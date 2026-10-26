import { useEffect, useState } from 'react';
import ModernModal from '../ui/ModernModal';
import { getSupplierLedger } from '../../api/suppliersApi';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function SupplierLedgerModal({ supplier, currency, onClose }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ entries: [], pagination: { pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    getSupplierLedger(supplier._id, { page, limit: 20 }).then(response => {
      if (active) setData(response.data.data);
    }).catch(err => { if (active) setError(err.response?.data?.message || 'Supplier movements could not be loaded'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [supplier._id, page, attempt]);
  return <ModernModal isOpen onClose={onClose} title={`${supplier.name} - balance movements`} size="xl">
    <p className="mb-4 text-sm text-slate-500">Older purchases may not appear in this history. Reconcile these movements against the current supplier balances.</p>
    {error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 underline">Retry history</button></div>
      : loading ? <p role="status">Loading movements...</p> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr>{['Date', 'Reference', 'Movement', 'Value', 'Outstanding after', 'Credit after'].map(label => <th key={label} className="whitespace-nowrap border-b p-3">{label}</th>)}</tr></thead>
          <tbody>{data.entries.map(entry => <tr key={entry._id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="whitespace-nowrap p-3">{formatDate(entry.createdAt)}</td><td className="p-3 font-mono text-xs">{entry.reference}</td>
            <td className="p-3">{entry.kind === 'receipt' ? 'Goods received' : entry.kind === 'payment' ? `Payment (${entry.method})` : 'Supplier return'}</td>
            <td className="whitespace-nowrap p-3">{formatCurrency(entry.value, currency)}</td>
            <td className="whitespace-nowrap p-3">{formatCurrency(entry.outstandingAfter, currency)}</td>
            <td className="whitespace-nowrap p-3">{formatCurrency(entry.creditAfter, currency)}</td>
          </tr>)}</tbody>
        </table></div>
        {!data.entries.length && <p className="py-6 text-center text-sm text-slate-500">No recorded movements yet.</p>}
        <nav aria-label="Supplier history pages" className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Previous</button>
          <span>Page {page} of {Math.max(1, data.pagination.pages)}</span>
          <button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage(value => value + 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Next</button>
        </nav>
      </>}
  </ModernModal>;
}
