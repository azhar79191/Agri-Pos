import React, { useState, useEffect } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getProfitReport } from "../../api/reportsApi";

const ProfitReports = () => {
  const { state } = useApp();
  const { settings } = state;
  const [data, setData] = useState({ rows: [], summary: { totalRevenue: 0, totalCost: 0, totalProfit: 0, avgMargin: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfitReport()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { rows, summary } = data;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm"><DollarSign className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profit Reports</h1><p className="text-sm text-slate-500 dark:text-slate-400">Revenue, cost, and profit analysis</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Total Revenue", v: formatCurrency(summary.totalRevenue, settings.currency), c: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { l: "Total Profit", v: formatCurrency(summary.totalProfit, settings.currency), c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20" },
          { l: "Avg Margin", v: `${summary.avgMargin}%`, c: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
        ].map(({ l, v, c, bg }) => (
          <div key={l} className="stat-card-premium">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}><DollarSign className={`w-5 h-5 ${c}`} /></div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p>
            <p className={`text-xl font-bold mt-1 ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
        ) : (
          <table className="w-full table-premium">
            <thead><tr>{["Invoice", "Customer", "Revenue", "Cost", "Profit", "Margin", "Date"].map(h => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{r.invoice}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white">{r.customer}</td>
                  <td className="px-4 py-3.5 text-sm">{formatCurrency(r.revenue, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{formatCurrency(r.cost, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.profit, settings.currency)}</td>
                  <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.margin >= 25 ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : r.margin >= 20 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{r.margin}%</span></td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(r.date?.split?.("T")[0] || r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && rows.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">No profit data available for this period.</div>
        )}
      </div>
    </div>
  );
};
export default ProfitReports;
