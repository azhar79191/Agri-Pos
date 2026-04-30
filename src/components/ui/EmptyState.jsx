import React from "react";
import { Package } from "lucide-react";

const EmptyState = ({ icon: Icon = Package, title = "No data found", description = "", actionLabel, onAction, className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
        style={{ background: "var(--pos-primary)" }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
