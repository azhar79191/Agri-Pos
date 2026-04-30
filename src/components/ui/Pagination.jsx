import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build page window: always show first, last, current ±1
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);

  const btnBase = "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150";
  const btnActive = "text-white shadow-sm";
  const btnInactive = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
  const btnDisabled = "opacity-30 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{from}–{to}</span> of{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First */}
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`} title="First page">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        {/* Prev */}
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`} title="Previous">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {sorted.map((p, i) => {
          const prev = sorted[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && (
                <span className="w-8 text-center text-slate-400 text-sm select-none">…</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={`${btnBase} ${p === page ? `${btnActive}` : btnInactive}`}
                style={p === page ? { background: "var(--pos-primary)" } : {}}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}

        {/* Next */}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`} title="Next">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {/* Last */}
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`} title="Last page">
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
