import React, { useState, useEffect } from "react";
import { Wallet, DollarSign, Users, Loader2, X, TrendingDown, AlertTriangle, Phone } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { getCustomers, depositCredit } from "../../api/customersApi";

const LIMIT = 15;

const CustomerDues = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const isAdmin = state.currentUser?.role === "admin" || state.currentUser?.role === "manager";

  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, hasCredit: 'true' };
      if (search) params.search = search;
      
      const res = await getCustomers(params);
      const data = res.data.data;
      
      // Handle different response structures
      const customers = Array.isArray(data) ? data : data?.customers ?? data?.docs ?? [];
      const pagination = data?.pagination ?? {};
      
      // Filter customers with credit balance > 0
      const customersWithDues = customers.filter(c => (c.creditBalance || 0) > 0);
      
      setDues(customersWithDues);
      setTotal(pagination.total ?? customersWithDues.length);
      setTotalPages(pagination.pages ?? Math.ceil(customersWithDues.length / LIMIT));
    } catch (err) {
      console.error('Failed to fetch customer dues:', err);
      actions.showToast({ message: "Failed to load customer dues", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, [page, search]); // eslint-disable-line

  const totalDue = dues.reduce((s, d) => s + (d.creditBalance || 0), 0);
  const overdueCount = dues.filter(d => (d.creditBalance || 0) > 5000).length;

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { actions.showToast({ message: "Enter valid amount", type: "error" }); return; }
    setDepositing(true);
    try {
      await depositCredit(depositModal._id, { amount });
      actions.showToast({ message: `Rs. ${amount} deposited for ${depositModal.name}`, type: "success" });
      setDepositModal(null);
      setDepositAmount("");
      fetchDues();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Deposit failed", type: "error" });
    } finally { setDepositing(false); }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Dues</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} customers with outstanding balances · Total: {formatCurrency(totalDue, settings.currency)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Outstanding", value: formatCurrency(totalDue, settings.currency), color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: DollarSign },
          { label: "Customers with Dues", value: total, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Users },
          { label: "High Balance (>5k)", value: overdueCount, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: AlertTriangle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or phone..."
          className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {search && (
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      ) : dues.length === 0 ? (
        <EmptyState icon={Wallet} title="No customer dues" description="All customers have cleared their balances" />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dues.map(d => {
              const due = d.creditBalance || 0;
              const isHigh = due > 5000;
              return (
                <div key={d._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${isHigh ? 'bg-gradient-to-br from-red-400 to-rose-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                    <span className="text-white font-bold">{d.name?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" />{d.phone}</span>
                      {isHigh && <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertTriangle className="w-3 h-3" />High balance</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${isHigh ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {formatCurrency(due, settings.currency)}
                    </p>
                    <p className="text-xs text-slate-400">outstanding</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => { setDepositModal(d); setDepositAmount(""); }}
                      className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ml-2">
                      Collect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={() => setDepositModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10000 w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/50 animate-scale-in p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Collect Payment</h3>
              <button onClick={() => setDepositModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">{depositModal.name}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Outstanding: <strong>{formatCurrency(depositModal.creditBalance, settings.currency)}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount Received ({settings.currency})</label>
              <input type="number" min="1" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleDeposit()} />
              {depositAmount && parseFloat(depositAmount) >= (depositModal.creditBalance || 0) && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Full balance will be cleared</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDepositModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleDeposit} disabled={depositing} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 transition-colors">
                {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                Collect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDues;
