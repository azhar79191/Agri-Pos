import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-emerald-900/10">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{from}–{to}</span> of{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#122b1c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#122b1c] text-slate-600 dark:text-slate-400 transition-colors">1</button>
            {pages[0] > 2 && <span className="text-slate-400 px-1 text-sm">…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p} onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-emerald-500 text-white shadow-glow-sm"
                : "hover:bg-slate-100 dark:hover:bg-[#122b1c] text-slate-600 dark:text-slate-400"
            }`}
          >{p}</button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-slate-400 px-1 text-sm">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#122b1c] text-slate-600 dark:text-slate-400 transition-colors">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#122b1c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
