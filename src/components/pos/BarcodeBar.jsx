import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Barcode, Plus, CheckCircle } from "lucide-react";

const BarcodeBar = ({ value, onChange, onSubmit, inputRef }) => {
  const [focused, setFocused] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleSubmit = (e) => {
    onSubmit(e);
    if (value.trim()) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 3px rgba(16,185,129,0.2), 0 4px 20px rgba(16,185,129,0.1)"
              : "0 1px 3px rgba(0,0,0,0.06)",
          }}
          transition={{ duration: 0.2 }}
          className="flex gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex-1 relative">
            <motion.div
              animate={{ color: focused ? "#10b981" : "#94a3b8" }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <Barcode className="w-5 h-5" />
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Scan or type barcode and press Enter..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono border border-transparent focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            animate={{ backgroundColor: flash ? "#059669" : "#10b981" }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow-sm"
          >
            <AnimatePresence mode="wait">
              {flash ? (
                <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <CheckCircle className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Plus className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
            Add
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default BarcodeBar;
