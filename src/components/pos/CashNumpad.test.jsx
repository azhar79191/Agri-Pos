// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CashNumpad from './CashNumpad';
afterEach(cleanup);
it('keeps the receipt compact while allowing direct cash entry and an optional keypad', () => {
  const onChange = vi.fn();
  render(<CashNumpad payableAmount={100} value="" currency="Rs." onChange={onChange} />);
  expect(screen.queryByRole('button', { name: '7', exact: true })).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Cash received' }), { target: { value: '150.50' } });
  expect(onChange).toHaveBeenLastCalledWith('150.50');
  expect(screen.getByText('Rs. 50.50')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Show keypad' }));
  expect(screen.getByRole('button', { name: '7', exact: true })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Exact' }));
  expect(onChange).toHaveBeenLastCalledWith('100');
  fireEvent.click(screen.getByRole('button', { name: 'Hide keypad' }));
  expect(screen.queryByRole('button', { name: '7', exact: true })).toBeNull();
});
