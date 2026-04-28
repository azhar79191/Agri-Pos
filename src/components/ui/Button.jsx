import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children, variant = "primary", size = "md", className = "",
  disabled = false, loading = false, onClick, type = "button",
  icon: Icon = null, ...props
}) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0d1f14] select-none";

  const variants = {
    primary:   "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-glow-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-slate-100 dark:bg-[#122b1c] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#163320] focus:ring-emerald-400 border border-slate-200 dark:border-emerald-900/40",
    danger:    "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus:ring-red-500 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
    warning:   "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-sm hover:shadow-md",
    success:   "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-sm hover:shadow-md",
    outline:   "border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/15 focus:ring-emerald-500",
    ghost:     "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#122b1c] hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
    gold:      "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold hover:from-amber-500 hover:to-yellow-600 focus:ring-amber-400 shadow-gold hover:shadow-lg hover:scale-[1.02]",
    link:      "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 underline-offset-4 hover:underline focus:ring-emerald-500 p-0",
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs gap-1",
    sm: "px-3.5 py-2 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2",
    xl: "px-7 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      className={[base, variants[variant], sizes[size], (disabled || loading) && "opacity-60 cursor-not-allowed pointer-events-none", className].filter(Boolean).join(" ")}
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
