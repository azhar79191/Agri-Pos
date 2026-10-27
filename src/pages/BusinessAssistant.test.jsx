// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import BusinessAssistant from './BusinessAssistant';
import API from '../api/axios';
vi.mock('../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock('../context/AppContext', () => ({ useApp: () => ({ state: { settings: { currency: 'USD' } }, actions: { hasPermission: () => true } }) }));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
beforeEach(() => { API.get.mockImplementation(async path => ({ data: { data: path.endsWith('tools') ? { tools: [], aiPlanningEnabled: false } : { connections: [] } } })); });
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('discards an old company answer after session reset', async () => {
  const pending = deferred(); API.post.mockReturnValueOnce(pending.promise);
  render(<BusinessAssistant />);
  await act(async () => {});
  fireEvent.change(screen.getByLabelText('Ask about your business'), { target: { value: 'Show sales' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask assistant' }));
  act(() => window.dispatchEvent(new Event('business-session-reset')));
  await act(async () => { pending.resolve({ data: { data: { message: 'Previous company secret', data: {}, tool: 'sales_summary', generatedAt: new Date().toISOString() } } }); });
  expect(screen.queryByText('Previous company secret')).toBeNull();
  expect(screen.getByLabelText('Ask about your business').value).toBe('');
});

it('discards an old tools failure after session reset', async () => {
  const pending = deferred(); API.get.mockImplementation(path => path.endsWith('tools') ? pending.promise : Promise.resolve({ data: { data: { connections: [] } } }));
  render(<BusinessAssistant />);
  act(() => window.dispatchEvent(new Event('business-session-reset')));
  await act(async () => { pending.reject(new Error('Old connection failed')); });
  expect(screen.queryByRole('alert')).toBeNull();
});
