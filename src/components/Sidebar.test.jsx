// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
vi.mock('../context/AppContext',()=>({useApp:()=>({state:{currentUser:{role:'admin'},settings:{shopName:'Test shop'}},actions:{hasPermission:()=>true,showToast:vi.fn()}})}));
afterEach(cleanup);
it('finds nested pages and restores navigation when search is cleared', () => {
 render(<MemoryRouter initialEntries={['/products']}><Sidebar /></MemoryRouter>);
 fireEvent.change(screen.getByRole('textbox', { name: 'Search navigation' }), { target: { value: 'Forecasting' } });
 expect(screen.getByRole('button', { name: 'Forecasting' })).toBeTruthy();
 expect(screen.queryByRole('button', { name: 'Sales' })).toBeNull();
 fireEvent.click(screen.getByRole('button', { name: 'Clear navigation search' }));
 expect(screen.getByRole('button', { name: 'Sales' })).toBeTruthy();
});
it('offers a recovery action when no navigation pages match', () => {
 render(<MemoryRouter><Sidebar /></MemoryRouter>);
 fireEvent.change(screen.getByRole('textbox', { name: 'Search navigation' }), { target: { value: 'no-such-page' } });
 expect(screen.getByRole('status').textContent).toContain('No pages found');
 fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
 expect(screen.getByRole('button', { name: 'Dashboard' })).toBeTruthy();
});
it('opens only one section and prevents access to collapsed links', () => {
 render(<MemoryRouter initialEntries={['/dashboard/analytics']}><Sidebar /></MemoryRouter>);
 const dashboard=screen.getByRole('button',{name:'Dashboard'}), sales=screen.getByRole('button',{name:'Sales'});
 expect(dashboard.getAttribute('aria-expanded')).toBe('true');
 fireEvent.click(sales);expect(sales.getAttribute('aria-expanded')).toBe('true');expect(dashboard.getAttribute('aria-expanded')).toBe('false');
 expect(document.getElementById(dashboard.getAttribute('aria-controls')).hasAttribute('inert')).toBe(true);
 fireEvent.click(sales);expect(sales.getAttribute('aria-expanded')).toBe('false');
});
it('opens the route group after navigation and preserves the nav element', () => {
 render(<MemoryRouter initialEntries={['/products']}><Sidebar /></MemoryRouter>);
 const nav=screen.getByRole('navigation');fireEvent.click(screen.getByRole('button',{name:'Sales'}));
 fireEvent.click(screen.getByRole('button',{name:'Invoices'}));
 expect(screen.getByRole('navigation')).toBe(nav);
 expect(screen.getByRole('button',{name:'Invoices'}).getAttribute('aria-current')).toBe('page');
 expect(screen.getByRole('button',{name:'Inventory'}).getAttribute('aria-expanded')).toBe('false');
});
