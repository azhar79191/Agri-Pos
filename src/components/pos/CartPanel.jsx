import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, X, Banknote, CreditCard, Smartphone, Receipt, ChevronDown, User, PauseCircle, UserPlus, Percent, Hash } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Input from "../ui/Input";
import { useApp } from "../../context/AppContext";

const itemVariants = {
  hidden: { opacity: 0, x: 20, height: 0 },
  visible: { opacity: 1, x: 0, height: "auto", transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, height: 0, transition: { duration: 0.2 } },
};

const paymentMethods = [
  { id: "Cash",            icon: Banknote,   label: "Cash" },
  { id: "Credit",          icon: CreditCard, label: "Credit" },
  { id: "Online Transfer", icon: Smartphone, label: "Online" },
];

const CartPanel = ({
  cart, customerOptions, selectedCustomer, onCustomerChange, onAddCustomer,
  discount, discountType, discountAmount, onDiscountChange, onDiscountTypeToggle,
  paymentMethod, onPaymentMethodChange,
  cashReceived, onCashReceivedChange, cartCalculations, change,
  needsCashInput, isOnline, checkoutLoading,
  onRemoveItem, onUpdateQuantity, onClearCart,
  onHoldSale, onShowHeld, heldCount,
  onCheckout, currency, taxRate,
}) => {
  const { state } = useApp();
  const tc = state.themeColor || "#10b981";
  const tcA = (a) => `${tc}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

  return (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white dark:bg-[#0d1f14] rounded-2xl border border-slate-200/80 dark:border-emerald-900/20 shadow-premium flex flex-col h-full"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-emerald-900/15">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tc}, ${tcA(0.7)})` }}>
          <ShoppingCart className="w-3.5 h-3.5 text-white" />
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white text-sm">Cart</h2>
        {cart.length > 0 && (
          <motion.span key={cart.length} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ background: tc }}>
            {cart.length}
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {/* Held sales button */}
        <button onClick={onShowHeld} className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border border-amber-200 dark:border-amber-800/50">
          <PauseCircle className="w-3.5 h-3.5" />
          Held
          {heldCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{heldCount}</span>}
        </button>
        {/* Hold current sale */}
        {cart.length > 0 && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.9 }}
            onClick={onHoldSale}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#122b1c] transition-colors"
            title="Hold this sale">
            <PauseCircle className="w-3.5 h-3.5" />Hold
          </motion.button>
        )}
        {cart.length > 0 && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileTap={{ scale: 0.9 }}
            onClick={onClearCart}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-3 h-3" />Clear
          </motion.button>
        )}
      </div>
    </div>

    {/* Customer selector */}
    <div className="px-4 py-3 border-b border-slate-100 dark:border-emerald-900/15">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={selectedCustomer} onChange={onCustomerChange}
            className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/30 bg-slate-50 dark:bg-[#122b1c] text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer">
            <option value="">Walk-in Customer</option>
            {customerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={onAddCustomer} title="Quick add customer"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-emerald-900/30 bg-slate-50 dark:bg-[#122b1c] text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:border-emerald-400 transition-colors flex-shrink-0">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Cart items */}
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-64">
      <AnimatePresence initial={false}>
        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            </motion.div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add products to get started</p>
          </motion.div>
        ) : (
          cart.map(item => (
            <motion.div key={item.productId} variants={itemVariants} initial="hidden" animate="visible" exit="exit" layout
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#122b1c] border border-slate-100 dark:border-emerald-900/15 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatCurrency(item.price, currency)} each</p>
              </div>
              <div className="flex items-center gap-0.5 bg-white dark:bg-[#0d1f14] rounded-lg border border-slate-200 dark:border-emerald-900/20 flex-shrink-0">
                <button onClick={() => item.quantity <= 1 ? onRemoveItem(item.productId) : onUpdateQuantity(item.productId, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors font-bold rounded-l-lg">−</button>
                <input type="number" min="1" value={item.quantity}
                  onChange={e => { const v = parseInt(e.target.value); if (v > 0) onUpdateQuantity(item.productId, v); }}
                  className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none" />
                <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors font-bold rounded-r-lg">+</button>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs w-14 text-right flex-shrink-0">{formatCurrency(item.price * item.quantity, currency)}</span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => onRemoveItem(item.productId)}
                className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                <X className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>

    {/* Totals + Checkout */}
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          className="px-4 py-3 border-t border-slate-100 dark:border-emerald-900/15 space-y-3">

          {/* Line items */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cartCalculations.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax ({taxRate}%)</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cartCalculations.tax, currency)}</span>
            </div>

            {/* Discount with flat/percent toggle */}
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Discount</span>
              <div className="flex items-center gap-1.5">
                <button onClick={onDiscountTypeToggle} title={discountType === "flat" ? "Switch to percent" : "Switch to flat amount"}
                  className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-emerald-900/30 bg-white dark:bg-[#122b1c] text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors">
                  {discountType === "flat" ? <Hash className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                </button>
                <span className="text-xs text-slate-400">{discountType === "flat" ? currency : "%"}</span>
                <input type="number" min="0" max={discountType === "percent" ? 100 : cartCalculations.subtotal}
                  value={discount} onChange={onDiscountChange}
                  className="w-16 px-2 py-1 text-right text-xs border border-slate-200 dark:border-emerald-900/30 rounded-lg bg-white dark:bg-[#122b1c] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-medium" style={{ color: tc }}>
                <span>Discount applied</span>
                <span>− {formatCurrency(discountAmount, currency)}</span>
              </div>
            )}

            {cartCalculations.balanceUsed > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <span>Balance Deducted</span>
                <span>− {formatCurrency(cartCalculations.balanceUsed, currency)}</span>
              </motion.div>
            )}
          </div>

          {/* Grand total */}
          <motion.div layout className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-emerald-900/20">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{cartCalculations.balanceUsed > 0 ? "Payable" : "Total"}</span>
            <motion.span key={cartCalculations.payableAmount} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-xl font-extrabold"
              style={{ color: tc }}>
              {formatCurrency(cartCalculations.payableAmount, currency)}
            </motion.span>
          </motion.div>

          {/* Payment methods */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment</p>
            <div className="grid grid-cols-3 gap-1.5">
              {paymentMethods.map(method => {
                const active = paymentMethod === method.id;
                return (
                  <motion.button key={method.id} whileTap={{ scale: 0.94 }} onClick={() => onPaymentMethodChange(method.id)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all"
                    style={active ? {
                      borderColor: tc,
                      background: tcA(0.12),
                      color: tc,
                    } : {
                      borderColor: "transparent",
                    }}>
                    <method.icon className="w-4 h-4" style={{ color: active ? tc : undefined }} />
                    {method.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Cash input */}
          <AnimatePresence>
            {needsCashInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                <Input label="Cash Received" type="number" min={cartCalculations.payableAmount} value={cashReceived} onChange={onCashReceivedChange} placeholder="Enter amount" />
                <AnimatePresence>
                  {parseFloat(cashReceived) > 0 && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex justify-between text-sm p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">Change</span>
                      <span className={`font-bold text-xs ${change >= 0 ? "" : "text-red-600"}`}
                style={change >= 0 ? { color: tc } : {}}>
                        {formatCurrency(change >= 0 ? change : 0, currency)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fully covered */}
          <AnimatePresence>
            {paymentMethod === "Cash" && cartCalculations.balanceUsed >= cartCalculations.grandTotal && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">✓ Fully covered by customer balance</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Checkout */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onCheckout} disabled={cart.length === 0 || checkoutLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tcA(0.8)})`, boxShadow: `0 4px 15px ${tcA(0.4)}` }}>
            {checkoutLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <><Receipt className="w-4 h-4" />{isOnline ? "Process & Generate Invoice" : "Process (Offline)"}</>
            )}
          </motion.button>

          {/* Offline warning */}
          <AnimatePresence>
            {!isOnline && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-amber-600 dark:text-amber-400 text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                ⚠️ Offline — will sync when connection restores
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
  );
};

export default CartPanel;
