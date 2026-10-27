import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import React from 'react';

const SDPTable = ({ columns, data, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.length) return <EmptyState title={emptyMessage} />;

  return (
    <div className="overflow-x-auto">
      <DataTable className="sdp-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th data-sortable={col.sortable !== false && !["actions", "action"].includes(col.key)} key={idx} className={col.className}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => (
                <td data-sort-value={col.sortValue ? col.sortValue(row) : row[col.key]} key={colIdx} className={col.cellClassName}>
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
};

export default SDPTable;
