import React, { useState, useMemo, useEffect } from "react";
import { Shield, Search, ChevronDown, User, Clock, Edit3, Trash2, DollarSign, Package } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import { getAuditLogs } from "../../api/auditLogsApi";

const MOCK = [
  { _id: "a1", action: "stock_edit", user: "Admin", description: "Adjusted stock for Roundup Herbicide", before: "12", after: "20", timestamp: "2026-04-29T10:30:00" },
  { _id: "a2", action: "price_change", user: "Admin", description: "Changed price of Urea Fertilizer", before: "Rs. 160", after: "Rs. 180", timestamp: "2026-04-28T14:15:00" },
  { _id: "a3", action: "invoice_delete", user: "Admin", description: "Deleted invoice INV-260420-005", before: "Active", after: "Deleted", timestamp: "2026-04-27T09:45:00" },
  { _id: "a4", action: "discount_override", user: "Manager", description: "Applied 15% discount on INV-260425-002", before: "0%", after: "15%", timestamp: "2026-04-25T16:20:00" },
  { _id: "a5", action: "user_activity", user: "Cashier", description: "Login from new device", before: "-", after: "Chrome/Windows", timestamp: "2026-04-24T08:00:00" },
  { _id: "a6", action: "stock_edit", user: "Admin", description: "Set stock level for Malathion", before: "8", after: "15", timestamp: "2026-04-23T11:30:00" },
  { _id: "a7", action: "invoice_edit", user: "Admin", description: "Updated payment method on INV-260422-001", before: "Cash", after: "Credit", timestamp: "2026-04-22T13:10:00" },
];

const actionConfig = {
  stock_edit: { label: "Stock Edit", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  price_change: { label: "Price Change", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: DollarSign },
  invoice_edit: { label: "Invoice Edit", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Edit3 },
  invoice_delete: { label: "Invoice Delete", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Trash2 },
  discount_override: { label: "Discount Override", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: DollarSign },
  user_activity: { label: "User Activity", color: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", icon: User },
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    getAuditLogs()
      .then(res => setLogs(res.data.data.logs))
      .catch(() => setLogs(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => logs.filter(l => {
    const m = l.description.toLowerCase().includes(search.toLowerCase()) || (l.userName || l.user || "").toLowerCase().includes(search.toLowerCase());
    return m && (filterAction === "all" || l.action === filterAction);
  }), [logs, search, filterAction]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-sm"><Shield className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Audit Logs</h1><p className="text-sm text-slate-500 dark:text-slate-400">{logs.length} activities tracked</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" /></div>
        <div className="relative"><select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm cursor-pointer text-slate-700 dark:text-slate-300"><option value="all">All Actions</option><option value="stock_edit">Stock Edits</option><option value="price_change">Price Changes</option><option value="invoice_edit">Invoice Edits</option><option value="invoice_delete">Invoice Deletes</option><option value="discount_override">Discount Overrides</option><option value="user_activity">User Activity</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
      </div>

      <div className="space-y-2">
        {filtered.map(log => {
          const cfg = actionConfig[log.action] || actionConfig.user_activity;
          const Icon = cfg.icon;
          const ts = new Date(log.timestamp);
          return (
            <div key={log._id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-lg ${cfg.color} flex items-center justify-center flex-shrink-0`}><Icon className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{log.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.userName || log.user}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ts.toLocaleDateString()} {ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 text-xs"><span className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-mono">{log.before}</span><span className="text-slate-400">→</span><span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-blue-900/15 text-emerald-600 dark:text-emerald-400 font-mono">{log.after}</span></div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <EmptyState icon={Shield} title="No audit logs" description="System activity will be logged here" />}
    </div>
  );
};
export default AuditLogs;
