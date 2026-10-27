// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SeasonBudget from './SeasonBudget';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
vi.mock('../api/axios', () => ({ default: { get: vi.fn() } }));
vi.mock('../api/financialCommand', () => ({ financialCommand: vi.fn() }));
vi.mock('./HarvestSchedule', () => ({ default: () => null }));
const summary = { planned: 400, actual: 420, remaining: -20, version: 1, lines: [{ label: 'Seed', basis: 'per_area', planned: 100, actual: 420 }] };
const season = { _id: 'season-a', area: 4, areaUnit: 'acre' };
beforeEach(() => { vi.clearAllMocks(); API.get.mockResolvedValue({ data: { data: summary } }); });
afterEach(cleanup);

it('loads saved costs and submits versioned whole-season actual costs', async () => {
  financialCommand.mockResolvedValue({ data: { data: { ...summary, version: 2 } } });
  render(<SeasonBudget season={season} canEdit currency="Rs." />);
  await screen.findByDisplayValue('Seed');
  expect(screen.getByText(/Remaining: Rs. -20/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Actual season cost (Rs.)'), { target: { value: '450' } });
  fireEvent.click(screen.getByText('Save budget'));
  await screen.findByText('Budget saved.');
  expect(financialCommand).toHaveBeenCalledWith('put', '/farmer-workspace/seasons/season-a/budget', { version: 1, lines: [{ label: 'Seed', basis: 'per_area', planned: 100, actual: 450 }] }, expect.any(Object));
});

it('keeps viewing available without edit permission', async () => {
  render(<SeasonBudget season={season} canEdit={false} currency="Rs." />);
  await screen.findByDisplayValue('Seed');
  expect(screen.getByLabelText('Cost item').closest('fieldset').disabled).toBe(true);
  expect(screen.queryByText('Save budget')).toBeNull();
});

it('discards a response for a previously selected season', async () => {
  let resolve;
  API.get.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const view = render(<SeasonBudget season={season} canEdit currency="Rs." />);
  view.rerender(<SeasonBudget season={{ ...season, _id: 'season-b' }} canEdit currency="Rs." />);
  await screen.findByDisplayValue('Seed');
  resolve({ data: { data: { ...summary, lines: [{ ...summary.lines[0], label: 'Old season secret' }] } } });
  await waitFor(() => expect(screen.queryByDisplayValue('Old season secret')).toBeNull());
});
