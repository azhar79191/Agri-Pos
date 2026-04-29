import React, { useState, useEffect } from "react";
import { Package, DollarSign, TrendingDown, Archive, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { getInventoryReport } from "../../api/reportsApi";

const InventoryReports = () => {
  const { state } = useApp();
  const { settings } = state;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventoryReport()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || { totalProducts: 0, totalStockValue: 0, lowStockCount: 0, outOfStockCount: 0 };
  const categorySummary = data?.categorySummary || {};
  const products = data?.products || [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-glow-sm"><Package className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Reports</h1><p className="text-sm text-slate-500 dark:text-slate-400">Stock valuation and turnover analysis</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Total Products", v: summary.totalProducts, c: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Package },
              { l: "Stock Value", v: formatCurrency(summary.totalStockValue, settings.currency), c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: DollarSign },
              { l: "Low Stock", v: summary.lowStockCount, c: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: TrendingDown },
              { l: "Out of Stock", v: summary.outOfStockCount, c: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: Archive },
            ].map(({ l, v, c, bg, icon: I }) => (
              <div key={l} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><I className={`w-5 h-5 ${c}`} /></div><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p><p className={`text-xl font-bold mt-0.5 ${c}`}>{v}</p></div></div></div>
            ))}
          </div>

          {Object.keys(categorySummary).length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Category Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(categorySummary).map(([cat, d]) => (
                  <div key={cat} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{cat}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>{d.count} products</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.stockValue, settings.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800"><p className="font-bold text-slate-900 dark:text-white text-sm">Product Stock Details</p></div>
            <div className="overflow-x-auto">
              <table className="w-full table-premium">
                <thead><tr>{["Product", "Category", "Stock", "Unit", "Value", "Status"].map(h => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5"><p className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</p><p className="text-xs text-slate-400 font-mono">{p.sku}</p></td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{p.category}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{p.stock}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{p.unit}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.stockValue, settings.currency)}</td>
                      <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === "In Stock" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : p.status === "Low Stock" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default InventoryReports;
