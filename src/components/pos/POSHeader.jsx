import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Receipt, Scan, Wifi, WifiOff, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const POSHeader = ({ isOnline, itemCount, onScanOpen }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      {/* Left */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Point of Sale
          </h1>
        </div>
        <div className="flex items-center gap-3 ml-13 pl-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fast checkout · Real-time inventory
          </p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </motion.div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors shadow-sm"
        >
          <Receipt className="w-4 h-4" />
          View Invoices
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onScanOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Scan className="w-4 h-4" />
          Scan
        </motion.button>

        <motion.div
          key={itemCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-glow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default POSHeader;
