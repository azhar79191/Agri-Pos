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
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-[1]"
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
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Loading...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-sm text-slate-400">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                onClick={() => onRowClick?.(row)}
                className={[
                  "border-b border-slate-100 dark:border-slate-800 transition-colors duration-100",
                  "hover:bg-blue-50/40 dark:hover:bg-slate-800/50",
                  onRowClick && "cursor-pointer",
                  rowClassName,
                ].filter(Boolean).join(" ")}
              >
                {columns.map(col => (
                  <td
                    key={`${row.id || row._id || i}-${col.key}`}
                    className={["px-4 py-3 text-sm text-slate-700 dark:text-slate-200", col.cellClassName].filter(Boolean).join(" ")}
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
