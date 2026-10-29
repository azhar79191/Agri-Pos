import PageHeader from "../ui/PageHeader";
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Receipt, Scan, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const POSHeader = ({ isOnline, itemCount, onScanOpen }) => {
  const navigate = useNavigate();
  return (
    <PageHeader description={<span className="inline-flex items-center gap-2">Checkout <span role="status" className={isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>{isOnline ? "Online" : "Offline"}</span></span>} title={<>
            Point of Sale
          </>} icon={ShoppingCart} actions={<><div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors shadow-sm"
        >
          <Receipt className="w-4 h-4" />
          View Invoices
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onScanOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Scan className="w-4 h-4 hidden sm:block " />
          Scan
        </motion.button>

        <motion.div
          key={itemCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <ShoppingCart className="w-4 h-4" />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </motion.div>
      </div></>}></PageHeader>
  );
};

export default POSHeader;
