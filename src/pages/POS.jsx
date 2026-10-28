import React, { useState, useMemo, useRef, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useProducts } from "../context/ProductsContext";
import { useCustomers } from "../context/CustomersContext";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { usePOSCart } from "../hooks/usePOSCart";
import { usePOSCheckout } from "../hooks/usePOSCheckout";
import { formatCurrency } from "../utils/helpers";
import BarcodeScanner from "../components/BarcodeScanner";
import POSHeader from "../components/pos/POSHeader";
import BarcodeBar from "../components/pos/BarcodeBar";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";
import ReceiptModal from "../components/pos/ReceiptModal";
import HeldSalesModal from "../components/pos/HeldSalesModal";
import QuickAddCustomerModal from "../components/pos/QuickAddCustomerModal";
import { getSalesReps } from "../api/salesRepsApi";
import { getProducts } from "../api/productApi";



const POS = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { shopCategories, fetchProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPages, setCatalogPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { customers, fetchCustomers } = useCustomers();
  const isOnline = useOnlineStatus();
  const barcodeInputRef = useRef(null);

  const canAccessPOS = actions.hasPermission("pos");

  const [quickBarcode, setQuickBarcode]       = useState("");
  const [isScannerOpen, setIsScannerOpen]     = useState(false);
  const [mobileTab, setMobileTab]             = useState("products");
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [salesReps, setSalesReps]             = useState([]);
  const bundles = [];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F2") { e.preventDefault(); barcodeInputRef.current?.focus(); }
      if (e.key === "Escape") setQuickBarcode("");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    getSalesReps({ status: "active", limit: 100 })
      .then((res) => {
        const reps = [res.data?.data?.reps, res.data?.reps, res.data].find(Array.isArray);
        if (!reps) throw new Error("Sales representatives response was invalid");
        setSalesReps(reps);
      })
      .catch((err) => {
        console.error('Failed to fetch sales reps:', err);
        setSalesReps([]);
        actions.showToast({ message: "Sales representatives could not be loaded. Checkout is still available.", type: "warning" });
      });

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const posCart = usePOSCart({ settings, customers });
  const {
    cart, customer, selectedCustomer, setSelectedCustomer,
    discount, setDiscount, discountType, toggleDiscountType, discountAmount,
    cashReceived, setCashReceived, paymentMethod, setPaymentMethod,
    cartCalculations, change, recentProducts, needsCashInput,
    handleAddToCart, handleAddBundle, handleBarcodeScan,
    handleQuickBarcode, handleUpdateQuantity, handleClearCart, resetCart,
  } = posCart;

  const checkout = usePOSCheckout({
    cart, cartCalculations, discountAmount, paymentMethod, cashReceived,
    selectedCustomer, customer, selectedSalesRep, resetCart,
    setSelectedCustomer, setDiscount, setCashReceived,
  });
  const {
    hasPendingCheckout, handleRecoverCheckout,
    checkoutLoading, completedTransaction,
    showReceipt, setShowReceipt,
    heldCount, showHeld, setShowHeld,
    showQuickCustomer, setShowQuickCustomer,
    quickCustomerForm, setQuickCustomerForm,
    addingCustomer,
    handleHoldSale, handleRecallSale,
    handleQuickAddCustomer, handleCheckout,
  } = checkout;

  const categories = useMemo(() => {
    return shopCategories || [];
  }, [shopCategories]);

  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) setSelectedCategory("");
  }, [categories, selectedCategory]);

  useEffect(() => { setCatalogPage(1); }, [quickBarcode, selectedCategory]);
  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getProducts({ search: quickBarcode, category: selectedCategory || undefined, page: catalogPage, limit: 24, isActive: true });
        if (!cancelled) {
          setProducts(res.data.data.products || []);
          setCatalogPages(Math.max(1, res.data.data.pagination?.pages || 1));
          setCatalogError(null);
        }
      } catch (error) {
        if (!cancelled) setCatalogError(error.response?.data?.message || "Catalog could not be loaded. Check your connection and try searching again.");
      } finally { if (!cancelled) setCatalogLoading(false); }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [quickBarcode, selectedCategory, catalogPage]);
  const filteredProducts = products;

  const customerOptions = customers.map((c) => {
    const wallet = c.walletBalance || 0;
    const credit = c.creditBalance || 0;
    let tag = "";
    if (wallet > 0 && credit > 0) tag = ` | Wallet: ${formatCurrency(wallet, settings.currency)} · Owes: ${formatCurrency(credit, settings.currency)}`;
    else if (wallet > 0) tag = ` | Wallet: ${formatCurrency(wallet, settings.currency)}`;
    else if (credit > 0) tag = ` | Owes: ${formatCurrency(credit, settings.currency)}`;
    return { value: c._id, label: `${c.name} (${c.phone})${tag}` };
  });

  if (!canAccessPOS) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400">You don't have permission to access the POS system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasPendingCheckout && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold">A previous checkout needs confirmation</p>
        <p className="mt-1 text-sm">Recover the original sale before submitting another payment.</p>
        <button type="button" disabled={checkoutLoading || !isOnline} onClick={handleRecoverCheckout} className="mt-3 min-h-11 rounded-lg bg-amber-900 px-4 font-semibold text-white disabled:opacity-50">Recover previous checkout</button>
      </div>}
      <POSHeader isOnline={isOnline} itemCount={cartCalculations.itemCount} onScanOpen={() => setIsScannerOpen(true)} />

      <BarcodeBar
        value={quickBarcode}
        onChange={(e) => setQuickBarcode(e.target.value)}
        onSubmit={(e) => { e.preventDefault(); if (quickBarcode.trim()) { handleQuickBarcode(quickBarcode, products); setQuickBarcode(""); } }}
        inputRef={barcodeInputRef}
      />

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {["products", "cart"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mobileTab === tab ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {tab === "cart" ? "Cart" : "Products"}
            {tab === "cart" && cartCalculations.itemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{cartCalculations.itemCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${mobileTab === "cart" ? "hidden lg:block" : ""}`}>
          {catalogError && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{catalogError}</p>}
          <ProductGrid
            loading={catalogLoading}
            products={filteredProducts}
            cart={cart}
            categories={categories}
            searchTerm={quickBarcode}
            selectedCategory={selectedCategory}
            onSearchChange={(e) => setQuickBarcode(e.target.value)}
            onCategoryChange={(value) => setSelectedCategory(value?.target?.value ?? value)}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            currency={settings.currency}
            recentProducts={recentProducts}
            bundles={bundles}
            bundlesEnabled={false}
            onAddBundle={handleAddBundle}
          />
          <nav aria-label="Catalog pages" className="mt-4 flex items-center justify-between gap-3 text-sm">
            <button type="button" disabled={catalogPage <= 1 || catalogLoading} onClick={() => setCatalogPage(p => p - 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Previous</button>
            <span>Page {catalogPage} of {catalogPages}</span>
            <button type="button" disabled={catalogPage >= catalogPages || catalogLoading} onClick={() => setCatalogPage(p => p + 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Next</button>
          </nav>
        </div>

        <div className={mobileTab === "products" ? "hidden lg:block" : ""}>
          <CartPanel
            mobileCartVisible={mobileTab === "cart"}
            onReviewCart={() => setMobileTab("cart")}
            cart={cart}
            customerOptions={customerOptions}
            selectedCustomer={selectedCustomer}
            onCustomerChange={(e) => setSelectedCustomer(e.target.value)}
            onAddCustomer={() => setShowQuickCustomer(true)}
            salesReps={salesReps}
            selectedSalesRep={selectedSalesRep}
            onSalesRepChange={(e) => setSelectedSalesRep(e.target.value)}
            discount={discount}
            discountType={discountType}
            discountAmount={discountAmount}
            onDiscountChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            onDiscountTypeToggle={toggleDiscountType}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            cashReceived={cashReceived}
            onCashReceivedChange={(e) => setCashReceived(e.target.value)}
            cartCalculations={cartCalculations}
            change={change}
            needsCashInput={needsCashInput}
            isOnline={isOnline}
            checkoutLoading={checkoutLoading}
            onRemoveItem={actions.removeFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onHoldSale={() => handleHoldSale(customers)}
            onShowHeld={() => setShowHeld(true)}
            heldCount={heldCount}
            onCheckout={handleCheckout}
            currency={settings.currency}
            taxRate={settings.taxRate}
          />
        </div>
      </div>

      {showQuickCustomer && (
        <QuickAddCustomerModal
          form={quickCustomerForm}
          onChange={(field, value) => setQuickCustomerForm((p) => ({ ...p, [field]: value }))}
          onSubmit={handleQuickAddCustomer}
          onClose={() => setShowQuickCustomer(false)}
          loading={addingCustomer}
        />
      )}

      <HeldSalesModal isOpen={showHeld} onClose={() => setShowHeld(false)} onRecall={handleRecallSale} currency={settings.currency} />
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScan} products={products} useApi={true} />
      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} transaction={completedTransaction} settings={settings} currentUserName={currentUser?.name} />
    </div>
  );
};

export default POS;
