import React from "react";

const Card = ({ children, className = "", padding = "md", hover = false, onClick = null }) => {
  const pads = { none: "", sm: "p-3", md: "p-4", lg: "p-5", xl: "p-6" };
  return (
    <div
      onClick={onClick}
      className={[
        "card-base",
        hover || onClick ? "card-hover" : "",
        onClick ? "cursor-pointer" : "",
        pads[padding],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", action = null }) => (
  <div className={`flex items-center justify-between mb-3 ${className}`}>
    <div className="flex-1">{children}</div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-sm font-semibold text-slate-800 dark:text-white ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 ${className}`}>{children}</div>
);

export const StatCard = ({ title, value, icon: Icon, trend = null, trendLabel = "", color = "blue", onClick = null, subtitle = "" }) => {
  const iconBg = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    amber:   "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    purple:  "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    rose:    "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    cyan:    "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
  };
  const trendCls = trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-red-500 dark:text-red-400" : "text-slate-500";

  return (
    <div
      onClick={onClick}
      className={[
        "card-base card-hover p-4",
        onClick ? "cursor-pointer" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{title}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && trendLabel && (
            <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${trendCls}`}>
              <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>
              <span>{trendLabel}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${iconBg[color] || iconBg.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
