import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = ""
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    primary: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    danger:  "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    info:    "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
    purple:  "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    outline: "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300 bg-transparent",
    "outline-primary": "border border-blue-400 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-transparent",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[11px]",
    md: "px-2 py-0.5 text-xs",
    lg: "px-2.5 py-1 text-sm"
  };

  const classes = [
    "inline-flex items-center font-medium rounded",
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
