import { reportSchemas } from '../../utils/reportSchemas';
import ReportState from "../../components/ui/ReportState";
import useReportResource from '../../hooks/useReportResource';
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getProfitReport } from "../../api/reportsApi";
import DateRangePicker from "../../components/ui/DateRangePicker";

const useProfitReport = dateRange => { const params = dateRange?.start && dateRange?.end ? {startDate:dateRange.start,endDate:dateRange.end} : {}; const result = useReportResource(getProfitReport, params, reportSchemas.profit); return { ...result, rows:result.data?.rows || [], summary:result.data?.summary || {} }; };

const ProfitReports = () => {
  const { state }    = useApp();
  const { settings } = state;
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const { rows, summary, loading, error, retry } = useProfitReport(dateRange);

  const STATS = [
    { l: "Total Revenue", v: formatCurrency(summary.totalRevenue, settings.currency), c: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/30" },
    { l: "Total Profit",  v: formatCurrency(summary.totalProfit, settings.currency),  c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20" },
    { l: "Avg Margin",    v: `${summary.avgMargin}%`,                                  c: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader icon={DollarSign} title={<>Profit Reports</>} description={<>Revenue, cost, and profit analysis</>}  />
      {summary.incompleteCostInvoices > 0 && <p role="status" className="rounded-lg bg-amber-50 p-3 text-amber-900">{summary.incompleteCostInvoices} historical invoices have unknown costs. Profit totals include only invoices with recorded costs.</p>}
      <FilterBar label="Filter by date"><DateRangePicker value={dateRange} onChange={setDateRange} /></FilterBar>
<ReportState loading={loading} error={error} onRetry={retry}>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ l, v, c, bg }) => (
          <div key={l} className="stat-card-premium">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}><DollarSign className={`w-5 h-5 ${c}`} /></div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p>
            <p className={`text-xl font-bold mt-1 ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="workspace-panel overflow-x-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? (
          <LoadingState variant="table" label="Loading profit report" />
        ) : (
          <DataTable emptyTitle="No profit data for this period" className="w-full table-premium">
            <thead><tr>{["Invoice", "Customer", "Revenue", "Cost", "Profit", "Margin", "Date"].map((h) => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{r.invoice}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white">{r.customer}</td>
                  <td data-sort-value={r.revenue} className="px-4 py-3.5 text-sm">{formatCurrency(r.revenue, settings.currency)}</td>
                  <td data-sort-value={r.cost} className="px-4 py-3.5 text-sm text-slate-500">{r.cost == null ? "Unknown" : formatCurrency(r.cost, settings.currency)}</td>
                  <td data-sort-value={r.profit} className="px-4 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">{r.profit == null ? "Unknown" : formatCurrency(r.profit, settings.currency)}</td>
                  <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.margin >= 25 ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : r.margin >= 20 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{r.margin == null ? "Unknown" : `${r.margin}%`}</span></td>
                  <td data-sort-value={r.date?.split?.("T")[0] || r.date} className="px-4 py-3.5 text-xs text-slate-500">{formatDate(r.date?.split?.("T")[0] || r.date)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ReportState>
</div>
  );
};

export default ProfitReports;
