import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, X, Banknote, CreditCard, Smartphone, Receipt, ChevronDown, User } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import ModernButton from "../ui/ModernButton";
import Input from "../ui/Input";

const itemVariants = {
  hidden: { opacity: 0, x: 20, height: 0 },
  visible: { opacity: 1, x: 0, height: "auto", transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, height: 0, transition: { duration: 0.2 } },
};

const paymentMethods = [
  { id: "Cash",            icon: Banknote,    label: "Cash" },
  { id: "Credit",          icon: CreditCard,  label: "Credit" },
  { id: "Online Transfer", icon: Smartphone,  label: "Online" },
];

const CartPanel = ({
  cart, customerOptions, selectedCustomer, onCustomerChange,
  discount, onDiscountChange, paymentMethod, onPaymentMethodChange,
  cashReceived, onCashReceivedChange, cartCalculations, change,
  needsCashInput, isOnline, checkoutLoading,
  onRemoveItem, onClearCart, onCheckout,
  currency, taxRate,
}) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium flex flex-col h-full"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white">Cart</h2>
        {cart.length > 0 && (
          <motion.span
            key={cart.length}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {cart.length}
          </motion.span>
        )}
      </div>
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>

    {/* Customer selector */}
    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={selectedCustomer}
          onChange={onCustomerChange}
          className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">Walk-in Customer</option>
          {customerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>

    {/* Cart items */}
    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 max-h-72">
      <AnimatePresence initial={false}>
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            </motion.div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add products to get started</p>
          </motion.div>
        ) : (
          cart.map(item => (
            <motion.div
              key={item.productId}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatCurrency(item.price, currency)} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(item.price * item.quantity, currency)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>

    {/* Totals + Checkout */}
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
        >
          {/* Line items */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cartCalculations.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax ({taxRate}%)</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cartCalculations.tax, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Discount</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{currency}</span>
                <input
                  type="number" min="0" max={cartCalculations.subtotal} value={discount}
                  onChange={onDiscountChange}
                  className="w-20 px-2 py-1 text-right text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            {cartCalculations.balanceUsed > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800"
              >
                <span>Balance Deducted</span>
                <span>- {formatCurrency(cartCalculations.balanceUsed, currency)}</span>
              </motion.div>
            )}
          </div>

          {/* Grand total */}
          <motion.div
            layout
            className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700"
          >
            <span className="font-bold text-slate-900 dark:text-white">
              {cartCalculations.balanceUsed > 0 ? "Payable Amount" : "Grand Total"}
            </span>
            <motion.span
              key={cartCalculations.payableAmount}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400"
            >
              {formatCurrency(cartCalculations.payableAmount, currency)}
            </motion.span>
          </motion.div>

          {/* Payment methods */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const active = paymentMethod === method.id;
                return (
                  <motion.button
                    key={method.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onPaymentMethodChange(method.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <method.icon className={`w-5 h-5 ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    {method.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Cash input */}
          <AnimatePresence>
            {needsCashInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Input
                  label="Cash Received"
                  type="number"
                  min={cartCalculations.payableAmount}
                  value={cashReceived}
                  onChange={onCashReceivedChange}
                  placeholder="Enter amount"
                />
                <AnimatePresence>
                  {parseFloat(cashReceived) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex justify-between text-sm p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800"
                    >
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Change</span>
                      <span className={`font-bold ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                        {formatCurrency(change >= 0 ? change : 0, currency)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fully covered notice */}
          <AnimatePresence>
            {paymentMethod === "Cash" && cartCalculations.balanceUsed >= cartCalculations.grandTotal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center"
              >
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ Fully covered by customer balance</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Checkout button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(16,185,129,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onCheckout}
            disabled={cart.length === 0 || checkoutLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {checkoutLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                {isOnline ? "Process Payment & Generate Invoice" : "Process Payment (Offline)"}
              </>
            )}
          </motion.button>

          {/* Offline warning */}
          <AnimatePresence>
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-amber-600 dark:text-amber-400 text-center p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
              >
                ⚠️ Working offline — Invoice will sync when connection is restored
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default CartPanel;
