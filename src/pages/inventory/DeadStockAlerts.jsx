import React, { useState, useMemo, useEffect } from "react";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Archive, Zap, BarChart2, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { getInventoryReport } from "../../api/reportsApi";
import EmptyState from "../../components/ui/EmptyState";

const getVelocity = (product) => {
  if (product.stock === 0) return "dead";
  if (product.stock > (product.minStockLevel || 5) * 10) return "overstock";
  if (product.stock <= (product.minStockLevel || 5)) return "fast";
  return "medium";
};

const velocityConfig = {
  fast:      { label: "Fast Moving",  color: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", icon: TrendingUp,    dot: "bg-emerald-500" },
  medium:    { label: "Normal",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",             icon: BarChart2,     dot: "bg-blue-500" },
  dead:      { label: "Dead Stock",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 icon: Archive,       dot: "bg-red-500" },
  overstock: { label: "Overstock",     color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         icon: AlertTriangle, dot: "bg-amber-500" },
};

const DeadStockAlerts = () => {
  const { state } = useApp();
  const { settings } = state;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getInventoryReport()
      .then(res => setProducts(res.data.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enriched = useMemo(() => products.map(p => ({ ...p, velocity: getVelocity(p) })), [products]);
  const filtered = useMemo(() => filter === "all" ? enriched : enriched.filter(d => d.velocity === filter), [enriched, filter]);

  const stats = useMemo(() => ({
    fast:      enriched.filter(d => d.velocity === "fast").length,
    dead:      enriched.filter(d => d.velocity === "dead").length,
    overstock: enriched.filter(d => d.velocity === "overstock").length,
    deadValue: enriched.filter(d => d.velocity === "dead").reduce((s, d) => s + (d.stock * (d.costPrice || 0)), 0),
  }), [enriched]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm"><Zap className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Inventory Alerts</h1><p className="text-sm text-slate-500 dark:text-slate-400">Fast movers, dead stock, and overstock detection</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Fast Moving", value: stats.fast, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20", icon: TrendingUp },
              { label: "Dead Stock", value: stats.dead, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: Archive },
              { label: "Overstock", value: stats.overstock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: AlertTriangle },
              { label: "Dead Stock Value", value: formatCurrency(stats.deadValue, settings.currency), color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: TrendingDown },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p><p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p></div></div></div>
            ))}
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
            {[{ id: "all", label: "All" }, { id: "fast", label: "Fast Moving" }, { id: "dead", label: "Dead Stock" }, { id: "overstock", label: "Overstock" }].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.id ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"}`}>{t.label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Package} title="No items match this filter" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item => {
                const vc = velocityConfig[item.velocity];
                const VIcon = vc.icon;
                return (
                  <div key={item._id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 hover:shadow-premium-lg hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div><p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p><p className="text-xs text-slate-400 mt-0.5">{item.category}</p></div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${vc.color}`}><VIcon className="w-3 h-3" />{vc.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-slate-400">Current Stock</p><p className="font-bold text-slate-900 dark:text-white">{item.stock} {item.unit}</p></div>
                      <div><p className="text-xs text-slate-400">Min Level</p><p className="font-bold text-slate-900 dark:text-white">{item.minStockLevel || 5}</p></div>
                      <div><p className="text-xs text-slate-400">Sale Price</p><p className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.price, settings.currency)}</p></div>
                      <div><p className="text-xs text-slate-400">Stock Value</p><p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.stockValue || 0, settings.currency)}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default DeadStockAlerts;
