import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children, variant = "primary", size = "md", className = "",
  disabled = false, loading = false, onClick, type = "button",
  icon: Icon = null, ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-900 select-none";

  const variants = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow active:scale-[0.98]",
    secondary: "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-blue-400 border border-slate-200 dark:border-slate-600",
    danger:    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow active:scale-[0.98]",
    warning:   "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow",
    success:   "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-blue-500 shadow-sm hover:shadow",
    outline:   "border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 focus:ring-blue-500",
    ghost:     "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white focus:ring-slate-400",
    gold:      "bg-amber-500 text-white font-semibold hover:bg-amber-600 focus:ring-amber-400 shadow-sm hover:shadow",
    link:      "text-blue-600 dark:text-blue-400 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500 p-0",
  };

  const sizes = {
    xs: "px-2 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-sm gap-2",
    xl: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      className={[base, variants[variant], sizes[size], (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none", className].filter(Boolean).join(" ")}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
