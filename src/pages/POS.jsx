import React, { useState, useMemo, useRef, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
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
import { formatCurrency, calculateTax, calculateGrandTotal, generateInvoiceNumber, getTodayDate, getCurrentTime, isOutOfStock } from "../utils/helpers";

const POS = () => {
  const { state, actions } = useApp();
  const { settings, currentUser, cart } = state;
  const { products, fetchProducts } = useProducts();
  const { customers, fetchCustomers, refreshCustomer } = useCustomers();
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();
  const barcodeInputRef = useRef(null);
  const isOnline = useOnlineStatus();

  const canAccessPOS = actions.hasPermission("pos");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [quickBarcode, setQuickBarcode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState("products");

  // Keyboard shortcuts: F2 = focus barcode input, Escape = clear search
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

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

  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal, settings.taxRate);
    const grandTotal = calculateGrandTotal(subtotal, tax, discount);
    const balanceUsed = Math.min(customerBalance, grandTotal);
    const payableAmount = Math.max(0, grandTotal - balanceUsed);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, grandTotal, itemCount, balanceUsed, payableAmount };
  }, [cart, settings.taxRate, discount, customerBalance]);

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

  // Handlers
  const handleAddToCart = (product) => {
    if (isOutOfStock(product.stock)) {
      actions.showToast({ message: "Product is out of stock", type: "error" });
      return;
    }
    actions.addToCart(product, 1);
  };

  const handleBarcodeScan = (product) => {
    actions.addToCart(product, 1);
    actions.showToast({ message: `${product.name} added to cart`, type: "success" });
  };

  const handleQuickBarcode = (e) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      const product = products.find(p => p.barcode === quickBarcode.trim());
      if (product) {
        actions.addToCart(product, 1);
        setQuickBarcode("");
      } else {
        actions.showToast({ message: "Product not found", type: "error" });
      }
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

  const handleCheckout = async () => {
    if (cart.length === 0) { actions.showToast({ message: "Cart is empty", type: "error" }); return; }
    if (paymentMethod === "Cash" && cartCalculations.payableAmount > 0) {
      const received = parseFloat(cashReceived);
      if (!received || received < cartCalculations.payableAmount) {
        actions.showToast({ message: "Insufficient cash received", type: "error" });
        return;
      }
    }
    if (paymentMethod === "Credit" && !selectedCustomer) {
      actions.showToast({ message: "Please select a customer for Credit payment", type: "error" });
      return;
    }

    const invoiceData = {
      ...(customer?._id && { customer: customer._id }),
      items: cart.map(item => ({ product: item.productId, quantity: item.quantity, discount: 0 })),
      paymentMethod,
      amountPaid: paymentMethod === "Cash" ? parseFloat(cashReceived) : 0,
      discount,
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
        date: getTodayDate(),
        time: getCurrentTime(),
        customerName: invoiceRecord.customerName || customer?.name || "Walk-in Customer",
        items: invoiceRecord.items || cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
        subtotal: invoiceRecord.subtotal || cartCalculations.subtotal,
        tax: invoiceRecord.taxAmount || cartCalculations.tax,
        discount: invoiceRecord.discount || discount,
        grandTotal: invoiceRecord.total || cartCalculations.grandTotal,
        paymentMethod,
        status: isPending ? "Pending" : "Completed",
        createdBy: currentUser?.name || "System",
      };
      actions.createTransaction(invoiceData);
      if (customer?._id) refreshCustomer(customer._id);
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      setCashReceived("");
      setDiscount(0);
      setSelectedCustomer("");
      actions.showToast({
        message: isPending
          ? `Invoice #${invoiceRecord.invoiceNumber} created — awaiting admin confirmation`
          : `Sale completed! Invoice #${invoiceRecord.invoiceNumber} generated`,
        type: isPending ? "warning" : "success",
      });
    } catch (err) {
      const transaction = actions.createTransaction(invoiceData);
      actions.createInvoice(transaction);
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      setCashReceived("");
      setDiscount(0);
      setSelectedCustomer("");
      actions.showToast({ message: `Sale completed (offline)! Invoice #${transaction.id}`, type: "warning" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Access denied
  if (!canAccessPOS) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You don't have permission to access the POS system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <POSHeader
        isOnline={isOnline}
        itemCount={cartCalculations.itemCount}
        onScanOpen={() => setIsScannerOpen(true)}
      />

      <BarcodeBar
        value={quickBarcode}
        onChange={e => setQuickBarcode(e.target.value)}
        onSubmit={handleQuickBarcode}
        inputRef={barcodeInputRef}
      />

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => setMobileTab("products")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mobileTab === "products"
              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setMobileTab("cart")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mobileTab === "cart"
              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Cart
          {cartCalculations.itemCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
              {cartCalculations.itemCount}
            </span>
          )}
        </button>
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
          />
        </div>

        <div className={mobileTab === "products" ? "hidden lg:block" : ""}>
          <CartPanel
            cart={cart}
            customerOptions={customerOptions}
            selectedCustomer={selectedCustomer}
            onCustomerChange={e => setSelectedCustomer(e.target.value)}
            discount={discount}
            onDiscountChange={e => setDiscount(parseFloat(e.target.value) || 0)}
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
            onCheckout={handleCheckout}
            currency={settings.currency}
            taxRate={settings.taxRate}
          />
        </div>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
      />

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={completedTransaction}
        settings={settings}
        currentUserName={currentUser?.name}
      />
    </div>
  );
};

export default POS;
