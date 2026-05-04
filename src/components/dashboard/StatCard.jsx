import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, subtitle, delay = 0 }) => {
  const colors = {
    blue:    { light: "bg-blue-50 dark:bg-blue-900/15",    text: "text-blue-600 dark:text-blue-400" },
    emerald: { light: "bg-emerald-50 dark:bg-emerald-900/15", text: "text-emerald-600 dark:text-emerald-400" },
    amber:   { light: "bg-amber-50 dark:bg-amber-900/15",  text: "text-amber-600 dark:text-amber-400" },
    purple:  { light: "bg-purple-50 dark:bg-purple-900/15", text: "text-purple-600 dark:text-purple-400" },
  };
  const c = colors[color] || colors.blue;
  
  return (
    <div
      className="card-base card-hover p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.light}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
            trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/15 dark:text-emerald-400"
                           : "bg-red-50 text-red-600 dark:bg-red-900/15 dark:text-red-400"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default React.memo(StatCard);
