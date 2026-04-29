import React from "react";
import { Package } from "lucide-react";

const EmptyState = ({ icon: Icon = Package, title = "No data found", description = "", actionLabel, onAction, className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
    </div>
    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-glow-sm">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
