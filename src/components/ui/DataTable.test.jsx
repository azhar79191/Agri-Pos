// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import DataTable from './DataTable';
import { compareValues } from '../../utils/tableSort';
afterEach(cleanup);
it('keeps headers during loading and delegates server sorting without reordering one page', () => {
  const onSortChange = vi.fn();
  const content = <><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Zebra</td></tr><tr><td>Apple</td></tr></tbody></>;
  const view = render(<DataTable loading>{content}</DataTable>);
  expect(screen.getByRole('columnheader', { name: /Name/ })).toBeTruthy();
  expect(document.querySelector('tbody .loading-table')).toBeTruthy();
  view.rerender(<DataTable sort={{ index: null, direction: 'asc' }} onSortChange={onSortChange}>{content}</DataTable>);
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Name' }));
  expect(onSortChange).toHaveBeenCalledWith({ index: 0, direction: 'asc' });
  expect([...document.querySelectorAll('tbody td')].map(cell => cell.textContent)).toEqual(['Zebra', 'Apple']);
});
const records = [{id:'a', name:'Item 10', amount:1200}, {id:'b', name:'Item 2', amount:90}, {id:'c', name:'Item 1', amount:null}];
function Example({data=records, searchable=false, loading=false}) { return <DataTable searchable={searchable} loading={loading}><thead><tr><th>Name</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{data.map(row => <tr key={row.id}><td>{row.name}</td><td data-sort-value={row.amount}>{row.amount == null ? 'Unknown' : `Custom ${row.amount}`}</td><td><button>Edit {row.name}</button></td></tr>)}</tbody><tfoot><tr><td colSpan={3}>Total</td></tr></tfoot></DataTable>; }
const names = () => [...document.querySelectorAll('tbody tr')].map(row=>row.cells[0].textContent);
it('sorts numeric amounts both ways with missing values last and keeps totals fixed', () => {
 render(<Example />);
 fireEvent.click(screen.getByRole('button', {name:'Sort by Amount'}));
 expect(names()).toEqual(['Item 2','Item 10','Item 1']);
 expect(screen.getByRole('columnheader',{name:/Amount/}).getAttribute('aria-sort')).toBe('ascending');
 fireEvent.click(screen.getByRole('button', {name:/Sort by Amount/}));
 expect(names()).toEqual(['Item 10','Item 2','Item 1']);
 expect(document.querySelector('tfoot').textContent).toBe('Total');
 expect(screen.queryByRole('button',{name:'Sort by Actions'})).toBeNull();
});
it('sorts names naturally, preserves actions, and never mutates source records', () => {
 render(<Example />); fireEvent.click(screen.getByRole('button',{name:'Sort by Name'}));
 expect(names()).toEqual(['Item 1','Item 2','Item 10']);
 expect(records[0].name).toBe('Item 10');
 expect(screen.getByRole('button',{name:'Edit Item 10'})).toBeTruthy();
});
it('uses the common empty state and clears a table search', () => {
 render(<Example searchable />);fireEvent.change(screen.getByRole('searchbox'),{target:{value:'missing'}});
 expect(screen.getByRole('status').textContent).toContain('No matching records');
 fireEvent.click(screen.getAllByRole('button',{name:'Clear filters'}).at(-1));
 expect(names()).toHaveLength(3);
});
it('keeps table headers visible and displays loading feedback below them', () => {
 render(<Example loading />);
 expect(screen.getByRole('columnheader', {name:/Name/})).toBeTruthy();
 expect(screen.getByRole('status', {name:'Loading records'})).toBeTruthy();
 expect(document.querySelector('tbody').textContent).not.toContain('Item 10');
});
it('sorts explicit dates and keeps nulls last in both directions', () => {
 expect(compareValues('2026-01-31','2026-02-01','asc','Date')).toBeLessThan(0);
 expect(compareValues(null,2,'desc')).toBeGreaterThan(0);
 expect(compareValues('Rs. 1,200','Rs. 90')).toBeGreaterThan(0);
});
