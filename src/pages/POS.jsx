import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ShoppingCart, Search, Plus, Minus, Trash2, User, CreditCard,
  Banknote, Smartphone, Receipt, Printer, X, Barcode, Scan, Package, Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useProducts } from "../context/ProductsContext";
import { useCustomers } from "../context/CustomersContext";
import { useInvoices } from "../hooks/useInvoices";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ModernModal from "../components/ui/ModernModal";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import BarcodeScanner from "../components/BarcodeScanner";
import { formatCurrency, calculateTax, calculateGrandTotal, generateInvoiceNumber, getTodayDate, getCurrentTime, isOutOfStock, isLowStock } from "../utils/helpers";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { downloadInvoicePDF } from "../utils/pdfGenerator";

const POS = () => {
  const { state, actions } = useApp();
  const { settings, currentUser, cart } = state;
  const { products, fetchProducts } = useProducts();
  const { customers, fetchCustomers } = useCustomers();
  const { addInvoice } = useInvoices();
  const navigate = useNavigate();
  const barcodeInputRef = useRef(null);
  const isOnline = useOnlineStatus();

  const canAccessPOS = actions.hasPermission("pos");

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

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filteredProducts = useMemo(() =>
    products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm);
      return matchesSearch && (!selectedCategory || product.category === selectedCategory);
    }),
    [products, searchTerm, selectedCategory]
  );

  const customer = customers.find((c) => c._id === selectedCustomer);
  const walletBalance = customer?.walletBalance || 0;

  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal, settings.taxRate);
    const grandTotal = calculateGrandTotal(subtotal, tax, discount);
    const walletUsed = Math.min(walletBalance, grandTotal);
    const payableAmount = Math.max(0, grandTotal - walletUsed);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, grandTotal, itemCount, walletUsed, payableAmount };
  }, [cart, settings.taxRate, discount, walletBalance]);

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
      const product = products.find((p) => p.barcode === quickBarcode.trim());
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
    if (paymentMethod === "Cash") {
      const received = parseFloat(cashReceived);
      const required = cartCalculations.payableAmount;
      if (!received || received < required) {
        actions.showToast({ message: "Insufficient cash received", type: "error" });
        return;
      }
    }
    if (paymentMethod === "Credit" && !selectedCustomer) {
      actions.showToast({ message: "Please select a customer for Credit payment", type: "error" });
      return;
    }

    const customer = customers.find((c) => c._id === selectedCustomer);
    const invoiceData = {
      ...(customer?._id && { customer: customer._id }),
      items: cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        discount: 0,
      })),
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
      console.error('[POS] Invoice creation failed:', err.response?.data);
      // Fallback to local transaction if backend fails
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

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received - cartCalculations.payableAmount;
  }, [cashReceived, cartCalculations.payableAmount]);

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.phone})${ (c.walletBalance || 0) > 0 ? ` | Wallet: ${formatCurrency(c.walletBalance, settings.currency)}` : ''}${ (c.creditBalance || 0) > 0 ? ` | Owes: ${formatCurrency(c.creditBalance, settings.currency)}` : '' }`
  }));

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Point of Sale</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Process sales and generate invoices</span>
            </p>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
              isOnline 
                ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModernButton variant="outline" onClick={() => navigate("/invoices")} icon={Receipt} size="sm">View Invoices</ModernButton>
          <ModernButton variant="secondary" onClick={() => setIsScannerOpen(true)} icon={Scan}>Scan Barcode</ModernButton>
          <Badge variant="primary" size="md" className="px-4 py-2.5 shadow-lg">
            <ShoppingCart className="w-4 h-4 mr-2" />{cartCalculations.itemCount} items
          </Badge>
        </div>
      </div>

      <Card padding="md" className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
        <form onSubmit={handleQuickBarcode} className="flex gap-3">
          <div className="flex-1 relative">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={quickBarcode}
              onChange={(e) => setQuickBarcode(e.target.value)}
              placeholder="Scan or type barcode and press Enter..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <ModernButton type="submit" variant="primary" icon={Plus}>Add</ModernButton>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card padding="md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="All Categories"
                  options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.productId === (product._id || product.id));
              const cartQuantity = inCart?.quantity || 0;
              const availableStock = product.stock - cartQuantity;
              const outOfStock = isOutOfStock(availableStock);
              const lowStock = isLowStock(availableStock);

              return (
                <Card key={product._id || product.id} padding="md" className={`relative transition-all hover:shadow-lg ${outOfStock ? "opacity-60" : ""}`}>
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl z-10">
                      <Badge variant="danger" size="lg">Out of Stock</Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="primary" size="sm">{product.category}</Badge>
                    {lowStock && !outOfStock && <Badge variant="warning" size="sm">Low Stock</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">{product.barcode}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(product.price, settings.currency)}</span>
                    <span className={`text-sm ${lowStock ? "text-amber-600" : "text-gray-500"}`}>Stock: {availableStock}</span>
                  </div>
                  {inCart ? (
                    <div className="flex items-center justify-center gap-3">
                      <ModernButton variant="secondary" size="sm" onClick={() => handleUpdateQuantity(product._id || product.id, cartQuantity - 1)}>
                        <Minus className="w-4 h-4" />
                      </ModernButton>
                      <span className="font-semibold w-8 text-center text-lg">{cartQuantity}</span>
                      <ModernButton variant="secondary" size="sm" onClick={() => handleUpdateQuantity(product._id || product.id, cartQuantity + 1)} disabled={cartQuantity >= product.stock}>
                        <Plus className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  ) : (
                    <ModernButton variant="primary" className="w-full" onClick={() => handleAddToCart(product)} disabled={outOfStock}>
                      <Plus className="w-4 h-4 mr-2" />Add to Cart
                    </ModernButton>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <Card padding="lg" className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card padding="md" className="h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />Cart
              </h2>
              {cart.length > 0 && (
                <ModernButton variant="ghost" size="sm" className="text-red-600" onClick={handleClearCart}>
                  <Trash2 className="w-4 h-4 mr-1" />Clear
                </ModernButton>
              )}
            </div>

            <div className="mb-4">
              <Select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                placeholder="Walk-in Customer"
                options={[{ value: "", label: "Walk-in Customer" }, ...customerOptions]}
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-80 space-y-3 mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Add products to get started</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.price, settings.currency)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-emerald-600">{formatCurrency(item.price * item.quantity, settings.currency)}</span>
                      <button onClick={() => actions.removeFromCart(item.productId)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartCalculations.subtotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({settings.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(cartCalculations.tax, settings.currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{settings.currency}</span>
                    <input
                      type="number" min="0" max={cartCalculations.subtotal} value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                {cartCalculations.walletUsed > 0 && (
                  <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                    <span>Wallet Balance Used</span>
                    <span className="font-medium">- {formatCurrency(cartCalculations.walletUsed, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-emerald-600">{formatCurrency(cartCalculations.grandTotal, settings.currency)}</span>
                </div>
                {cartCalculations.walletUsed > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                    <span>Payable (after wallet)</span>
                    <span>{formatCurrency(cartCalculations.payableAmount, settings.currency)}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Cash", icon: Banknote, label: "Cash" },
                      { id: "Credit", icon: CreditCard, label: "Credit" },
                      { id: "Online Transfer", icon: Smartphone, label: "Online" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                      >
                        <method.icon className={`w-6 h-6 mb-1 ${paymentMethod === method.id ? "text-emerald-600" : "text-gray-500"}`} />
                        <span className={`text-xs ${paymentMethod === method.id ? "text-emerald-600 font-medium" : "text-gray-600"}`}>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "Cash" && (
                  <div className="space-y-2">
                    <Input label="Cash Received" type="number" min={cartCalculations.grandTotal} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder="Enter amount" />
                    {parseFloat(cashReceived) > 0 && (
                      <div className="flex justify-between text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Change</span>
                        <span className={`font-bold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(change >= 0 ? change : 0, settings.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <ModernButton variant="primary" size="lg" className="w-full" onClick={handleCheckout} disabled={cart.length === 0} loading={checkoutLoading} icon={Receipt}>
                  {isOnline ? "Process Payment & Generate Invoice" : "Process Payment (Offline)"}
                </ModernButton>

                {!isOnline && cart.length > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    ⚠️ Working offline — Invoice will sync when connection is restored
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScan} products={products} />

      <ModernModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Receipt"
        subtitle={completedTransaction?.invoiceNumber || completedTransaction?.id}
        size="md"
        icon={Receipt}
        footer={
          <div className="flex justify-end gap-3">
            <ModernButton variant="secondary" onClick={() => setShowReceipt(false)}>Close</ModernButton>
            <ModernButton variant="outline" onClick={() => window.print()} icon={Printer}>Print</ModernButton>
            <ModernButton variant="primary" onClick={() => downloadInvoicePDF(completedTransaction, settings)} icon={Download}>Download PDF</ModernButton>
          </div>
        }
      >
        {completedTransaction && (
          <div className="receipt bg-white p-6 border-2 border-dashed border-gray-300 rounded-xl">
            {/* Pending notice for online transfer */}
            {completedTransaction.status === "Pending" && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-amber-700 font-semibold text-sm">⏳ Payment Pending Confirmation</p>
                <p className="text-amber-600 text-xs mt-0.5">This invoice is awaiting admin confirmation. Stock will be reserved once confirmed.</p>
              </div>
            )}
            <div className="text-center mb-6">
              {settings.shopLogo && (
                <img src={settings.shopLogo} alt={settings.shopName} className="w-16 h-16 object-contain mx-auto mb-3" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">{settings.shopName}</h2>
              <p className="text-sm text-gray-600">{settings.address}</p>
              <p className="text-sm text-gray-600">{settings.phone}</p>
              <div className="mt-4 border-t border-b border-gray-300 py-2">
                <p className="text-xl font-bold">INVOICE</p>
                <p className="text-sm text-gray-600 font-mono">{completedTransaction.invoiceNumber || completedTransaction.id}</p>
                <p className="text-sm text-gray-600">{completedTransaction.date} {completedTransaction.time}</p>
              </div>
            </div>
            <div className="mb-4 text-sm">
              <p><span className="font-medium">Customer:</span> {completedTransaction.customerName}</p>
              <p><span className="font-medium">Payment:</span> {completedTransaction.paymentMethod}</p>
              <p><span className="font-medium">Status:</span>{" "}
                <span className={`font-semibold ${completedTransaction.status === "Pending" ? "text-amber-600" : "text-emerald-600"}`}>
                  {completedTransaction.status}
                </span>
              </p>
              <p><span className="font-medium">Cashier:</span> {completedTransaction.createdBy || currentUser?.name}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {completedTransaction.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1">{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price, settings.currency)}</td>
                    <td className="text-right">{formatCurrency(item.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-300 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(completedTransaction.subtotal, settings.currency)}</span></div>
              <div className="flex justify-between"><span>Tax ({settings.taxRate}%):</span><span>{formatCurrency(completedTransaction.tax, settings.currency)}</span></div>
              {completedTransaction.discount > 0 && (
                <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(completedTransaction.discount, settings.currency)}</span></div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Grand Total:</span><span>{formatCurrency(completedTransaction.grandTotal, settings.currency)}</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>{settings.receiptFooter || "Thank you for your business!"}</p>
              <p className="mt-1">{settings.email}</p>
            </div>
          </div>
        )}
      </ModernModal>
    </div>
  );
};

export default POS;
