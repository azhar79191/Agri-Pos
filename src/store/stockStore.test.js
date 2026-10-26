// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('../api/stockApi', () => ({
  adjustStock: vi.fn(), bulkAdjustStock: vi.fn(), getStockLogs: vi.fn(), getStockAlerts: vi.fn(), getStockLevels: vi.fn(), getStockSummary: vi.fn(),
}));
import { adjustStock } from '../api/stockApi';
import { useStockStore } from './stockStore';
import { useProductStore } from './productStore';
beforeEach(() => { vi.restoreAllMocks(); useProductStore.setState({ products: [{ _id: 'product-a', stock: 5, price: 100 }] }); });
it('updates the cached stock without issuing a second product mutation', async () => {
  const edit = vi.spyOn(useProductStore.getState(), 'editProduct');
  adjustStock.mockResolvedValue({ data: { data: { product: { _id: 'product-a', stock: 7, newStock: 7 } } } });
  await useStockStore.getState().adjust({ product: 'product-a', action: 'add', quantity: 2 });
  expect(edit).not.toHaveBeenCalled();
  expect(useProductStore.getState().products[0]).toEqual({ _id: 'product-a', stock: 7, price: 100 });
});
