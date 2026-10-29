import Modal from "../ui/Modal";
import React from "react";
import { UserPlus } from "lucide-react";

/**
 * QuickAddCustomerModal — lightweight modal for adding a customer directly from POS.
 */
const QuickAddCustomerModal = ({ form, onChange, onSubmit, onClose, loading }) => {

  return (
  <Modal
          isOpen
          onClose={onClose}
          title={<>Quick Add Customer</>}
          size="xs"
          icon={UserPlus}
          footer={<div className="flex gap-3">
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
      </div>}><div className="space-y-4">


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


    </div></Modal>
  );
};

export default QuickAddCustomerModal;
