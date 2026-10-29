// @vitest-environment jsdom
import React, { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Modal from './Modal';
import ModernModal, { ConfirmModal } from './ModernModal';
import QuickAddCustomerModal from '../pos/QuickAddCustomerModal';
import HeldSalesModal from '../pos/HeldSalesModal';

afterEach(cleanup);
it('shares one shell across both entry points with labelled, scrolling content and footer', () => {
  expect(ModernModal).toBe(Modal);
  const close = vi.fn();
  render(<Modal isOpen title="Edit supplier" subtitle="Supplier details" onClose={close} footer={<button>Save</button>}><input aria-label="Name" /></Modal>);
  const dialog = screen.getByRole('dialog', { name: 'Edit supplier' });
  expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
  expect(dialog.querySelector('.app-modal__body')).toBeTruthy();
  expect(dialog.querySelector('.app-modal__footer').textContent).toBe('Save');
  fireEvent.click(screen.getByLabelText('Name'));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(dialog.parentElement);
  expect(close).toHaveBeenCalledOnce();
});
it('respects disabled dismissal during a pending confirmation', () => {
  const close = vi.fn();
  render(<ConfirmModal isOpen loading title="Delete record" onClose={close} onConfirm={vi.fn()} />);
  const dialog=screen.getByRole('dialog');
  fireEvent.click(dialog.parentElement);
  fireEvent.keyDown(document, {key:'Escape'});
  expect(close).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('Close dialog')).toBeNull();
  expect(screen.getByRole('button', {name:'Confirm'}).disabled).toBe(true);
});
it('dismisses only the top dialog and restores scroll only when the last dialog closes', () => {
  document.body.style.overflow='auto';
  document.body.style.paddingRight='7px';
  function Stack(){
    const [parent,setParent]=useState(true), [child,setChild]=useState(true);
    return <><Modal isOpen={parent} title="Parent" onClose={()=>setParent(false)}><button>Parent action</button></Modal><Modal isOpen={child} title="Child" onClose={()=>setChild(false)}>Child content</Modal></>;
  }
  render(<Stack />);
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog',{name:'Child'})).toBeNull();
  expect(screen.getByRole('dialog',{name:'Parent'})).toBeTruthy();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('auto');
  expect(document.body.style.paddingRight).toBe('7px');
  document.body.style.overflow=''; document.body.style.paddingRight='';
});
it('restores focus to the trigger after dismissal', () => {
  function Example(){ const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>Open</button><Modal isOpen={open} onClose={()=>setOpen(false)} title="Example">Content</Modal></>; }
  render(<Example />);
  const trigger=screen.getByText('Open');trigger.focus();fireEvent.click(trigger);
  expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  fireEvent.click(screen.getByLabelText('Close dialog'));
  expect(document.activeElement).toBe(trigger);
});
it('migrates POS quick-add and held-sale dialogs without losing actions', () => {
  const submit=vi.fn(),close=vi.fn();
  const view=render(<QuickAddCustomerModal form={{name:'Farmer',phone:'',address:''}} onChange={vi.fn()} onSubmit={submit} onClose={close} />);
  expect(screen.getByRole('dialog',{name:'Quick Add Customer'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Add & Select'}));expect(submit).toHaveBeenCalledOnce();
  view.unmount();
  render(<HeldSalesModal isOpen onClose={close} onRecall={vi.fn()} currency="Rs." />);
  expect(screen.getByRole('dialog',{name:'Held Sales'})).toBeTruthy();
  expect(screen.getByText('No held sales')).toBeTruthy();
});
