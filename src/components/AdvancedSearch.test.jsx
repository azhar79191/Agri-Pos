// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const context = vi.hoisted(() => ({ state: { products: [], customers: [], transactions: [], settings: { lowStockThreshold: 5 } } }));
vi.mock('../context/AppContext', () => ({ useApp: () => context }));
import AdvancedSearch from './AdvancedSearch';
afterEach(cleanup);
it('refreshes results when records change and handles optional product fields', () => {
  context.state.products = [{ name: 'Seed', stock: 2, price: 10 }];
  const onResults = vi.fn();
  const view = render(<AdvancedSearch onResults={onResults} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Search...' }), { target: { value: 'fertilizer' } });
  expect(onResults).toHaveBeenLastCalledWith([], 'products');
  const fertilizer = { name: 'Fertilizer', stock: 1, price: 20 };
  context.state.products = [fertilizer];
  view.rerender(<AdvancedSearch onResults={onResults} />);
  expect(onResults).toHaveBeenLastCalledWith([fertilizer], 'products');
});
