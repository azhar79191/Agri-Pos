import React, { useState } from "react";
import { RotateCcw, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";

const MOCK = [
  { _id: "pr1", returnNumber: "PR-001", supplier: "Syngenta Pakistan", reason: "Damaged goods", total: 1350, status: "Approved", date: "2026-04-22" },
  { _id: "pr2", returnNumber: "PR-002", supplier: "FMC Corporation", reason: "Wrong product", total: 1600, status: "Pending", date: "2026-04-26" },
];

const PurchaseReturns = () => {
  const { state } = useApp();
  const [returns] = useState(MOCK);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-glow-sm"><RotateCcw className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Returns</h1><p className="text-sm text-slate-500 dark:text-slate-400">Return items to suppliers</p></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <table className="w-full table-premium">
          <thead><tr>{["Return #","Supplier","Reason","Total","Status","Date"].map(h=><th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {returns.map(r=>(
              <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">{r.returnNumber}</span></td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white">{r.supplier}</td>
                <td className="px-4 py-3.5 text-sm text-slate-500">{r.reason}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-red-600">{formatCurrency(r.total, state.settings.currency)}</td>
                <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status==="Approved"?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{r.status}</span></td>
                <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(r.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {returns.length===0 && <EmptyState icon={Package} title="No purchase returns" />}
      </div>
    </div>
  );
};
export default PurchaseReturns;
