import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

/**
 * FilterBar — reusable filter row for all list pages
 *
 * filters: array of filter config objects:
 *   { type: 'search', key, placeholder }
 *   { type: 'select', key, placeholder, options: [{value, label}] }
 *   { type: 'date', key, label }
 *
 * values: current filter values object
 * onChange: (key, value) => void
 * onClear: () => void  (optional)
 * total: number (optional, shows result count)
 */
const FilterBar = ({ filters = [], values = {}, onChange, onClear, total, className = "" }) => {
  const hasActiveFilters = filters.some(f => values[f.key] && values[f.key] !== '');

  return (
    <div className={`flex flex-col sm:flex-row gap-2.5 ${className}`}>
      {filters.map(f => {
        if (f.type === 'search') return (
          <div key={f.key} className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={values[f.key] || ''}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.placeholder || 'Search...'}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all"
            />
            {values[f.key] && (
              <button onClick={() => onChange(f.key, '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );

        if (f.type === 'select') return (
          <div key={f.key} className="relative flex-shrink-0">
            <select
              value={values[f.key] || ''}
              onChange={e => onChange(f.key, e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all cursor-pointer min-w-[130px]"
            >
              <option value="">{f.placeholder || 'All'}</option>
              {(f.options || []).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        );

        if (f.type === 'date') return (
          <div key={f.key} className="relative flex-shrink-0">
            <input
              type="date"
              value={values[f.key] || ''}
              onChange={e => onChange(f.key, e.target.value)}
              title={f.label}
              className="pl-3.5 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all cursor-pointer"
            />
          </div>
        );

        return null;
      })}

      {/* Clear all filters */}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 text-sm font-medium transition-all flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}

      {/* Result count badge */}
      {total !== undefined && (
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> results
        </div>
      )}
    </div>
  );
};

export default FilterBar;
