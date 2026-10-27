// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import HarvestSchedule from './HarvestSchedule';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
vi.mock('../api/axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../api/financialCommand', () => ({ financialCommand: vi.fn() }));
const summary = { harvestDate: '2027-04-01', installments: [], version: 0, currentDues: 500 };
beforeEach(() => { vi.clearAllMocks(); API.get.mockResolvedValue({ data: { data: summary } }); });
afterEach(cleanup);
it('saves a versioned promise without invoking a payment endpoint', async () => {
  financialCommand.mockResolvedValue({ data: { data: { ...summary, version: 1 } } });
  render(<HarvestSchedule season={{ _id: 'a', customer: { _id: 'farmer-a' } }} canEdit currency="Rs." />);
  await screen.findByDisplayValue('2027-04-01');
  fireEvent.click(screen.getByText('Add installment'));
  fireEvent.change(screen.getByLabelText('Agreed amount (Rs.)'), { target: { value: '500' } });
  fireEvent.click(screen.getByText('Save payment schedule'));
  await screen.findByText('Payment promises saved. No payment was recorded.');
  expect(financialCommand).toHaveBeenCalledWith('put', '/farmer-workspace/seasons/a/payment-schedule', { version: 0, harvestDate: '2027-04-01', installments: [{ dueDate: '2027-04-01', amount: 500, promise: '' }] }, expect.any(Object));
  expect(screen.getByText('Review collections in customer statement').getAttribute('href')).toBe('/customers/farmer-a/statement');
});
it('supports loading failure and retry', async () => {
  API.get.mockRejectedValueOnce(new Error('Unavailable'));
  render(<HarvestSchedule season={{ _id: 'a' }} canEdit={false} currency="Rs." />);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByText('Reload payment schedule'));
  await screen.findByDisplayValue('2027-04-01');
  expect(screen.queryByText('Save payment schedule')).toBeNull();
});
