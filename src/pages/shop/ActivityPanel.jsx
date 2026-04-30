import React, { useState, useEffect } from "react";
import { Bell, Loader2, ShoppingCart, Package, Users, Settings, RefreshCw } from "lucide-react";
import ShopCard from "./ShopCard";
import { formatDate } from "../../utils/helpers";
import { useApp } from "../../context/AppContext";
import { getAuditLogs } from "../../api/auditLogsApi";

const ACTION_ICON = {
  sale:     { icon: ShoppingCart, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  product:  { icon: Package,      color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" },
  user:     { icon: Users,        color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
  settings: { icon: Settings,     color: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
  default:  { icon: Bell,         color: "bg-slate-100 dark:bg-slate-800 text-slate-500" },
};

const getActionCfg = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("sale") || a.includes("invoice")) return ACTION_ICON.sale;
  if (a.includes("product") || a.includes("stock")) return ACTION_ICON.product;
  if (a.includes("user") || a.includes("login"))    return ACTION_ICON.user;
  if (a.includes("setting") || a.includes("shop"))  return ACTION_ICON.settings;
  return ACTION_ICON.default;
};

const ActivityPanel = () => {
  const { actions } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAuditLogs({ limit: 20 })
      .then(r => {
        const d = r.data.data;
        setLogs(d.logs ?? d.items ?? d.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <ShopCard title="Recent Activity" desc="Latest actions performed in your shop"
      action={
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      }>
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading activity...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, i) => {
            const cfg = getActionCfg(log.action);
            const Icon = cfg.icon;
            return (
              <div key={log._id || i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {log.action || log.description || "Action performed"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{log.userName || log.user?.name || "System"}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{formatDate(log.createdAt?.split?.("T")?.[0] || log.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ShopCard>
  );
};

export default ActivityPanel;
