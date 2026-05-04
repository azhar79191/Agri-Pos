import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ShoppingCart, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useProducts } from "../context/ProductsContext";
import { useCustomers } from "../context/CustomersContext";
import { useInvoices } from "../hooks/useInvoices";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import BarcodeScanner from "../components/BarcodeScanner";
import POSHeader from "../components/pos/POSHeader";
import BarcodeBar from "../components/pos/BarcodeBar";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";
import ReceiptModal from "../components/pos/ReceiptModal";
import HeldSalesModal, { holdSale, getHeldSales } from "../components/pos/HeldSalesModal";
import { formatCurrency, calculateTax, calculateGrandTotal, generateInvoiceNumber, getTodayDate, getCurrentTime, isOutOfStock } from "../utils/helpers";
import { createCustomer } from "../api/customersApi";
import { getSalesReps } from "../api/salesRepsApi";
import { getBundles } from "../api/bundlesApi";

const RECENT_KEY = "pos_recent_products";
const getRecentProducts = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } };
const addRecentProduct = (product) => {
  const recent = getRecentProducts().filter(p => p._id !== product._id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([{ _id: product._id, name: product.name, price: product.price, unit: product.unit, barcode: product.barcode, stock: product.stock }, ...recent].slice(0, 8)));
};

const POS = () => {
  const { state, actions } = useApp();
  const { settings, currentUser, cart } = state;
  const { products, shopCategories, fetchProducts } = useProducts();
  const { customers, fetchCustomers, refreshCustomer, addCustomer } = useCustomers();
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();
  const barcodeInputRef = useRef(null);
  const isOnline = useOnlineStatus();

  const canAccessPOS = actions.hasPermission("pos");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "percent"
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [quickBarcode, setQuickBarcode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState("products");
  const [showHeld, setShowHeld] = useState(false);
  const [heldCount, setHeldCount] = useState(() => getHeldSales().length);
  const [recentProducts, setRecentProducts] = useState(() => getRecentProducts());
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [salesReps, setSalesReps] = useState([]);
  const [bundles, setBundles] = useState([]);
  // Quick customer add
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({ name: "", phone: "", address: "" });
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F2") { e.preventDefault(); barcodeInputRef.current?.focus(); }
      if (e.key === "Escape") setSearchTerm("");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    // Load sales reps and bundles for POS
    getSalesReps({ status: 'active', limit: 100 })
      .then(res => setSalesReps(res.data.data.reps || []))
      .catch(() => {});
    getBundles({ isActive: true, limit: 100 })
      .then(res => setBundles(res.data.data.bundles || []))
      .catch(() => {});
  }, []); // eslint-disable-line

  const DEFAULT_CATS = ["Herbicides", "Insecticides", "Fungicides", "Fertilizers", "Seeds", "Other"];
  const categories = useMemo(() => {
    const fromProducts = [...new Set(products.map(p => p.category))];
    const custom = (shopCategories || []).filter(c => !DEFAULT_CATS.includes(c));
    return [...new Set([...fromProducts, ...custom])];
  }, [products, shopCategories]);

  const filteredProducts = useMemo(() =>
    products.filter(product => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm);
      return matchesSearch && (!selectedCategory || product.category === selectedCategory);
    }),
    [products, searchTerm, selectedCategory]
  );

  const customer = customers.find(c => c._id === selectedCustomer);
  const customerBalance = customer?.walletBalance || 0;

  // Compute actual discount amount based on type
  const discountAmount = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (discountType === "percent") return Math.min((subtotal * discount) / 100, subtotal);
    return Math.min(discount, subtotal);
  }, [cart, discount, discountType]);

  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal, settings.taxRate);
    const grandTotal = calculateGrandTotal(subtotal, tax, discountAmount);
    const balanceUsed = Math.min(customerBalance, grandTotal);
    const payableAmount = Math.max(0, grandTotal - balanceUsed);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, grandTotal, itemCount, balanceUsed, payableAmount };
  }, [cart, settings.taxRate, discountAmount, customerBalance]);

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received - cartCalculations.payableAmount;
  }, [cashReceived, cartCalculations.payableAmount]);

  const needsCashInput = paymentMethod === "Cash" && cartCalculations.payableAmount > 0;

  const customerOptions = customers.map(c => {
    const wallet = c.walletBalance || 0;
    const credit = c.creditBalance || 0;
    let tag = "";
    if (wallet > 0 && credit > 0) tag = ` | Wallet: ${formatCurrency(wallet, settings.currency)} · Owes: ${formatCurrency(credit, settings.currency)}`;
    else if (wallet > 0) tag = ` | Wallet: ${formatCurrency(wallet, settings.currency)}`;
    else if (credit > 0) tag = ` | Owes: ${formatCurrency(credit, settings.currency)}`;
    return { value: c._id, label: `${c.name} (${c.phone})${tag}` };
  });

  const handleAddToCart = useCallback((product) => {
    if (isOutOfStock(product.stock)) { actions.showToast({ message: "Product is out of stock", type: "error" }); return; }
    actions.addToCart(product, 1);
    addRecentProduct(product);
    setRecentProducts(getRecentProducts());
  }, [actions]);

  // Add all bundle items to cart at bundle price (distributed proportionally)
  const handleAddBundle = useCallback((bundle) => {
    if (!bundle.items || bundle.items.length === 0) return;
    const totalValue = bundle.items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
    const ratio = totalValue > 0 ? bundle.bundlePrice / totalValue : 1;
    bundle.items.forEach(item => {
      const adjustedPrice = parseFloat((item.price * ratio).toFixed(2));
      // Use actual product ID if available, otherwise use the product field
      const productId = item.product?._id || item.product || item.productId;
      
      actions.addToCart({
        _id: productId,
        name: `[Bundle] ${item.productName}`,
        price: adjustedPrice,
        unit: item.unit || "piece",
        barcode: "",
        stock: 9999,
      }, item.quantity || 1);
    });
    actions.showToast({ message: `"${bundle.name}" added to cart`, type: "success" });
  }, [actions]);

  const handleBarcodeScan = (product) => {
    actions.addToCart(product, 1);
    addRecentProduct(product);
    setRecentProducts(getRecentProducts());
    actions.showToast({ message: `${product.name} added to cart`, type: "success" });
  };

  const handleQuickBarcode = (e) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      const product = products.find(p => p.barcode === quickBarcode.trim());
      if (product) { actions.addToCart(product, 1); addRecentProduct(product); setRecentProducts(getRecentProducts()); setQuickBarcode(""); }
      else actions.showToast({ message: "Product not found", type: "error" });
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) { actions.removeFromCart(productId); return; }
    actions.updateCartQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    actions.showToast({
      message: "Are you sure you want to clear the cart?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => { actions.clearCart(); setDiscount(0); setSelectedCustomer(""); setCashReceived(""); },
    });
  };

  // Hold sale
  const handleHoldSale = () => {
    if (cart.length === 0) { actions.showToast({ message: "Cart is empty", type: "error" }); return; }
    const cName = customers.find(c => c._id === selectedCustomer)?.name || "";
    holdSale(cart, cName, discount);
    setHeldCount(getHeldSales().length);
    actions.clearCart();
    setDiscount(0); setSelectedCustomer(""); setCashReceived("");
    actions.showToast({ message: "Sale held — cart cleared for next customer", type: "success" });
  };

  const handleRecallSale = (sale) => {
    if (cart.length > 0) actions.clearCart();
    sale.cart.forEach(item => {
      actions.addToCart({ _id: item.productId, name: item.name, price: item.price, unit: item.unit, barcode: item.barcode, stock: 9999 }, item.quantity);
    });
    setDiscount(sale.discount || 0);
    setHeldCount(getHeldSales().length);
    actions.showToast({ message: `Sale recalled: ${sale.label}`, type: "success" });
  };

  // Quick customer add
  const handleQuickAddCustomer = async () => {
    if (!quickCustomerForm.name || !quickCustomerForm.phone) {
      actions.showToast({ message: "Name and phone are required", type: "error" }); return;
    }
    setAddingCustomer(true);
    try {
      const res = await addCustomer({ name: quickCustomerForm.name, phone: quickCustomerForm.phone, address: quickCustomerForm.address || "N/A" });
      const newCustomer = res?._id ? res : res?.data?.data;
      if (newCustomer?._id) {
        setSelectedCustomer(newCustomer._id);
        actions.showToast({ message: `${newCustomer.name} added and selected`, type: "success" });
      }
      setShowQuickCustomer(false);
      setQuickCustomerForm({ name: "", phone: "", address: "" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add customer", type: "error" });
    } finally { setAddingCustomer(false); }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { actions.showToast({ message: "Cart is empty", type: "error" }); return; }
    if (paymentMethod === "Cash" && cartCalculations.payableAmount > 0) {
      const received = parseFloat(cashReceived);
      if (!received || received < cartCalculations.payableAmount) {
        actions.showToast({ message: "Insufficient cash received", type: "error" }); return;
      }
    }
    if (paymentMethod === "Credit" && !selectedCustomer) {
      actions.showToast({ message: "Please select a customer for Credit payment", type: "error" }); return;
    }

    const invoiceData = {
      ...(customer?._id && { customer: customer._id }),
      ...(selectedSalesRep && { salesRepId: selectedSalesRep }),
      items: cart.map(item => ({
        product: item.productId,
        productName: item.name?.replace(/^\[Bundle\] /, '') || item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        discount: 0,
      })),
      paymentMethod,
      amountPaid: paymentMethod === "Cash" ? parseFloat(cashReceived) : 0,
      discount: discountAmount,
      notes: "",
    };

    setCheckoutLoading(true);
    try {
      const invoice = await addInvoice(invoiceData);
      const invoiceRecord = invoice.invoice ?? invoice;
      const isPending = paymentMethod === "Online Transfer";
      const transaction = {
        id: invoiceRecord.invoiceNumber || generateInvoiceNumber(),
        invoiceNumber: invoiceRecord.invoiceNumber,
        date: getTodayDate(), time: getCurrentTime(),
        customerName: invoiceRecord.customerName || customer?.name || "Walk-in Customer",
        items: invoiceRecord.items || cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
        subtotal: invoiceRecord.subtotal || cartCalculations.subtotal,
        tax: invoiceRecord.taxAmount || cartCalculations.tax,
        discount: invoiceRecord.discount || discountAmount,
        grandTotal: invoiceRecord.total || cartCalculations.grandTotal,
        paymentMethod, status: isPending ? "Pending" : "Completed",
        createdBy: currentUser?.name || "System",
      };
      actions.createTransaction(invoiceData);
      if (customer?._id) refreshCustomer(customer._id);
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      setCashReceived(""); setDiscount(0); setSelectedCustomer(""); setSelectedSalesRep("");
      actions.showToast({
        message: isPending ? `Invoice #${invoiceRecord.invoiceNumber} created — awaiting admin confirmation` : `Sale completed! Invoice #${invoiceRecord.invoiceNumber} generated`,
        type: isPending ? "warning" : "success",
      });
    } catch {
      const transaction = actions.createTransaction(invoiceData);
      actions.createInvoice(transaction);
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      setCashReceived(""); setDiscount(0); setSelectedCustomer("");
      actions.showToast({ message: `Sale completed (offline)! Invoice #${transaction.id}`, type: "warning" });
    } finally { setCheckoutLoading(false); }
  };

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
      <POSHeader isOnline={isOnline} itemCount={cartCalculations.itemCount} onScanOpen={() => setIsScannerOpen(true)} />

      <BarcodeBar value={quickBarcode} onChange={e => setQuickBarcode(e.target.value)} onSubmit={handleQuickBarcode} inputRef={barcodeInputRef} />

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {["products", "cart"].map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
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
          <ProductGrid
            products={filteredProducts}
            cart={cart}
            categories={categories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onSearchChange={e => setSearchTerm(e.target.value)}
            onCategoryChange={e => setSelectedCategory(e.target.value)}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            currency={settings.currency}
            recentProducts={recentProducts}
            bundles={bundles}
            onAddBundle={handleAddBundle}
          />
        </div>

        <div className={mobileTab === "products" ? "hidden lg:block" : ""}>
          <CartPanel
            cart={cart}
            customerOptions={customerOptions}
            selectedCustomer={selectedCustomer}
            onCustomerChange={e => setSelectedCustomer(e.target.value)}
            onAddCustomer={() => setShowQuickCustomer(true)}
            salesReps={salesReps}
            selectedSalesRep={selectedSalesRep}
            onSalesRepChange={e => setSelectedSalesRep(e.target.value)}
            discount={discount}
            discountType={discountType}
            discountAmount={discountAmount}
            onDiscountChange={e => setDiscount(parseFloat(e.target.value) || 0)}
            onDiscountTypeToggle={() => { setDiscountType(t => t === "flat" ? "percent" : "flat"); setDiscount(0); }}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            cashReceived={cashReceived}
            onCashReceivedChange={e => setCashReceived(e.target.value)}
            cartCalculations={cartCalculations}
            change={change}
            needsCashInput={needsCashInput}
            isOnline={isOnline}
            checkoutLoading={checkoutLoading}
            onRemoveItem={actions.removeFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onHoldSale={handleHoldSale}
            onShowHeld={() => setShowHeld(true)}
            heldCount={heldCount}
            onCheckout={handleCheckout}
            currency={settings.currency}
            taxRate={settings.taxRate}
          />
        </div>
      </div>

      {/* Quick Customer Add Modal */}
      {showQuickCustomer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowQuickCustomer(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-[10000] w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Quick Add Customer</h3>
            </div>
            <input
              autoFocus
              placeholder="Customer name"
              value={quickCustomerForm.name}
              onChange={e => setQuickCustomerForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-blue-800/30 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <input
              placeholder="Phone number"
              value={quickCustomerForm.phone}
              onChange={e => setQuickCustomerForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-blue-800/30 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <input
              placeholder="Address (optional)"
              value={quickCustomerForm.address}
              onChange={e => setQuickCustomerForm(p => ({ ...p, address: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleQuickAddCustomer()}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-blue-800/30 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowQuickCustomer(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleQuickAddCustomer} disabled={addingCustomer} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {addingCustomer ? "Adding..." : "Add & Select"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HeldSalesModal isOpen={showHeld} onClose={() => setShowHeld(false)} onRecall={handleRecallSale} currency={settings.currency} />
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScan} products={products} />
      <ReceiptModal isOpen={showReceipt} onClose={() => setShowReceipt(false)} transaction={completedTransaction} settings={settings} currentUserName={currentUser?.name} />
    </div>
  );
};

export default POS;
