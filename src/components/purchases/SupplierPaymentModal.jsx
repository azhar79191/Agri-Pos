import SearchableSelect from "../ui/Select";
import { useState } from 'react';
import ModernModal from '../ui/ModernModal';
import { recordSupplierPayment } from '../../api/suppliersApi';
import { formatCurrency } from '../../utils/helpers';

export default function SupplierPaymentModal({ supplier, currency, onClose, onRecorded }) {
  const payable = Math.max(0, (supplier.outstanding || 0) - (supplier.creditBalance || 0));
  const [amount, setAmount] = useState(String(payable));
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const submit = async event => {
    event.preventDefault();
    setSaving(true); setError(null);
    try {
      await recordSupplierPayment(supplier._id, { amount: Number(amount), method, notes });
      onRecorded(); onClose();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Payment could not be confirmed'); }
    finally { setSaving(false); }
  };
  return <ModernModal isOpen onClose={onClose} title={`Record payment - ${supplier.name}`} size="md">
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm">Net amount owed: <strong>{formatCurrency(payable, currency)}</strong></p>
      <p className="text-sm text-slate-500">Record money you have paid. This action does not initiate a bank transfer.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <label className="block text-sm font-medium">Amount
        <input type="number" min="0.01" max={payable} step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border bg-transparent px-3" />
      </label>
      <label className="block text-sm font-medium">Payment method
        <SearchableSelect value={method} onChange={event => setMethod(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 dark:bg-slate-900">
          {['Cash', 'Bank Transfer', 'Cheque', 'Other'].map(value => <option key={value}>{value}</option>)}
        </SearchableSelect>
      </label>
      <label className="block text-sm font-medium">Reference or notes
        <textarea maxLength={1000} value={notes} onChange={event => setNotes(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border bg-transparent p-3" />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="min-h-11 rounded-lg border px-4">Close</button>
        <button type="submit" disabled={saving || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || Number(amount) > payable} className="min-h-11 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:opacity-50">{saving ? 'Recording...' : 'Record payment'}</button>
      </div>
    </form>
  </ModernModal>;
}
