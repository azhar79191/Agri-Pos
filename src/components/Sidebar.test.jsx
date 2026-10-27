// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
vi.mock('../context/AppContext',()=>({useApp:()=>({state:{currentUser:{role:'admin'},settings:{shopName:'Test shop'}},actions:{hasPermission:()=>true,showToast:vi.fn()}})}));
afterEach(cleanup);
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
