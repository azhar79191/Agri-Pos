import React, { useState, useEffect } from "react";
import { AlertTriangle, Save, Loader2, CheckCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getMyShop, updateShop } from "../../api/shopApi";
import SettingsCard from "./SettingsCard";

const inp = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none";

const AlertsPanel = () => {
  const { state, actions } = useApp();
  const { themeColor } = state;
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [threshold, setThreshold] = useState("5");

  useEffect(() => {
    getMyShop()
      .then(r => {
        const s = r.data.data?.shop;
        if (s) { setShop(s); setThreshold(String(s.lowStockThreshold ?? 5)); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    try {
      await updateShop(shop._id, { lowStockThreshold: parseInt(threshold) || 5 });
      actions.updateSettings({ lowStockThreshold: parseInt(threshold) || 5 });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      actions.showToast({ message: "Alert threshold saved", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <SettingsCard
      title="Stock Alert Threshold"
      desc="Products at or below this quantity will be flagged as low stock"
      action={
        <button onClick={handleSave} disabled={saving || !shop}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
          style={{ background: saved ? "#10b981" : themeColor }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      }
    >
      {!shop ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 dark:text-slate-400">No shop found. Complete shop setup first.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="max-w-xs">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Minimum Stock Quantity
            </label>
            <input type="number" min="1" value={threshold}
              onChange={e => setThreshold(e.target.value)} className={inp} placeholder="e.g. 5" />
          </div>

          {/* Visual indicator */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Out of Stock", color: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800", dot: "bg-red-500", text: "text-red-700 dark:text-red-400", note: "qty = 0" },
              { label: "Low Stock",    color: "bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", note: `qty ≤ ${threshold || 5}` },
              { label: "In Stock",     color: "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", note: `qty > ${threshold || 5}` },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl border ${s.color} flex flex-col gap-1.5`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                  <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SettingsCard>
  );
};

export default AlertsPanel;
