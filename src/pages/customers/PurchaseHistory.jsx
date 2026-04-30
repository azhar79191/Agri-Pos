import React, { useState, useEffect } from "react";
import { History, ShoppingCart, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCustomerPurchaseHistory } from "../../api/reportsApi";
import EmptyState from "../../components/ui/EmptyState";

const PurchaseHistory = () => {
  const { state } = useApp();
  const { settings } = state;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCustomerPurchaseHistory()
      .then(res => {
        const data = res.data.data.customers;
        setCustomers(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm"><History className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase History</h1><p className="text-sm text-slate-500 dark:text-slate-400">Customer-wise purchase timeline</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : customers.length === 0 ? (
        <EmptyState icon={History} title="No purchase history" description="Customer purchase history will appear here after sales are made" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Customers</h3>
            {customers.map(c => (
              <button key={c._id} onClick={() => setSelected(c)}
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
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 flex items-center gap-4">
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
    </div>
  );
};
export default PurchaseHistory;
