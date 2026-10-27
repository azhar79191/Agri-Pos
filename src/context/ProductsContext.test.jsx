// @vitest-environment jsdom
import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { ProductsProvider, useProducts } from './ProductsContext';
import { getProducts } from '../api/productApi';
vi.mock('../api/productApi', () => ({ getProducts: vi.fn(), getProduct: vi.fn(), createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(), getLowStockProducts: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const response = name => ({ data: { data: { products: [{ _id: name, name }] } } });
describe('directory request ordering', () => {
  it('keeps the latest search when responses arrive out of order', async () => {
    const first = deferred(), second = deferred();
    getProducts.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useProducts(), { wrapper: ProductsProvider });
    let a, b;
    act(() => { a = result.current.fetchProducts({ search: 'old' }); b = result.current.fetchProducts({ search: 'new' }); });
    await act(async () => { second.resolve(response('new')); await b; });
    await act(async () => { first.resolve(response('old')); await a; });
    expect(result.current.products[0].name).toBe('new');
    expect(result.current.loading).toBe(false);
  });
  it('does not restore a previous session list after account reset', async () => {
    const pending = deferred(); getProducts.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useProducts(), { wrapper: ProductsProvider });
    let request;
    act(() => { request = result.current.fetchProducts(); });
    act(() => window.dispatchEvent(new Event('business-session-reset')));
    await act(async () => { pending.resolve(response('previous-shop')); await request; });
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
