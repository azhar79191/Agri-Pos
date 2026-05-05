import React from "react";
import { UserPlus } from "lucide-react";

/**
 * QuickAddCustomerModal — lightweight modal for adding a customer directly from POS.
 */
const QuickAddCustomerModal = ({ form, onChange, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
    <div
      className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in p-5 space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white">Quick Add Customer</h3>
      </div>

      {["name", "phone", "address"].map((field, i) => (
        <input
          key={field}
          autoFocus={i === 0}
          placeholder={field === "name" ? "Customer name" : field === "phone" ? "Phone number" : "Address (optional)"}
          value={form[field]}
          onChange={(e) => onChange(field, e.target.value)}
          onKeyDown={field === "address" ? (e) => e.key === "Enter" && onSubmit() : undefined}
          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
      ))}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {loading ? "Adding..." : "Add & Select"}
        </button>
      </div>
    </div>
  </div>
);

export default QuickAddCustomerModal;
