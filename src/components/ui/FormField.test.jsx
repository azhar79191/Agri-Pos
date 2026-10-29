// @vitest-environment jsdom
import React from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
import FormField from './FormField';
import Input from './Input';
import Select from './Select';
import Modal from './Modal';

afterEach(cleanup);
it('connects nested inputs to visible labels, inline hints and errors', () => {
  const change=vi.fn();
  render(<FormField label="Amount" error="Amount exceeds balance"><div><input type="number" onChange={change} /></div><p>Use the invoice currency.</p></FormField>);
  const control=screen.getByLabelText('Amount');
  expect(control.getAttribute('aria-invalid')).toBe('true');
  const descriptions=control.getAttribute('aria-describedby').split(' ').map(id=>document.getElementById(id).textContent).join(' ');
  expect(descriptions).toContain('Amount exceeds balance');
  expect(descriptions).toContain('Use the invoice currency.');
  fireEvent.change(control,{target:{value:'12'}});expect(change).toHaveBeenCalledOnce();
});
it('connects native validation messages and clears them on editing', () => {
  render(<FormField label="Email"><input type="email" required /></FormField>);
  const control=screen.getByLabelText('Email');fireEvent.invalid(control);
  expect(control.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByRole('alert').textContent).toBeTruthy();
  fireEvent.change(control,{target:{value:'farmer@example.test'}});
  expect(screen.queryByRole('alert')).toBeNull();
});
it('connects shared Input helper/error text and preserves additional descriptions', () => {
  render(<><p id="hint">Use business email.</p><Input label="Email" error="Email is required" aria-describedby="hint" /></>);
  const control=screen.getByLabelText('Email');
  expect(control.getAttribute('aria-describedby')).toContain('hint');
  expect(control.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
});
it('labels custom selects and protects selections from accidental dismissal', () => {
  const close=vi.fn();
  render(<Modal isOpen onClose={close} title="Edit payment"><FormField label="Payment method"><Select defaultValue="cash" options={[{value:'cash',label:'Cash'},{value:'bank',label:'Bank'}]} /></FormField></Modal>);
  fireEvent.click(screen.getByRole('combobox',{name:'Payment method'}));
  fireEvent.click(screen.getByRole('option',{name:'Bank'}));
  fireEvent.click(screen.getByLabelText('Close dialog'));
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByText('Discard unsaved changes?')).toBeTruthy();
});
