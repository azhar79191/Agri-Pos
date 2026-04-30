import React from "react";
import { DollarSign, Receipt, Percent, Save, Loader2, CheckCircle } from "lucide-react";
import ShopCard from "./ShopCard";
import { inp } from "./shopConfig";

const CURRENCIES = [
  { symbol: "Rs.", label: "Pakistani Rupee (Rs.)" },
  { symbol: "₹",  label: "Indian Rupee (₹)" },
  { symbol: "$",  label: "US Dollar ($)" },
  { symbol: "€",  label: "Euro (€)" },
  { symbol: "£",  label: "British Pound (£)" },
  { symbol: "AED",label: "UAE Dirham (AED)" },
];

const BillingPanel = ({ form, setForm, saving, saved, onSave, shopName }) => {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <ShopCard title="Tax & Currency" desc="Applied to all sales and shown on invoices"
        action={
          <button onClick={onSave} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-400" /> Tax Rate (%)
              </label>
              <input type="number" min="0" max="100" step="0.1" value={form.taxRate}
                onChange={e => f("taxRate", e.target.value)} className={inp} placeholder="e.g. 5" />
              <p className="text-[11px] text-slate-400 mt-1">Applied to all taxable sales at checkout</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Currency
              </label>
              <select value={form.currency} onChange={e => f("currency", e.target.value)} className={inp}>
                {CURRENCIES.map(c => <option key={c.symbol} value={c.symbol}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tax preview */}
          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map(amount => (
              <div key={amount} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-1">On {form.currency}{amount}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  +{form.currency}{((amount * (parseFloat(form.taxRate) || 0)) / 100).toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-400">tax</p>
              </div>
            ))}
          </div>
        </div>
      </ShopCard>

      <ShopCard title="Receipt Settings" desc="Footer message printed at the bottom of every receipt">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" /> Footer Message
            </label>
            <textarea rows={2} value={form.receiptFooter} onChange={e => f("receiptFooter", e.target.value)}
              placeholder="Thank you for your purchase!" className={inp + " resize-none"} />
          </div>

          {/* Receipt preview */}
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 font-mono text-xs">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 font-sans">Receipt Preview</p>
            <div className="text-center space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-sm">{shopName || "Your Shop"}</p>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2" />
              <div className="flex justify-between text-[11px]"><span>Subtotal</span><span>{form.currency}1,000.00</span></div>
              <div className="flex justify-between text-[11px]"><span>Tax ({form.taxRate || 0}%)</span><span>{form.currency}{((1000 * (parseFloat(form.taxRate) || 0)) / 100).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-[12px] border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 mt-1">
                <span>Total</span>
                <span>{form.currency}{(1000 + (1000 * (parseFloat(form.taxRate) || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2" />
              <p className="text-[11px] italic text-slate-500">{form.receiptFooter || "Thank you for your purchase!"}</p>
            </div>
          </div>
        </div>
      </ShopCard>
    </div>
  );
};

export default BillingPanel;
