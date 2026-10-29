import { reportSchemas } from '../../utils/reportSchemas';
import useReportResource from '../../hooks/useReportResource';
import ReportState from '../../components/ui/ReportState';
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import React, { useState } from "react";
import { History, ShoppingCart } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCustomerPurchaseHistory } from "../../api/reportsApi";
import EmptyState from "../../components/ui/EmptyState";

const PurchaseHistory = () => {
  const { state } = useApp();
  const { settings } = state;
  const {data,loading,error,retry}=useReportResource(getCustomerPurchaseHistory,{},reportSchemas.purchases);
  const customers=data?.customers||[];
  const [selectedId,setSelectedId]=useState('');
  const selected=customers.find(customer=>customer._id===selectedId)||customers[0]||null;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader icon={History} title={<>Purchase History</>} description={<>Customer-wise purchase timeline</>}  />

      <ReportState loading={loading} error={error} onRetry={retry}>{loading ? (
        <LoadingState label="Loading" />
      ) : customers.length === 0 ? (
        <EmptyState icon={History} title="No purchase history" description="Customer purchase history will appear here after sales are made" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Customers</h3>
            {customers.map(c => (
              <button key={c._id} onClick={() => setSelectedId(c._id)}
                className={`w-full text-left p-4 rounded-lg transition-all ${selected?._id === c._id ? "bg-emerald-50 dark:bg-blue-900/15 border-emerald-300 dark:border-emerald-700 border" : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/50 hover:shadow-sm"}`}>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</p>
                <p className="text-xs text-slate-400 mt-1">{c.purchases.length} purchases · {formatCurrency(c.purchases.reduce((s, p) => s + p.total, 0), settings.currency)}</p>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white">{selected.name}'s Purchase Timeline</h3>
                {selected.purchases.map((p, i) => (
                  <div key={i} className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{p.items.slice(0, 3).join(", ")}{p.items.length > 3 ? ` +${p.items.length - 3} more` : ""}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.invoiceNumber} · {formatDate(p.date?.split?.("T")[0] || p.date)}</p>
                    </div>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.total, settings.currency)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={History} title="Select a customer" description="View their purchase history" />
            )}
          </div>
        </div>
      )}
</ReportState>
    </div>
  );
};
export default PurchaseHistory;
