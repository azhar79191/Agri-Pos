// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('./axios', () => ({ default: mocks }));
import { financialCommand } from './financialCommand';
beforeEach(() => {
  vi.resetAllMocks(); sessionStorage.clear(); localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ _id: 'user-a', shop: 'shop-a' }));
});
it('reuses the identifier after an unknown payment outcome', async () => {
  mocks.request.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({ data: { success: true } });
  await expect(financialCommand('post', '/customers/a/deposit', { amount: 10 })).rejects.toThrow('timeout');
  await financialCommand('post', '/customers/a/deposit', { amount: 10 });
  expect(mocks.request.mock.calls[0][0].data.clientPaymentId).toBe(mocks.request.mock.calls[1][0].data.clientPaymentId);
  expect(sessionStorage.length).toBe(0);
});
it('prevents a changed payment from overwriting an unresolved command', async () => {
  mocks.request.mockRejectedValue(new Error('timeout'));
  await expect(financialCommand('post', '/customers/a/deposit', { amount: 10 })).rejects.toThrow();
  await expect(financialCommand('post', '/customers/a/deposit', { amount: 20 })).rejects.toThrow('unresolved');
  expect(mocks.request).toHaveBeenCalledTimes(1);
});
it('partitions unresolved commands by account and shop', async () => {
  mocks.request.mockRejectedValue(new Error('timeout'));
  await expect(financialCommand('post', '/customers/a/deposit', { amount: 10 })).rejects.toThrow();
  localStorage.setItem('user', JSON.stringify({ _id: 'user-b', shop: 'shop-b' }));
  await expect(financialCommand('post', '/customers/a/deposit', { amount: 20 })).rejects.toThrow('timeout');
  expect(mocks.request.mock.calls[0][0].data.clientPaymentId).not.toBe(mocks.request.mock.calls[1][0].data.clientPaymentId);
});

it('deduplicates simultaneous submissions and uses inventory recovery identifiers', async () => {
  let complete;
  mocks.request.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  const options = { idField: 'clientOperationId', label: 'stock adjustment' };
  const first = financialCommand('post', '/stock/adjust', { quantity: 2 }, options);
  const second = financialCommand('post', '/stock/adjust', { quantity: 2 }, options);
  await Promise.resolve();
  expect(mocks.request).toHaveBeenCalledTimes(1);
  expect(mocks.request.mock.calls[0][0].data.clientOperationId).toBeTruthy();
  expect(mocks.request.mock.calls[0][0].data.clientPaymentId).toBeUndefined();
  complete({ data: { success: true } });
  await Promise.all([first, second]);
  expect(sessionStorage.length).toBe(0);
});
