import React from "react";
import {
  Shield, User, Clock, Package, DollarSign,
  Edit3, Trash2, LogIn, Settings, Loader2, AlertCircle, RefreshCw, ArrowRight
} from "lucide-react";
import { usePaginatedApi } from "../../../hooks/usePaginatedApi";
import { getAuditLogs } from "../../../api/auditLogsApi";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";

const LIMIT = 20;

const ACTION_CFG = {
  stock_edit:        { label: "Stock Edit",        bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-400",     border: "border-l-blue-500",    icon: Package,    dot: "bg-blue-500" },
  price_change:      { label: "Price Change",      bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-400",   border: "border-l-amber-500",   icon: DollarSign, dot: "bg-amber-500" },
  invoice_edit:      { label: "Invoice Edit",      bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", border: "border-l-purple-500",  icon: Edit3,      dot: "bg-purple-500" },
  invoice_delete:    { label: "Invoice Delete",    bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400",       border: "border-l-red-500",     icon: Trash2,     dot: "bg-red-500" },
  discount_override: { label: "Discount Override", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", border: "border-l-orange-500",  icon: DollarSign, dot: "bg-orange-500" },
  user_activity:     { label: "User Activity",     bg: "bg-emerald-100 dark:bg-emerald-900/20",text: "text-emerald-700 dark:text-emerald-400",border: "border-l-emerald-500",icon: LogIn,      dot: "bg-emerald-500" },
  settings_change:   { label: "Settings Change",   bg: "bg-slate-100 dark:bg-slate-800",      text: "text-slate-700 dark:text-slate-400",   border: "border-l-slate-400",   icon: Settings,   dot: "bg-slate-400" },
};

const getCfg = (action) => ACTION_CFG[action] || ACTION_CFG.user_activity;

const AuditPanel = () => {
  const { data: logs, loading, error, page, totalPages, total, setFilter, setPage, refresh } =
    usePaginatedApi(getAuditLogs, { search: "", action: "" }, LIMIT);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input onChange={e => setFilter("search", e.target.value)} placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
        </div>
        <select onChange={e => setFilter("action", e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-violet-500/30">
          <option value="">All Actions</option>
          {Object.entries(ACTION_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={refresh} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Count badge */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{total} event{total !== 1 ? "s" : ""} recorded</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-400">Loading audit trail...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
          <button onClick={refresh} className="ml-auto text-xs underline font-medium">Retry</button>
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <EmptyState icon={Shield} title="No audit logs yet" description="System activity will be recorded here as your team works" />
      )}

      {/* Timeline */}
      {!loading && !error && logs.length > 0 && (
        <div className="relative space-y-2">
          {/* Vertical timeline line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block" />

          {logs.map((log, i) => {
            const cfg = getCfg(log.action);
            const Icon = cfg.icon;
            const ts = log.timestamp ? new Date(log.timestamp) : log.createdAt ? new Date(log.createdAt) : null;
            return (
              <div key={log._id || i} className="relative flex items-start gap-4 group">
                {/* Timeline dot */}
                <div className={`hidden sm:flex w-11 h-11 rounded-2xl ${cfg.bg} items-center justify-center shrink-0 z-10 border-2 border-white dark:border-slate-950 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>

                {/* Card */}
                <div className={`flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 border-l-4 ${cfg.border} p-4 hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-slate-900/50 transition-all duration-150`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{log.description || log.action}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="w-3 h-3" />{log.userName || log.user || "System"}
                        </span>
                        {ts && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {ts.toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} · {ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Before → After diff */}
                    {(log.before || log.after) && (
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {log.before && (
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-mono text-xs border border-red-100 dark:border-red-900/30 max-w-[90px] truncate">
                            {log.before}
                          </span>
                        )}
                        {log.before && log.after && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        {log.after && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400 font-mono text-xs border border-emerald-100 dark:border-emerald-900/30 max-w-[90px] truncate">
                            {log.after}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AuditPanel;
