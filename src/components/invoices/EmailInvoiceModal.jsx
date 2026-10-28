import { useState } from 'react';
import { Mail } from 'lucide-react';
import API from '../../api/axios';
import ModernModal from '../ui/ModernModal';
import Button from '../ui/Button';
export default function EmailInvoiceModal({ invoice, onClose }) {
  const [email, setEmail] = useState(invoice.customer?.email || invoice.customerEmail || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const send = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try { await API.post(`/invoices/${invoice._id || invoice.id}/email`, { email }); setSent(true); }
    catch (e) { setError(e.response?.data?.message || 'Unable to confirm email delivery. Check before retrying.'); }
    finally { setBusy(false); }
  };
  return <ModernModal isOpen onClose={() => { if (!busy) onClose(); }} title="Email receipt" icon={Mail}>
    {sent ? <div className="space-y-4"><p role="status" className="text-sm">Receipt accepted by the email provider for {email}. Inbox delivery may take a moment.</p><Button onClick={onClose}>Done</Button></div> : <form onSubmit={send} className="space-y-4">
      <p className="text-sm text-slate-500">Invoice #{invoice.invoiceNumber}</p>
      <label className="block text-sm font-medium">Recipient email<input type="email" required maxLength={200} autoFocus value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-3" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Send receipt</Button></div>
    </form>}
  </ModernModal>;
}
