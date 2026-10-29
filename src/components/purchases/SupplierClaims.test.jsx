import FeedbackHost from '../FeedbackHost';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SupplierClaims from './SupplierClaims';
import API from '../../api/axios';
import { financialCommand } from '../../api/financialCommand';
vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../../api/financialCommand', () => ({ financialCommand: vi.fn() }));
const suppliers = [{ _id: 'a', name: 'Supplier A' }];
const claim = { _id: 'claim-a', kind: 'damage', title: 'Damage claim', amount: 150, status: 'open', notes: 'Damaged cartons' };
beforeEach(() => { vi.clearAllMocks(); API.get.mockResolvedValue({ data: { data: { items: [claim], pagination: { pages: 1 } } } }); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('requires evidence and confirmation before posting credit', async () => {

  const recorded = vi.fn();
  financialCommand.mockResolvedValue({ data: { data: {} } });
  render(<><SupplierClaims suppliers={suppliers} currency="Rs." onRecorded={recorded} /><FeedbackHost /></>);
  fireEvent.click(screen.getByText('Supplier claims and schemes'));
  fireEvent.click(screen.getByLabelText('Supplier from current search page'));
  fireEvent.click(screen.getByRole('option', { name: 'Supplier A' }));
  const credit = await screen.findByText('Post supplier credit');
  expect(credit.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Supplier response / credit-note reference'), { target: { value: 'Supplier credit note CN-1' } });
  fireEvent.click(credit);
  expect(financialCommand).not.toHaveBeenCalled();
  await screen.findByRole('dialog',{name:'Confirm action'});
  fireEvent.click(screen.getByRole('button',{name:'Cancel',exact:true}));
  fireEvent.click(credit);
  await screen.findByRole('dialog',{name:'Confirm action'});
  fireEvent.click(screen.getByRole('button',{name:'Confirm',exact:true}));
  await screen.findByText('Supplier credit posted to the ledger.');
  expect(financialCommand).toHaveBeenCalledWith('post', '/suppliers/a/claims/claim-a/resolve', { status: 'credited', response: 'Supplier credit note CN-1' }, expect.any(Object));
  await waitFor(() => expect(recorded).toHaveBeenCalled());
});
it('creates a claim separately from posting ledger credit', async () => {
  financialCommand.mockResolvedValue({ data: { data: {} } });
  render(<SupplierClaims suppliers={suppliers} currency="Rs." />);
  fireEvent.click(screen.getByText('Supplier claims and schemes'));
  fireEvent.click(screen.getByLabelText('Supplier from current search page'));
  fireEvent.click(screen.getByRole('option', { name: 'Supplier A' }));
  await screen.findByText('Post supplier credit');
  fireEvent.change(screen.getByLabelText('Claim title'), { target: { value: 'Expired cartons' } });
  fireEvent.change(screen.getByLabelText('Expected credit (Rs.)'), { target: { value: '200' } });
  fireEvent.click(screen.getByText('Open claim'));
  await screen.findByText('Claim opened. No supplier credit has been posted.');
  expect(financialCommand).toHaveBeenCalledWith('post', '/suppliers/a/claims', { kind: 'damage', title: 'Expired cartons', amount: 200, notes: '' }, expect.any(Object));
});
