import LoadingState from "./LoadingState";
import FilterBar from "./FilterBar";
import React, { Children, cloneElement, isValidElement, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import EmptyState from "./EmptyState";
import { compareValues } from "../../utils/tableSort";

// Read React cell content before rendering. Explicit values take precedence for
// formatted dates, monetary amounts, and reusable row components.
const nodes = children => Children.toArray(children).flatMap(child => child?.type === React.Fragment ? nodes(child.props.children) : [child]);
export const cellValue = node => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return node;
  if (Array.isArray(node)) return node.map(cellValue).join(' ');
  if (!isValidElement(node)) return '';
  if (node.props['data-sort-value'] !== undefined) return node.props['data-sort-value'];
  if (node.type === 'input' || node.type === 'select') return node.props.value ?? '';
  return cellValue(node.props.children);
};
const cells = row => nodes(row.props?.children).filter(c => ['td', 'th'].includes(c.type));
const fixedRow = row => row.type === 'tr' && cells(row).some(c => c.props.colSpan > 1);

/** Native-table compatible sorting, without mutating records or DOM order.
 * Reusable row components supply sortValues in column order. Set sortable=false
 * for receipts or editable line-item forms; data-sortable=false excludes a column.
 */
export default function DataTable({ children, loading = false, loadingLabel = "Loading records", emptyState = true, emptyTitle = 'No records found', emptyDescription = 'Records will appear here when they are available.', sortable = true, sortScope, searchable = false, ...props }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ index: null, direction: 'asc' });
  const sections = nodes(children);
  const head = sections.find(s => s.type === 'thead');
  const headerIndex = nodes(head?.props.children).findIndex(r => r.type === 'tr');
  const headerRow = nodes(head?.props.children)[headerIndex];
  const headers = headerRow ? cells(headerRow) : [];
  const toggle = index => setSort(previous => ({ index, direction: previous.index === index && previous.direction === 'asc' ? 'desc' : 'asc' }));
  const enhanced = sections.map(section => {
    if (section.type === 'thead' && sortable) return cloneElement(section, {}, nodes(section.props.children).map((row, rowIndex) => rowIndex !== headerIndex ? row : cloneElement(row, {}, headers.map((header, index) => {
      const label = String(cellValue(header.props.children)).trim();
      const enabled = header.props['data-sortable'] !== false && !header.props.colSpan && label && !/^(actions?|select|#)$/i.test(label);
      if (!enabled) return header;
      const active = sort.index === index;
      const Icon = active ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
      return cloneElement(header, { 'aria-sort': active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none' },
        <button type="button" className="table-sort-button" onClick={() => toggle(index)} aria-label={`Sort by ${label}${active ? `, currently ${sort.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}>
          {header.props.children}<Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>);
    }))));
    if (section.type !== 'tbody') return section;
    if (loading) return cloneElement(section, {}, <tr><td colSpan={Math.max(headers.length, 1)}><LoadingState variant="inline" label={loadingLabel} /></td></tr>);
    const rows = nodes(section.props.children).filter(row => !search || fixedRow(row) || String(row.props.sortValues?.join(' ') || cellValue(row)).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    if (emptyState && rows.length === 1 && fixedRow(rows[0]) && /^no |^nothing /i.test(String(cellValue(rows[0])).trim())) return cloneElement(section, {}, <tr><td colSpan={Math.max(headers.length, 1)}><EmptyState title={String(cellValue(rows[0])).trim()} /></td></tr>);
    if (!rows.length && emptyState) return cloneElement(section, {}, <tr><td colSpan={Math.max(headers.length, 1)}><EmptyState title={search ? 'No matching records' : emptyTitle} description={search ? 'Try a different search or clear the filters.' : emptyDescription} filtered={!!search} onClear={search ? () => setSearch('') : undefined} /></td></tr>);
    if (!sortable || sort.index === null) return cloneElement(section, {}, rows);
    const movable = rows.filter(row => !fixedRow(row));
    const value = row => row.props.sortValues?.[sort.index] ?? cellValue(cells(row)[sort.index]);
    const ordered = movable.map((row, index) => ({ row, index })).sort((a, b) => compareValues(value(a.row), value(b.row), sort.direction, String(cellValue(headers[sort.index]))) || a.index - b.index).map(item => item.row);
    let index = 0;
    return cloneElement(section, {}, rows.map(row => fixedRow(row) ? row : ordered[index++]));
  });
  return <>
    {searchable && <FilterBar filters={[{ type: 'search', key: 'search', label: 'Search table', placeholder: 'Search records...' }]} values={{ search }} onChange={(_, value) => setSearch(value)} onClear={() => setSearch('')} />}
    <table {...props}>
    {sortScope && <caption className="table-sort-scope">{sortScope}</caption>}
    {enhanced}
  </table></>;
}
