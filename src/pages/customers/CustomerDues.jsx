import React, { useState, useEffect } from "react";
import { Wallet, DollarSign, Users, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCustomers } from "../../api/customersApi";
import EmptyState from "../../components/ui/EmptyState";

const CustomerDues = () => {
  const { state } = useApp();
  const { settings } = state;
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers({ limit: 200 })
      .then(res => {
        const all = res.data.data?.customers || [];
        setDues(all.filter(c => (c.creditBalance || 0) > 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDue = dues.reduce((s, d) => s + (d.creditBalance || 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-glow-sm"><Wallet className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Dues</h1><p className="text-sm text-slate-500 dark:text-slate-400">Total outstanding: {formatCurrency(totalDue, settings.currency)}</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Outstanding", value: formatCurrency(totalDue, settings.currency), color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: DollarSign },
              { label: "Customers with Dues", value: dues.length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Users },
              { label: "Avg Due per Customer", value: formatCurrency(totalDue / (dues.length || 1), settings.currency), color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: Wallet },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p></div></div></div>
            ))}
          </div>

          {dues.length === 0 ? (
            <EmptyState icon={Wallet} title="No customer dues" description="All customers have cleared their balances" />
          ) : (
            <div className="space-y-3">
              {dues.sort((a, b) => (b.creditBalance || 0) - (a.creditBalance || 0)).map(d => (
                <div key={d._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 flex items-center justify-between hover:shadow-premium-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center"><span className="text-white font-bold">{d.name?.[0]}</span></div>
                    <div><p className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</p><p className="text-xs text-slate-400">{d.phone}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(d.creditBalance, settings.currency)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Credit balance owed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default CustomerDues;
