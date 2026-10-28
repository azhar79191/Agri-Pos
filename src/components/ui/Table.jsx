import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import DataTable from "./DataTable";
import React from "react";

const Table = ({
  columns, data, emptyMessage = "No data available",
  loading = false, onRowClick = null, rowClassName = "", className = "",
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <DataTable className="min-w-full" emptyState={false}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  data-sortable={col.sortable !== false && !["actions", "action"].includes(col.key)}
                  className={[
                    "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-[1] select-none",
                    col.sortable !== false && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  ].filter(Boolean).join(" ")}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.title}

                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <LoadingState variant="table" rows={5} cols={columns.length} label="Loading records" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <EmptyState title={emptyMessage} />
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
                      data-sort-value={col.sortValue ? col.sortValue(row) : row[col.key]}
                      className={["px-4 py-3 text-sm text-slate-700 dark:text-slate-200", col.cellClassName].filter(Boolean).join(" ")}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
};

export default Table;
