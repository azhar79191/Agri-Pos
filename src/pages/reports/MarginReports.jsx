import React, { useState, useEffect } from "react";
import { PieChart, TrendingDown, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { getMarginReport } from "../../api/reportsApi";

const MarginReports = () => {
  const { state } = useApp();
  const { settings } = state;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarginReport()
      .then(res => setCategories(res.data.data.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm"><PieChart className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Margin Analysis</h1><p className="text-sm text-slate-500 dark:text-slate-400">Category-wise margin breakdown</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No margin data available. Make some sales first.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.category} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 hover:shadow-premium-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-900 dark:text-white">{c.category}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.margin >= 25 ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : c.margin >= 20 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{c.margin}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${Math.min(c.margin * 3, 100)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">Revenue</p><p className="font-bold text-slate-900 dark:text-white">{formatCurrency(c.revenue, settings.currency)}</p></div>
                <div><p className="text-xs text-slate-400">Profit</p><p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.profit, settings.currency)}</p></div>
              </div>
              {c.margin < 20 && <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-xs text-red-600 dark:text-red-400"><TrendingDown className="w-3 h-3" />Low margin — consider price adjustment</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MarginReports;
