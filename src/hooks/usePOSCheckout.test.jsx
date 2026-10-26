// @vitest-environment jsdom
import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addInvoice: vi.fn(), refreshCustomer: vi.fn(), addCustomer: vi.fn(),
  actions: { showToast: vi.fn(), clearCart: vi.fn(), createTransaction: vi.fn(), createInvoice: vi.fn() },
}));
vi.mock('../context/AppContext', () => ({ useApp: () => ({ state: { currentUser: { _id: 'cashier', name: 'Cashier', shop: 'shop-a' } }, actions: mocks.actions }) }));
vi.mock('./useInvoices', () => ({ useInvoices: () => ({ addInvoice: mocks.addInvoice }) }));
vi.mock('../context/CustomersContext', () => ({ useCustomers: () => mocks }));
vi.mock('../components/pos/HeldSalesModal', () => ({ getHeldSales: () => [], holdSale: vi.fn() }));
import { usePOSCheckout } from './usePOSCheckout';

const props = () => ({
  cart: [{ productId: 'product-a', name: 'Seed', price: 100, quantity: 1 }],
  cartCalculations: { payableAmount: 100, subtotal: 100, tax: 0, grandTotal: 100 },
  discountAmount: 0, paymentMethod: 'Cash', cashReceived: '100', selectedCustomer: '', customer: null,
  resetCart: vi.fn(), setSelectedCustomer: vi.fn(), setDiscount: vi.fn(), setCashReceived: vi.fn(),
});
const invoice = { _id: 'invoice-a', invoiceNumber: 'INV-TEST', customerName: 'Walk-in',
  items: [{ product: 'product-a', productName: 'Seed', unitPrice: 100, quantity: 1, total: 100 }],
  subtotal: 100, taxAmount: 0, discount: 0, total: 100, paymentMethod: 'Cash', status: 'Completed' };
beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('checkout outcomes', () => {
  it('preserves the cart and never shows a receipt for a rejected sale', async () => {
    mocks.addInvoice.mockRejectedValue({ response: { status: 409, data: { message: 'Insufficient stock' } } });
    const args = props();
    const { result } = renderHook(() => usePOSCheckout(args));
    await act(async () => { await result.current.handleCheckout(); });
    expect(result.current.showReceipt).toBe(false);
    expect(args.resetCart).not.toHaveBeenCalled();
    expect(mocks.actions.createTransaction).not.toHaveBeenCalled();
    expect(mocks.actions.createInvoice).not.toHaveBeenCalled();
    expect(mocks.actions.showToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Insufficient stock', type: 'error' }));
  });
  it('does not send offline checkout requests', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => usePOSCheckout(props()));
    await act(async () => { await result.current.handleCheckout(); });
    expect(mocks.addInvoice).not.toHaveBeenCalled();
    expect(result.current.showReceipt).toBe(false);
  });
  it('recovers an ambiguous timeout using exactly the original identifier and payload', async () => {
    mocks.addInvoice.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce(invoice);
    const args = props();
    const first = renderHook(() => usePOSCheckout(args));
    await act(async () => { await first.result.current.handleCheckout(); });
    const original = mocks.addInvoice.mock.calls[0][0];
    expect(first.result.current.hasPendingCheckout).toBe(true);
    first.unmount();
    const second = renderHook(() => usePOSCheckout({ ...args, cashReceived: '' }));
    await act(async () => { await second.result.current.handleRecoverCheckout(); });
    expect(mocks.addInvoice.mock.calls[1][0]).toEqual(original);
    expect(second.result.current.showReceipt).toBe(true);
    expect(second.result.current.hasPendingCheckout).toBe(false);
    expect(second.result.current.completedTransaction.invoiceNumber).toBe('INV-TEST');
  });
  it('uses backend totals including authoritative zero values', async () => {
    mocks.addInvoice.mockResolvedValue({ ...invoice, total: 0, subtotal: 0 });
    const { result } = renderHook(() => usePOSCheckout(props()));
    await act(async () => { await result.current.handleCheckout(); });
    expect(result.current.completedTransaction.grandTotal).toBe(0);
    expect(result.current.completedTransaction.subtotal).toBe(0);
    expect(result.current.hasPendingCheckout).toBe(false);
  });
});
