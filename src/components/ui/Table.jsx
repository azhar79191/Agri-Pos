import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

const SortIcon = ({ direction }) => {
  if (direction === "asc")  return <ChevronUp className="w-3.5 h-3.5" />;
  if (direction === "desc") return <ChevronDown className="w-3.5 h-3.5" />;
  return <ChevronsUpDown className="w-3.5 h-3.5" />;
};

const Table = ({
  columns, data, emptyMessage = "No data available",
  loading = false, onRowClick = null, rowClassName = "", className = "",
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(col.key); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={[
                    "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-[1] select-none",
                    col.sortable && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  ].filter(Boolean).join(" ")}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.title}
                    {col.sortable && (
                      <span className={`flex-shrink-0 transition-colors ${
                        sortKey === col.key
                          ? "text-violet-500 dark:text-violet-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}>
                        <SortIcon direction={sortKey === col.key ? sortDir : null} />
                      </span>
                    )}
                  </div>
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
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-slate-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
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
};

export default Table;
