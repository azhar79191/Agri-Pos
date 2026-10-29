// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ProductAuthenticity from './ProductAuthenticity';
import API from '../../api/axios';
import { financialCommand } from '../../api/financialCommand';
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../../api/financialCommand', () => ({ financialCommand: vi.fn() }));
const products = [{ _id: 'a', name: 'Seed', manufacturer: 'Manufacturer A' }];
beforeEach(() => { vi.clearAllMocks(); API.get.mockResolvedValue({ data: { data: { manufacturer: 'Manufacturer A', registered: true, checks: [] } } }); });
afterEach(cleanup);
it('records manual evidence and never claims an automatic authenticity result', async () => {
  financialCommand.mockResolvedValue({ data: { data: { item: { _id: 'check-a', code: 'PACK-123', outcome: 'manufacturer_confirmed', manufacturer: 'Manufacturer A', evidence: 'Confirmed by manufacturer support', checkedByName: 'Owner', createdAt: '2026-10-28T00:00:00Z' } } } });
  render(<ProductAuthenticity products={products} canEdit />);
  fireEvent.click(screen.getByText('Manufacturer authenticity checks'));
  fireEvent.click(screen.getByLabelText('Product from current search page'));
  fireEvent.click(screen.getByRole('option', { name: 'Seed · Manufacturer A' }));
  await screen.findByText('No checks recorded. Authenticity is unverified.');
  fireEvent.change(screen.getByLabelText('Package verification code'), { target: { value: 'PACK-123' } });
  fireEvent.click(screen.getByLabelText('Recorded outcome'));
  fireEvent.click(screen.getByRole('option', { name: /Manufacturer confirmation recorded by staff/i }));
  fireEvent.change(screen.getByLabelText('Evidence or manufacturer response'), { target: { value: 'Confirmed by manufacturer support' } });
  fireEvent.click(screen.getByText('Record manual check'));
  await screen.findByText('Check recorded.');
  expect(financialCommand).toHaveBeenCalledWith('post', '/products/a/authenticity', { code: 'PACK-123', batchNo: '', outcome: 'manufacturer_confirmed', evidence: 'Confirmed by manufacturer support' }, expect.any(Object));
  expect(screen.getByText(/Automatic manufacturer verification is not connected/)).toBeTruthy();
});
it('requires a registered company manufacturer before enabling checks', async () => {
  API.get.mockResolvedValue({ data: { data: { manufacturer: '', registered: false, checks: [] } } });
  render(<ProductAuthenticity products={products} canEdit />);
  fireEvent.click(screen.getByText('Manufacturer authenticity checks'));
  fireEvent.click(screen.getByLabelText('Product from current search page'));
  fireEvent.click(screen.getByRole('option', { name: 'Seed · Manufacturer A' }));
  await screen.findByText(/Add this manufacturer in company brands to record checks/);
  expect(screen.queryByText('Record manual check')).toBeNull();
});
