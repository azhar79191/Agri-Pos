// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import DateRangePicker from './DateRangePicker';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('anchors to the trigger and flips near the viewport edge', () => {
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({left: 100});
  render(<DateRangePicker onChange={() => {}} />);
  const trigger = screen.getByRole('button', {name: 'Select date range'});
  fireEvent.click(trigger);
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  expect(panel.classList.contains('left-0')).toBe(true);
  rect.mockReturnValue({left: window.innerWidth - 100});
  fireEvent(window, new Event('resize'));
  expect(panel.classList.contains('right-0')).toBe(true);
  fireEvent.keyDown(trigger, {key: 'Escape'});
  expect(document.getElementById(trigger.getAttribute('aria-controls'))).toBeNull();
});
