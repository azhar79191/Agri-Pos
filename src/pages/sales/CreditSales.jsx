import React, { useState, useMemo, useEffect } from "react";
import { CreditCard, DollarSign, Clock, AlertTriangle, Search, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCreditSalesReport } from "../../api/reportsApi";
import EmptyState from "../../components/ui/EmptyState";

const CreditSales = () => {
  const { state } = useApp();
  const { settings } = state;
  const [rows, setRows] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getCreditSalesReport()
      .then(res => {
        setRows(res.data.data.rows);
        setTotalOutstanding(res.data.data.totalOutstanding);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter(s => {
    const m = (s.customer || "").toLowerCase().includes(search.toLowerCase()) ||
              (s.invoiceNumber || "").toLowerCase().includes(search.toLowerCase());
    return m && (filter === "all" || s.status === filter);
  }), [rows, search, filter]);

  const overdueCount = rows.filter(s => s.status === "overdue").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm"><CreditCard className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Credit Sales</h1><p className="text-sm text-slate-500 dark:text-slate-400">Outstanding: {formatCurrency(totalOutstanding, settings.currency)} · {overdueCount} overdue</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Outstanding", value: formatCurrency(totalOutstanding, settings.currency), color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: DollarSign },
          { label: "Credit Sales", value: rows.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: CreditCard },
          { label: "Overdue", value: overdueCount, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: AlertTriangle },
          { label: "Paid", value: rows.filter(s => s.status === "paid").length, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20", icon: Clock },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p><p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p></div></div></div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" /></div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[{ id: "all", l: "All" }, { id: "pending", l: "Pending" }, { id: "partial", l: "Partial" }, { id: "overdue", l: "Overdue" }, { id: "paid", l: "Paid" }].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === t.id ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
        ) : (
          <table className="w-full table-premium">
            <thead><tr>{["Invoice", "Customer", "Total", "Paid", "Balance", "Due Date", "Status"].map(h => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{s.invoiceNumber}</span></td>
                  <td className="px-4 py-3.5"><p className="font-semibold text-slate-900 dark:text-white text-sm">{s.customer}</p><p className="text-xs text-slate-400">{s.phone}</p></td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(s.total, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm text-emerald-600 font-semibold">{formatCurrency(s.paid, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-red-600">{formatCurrency(s.balance, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(s.dueDate?.split?.("T")[0] || s.dueDate)}</td>
                  <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : s.status === "overdue" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : s.status === "partial" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <EmptyState icon={CreditCard} title="No credit sales found" />}
      </div>
    </div>
  );
};
export default CreditSales;
