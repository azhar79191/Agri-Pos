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
it('protects edited fields through Cancel, Escape and backdrop, and supports explicit discard', () => {
  const close=vi.fn();
  render(<Modal isOpen title="Edit record" onClose={close} footer={<button data-modal-dismiss onClick={close}>Cancel</button>}><input aria-label="Record name" defaultValue="Original" /></Modal>);
  fireEvent.input(screen.getByLabelText('Record name'),{target:{value:'Changed'}});
  fireEvent.click(screen.getByText('Cancel'));
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('group',{name:'Unsaved changes'})).toBeTruthy();
  fireEvent.click(screen.getByText('Keep editing'));
  fireEvent.keyDown(document,{key:'Escape'});
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByText('Discard unsaved changes?')).toBeTruthy();
  fireEvent.click(screen.getByText('Keep editing'));
  fireEvent.click(screen.getByRole('dialog').parentElement);
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Discard changes'));
  expect(close).toHaveBeenCalledOnce();
});
it('allows a reverted field to close and ignores search/filter controls', () => {
  const close=vi.fn();
  render(<Modal isOpen onClose={close} title="Search records"><input aria-label="Search" placeholder="Search records" /><input aria-label="Name" defaultValue="Original" /></Modal>);
  fireEvent.input(screen.getByLabelText('Search'),{target:{value:'query'}});
  fireEvent.input(screen.getByLabelText('Name'),{target:{value:'Changed'}});
  fireEvent.input(screen.getByLabelText('Name'),{target:{value:'Original'}});
  fireEvent.click(screen.getByLabelText('Close dialog'));
  expect(close).toHaveBeenCalledOnce();
  expect(screen.queryByText('Discard unsaved changes?')).toBeNull();
});
it('blocks dismissal while a submission is pending', () => {
  const close=vi.fn();
  render(<Modal isOpen busy onClose={close} title="Saving" footer={<button data-modal-dismiss onClick={close}>Cancel</button>}>Content</Modal>);
  fireEvent.click(screen.getByRole('dialog').parentElement);
  fireEvent.click(screen.getByText('Cancel'));
  fireEvent.keyDown(document,{key:'Escape'});
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Close dialog').disabled).toBe(true);
});
it('cannot discard through an already-open warning once saving starts', () => {
  const close=vi.fn();
  const view=render(<Modal isOpen title="Edit" onClose={close}><input aria-label="Name" defaultValue="Before" /></Modal>);
  fireEvent.input(screen.getByLabelText('Name'),{target:{value:'After'}});
  fireEvent.click(screen.getByLabelText('Close dialog'));
  view.rerender(<Modal isOpen busy title="Edit" onClose={close}><input aria-label="Name" defaultValue="Before" /></Modal>);
  expect(screen.getByText('Discard changes').disabled).toBe(true);
  fireEvent.click(screen.getByText('Discard changes'));
  expect(close).not.toHaveBeenCalled();
});
