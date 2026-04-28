import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = ""
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-[#122b1c] dark:text-slate-300 border border-slate-200 dark:border-emerald-900/20",
    primary: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    danger:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    info:    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    purple:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    outline: "border-2 border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300 bg-transparent",
    "outline-primary": "border-2 border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400 bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  };

  const classes = [
    "inline-flex items-center font-medium rounded-full",
    variants[variant],
    sizes[size],
    className
  ].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
