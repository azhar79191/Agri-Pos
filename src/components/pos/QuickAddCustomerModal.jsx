import React from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function QuickAddCustomerModal({ form, onChange, onSubmit, onClose, loading }) {
  return <Modal isOpen busy={loading} onClose={onClose} title="Quick Add Customer" size="xs" icon={UserPlus}
    footer={<div className="flex justify-end gap-3">
      <Button variant="secondary" data-modal-dismiss onClick={onClose}>Cancel</Button>
      <Button type="submit" form="pos-quick-customer" disabled={loading}>{loading ? 'Adding...' : 'Add & Select'}</Button>
    </div>}>
    <form id="pos-quick-customer" className="space-y-4" onSubmit={event => { event.preventDefault(); if (!loading) onSubmit(); }}>
      <Input label="Customer name" name="name" autoComplete="name" required autoFocus value={form.name} onChange={event => onChange('name', event.target.value)} />
      <Input label="Phone number" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={event => onChange('phone', event.target.value)} />
      <Input label="Address (optional)" name="address" autoComplete="street-address" value={form.address} onChange={event => onChange('address', event.target.value)} />
    </form>
  </Modal>;
}
