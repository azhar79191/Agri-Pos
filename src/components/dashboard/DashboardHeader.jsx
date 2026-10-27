import { companyName } from "../../utils/company";
import React from "react";
import { AlertTriangle, ArrowUpRight, Calendar, RefreshCw, ShoppingCart } from "lucide-react";
import { formatDate, getTodayDate } from "../../utils/helpers";

const DashboardHeader = ({
  currentUser,
  settings,
  lowStock,
  expiringProducts,
  refreshing,
  onRefresh,
  onNavigate,
  canPOS,
}) => {
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <section className="workspace-hero dashboard-welcome animate-fade-up" aria-labelledby="dashboard-welcome-title">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <Calendar className="w-4 h-4 text-[var(--pos-primary)]" aria-hidden="true" />
            <span>{formatDate(getTodayDate())}</span>
          </div>
          <h1 id="dashboard-welcome-title" className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {greeting()}{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Here’s what’s happening at <span className="font-semibold text-slate-900 dark:text-white">{companyName(settings)}</span> today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPOS && (
            <button type="button" onClick={() => onNavigate("/pos")} className="dashboard-welcome__primary inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              New sale
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="dashboard-welcome__refresh inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            {refreshing ? "Updating" : "Refresh"}
          </button>
        </div>
      </div>

      {(lowStock > 0 || expiringProducts.length > 0) && (
        <div className="dashboard-welcome__alerts mt-5 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
          {lowStock > 0 && (
            <button type="button" onClick={() => onNavigate("/stock")} className="dashboard-welcome__alert">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {lowStock} {lowStock === 1 ? "item is" : "items are"} running low
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {expiringProducts.length > 0 && (
            <button type="button" onClick={() => onNavigate("/inventory/batch-expiry")} className="dashboard-welcome__alert">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {expiringProducts.length} {expiringProducts.length === 1 ? "product expires" : "products expire"} soon
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(DashboardHeader);
