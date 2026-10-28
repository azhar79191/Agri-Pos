// @vitest-environment jsdom
import { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import Select from './CustomSelect';
afterEach(cleanup);
const options = [{ value: 'viewer', label: 'Viewer' }, { value: 'blocked', label: 'Unavailable', disabled: true }, { value: 'editor', label: 'Editor' }];
function Example({ disabled = false }) { const [value, setValue] = useState(''); return <Select label="Access role" name="role" options={options} value={value} disabled={disabled} onChange={event => setValue(event.target.value)} />; }
it('selects with a custom listbox and skips disabled options using the keyboard', () => {
  render(<Example />);
  const trigger = screen.getByRole('combobox', { name: 'Access role' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(screen.getByRole('listbox')).toBeTruthy();
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  expect(trigger.textContent).toContain('Editor');
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(document.querySelector('select[name="role"]').value).toBe('editor');
});
it('supports pointer choice, typeahead, escape and outside dismissal', () => {
  render(<Example />);
  const trigger = screen.getByRole('combobox', { name: 'Access role' });
  fireEvent.click(trigger); fireEvent.click(screen.getByRole('option', { name: 'Viewer' }));
  expect(trigger.textContent).toContain('Viewer');
  fireEvent.keyDown(trigger, { key: 'e' }); fireEvent.keyDown(trigger, { key: 'Enter' });
  expect(trigger.textContent).toContain('Editor');
  fireEvent.click(trigger); fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.click(trigger); fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('listbox')).toBeNull();
});
it('filters dropdown options through its search field', () => {
  render(<Example />);
  fireEvent.click(screen.getByRole('combobox', { name: 'Access role' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search options' }), { target: { value: 'edit' } });
  expect(screen.getByRole('option', { name: 'Editor' })).toBeTruthy();
  expect(screen.queryByRole('option', { name: 'Viewer' })).toBeNull();
  fireEvent.click(screen.getByRole('option', { name: 'Editor' }));
  expect(screen.getByRole('combobox', { name: 'Access role' }).textContent).toContain('Editor');
});
it('does not open inside a disabled fieldset and announces empty lists', () => {
  const view = render(<fieldset disabled><Example /></fieldset>);
  fireEvent.click(screen.getByRole('combobox'));
  expect(screen.queryByRole('listbox')).toBeNull();
  view.unmount(); render(<Select label="Staff" options={[]} />);
  fireEvent.click(screen.getByRole('combobox'));
  expect(screen.getByText('No options available')).toBeTruthy();
});
