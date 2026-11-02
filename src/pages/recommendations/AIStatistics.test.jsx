// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ getAIStats: vi.fn() }));
vi.mock('../../api/cropAdvisoryApi', () => api);
import AIStatistics from './AIStatistics';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('applies dates explicitly and keeps refresh on the applied range', async () => {
  api.getAIStats.mockResolvedValue({ success: true, data: { requests: { total: 1 } } });
  render(<AIStatistics />);
  const apply = screen.getByRole('button', { name: 'Apply Filter' });
  await waitFor(() => expect(apply.disabled).toBe(false));
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-11-01' } });
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-11-02' } });
  expect(api.getAIStats).toHaveBeenCalledTimes(1);
  fireEvent.click(apply);
  await waitFor(() => expect(api.getAIStats).toHaveBeenLastCalledWith({ startDate: '2026-11-01', endDate: '2026-11-02' }));
  await waitFor(() => expect(apply.disabled).toBe(false));
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-11-04' } });
  fireEvent.click(apply);
  expect(screen.getByText('Start date must be on or before end date.')).toBeTruthy();
  expect(api.getAIStats).toHaveBeenCalledTimes(2);
});
