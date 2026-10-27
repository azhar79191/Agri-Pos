// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { useInvoiceStore } from './invoiceStore';
import { getInvoices } from '../api/invoicesApi';
vi.mock('../api/invoicesApi', () => ({ getInvoices: vi.fn(), getInvoice: vi.fn(), createInvoice: vi.fn(), updateInvoiceStatus: vi.fn(), getTodaySales: vi.fn(), getRecentTransactions: vi.fn() }));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const response = name => ({ data: { data: { invoices: [{ _id: name }], pagination: { page: 2, pages: 3, total: 30 } } } });
beforeEach(() => { window.dispatchEvent(new Event('business-session-reset')); vi.clearAllMocks(); });
it('retains server pagination and refreshes the current filters', async () => {
  getInvoices.mockResolvedValue(response('match'));
  await useInvoiceStore.getState().fetchInvoices({ page: 2, search: 'remote' });
  await useInvoiceStore.getState().fetchInvoices();
  expect(getInvoices).toHaveBeenLastCalledWith({ page: 2, search: 'remote' });
  expect(useInvoiceStore.getState().pagination.total).toBe(30);
});
it('does not restore an old response after a newer search or account reset', async () => {
  const older = deferred(), newer = deferred();
  getInvoices.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
  const first = useInvoiceStore.getState().fetchInvoices({ search: 'old' });
  const second = useInvoiceStore.getState().fetchInvoices({ search: 'new' });
  newer.resolve(response('new')); await second;
  older.resolve(response('old')); await first;
  expect(useInvoiceStore.getState().invoices[0]._id).toBe('new');
  const stale = deferred(); getInvoices.mockReturnValueOnce(stale.promise);
  const pending = useInvoiceStore.getState().fetchInvoices();
  window.dispatchEvent(new Event('business-session-reset'));
  stale.resolve(response('previous-company')); await pending;
  expect(useInvoiceStore.getState().invoices).toEqual([]);
});
