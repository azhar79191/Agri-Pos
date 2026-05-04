import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Trash2, X, Banknote, CreditCard, Smartphone,
  Receipt, ChevronDown, User, PauseCircle, UserPlus, Percent,
  Hash, Package, ArrowRight, Wifi, WifiOff, Tag
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { useApp } from "../../context/AppContext";

const paymentMethods = [
  { id: "Cash",            icon: Banknote,   label: "Cash",   color: "emerald" },
  { id: "Credit",          icon: CreditCard, label: "Credit", color: "orange" },
  { id: "Online Transfer", icon: Smartphone, label: "Online", color: "blue" },
];

const PAY_COLORS = {
  emerald: { active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400" },
  orange:  { active: "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",   icon: "text-orange-600 dark:text-orange-400" },
  blue:    { active: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",             icon: "text-blue-600 dark:text-blue-400" },
};

const CartPanel = ({
  cart, customerOptions, selectedCustomer, onCustomerChange, onAddCustomer,
  salesReps = [], selectedSalesRep, onSalesRepChange,
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 flex flex-col overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm leading-none">Order Summary</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} · {cartCalculations.itemCount} qty</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onShowHeld}
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 transition-colors">
              <PauseCircle className="w-3.5 h-3.5" /> Held
              {heldCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">{heldCount}</span>
              )}
            </button>
            {cart.length > 0 && (
              <>
                <button onClick={onHoldSale} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Hold sale">
                  <PauseCircle className="w-3.5 h-3.5" />
                </button>
                <button onClick={onClearCart} className="p-1.5 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Clear cart">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Customer selector ── */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select value={selectedCustomer} onChange={onCustomerChange}
              className="w-full appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer outline-none">
              <option value="">Walk-in Customer</option>
              {customerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={onAddCustomer} title="Quick add customer"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors shrink-0">
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Sales Rep selector */}
        {salesReps.length > 0 && (
          <div className="relative mt-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <select value={selectedSalesRep} onChange={onSalesRepChange}
              className="w-full appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer outline-none">
              <option value="">No Sales Rep</option>
              {salesReps.map(r => <option key={r._id} value={r._id}>{r.name} ({r.commission}% commission)</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ── Cart items ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "260px" }}>
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                <ShoppingCart className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              </motion.div>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Your cart is empty</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5">Add products from the left</p>
            </motion.div>
          ) : (
            cart.map(item => (
              <motion.div key={item.productId}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors group">
                {/* Product icon */}
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(item.price, currency)} each</p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                  <button onClick={() => item.quantity <= 1 ? onRemoveItem(item.productId) : onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors text-sm font-bold rounded-l-lg">−</button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors text-sm font-bold rounded-r-lg">+</button>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs w-14 text-right shrink-0">
                  {formatCurrency(item.price * item.quantity, currency)}
                </span>
                <button onClick={() => onRemoveItem(item.productId)}
                  className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Checkout section ── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">

            {/* Discount row */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex-1">Discount</span>
              <button onClick={onDiscountTypeToggle}
                className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors">
                {discountType === "flat" ? <Hash className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
              </button>
              <span className="text-[10px] text-slate-400">{discountType === "flat" ? currency : "%"}</span>
              <input type="number" min="0" max={discountType === "percent" ? 100 : cartCalculations.subtotal}
                value={discount} onChange={onDiscountChange}
                className="w-16 px-2 py-1 text-right text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
            </div>

            {/* Order totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Subtotal ({cartCalculations.itemCount} items)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cartCalculations.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Tax ({taxRate}%)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cartCalculations.tax, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>− {formatCurrency(discountAmount, currency)}</span>
                </div>
              )}
              {cartCalculations.balanceUsed > 0 && (
                <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/15 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <span>Wallet Balance</span>
                  <span>− {formatCurrency(cartCalculations.balanceUsed, currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Total Payable</span>
                <motion.span key={cartCalculations.payableAmount} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="text-xl font-black" style={{ color: tc }}>
                  {formatCurrency(cartCalculations.payableAmount, currency)}
                </motion.span>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map(method => {
                  const active = paymentMethod === method.id;
                  const pc = PAY_COLORS[method.color];
                  return (
                    <motion.button key={method.id} whileTap={{ scale: 0.94 }}
                      onClick={() => onPaymentMethodChange(method.id)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${active ? pc.active : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"}`}>
                      <method.icon className={`w-4 h-4 ${active ? pc.icon : ""}`} />
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cash Received</label>
                    <input type="number" min={cartCalculations.payableAmount} value={cashReceived} onChange={onCashReceivedChange}
                      placeholder={`Min ${formatCurrency(cartCalculations.payableAmount, currency)}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
                  </div>
                  <AnimatePresence>
                    {parseFloat(cashReceived) > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Change</span>
                        <span className={`text-sm font-black ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {formatCurrency(Math.max(change, 0), currency)}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkout button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onCheckout} disabled={cart.length === 0 || checkoutLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}cc)`, boxShadow: `0 8px 24px ${tc}40` }}>
              {checkoutLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  {isOnline ? "Place Order" : "Process Offline"}
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </motion.button>

            {/* Online status */}
            <div className={`flex items-center justify-center gap-1.5 text-[10px] font-semibold ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? "Connected — invoice will be generated" : "Offline — will sync when connected"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartPanel;
