// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getAllAdvisories: vi.fn(), deleteAdvisory: vi.fn(), showToast: vi.fn(), exportAdvisoryPage: vi.fn(), confirmAction: vi.fn() }));
vi.mock('../../api/cropAdvisoryApi', () => mocks);
vi.mock('../../utils/advisoryExport', () => mocks);
vi.mock('../../utils/feedback', () => ({ confirmAction: mocks.confirmAction }));
const actions = { showToast: mocks.showToast };
vi.mock('../../context/AppContext', () => ({ useApp: () => ({ actions }) }));
import AdvisoryHistory from './AdvisoryHistory';
const response = (name, pages = 1) => ({ data: { advisories: [{ _id: name, crop: 'wheat', issue: name, diagnosis: 'Expert review needed', severity: 'Low', createdAt: '2026-11-02' }], pagination: { pages, total: pages * 20 } } });
beforeEach(() => { vi.clearAllMocks(); mocks.confirmAction.mockResolvedValue(true); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('ignores late search responses and opens the actual saved advisory', async () => {
  let finishOld;
  mocks.getAllAdvisories.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; })).mockResolvedValue(response('Current issue'));
  render(<AdvisoryHistory />);
  fireEvent.change(screen.getByLabelText('Search advisories'), { target: { value: 'Current' } });
  await screen.findByText('Current issue');
  await act(async () => finishOld(response('Outdated issue')));
  expect(screen.queryByText('Outdated issue')).toBeNull();
  fireEvent.click(screen.getByTitle('View'));
  expect(await screen.findByRole('dialog', { name: 'Advisory details' })).toBeTruthy();
  expect(screen.getByText('Expert review needed')).toBeTruthy();
});
it('resets pagination on filters and refreshes after deletion', async () => {
  mocks.getAllAdvisories.mockResolvedValue(response('Saved issue', 3));
  mocks.deleteAdvisory.mockResolvedValue({ success: true });
  render(<AdvisoryHistory />);
  await screen.findByText('Saved issue');
  fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
  await waitFor(() => expect(mocks.getAllAdvisories).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  fireEvent.change(screen.getByLabelText('Search advisories'), { target: { value: 'Saved' } });
  await waitFor(() => expect(mocks.getAllAdvisories).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: 'Saved' })));
  await screen.findByText('Saved issue');
  const calls = mocks.getAllAdvisories.mock.calls.length;
  fireEvent.click(screen.getByTitle('Delete'));
  await waitFor(() => expect(mocks.deleteAdvisory).toHaveBeenCalledWith('Saved issue'));
  await waitFor(() => expect(mocks.getAllAdvisories.mock.calls.length).toBeGreaterThan(calls));
});
it('shows a retryable error instead of keeping stale records', async () => {
  mocks.getAllAdvisories.mockRejectedValueOnce(new Error('History unavailable')).mockResolvedValue(response('Recovered issue'));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<AdvisoryHistory />);
  expect(await screen.findByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByText('Recovered issue');
  expect(screen.queryByRole('alert')).toBeNull();
});
