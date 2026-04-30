import React, { useState, useEffect } from "react";
import { Save, Loader2, Building2, DollarSign, Receipt, CheckCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getMyShop, updateShop } from "../../api/shopApi";
import SettingsCard from "./SettingsCard";

const inp = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none";

const ShopPanel = () => {
  const { state, actions } = useApp();
  const { themeColor } = state;
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ taxRate: "", currency: "", receiptFooter: "" });

  useEffect(() => {
    getMyShop()
      .then(r => {
        const s = r.data.data?.shop;
        if (s) {
          setShop(s);
          setForm({ taxRate: s.taxRate ?? 5, currency: s.currency || "Rs.", receiptFooter: s.receiptFooter || "Thank you for your purchase!" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    try {
      await updateShop(shop._id, {
        taxRate: parseFloat(form.taxRate) || 0,
        currency: form.currency,
        receiptFooter: form.receiptFooter,
      });
      actions.updateSettings({ taxRate: parseFloat(form.taxRate) || 0, currency: form.currency, receiptFooter: form.receiptFooter });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      actions.showToast({ message: "Shop settings saved", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  if (!shop) return (
    <SettingsCard title="Shop Settings" desc="Configure your shop details">
      <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No shop found. Complete shop setup in <strong>My Shop</strong> first.</p>
      </div>
    </SettingsCard>
  );

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Shop Settings"
        desc="Tax rate, currency symbol, and receipt message"
        action={
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: saved ? "#10b981" : themeColor }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        }
      >
        <div className="space-y-5">
          {/* Tax + Currency row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Tax Rate (%)
              </label>
              <input type="number" min="0" max="100" step="0.1" value={form.taxRate}
                onChange={e => f("taxRate", e.target.value)} className={inp} placeholder="e.g. 5" />
              <p className="text-[11px] text-slate-400 mt-1">Applied to all taxable sales</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Currency Symbol
              </label>
              <input type="text" value={form.currency}
                onChange={e => f("currency", e.target.value)} className={inp} placeholder="e.g. Rs. or $" />
              <p className="text-[11px] text-slate-400 mt-1">Shown on invoices and receipts</p>
            </div>
          </div>

          {/* Receipt footer */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Receipt className="w-3.5 h-3.5 text-slate-400" /> Receipt Footer Message
            </label>
            <textarea rows={3} value={form.receiptFooter}
              onChange={e => f("receiptFooter", e.target.value)}
              className={inp + " resize-none"} placeholder="Thank you for your purchase!" />
            <p className="text-[11px] text-slate-400 mt-1">Printed at the bottom of every receipt</p>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Receipt Preview</p>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{state.settings?.shopName || "Your Shop"}</p>
              <p className="text-xs text-slate-500">Tax: {form.taxRate}% · Currency: {form.currency}</p>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2" />
              <p className="text-xs text-slate-500 italic">{form.receiptFooter || "Thank you for your purchase!"}</p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default ShopPanel;
