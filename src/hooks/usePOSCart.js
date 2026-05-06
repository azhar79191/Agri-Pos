import { useState, useMemo, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { calculateTax, calculateGrandTotal, isOutOfStock } from "../utils/helpers";

const RECENT_KEY = "pos_recent_products";

const getRecentProducts = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};

const saveRecentProduct = (product) => {
  const recent = getRecentProducts().filter((p) => p._id !== product._id);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(
      [{ _id: product._id, name: product.name, price: product.price, unit: product.unit, barcode: product.barcode, stock: product.stock }, ...recent].slice(0, 8)
    )
  );
};

/**
 * usePOSCart — manages cart state, calculations, and cart action handlers for POS.
 */
export function usePOSCart({ settings, customers }) {
  const { state, actions } = useApp();
  const { cart } = state;

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount]                 = useState(0);
  const [discountType, setDiscountType]         = useState("flat"); // "flat" | "percent"
  const [cashReceived, setCashReceived]         = useState("");
  const [paymentMethod, setPaymentMethod]       = useState("Cash");
  const [recentProducts, setRecentProducts]     = useState(() => getRecentProducts());

  const customer        = customers.find((c) => c._id === selectedCustomer);
  const customerBalance = customer?.walletBalance || 0;

  const discountAmount = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (discountType === "percent") return Math.min((subtotal * discount) / 100, subtotal);
    return Math.min(discount, subtotal);
  }, [cart, discount, discountType]);

  const cartCalculations = useMemo(() => {
    const subtotal     = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax          = calculateTax(subtotal, settings.taxRate);
    const grandTotal   = calculateGrandTotal(subtotal, tax, discountAmount);
    const balanceUsed  = Math.min(customerBalance, grandTotal);
    const payableAmount = Math.max(0, grandTotal - balanceUsed);
    const itemCount    = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, grandTotal, itemCount, balanceUsed, payableAmount };
  }, [cart, settings.taxRate, discountAmount, customerBalance]);

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received - cartCalculations.payableAmount;
  }, [cashReceived, cartCalculations.payableAmount]);

  const handleAddToCart = useCallback((product) => {
    if (isOutOfStock(product.stock)) {
      actions.showToast({ message: "Product is out of stock", type: "error" });
      return;
    }
    actions.addToCart(product, 1);
    saveRecentProduct(product);
    setRecentProducts(getRecentProducts());
  }, [actions]);

  const handleAddBundle = useCallback((bundle) => {
    if (!bundle.items?.length) return;
    const totalValue = bundle.items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const ratio = totalValue > 0 ? bundle.bundlePrice / totalValue : 1;
    bundle.items.forEach((item) => {
      const adjustedPrice = parseFloat((item.price * ratio).toFixed(2));
      const productId     = item.product?._id || item.product || item.productId;
      actions.addToCart({ _id: productId, name: `[Bundle] ${item.productName}`, price: adjustedPrice, unit: item.unit || "piece", barcode: "", stock: 9999 }, item.quantity || 1);
    });
    actions.showToast({ message: `"${bundle.name}" added to cart`, type: "success" });
  }, [actions]);

  const handleBarcodeScan = useCallback((product) => {
    // Add to cart regardless of stock — show warning if out of stock but still add
    actions.addToCart(product, 1);
    saveRecentProduct(product);
    setRecentProducts(getRecentProducts());
    if (product.stock <= 0) {
      actions.showToast({ message: `${product.name} added (out of stock — verify)`, type: "warning" });
    } else {
      actions.showToast({ message: `${product.name} added to cart`, type: "success" });
    }
  }, [actions]);

  const handleQuickBarcode = useCallback((barcode, products) => {
    const product = products.find((p) => p.barcode === barcode.trim());
    if (product) {
      actions.addToCart(product, 1);
      saveRecentProduct(product);
      setRecentProducts(getRecentProducts());
    } else {
      actions.showToast({ message: "Product not found", type: "error" });
    }
  }, [actions]);

  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) { actions.removeFromCart(productId); return; }
    actions.updateCartQuantity(productId, newQuantity);
  }, [actions]);

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    actions.showToast({
      message: "Are you sure you want to clear the cart?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => { actions.clearCart(); setDiscount(0); setSelectedCustomer(""); setCashReceived(""); },
    });
  }, [cart, actions]);

  const toggleDiscountType = useCallback(() => {
    setDiscountType((t) => (t === "flat" ? "percent" : "flat"));
    setDiscount(0);
  }, []);

  const resetCart = useCallback(() => {
    setDiscount(0);
    setSelectedCustomer("");
    setCashReceived("");
  }, []);

  return {
    cart, customer, customerBalance,
    selectedCustomer, setSelectedCustomer,
    discount, setDiscount,
    discountType, toggleDiscountType,
    discountAmount,
    cashReceived, setCashReceived,
    paymentMethod, setPaymentMethod,
    cartCalculations, change,
    recentProducts,
    needsCashInput: paymentMethod === "Cash" && cartCalculations.payableAmount > 0,
    handleAddToCart, handleAddBundle, handleBarcodeScan,
    handleQuickBarcode, handleUpdateQuantity,
    handleClearCart, resetCart,
  };
}
