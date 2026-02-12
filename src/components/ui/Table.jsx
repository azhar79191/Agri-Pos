import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Table = ({
  columns,
  data,
  emptyMessage = "No data available",
  loading = false,
  onRowClick = null,
  rowClassName = "",
  className = "",
  sortable = false,
  sortColumn = null,
  sortDirection = "asc",
  onSort = null
}) => {
  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return;
    onSort(columnKey);
  };

  const getSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                  sortable && column.sortable !== false && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                  column.className
                ].filter(Boolean).join(" ")}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-1">
                  {column.title}
                  {sortable && column.sortable !== false && (
                    <span className="text-gray-400 ml-1">{getSortIcon(column.key)}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={[
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  onRowClick && "cursor-pointer",
                  rowClassName
                ].filter(Boolean).join(" ")}
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id || index}-${column.key}`}
                    className={[
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                      column.cellClassName
                    ].filter(Boolean).join(" ")}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Pagination Component
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {showInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Table;
