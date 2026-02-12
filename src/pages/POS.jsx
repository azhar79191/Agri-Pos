import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Printer,
  X,
  Check,
  Barcode,
  Scan,
  QrCode,
  Calculator
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ModernModal from "../components/ui/ModernModal";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import BarcodeScanner from "../components/BarcodeScanner";
import {
  formatCurrency,
  calculateTax,
  calculateGrandTotal,
  generateInvoiceNumber,
  getTodayDate,
  getCurrentTime,
  isOutOfStock,
  isLowStock
} from "../utils/helpers";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const POS = () => {
  const { state, actions } = useApp();
  const { products, customers, cart, settings, currentUser } = state;
  const barcodeInputRef = useRef(null);
  const isOnline = useOnlineStatus();

  // Check permissions
  const canAccessPOS = actions.hasPermission("pos");

  // Local state
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm);
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart calculations
  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal, settings.taxRate);
    const grandTotal = calculateGrandTotal(subtotal, tax, discount);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, grandTotal, itemCount };
  }, [cart, settings.taxRate, discount]);

  // Add to cart
  const handleAddToCart = (product) => {
    if (isOutOfStock(product.stock)) {
      actions.showToast({ message: "Product is out of stock", type: "error" });
      return;
    }
    actions.addToCart(product, 1);
  };

  // Handle barcode scan
  const handleBarcodeScan = (product) => {
    actions.addToCart(product, 1);
    actions.showToast({ message: `${product.name} added to cart`, type: "success" });
  };

  // Quick barcode entry
  const handleQuickBarcode = (e) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      const success = actions.addToCartByBarcode(quickBarcode.trim());
      if (success) {
        setQuickBarcode("");
      }
    }
  };

  // Update cart quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      actions.removeFromCart(productId);
      return;
    }
    actions.updateCartQuantity(productId, newQuantity);
  };

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    actions.removeFromCart(productId);
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    actions.showToast({
      message: "Are you sure you want to clear the cart?",
      type: "warning",
      position: "center",
      isConfirm: true,
      onConfirm: () => {
        actions.clearCart();
        setDiscount(0);
        setSelectedCustomer("");
        setCashReceived("");
      }
    });
  };

  // Process payment
  const handleCheckout = () => {
    if (cart.length === 0) {
      actions.showToast({ message: "Cart is empty", type: "error" });
      return;
    }

    if (paymentMethod === "Cash") {
      const received = parseFloat(cashReceived);
      if (!received || received < cartCalculations.grandTotal) {
        actions.showToast({ message: "Insufficient cash received", type: "error" });
        return;
      }
    }

    const customer = customers.find((c) => c.id === parseInt(selectedCustomer));
    
    const transactionData = {
      customerId: customer?.id || null,
      customerName: customer?.name || "Walk-in Customer",
      customerPhone: customer?.phone || "",
      customerAddress: customer?.address || "",
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        unit: item.unit || "pcs",
        barcode: item.barcode
      })),
      subtotal: cartCalculations.subtotal,
      tax: cartCalculations.tax,
      discount: discount,
      grandTotal: cartCalculations.grandTotal,
      paymentMethod: paymentMethod,
      taxRate: settings.taxRate
    };

    const transaction = actions.createTransaction(transactionData);
    
    // Create invoice from transaction
    actions.createInvoice(transaction);
    
    setCompletedTransaction(transaction);
    setShowReceipt(true);
    setCashReceived("");
    setDiscount(0);
    setSelectedCustomer("");
    
    // Show success message with invoice number
    actions.showToast({ 
      message: `Sale completed! Invoice #${transaction.id} generated`, 
      type: "success" 
    });
  };

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  // Customer options
  const customerOptions = customers.map((c) => ({
    value: c.id.toString(),
    label: `${c.name} (${c.phone})`
  }));

  // Calculate change
  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received - cartCalculations.grandTotal;
  }, [cashReceived, cartCalculations.grandTotal]);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Point of Sale
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 dark:text-gray-400">
              Process sales and generate invoices
            </p>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500" : "bg-red-500"
              }`} />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModernButton 
            variant="outline" 
            onClick={() => actions.setPage("invoices")} 
            icon={Receipt}
            size="sm"
          >
            View Invoices
          </ModernButton>
          <ModernButton variant="secondary" onClick={() => setIsScannerOpen(true)} icon={Scan}>
            Scan Barcode
          </ModernButton>
          <Badge variant="primary" size="md" className="px-4 py-2">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {cartCalculations.itemCount} items
          </Badge>
        </div>
      </div>

      {/* Quick Barcode Entry */}
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
          <ModernButton type="submit" variant="primary" icon={Plus}>
            Add
          </ModernButton>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card padding="md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="All Categories"
                  options={[
                    { value: "", label: "All Categories" },
                    ...categories.map((c) => ({ value: c, label: c }))
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.productId === product.id);
              const cartQuantity = inCart?.quantity || 0;
              const availableStock = product.stock - cartQuantity;
              const outOfStock = isOutOfStock(availableStock);
              const lowStock = isLowStock(availableStock);

              return (
                <Card
                  key={product.id}
                  padding="md"
                  className={`relative transition-all hover:shadow-lg ${outOfStock ? "opacity-60" : ""}`}
                >
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl z-10">
                      <Badge variant="danger" size="lg">Out of Stock</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="primary" size="sm">
                      {product.category}
                    </Badge>
                    {lowStock && !outOfStock && (
                      <Badge variant="warning" size="sm">Low Stock</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                    {product.barcode}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(product.price, settings.currency)}
                    </span>
                    <span className={`text-sm ${lowStock ? "text-amber-600" : "text-gray-500"}`}>
                      Stock: {availableStock}
                    </span>
                  </div>
                  
                  {inCart ? (
                    <div className="flex items-center justify-center gap-3">
                      <ModernButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateQuantity(product.id, cartQuantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </ModernButton>
                      <span className="font-semibold w-8 text-center text-lg">
                        {cartQuantity}
                      </span>
                      <ModernButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateQuantity(product.id, cartQuantity + 1)}
                        disabled={cartQuantity >= product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  ) : (
                    <ModernButton
                      variant="primary"
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={outOfStock}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </ModernButton>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <Card padding="lg" className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter
              </p>
            </Card>
          )}
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card padding="md" className="h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </h2>
              {cart.length > 0 && (
                <ModernButton
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={handleClearCart}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </ModernButton>
              )}
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <Select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                placeholder="Select Customer (Optional)"
                options={[{ value: "", label: "Walk-in Customer" }, ...customerOptions]}
              />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto max-h-80 space-y-3 mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Add products to get started
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.price, settings.currency)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(item.price * item.quantity, settings.currency)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(cartCalculations.subtotal, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax ({settings.taxRate}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(cartCalculations.tax, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{settings.currency}</span>
                    <input
                      type="number"
                      min="0"
                      max={cartCalculations.subtotal}
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-emerald-600">
                    {formatCurrency(cartCalculations.grandTotal, settings.currency)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Cash", icon: Banknote, label: "Cash" },
                      { id: "Credit", icon: CreditCard, label: "Credit" },
                      { id: "Online Transfer", icon: Smartphone, label: "Online" }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <method.icon className={`w-6 h-6 mb-1 ${
                          paymentMethod === method.id ? "text-emerald-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs ${
                          paymentMethod === method.id ? "text-emerald-600 font-medium" : "text-gray-600"
                        }`}>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Payment - Received Amount */}
                {paymentMethod === "Cash" && (
                  <div className="space-y-2">
                    <Input
                      label="Cash Received"
                      type="number"
                      min={cartCalculations.grandTotal}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount"
                    />
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

                {/* Checkout Button */}
                <ModernButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  icon={Receipt}
                >
                  {isOnline ? "Process Payment & Generate Invoice" : "Process Payment (Offline)"}
                </ModernButton>
                
                {!isOnline && cart.length > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    ⚠️ Working offline - Invoice will sync when connection is restored
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        products={products}
      />

      {/* Receipt Modal */}
      <ModernModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Receipt"
        subtitle={completedTransaction?.id}
        size="md"
        icon={Receipt}
        footer={
          <div className="flex justify-end gap-3">
            <ModernButton variant="secondary" onClick={() => setShowReceipt(false)}>
              Close
            </ModernButton>
            <ModernButton variant="primary" onClick={handlePrint} icon={Printer}>
              Print Receipt
            </ModernButton>
          </div>
        }
      >
        {completedTransaction && (
          <div className="receipt bg-white p-6 border-2 border-dashed border-gray-300 rounded-xl">
            {/* Receipt Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{settings.shopName}</h2>
              <p className="text-sm text-gray-600">{settings.address}</p>
              <p className="text-sm text-gray-600">{settings.phone}</p>
              <div className="mt-4 border-t border-b border-gray-300 py-2">
                <p className="text-xl font-bold">INVOICE</p>
                <p className="text-sm text-gray-600 font-mono">{completedTransaction.id}</p>
                <p className="text-sm text-gray-600">
                  {completedTransaction.date} {completedTransaction.time}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-4 text-sm">
              <p><span className="font-medium">Customer:</span> {completedTransaction.customerName}</p>
              <p><span className="font-medium">Payment:</span> {completedTransaction.paymentMethod}</p>
              <p><span className="font-medium">Cashier:</span> {completedTransaction.createdBy}</p>
            </div>

            {/* Items */}
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
                {completedTransaction.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1">{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price, settings.currency)}</td>
                    <td className="text-right">{formatCurrency(item.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-gray-300 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(completedTransaction.subtotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({settings.taxRate}%):</span>
                <span>{formatCurrency(completedTransaction.tax, settings.currency)}</span>
              </div>
              {completedTransaction.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(completedTransaction.discount, settings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(completedTransaction.grandTotal, settings.currency)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
              <p className="mt-1">{settings.email}</p>
            </div>
          </div>
        )}
      </ModernModal>
    </div>
  );
};

export default POS;
