import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = ""
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
    primary: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    success: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    warning: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    danger: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    info: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    purple: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    outline: "border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 bg-transparent",
    "outline-primary": "border-2 border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400 bg-transparent"
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
