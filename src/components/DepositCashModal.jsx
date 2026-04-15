import React, { useState } from "react";
import { createPortal } from "react-dom";
import { DollarSign, CreditCard, X } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/helpers";
import { depositCredit } from "../api/customersApi";

const DepositCashModal = ({ isOpen, onClose }) => {
  const { customers, fetchCustomers } = useCustomers();
  const { state, actions } = useApp();
  const { settings } = state;

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const creditCustomers = customers.filter((c) => (c.creditBalance || 0) > 0);
  const customer = customers.find((c) => c._id === selectedCustomer);

  const handleDeposit = async () => {
    if (!selectedCustomer) {
      actions.showToast({ message: "Please select a customer", type: "error" });
      return;
    }
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      actions.showToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await depositCredit(selectedCustomer, { amount: depositAmount });
      const excess = Math.max(0, depositAmount - (customer?.creditBalance || 0));
      const msg = excess > 0
        ? `${formatCurrency(depositAmount, settings.currency)} deposited. ${formatCurrency(excess, settings.currency)} added to wallet.`
        : `${formatCurrency(depositAmount, settings.currency)} deposited for ${customer?.name}`;
      actions.showToast({ message: msg, type: "success" });
      await fetchCustomers();
      handleClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Deposit failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomer("");
    setAmount("");
    setNote("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-[10000] w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deposit Cash</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Clear customer credit balance</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Customer Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => { setSelectedCustomer(e.target.value); setAmount(""); }}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select customer...</option>
              {creditCustomers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — Owes {formatCurrency(c.creditBalance, settings.currency)}
                </option>
              ))}
            </select>
            {creditCustomers.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No customers with outstanding credit</p>
            )}
          </div>

          {/* Customer Info */}
          {customer && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{customer.name}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Outstanding credit: {formatCurrency(customer.creditBalance, settings.currency)}
                </p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deposit Amount ({settings.currency})
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter exact amount to deposit"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {customer && amount && parseFloat(amount) > 0 && (() => {
              const dep = parseFloat(amount);
              const excess = Math.max(0, dep - (customer.creditBalance || 0));
              const remaining = Math.max(0, (customer.creditBalance || 0) - dep);
              return (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Credit after deposit: {formatCurrency(remaining, settings.currency)}
                  </p>
                  {excess > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {formatCurrency(excess, settings.currency)} will be added to wallet balance
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cash received in person"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
          <ModernButton variant="secondary" onClick={handleClose}>Cancel</ModernButton>
          <ModernButton
            variant="primary"
            onClick={handleDeposit}
            loading={submitting}
            disabled={!selectedCustomer || !amount || parseFloat(amount) <= 0}
            icon={DollarSign}
          >
            Confirm Deposit
          </ModernButton>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DepositCashModal;
