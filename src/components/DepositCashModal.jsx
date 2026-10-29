import Modal from "./ui/Modal";
import SearchableSelect from "./ui/Select";
import React, { useState } from "react";
import { DollarSign, Wallet, CreditCard, ArrowRight } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/helpers";
import { depositCredit, walletDeposit } from "../api/customersApi";

const TAB_DEPOSIT = "deposit"; // clears creditBalance first, excess → walletBalance
const TAB_WALLET  = "wallet";  // adds directly to walletBalance

const DepositCashModal = ({ isOpen, onClose }) => {
  const { customers, refreshCustomer } = useCustomers();
  const { state, actions } = useApp();
  const { settings } = state;

  const [tab, setTab] = useState(TAB_DEPOSIT);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const customer = customers.find(c => c._id === selectedCustomer);
  const dep = parseFloat(amount) || 0;
  const creditBalance = customer?.creditBalance || 0;
  const walletBalance = customer?.walletBalance || 0;

  // Preview — only for display, backend is the source of truth
  const previewDeposit = dep > 0 && customer ? {
    newCredit: Math.max(0, creditBalance - dep),
    newWallet: walletBalance + Math.max(0, dep - creditBalance),
  } : null;

  const previewWallet = dep > 0 && customer ? {
    newWallet: walletBalance + dep,
  } : null;

  const handleSubmit = async () => {
    if (!selectedCustomer) { actions.showToast({ message: "Please select a customer", type: "error" }); return; }
    if (!dep || dep <= 0)   { actions.showToast({ message: "Please enter a valid amount", type: "error" }); return; }

    setSubmitting(true);
    try {
      if (tab === TAB_DEPOSIT) {
        await depositCredit(selectedCustomer, { amount: dep, note });
        actions.showToast({ message: `${formatCurrency(dep, settings.currency)} deposited for ${customer?.name}`, type: "success" });
      } else {
        try {
          await walletDeposit(selectedCustomer, { amount: dep, note });
        } catch (e) {
          // fallback if wallet endpoint not yet on backend
          if (e.response?.status === 404) await depositCredit(selectedCustomer, { amount: dep, note });
          else throw e;
        }
        actions.showToast({ message: `${formatCurrency(dep, settings.currency)} added to ${customer?.name}'s wallet`, type: "success" });
      }
      // Always re-fetch from backend — no local math
      await refreshCustomer(selectedCustomer);
      handleClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Transaction failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomer(""); setAmount(""); setNote("");
    onClose();
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

  return (
    <Modal
          isOpen
          onClose={handleClose}
          title={<>Customer Payment</>}
          size="sm"
          subtitle={<>Deposit cash or top up wallet</>}
          icon={DollarSign}
          footer={<div className="flex justify-end gap-3">
          <ModernButton variant="secondary" onClick={handleClose}>Cancel</ModernButton>
          <ModernButton variant="primary" onClick={handleSubmit} loading={submitting}
            disabled={!selectedCustomer || !dep || dep <= 0} icon={DollarSign}>
            {tab === TAB_DEPOSIT ? "Confirm Deposit" : "Add to Wallet"}
          </ModernButton>
        </div>}><div className="space-y-4">

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[
            { id: TAB_DEPOSIT, label: "Clear Credit", icon: CreditCard },
            { id: TAB_WALLET,  label: "Wallet Top-up", icon: Wallet },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-1.5">
          {tab === TAB_DEPOSIT ? "Clears credit dues first — excess goes to wallet" : "Adds directly to wallet balance"}
        </p>

        {/* Body */}
        <div className="space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Customer</label>
            <SearchableSelect value={selectedCustomer} onChange={e => { setSelectedCustomer(e.target.value); setAmount(""); }}
              className={inputCls + " appearance-none cursor-pointer"}>
              <option value="">Select customer...</option>
              {customers.map(c => {
                const parts = [];
                if (c.creditBalance > 0) parts.push(`Owes: ${formatCurrency(c.creditBalance, settings.currency)}`);
                if (c.walletBalance > 0)  parts.push(`Wallet: ${formatCurrency(c.walletBalance, settings.currency)}`);
                return <option key={c._id} value={c._id}>{c.name} ({c.phone}){parts.length ? ` | ${parts.join(" · ")}` : ""}</option>;
              })}
            </SearchableSelect>
          </div>

          {/* Current balances from backend */}
          {customer && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Owes (Credit)</p>
                <p className="font-bold text-red-700 dark:text-red-300 mt-0.5">{formatCurrency(creditBalance, settings.currency)}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-blue-900/15 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Wallet Balance</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{formatCurrency(walletBalance, settings.currency)}</p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amount ({settings.currency})</label>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" className={inputCls} />
          </div>

          {/* Preview (indicative only — backend is source of truth) */}
          {dep > 0 && customer && (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected result</p>
              {tab === TAB_DEPOSIT && previewDeposit && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Owes (Credit)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(creditBalance, settings.currency)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className={`font-bold ${previewDeposit.newCredit === 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(previewDeposit.newCredit, settings.currency)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Wallet</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(walletBalance, settings.currency)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-emerald-600">{formatCurrency(previewDeposit.newWallet, settings.currency)}</span>
                    </div>
                  </div>
                </>
              )}
              {tab === TAB_WALLET && previewWallet && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Wallet</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through">{formatCurrency(walletBalance, settings.currency)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-emerald-600">{formatCurrency(previewWallet.newWallet, settings.currency)}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400 italic">Actual values confirmed by server after save</p>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Cash received in person" className={inputCls} />
          </div>
        </div>



      </div></Modal>
  );
};

export default DepositCashModal;
