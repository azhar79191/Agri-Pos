// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../api/axios', () => ({ default: mocks }));
import { financialCommand } from '../api/financialCommand';
import PendingInventoryOperations from './PendingInventoryOperations';

beforeEach(() => {
  vi.resetAllMocks(); sessionStorage.clear(); localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ _id: 'user-a', shop: 'shop-a' }));
});
afterEach(cleanup);
const command = { product: 'product-a', action: 'add', quantity: 2, reason: 'Count' };
const options = { idField: 'clientOperationId', label: 'stock adjustment' };
async function unresolved() {
  mocks.request.mockRejectedValueOnce(new Error('timeout'));
  await expect(financialCommand('post', '/stock/adjust', command, options)).rejects.toThrow('timeout');
}
it('recovers the stored inventory payload and original identifier after a remount', async () => {
  await unresolved();
  const original = mocks.request.mock.calls[0][0];
  mocks.request.mockResolvedValueOnce({ data: { success: true } });
  const recovered = vi.fn();
  render(<PendingInventoryOperations pathPrefix="/stock/adjust" onRecovered={recovered} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Recover original change' })); });
  await waitFor(() => expect(recovered).toHaveBeenCalledTimes(1));
  expect(mocks.request.mock.calls[1][0]).toEqual(original);
  expect(screen.getByRole('status').textContent).toContain('confirmed');
  expect(sessionStorage.length).toBe(0);
});
it('does not show another account\'s unresolved inventory change', async () => {
  await unresolved();
  localStorage.setItem('user', JSON.stringify({ _id: 'user-b', shop: 'shop-b' }));
  const { container } = render(<PendingInventoryOperations pathPrefix="/stock/adjust" />);
  expect(container.textContent).toBe('');
  expect(sessionStorage.length).toBe(1);
});
it('reports a confirmed change accurately when refreshing the view fails', async () => {
  await unresolved();
  mocks.request.mockResolvedValueOnce({ data: { success: true } });
  render(<PendingInventoryOperations pathPrefix="/stock/adjust" onRecovered={() => { throw new Error('Refresh failed'); }} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Recover original change' })); });
  expect(screen.getByRole('status').textContent).toContain('Change confirmed');
  expect(sessionStorage.length).toBe(0);
});
