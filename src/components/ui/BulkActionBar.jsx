import React from "react";
import { Trash2, X, Download, CheckSquare } from "lucide-react";

/**
 * BulkActionBar
 * Props:
 *   selectedIds   — Set of selected item ids
 *   totalCount    — total items in current view
 *   onSelectAll   — () => void
 *   onClearAll    — () => void
 *   onDelete      — () => void
 *   onExport      — () => void
 *   extraActions  — [{ label, icon: Icon, onClick, color }]  optional
 */
const BulkActionBar = ({ selectedIds, totalCount, onSelectAll, onClearAll, onDelete, onExport, extraActions = [] }) => {
  const count = selectedIds.size;
  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      style={{ animation: "scale-in 0.15s ease both" }}
    >
      {/* Count badge */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
          <span className="text-[11px] font-bold text-white">{count}</span>
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          selected
        </span>
      </div>

      {/* Select all */}
      {count < totalCount && (
        <button
          onClick={onSelectAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Select all {totalCount}
        </button>
      )}

      {/* Export */}
      {onExport && (
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      )}

      {/* Extra actions */}
      {extraActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              action.color === "amber"
                ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {action.label}
          </button>
        );
      })}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete {count > 1 ? `(${count})` : ""}
        </button>
      )}

      {/* Divider + clear */}
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
      <button
        onClick={onClearAll}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Clear selection"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default BulkActionBar;
