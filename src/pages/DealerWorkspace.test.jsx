// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import DealerWorkspace from './DealerWorkspace';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
vi.mock('../api/axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../api/financialCommand', () => ({ financialCommand: vi.fn() }));
vi.mock('../components/PackWorkspace', () => ({ default: () => null }));
vi.mock('../components/CustomerOrders', () => ({ default: () => null }));
vi.mock('../components/DealerNetwork', () => ({ default: () => null }));
vi.mock('../components/PendingInventoryOperations', () => ({ default: () => null }));
const schema = { title: 'Supplier offers', canEdit: true, canReview: true, fields: { title: { label: 'Offer title', type: 'text', required: true }, bonus: { label: 'Bonus units', type: 'integer', min: 0, max: 100, required: true } }, states: ['open', 'reviewed'] };
beforeEach(() => { vi.clearAllMocks(); API.get.mockImplementation(path => Promise.resolve({ data: { data: path.endsWith('/schemas') ? { schemas: { 'supplier-offers': schema } } : { items: [], pagination: { pages: 1 } } } })); });
afterEach(cleanup);
it('submits numeric zero without dropping it from typed fields', async () => {
  financialCommand.mockResolvedValue({ data: { data: {} } });
  render(<DealerWorkspace />);
  await screen.findByLabelText('Offer title');
  fireEvent.change(screen.getByLabelText('Offer title'), { target: { value: 'Season offer' } });
  fireEvent.change(screen.getByLabelText('Bonus units'), { target: { value: '0' } });
  fireEvent.click(screen.getByText('Save record'));
  await screen.findByText('Record saved.');
  expect(financialCommand).toHaveBeenCalledWith('post', '/dealer-records/supplier-offers', { fields: { title: 'Season offer', bonus: 0 } }, expect.any(Object));
});
it('shows a retryable API failure separately from an empty list', async () => {
  API.get.mockImplementation(path => path.endsWith('/schemas') ? Promise.resolve({ data: { data: { schemas: { 'supplier-offers': schema } } } }) : Promise.reject(new Error('Unavailable')));
  render(<DealerWorkspace />);
  await screen.findByText('Records unavailable');
  expect(screen.queryByText('No records yet.')).toBeNull();
  API.get.mockResolvedValue({ data: { data: { items: [], pagination: { pages: 1 } } } });
  fireEvent.click(screen.getByText('Reload records'));
  await screen.findByText('No records yet.');
});
