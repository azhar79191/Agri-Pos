import React from "react";

const Card = ({ children, className = "", padding = "md", hover = false, onClick = null }) => {
  const pads = { none: "", sm: "p-3", md: "p-4", lg: "p-6", xl: "p-8" };
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
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <div className="flex-1">{children}</div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-slate-900 dark:text-white tracking-tight ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 mt-0.5 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 ${className}`}>{children}</div>
);

export const StatCard = ({ title, value, icon: Icon, trend = null, trendLabel = "", color = "emerald", onClick = null, subtitle = "" }) => {
  const iconBg = {
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
    blue:    "from-blue-500 to-indigo-600 shadow-blue-500/30",
    amber:   "from-amber-500 to-orange-500 shadow-amber-500/30",
    purple:  "from-purple-500 to-pink-600 shadow-purple-500/30",
    rose:    "from-rose-500 to-red-600 shadow-rose-500/30",
    cyan:    "from-cyan-500 to-blue-500 shadow-cyan-500/30",
  };
  const borderColor = {
    emerald: "stat-border-emerald", blue: "stat-border-blue",
    amber: "stat-border-amber",     purple: "stat-border-purple",
    rose: "stat-border-rose",       cyan: "stat-border-blue",
  };
  const trendCls = trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-red-500 dark:text-red-400" : "text-slate-500";

  return (
    <div
      onClick={onClick}
      className={[
        "card-base card-hover p-5",
        borderColor[color] || "stat-border-emerald",
        onClick ? "cursor-pointer" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && trendLabel && (
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${trendCls}`}>
              <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>
              <span>{trendLabel}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBg[color] || iconBg.emerald} shadow-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
