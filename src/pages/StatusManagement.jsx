import React, { useState } from "react";
import { Search, FileText, Receipt, Clock, CheckCircle, AlertCircle, X, Calendar, User, DollarSign, ChevronDown, Activity } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatusManagement from "../components/StatusManagement";

const statusConfig = {
  Completed:  { cls: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
  Pending:    { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   dot: "bg-amber-500" },
  Processing: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       dot: "bg-blue-500" },
  Cancelled:  { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           dot: "bg-red-500" },
};

const selectCls = "appearance-none pl-3.5 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer";

const StatusManagementPage = () => {
  const { state } = useApp();
  const { transactions, invoices } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const allItems = [
    ...transactions.map(t => ({ ...t, type: "transaction", customerName: t.customerName || "Walk-in Customer" })),
    ...invoices.map(i => ({ ...i, type: "invoice" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredItems = allItems.filter(item => {
    const matchesSearch =
      item.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: allItems.length,
    pending: allItems.filter(i => i.status === "Pending").length,
    completed: allItems.filter(i => i.status === "Completed").length,
    cancelled: allItems.filter(i => i.status === "Cancelled").length,
    processing: allItems.filter(i => i.status === "Processing").length,
  };

  const fmt = (amount) => `Rs ${(amount || 0).toFixed(2)}`;
  const fmtDate = (date) => date ? new Date(date).toLocaleDateString("en-PK") : "—";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Status Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage invoice and transaction statuses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: FileText, cls: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800" },
          { label: "Pending", value: stats.pending, icon: Clock, cls: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20" },
          { label: "Processing", value: stats.processing, icon: AlertCircle, cls: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Cancelled", value: stats.cancelled, icon: X, cls: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
        ].map(({ label, value, icon: Icon, cls, bg }, i) => (
          <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${cls}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by ID or customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
            <option value="all">All Types</option>
            <option value="invoice">Invoices</option>
            <option value="transaction">Transactions</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                {["ID & Type", "Customer", "Date", "Amount", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => {
                const TypeIcon = item.type === "invoice" ? FileText : Receipt;
                const sc = statusConfig[item.status] || statusConfig.Pending;
                return (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === "invoice" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-emerald-100 dark:bg-blue-900/20 text-emerald-600 dark:text-emerald-400"}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">#{item.id}</p>
                          <p className="text-xs text-slate-400 capitalize">{item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />{item.customerName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />{fmtDate(item.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{fmt(item.grandTotal)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusManagement item={item} type={item.type} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-14">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-500 dark:text-slate-400">No items found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {searchTerm || filterStatus !== "all" || filterType !== "all" ? "Try adjusting your filters" : "No invoices or transactions available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusManagementPage;
