import React from "react";

const Table = ({
  columns, data, emptyMessage = "No data available",
  loading = false, onRowClick = null, rowClassName = "", className = "",
}) => (
  <div className={`overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-emerald-700/60 uppercase tracking-wider bg-slate-50/80 dark:bg-[#0a1f14]/90 border-b border-slate-200/80 dark:border-emerald-900/20 sticky top-0 z-[1] backdrop-blur-sm"
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                onClick={() => onRowClick?.(row)}
                className={[
                  "border-b border-slate-100 dark:border-emerald-900/10 transition-colors duration-150",
                  "hover:bg-emerald-50/40 dark:hover:bg-emerald-900/8",
                  onRowClick && "cursor-pointer",
                  rowClassName,
                ].filter(Boolean).join(" ")}
              >
                {columns.map(col => (
                  <td
                    key={`${row.id || row._id || i}-${col.key}`}
                    className={["px-4 py-3.5 text-sm text-slate-900 dark:text-slate-100", col.cellClassName].filter(Boolean).join(" ")}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;
