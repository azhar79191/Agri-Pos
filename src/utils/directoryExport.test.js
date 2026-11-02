// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { collectDirectory } from './directoryExport';
beforeEach(() => { localStorage.clear(); });
it('exports beyond the former 1000-record limit using every page', async () => {
  const rows = Array.from({ length: 1001 }, (_, index) => ({ _id: String(index) }));
  const fetchPage = vi.fn(async ({ page, limit }) => ({ data: { data: { products: rows.slice((page - 1) * limit, page * limit), pagination: { total: rows.length, pages: 11 } } } }));
  expect(await collectDirectory(fetchPage, 'products')).toEqual(rows);
  expect(fetchPage).toHaveBeenCalledTimes(11);
});
it('refuses incomplete exports and records from a changed session', async () => {
  const incomplete = vi.fn(async () => ({ data: { data: { customers: [], pagination: { total: 1, pages: 1 } } } }));
  await expect(collectDirectory(incomplete, 'customers')).rejects.toThrow('incomplete');
  const changed = vi.fn(async () => {
    localStorage.setItem('user', JSON.stringify({ _id: 'user-b', shop: 'shop-b' }));
    return { data: { data: { customers: [], pagination: { total: 0, pages: 0 } } } };
  });
  await expect(collectDirectory(changed, 'customers')).rejects.toThrow('session changed');
});
