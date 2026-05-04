import React from "react";
import { Activity, Clock, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDate, getTodayDate, formatCurrency } from "../../utils/helpers";

const DashboardHeader = ({ 
  currentUser, 
  settings, 
  timeStr, 
  todaySales, 
  totalProducts, 
  totalCustomers,
  lowStock,
  expiringProducts,
  refreshing,
  onRefresh,
  onNavigate
}) => {
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  return (
    <div className="card-base p-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800/30">
              <Activity className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Live Dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{timeStr}</span>
            </div>
          </div>

          <p className="text-slate-500 text-sm font-medium mb-0.5">{greeting()},</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {currentUser?.name || "Welcome"}
          </h1>
          <p className="text-slate-500 text-sm">
            Business overview for{" "}
            <span className="text-slate-900 dark:text-white font-semibold">{settings.shopName || "your shop"}</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            {[
              { label: "Today's Revenue", value: formatCurrency(todaySales, settings.currency), color: "text-blue-600 dark:text-blue-400" },
              { label: "Products", value: totalProducts, color: "text-slate-900 dark:text-white" },
              { label: "Customers", value: totalCustomers, color: "text-slate-900 dark:text-white" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />}
                <div>
                  <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(getTodayDate())}</span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>

          {lowStock > 0 && (
            <div
              onClick={() => onNavigate("/stock")}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-400 text-xs font-medium cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/25 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStock} low stock {lowStock === 1 ? "item" : "items"} — View
            </div>
          )}
          {expiringProducts.length > 0 && (
            <div
              onClick={() => onNavigate("/products")}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/15 text-red-700 dark:text-red-400 text-xs font-medium cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {expiringProducts.length} expiring in 30 days — View
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardHeader);
