import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { financialCommand } from '../../api/financialCommand';
const input = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
const empty = { kind: 'damage', title: '', amount: '', notes: '', startsOn: '', endsOn: '', target: '' };
export default function SupplierClaims({ suppliers, currency, onRecorded }) {
  const [supplierId, setSupplierId] = useState('');
  const [data, setData] = useState(null);
  const [form, setForm] = useState(empty);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [responses, setResponses] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const path = `/suppliers/${supplierId}/claims`;
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    if (supplierId) API.get(path, { params: { page } }).then(r => { if (active) setData(r.data.data); }).catch(e => { if (active) setError(e.response?.data?.message || 'Claims unavailable'); });
    return () => { active = false; };
  }, [supplierId, path, page, reload]);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await financialCommand('post', path, { kind: form.kind, title: form.title, amount: Number(form.amount), notes: form.notes, ...(form.kind === 'scheme' ? { startsOn: form.startsOn, endsOn: form.endsOn, target: Number(form.target) } : {}) }, { idField: 'clientOperationId', label: 'supplier claim' });
      setForm(empty); setPage(1); setReload(value => value + 1); setMessage('Claim opened. No supplier credit has been posted.');
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  const resolve = async (item, status) => {
    if (status === 'credited' && !window.confirm(`Post supplier credit of ${currency} ${item.amount}? Confirm that the supplier has issued this credit. It will reduce the amount owed or create a supplier credit balance.`)) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await financialCommand('post', `${path}/${item._id}/resolve`, { status, response: responses[item._id] || '' }, { idField: 'clientOperationId', label: 'supplier claim resolution' });
      setReload(value => value + 1); setMessage(status === 'credited' ? 'Supplier credit posted to the ledger.' : 'Claim rejected. No credit posted.');
      await onRecorded?.();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  return <details className="rounded-xl border p-4 text-slate-900 dark:text-white"><summary className="min-h-11 cursor-pointer font-semibold">Supplier claims and schemes</summary>
    <p className="my-3 text-sm">Track damage, expiry, rebates and promotional schemes. Posting a credit requires a supplier response or credit-note reference and updates the supplier ledger. Claims do not move stock. Use stock adjustments for write-offs. For goods sent back with a credit, use Purchase Returns instead; approving both would credit the supplier twice.</p>
    <label className="block text-sm">Supplier from current search page<select disabled={busy} className={input} value={supplierId} onChange={e => { setSupplierId(e.target.value); setPage(1); setForm(empty); setResponses({}); setMessage(''); }}><option value="">Select supplier</option>{suppliers.map(supplier => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}</select></label>
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}{message && <p role="status">{message}</p>}
    {supplierId && <><button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setReload(value => value + 1)}>Reload claims</button>
      <form onSubmit={save}><fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Claim type<select className={input} value={form.kind} onChange={e => set('kind', e.target.value)}>{['damage', 'expiry', 'rebate', 'scheme'].map(kind => <option key={kind}>{kind}</option>)}</select></label>
        <label className="text-sm">Claim title<input required maxLength={150} className={input} value={form.title} onChange={e => set('title', e.target.value)} /></label>
        <label className="text-sm">Expected credit ({currency})<input required min="0.01" max="100000000" step="0.01" type="number" className={input} value={form.amount} onChange={e => set('amount', e.target.value)} /></label>
        <label className="text-sm">Claim details<textarea maxLength={1000} className={input} value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
        {form.kind === 'scheme' && <><label className="text-sm">Scheme start (UTC)<input required type="date" className={input} value={form.startsOn} onChange={e => set('startsOn', e.target.value)} /></label><label className="text-sm">Scheme end (UTC)<input required type="date" min={form.startsOn} className={input} value={form.endsOn} onChange={e => set('endsOn', e.target.value)} /></label><label className="text-sm">Purchase-value target ({currency})<input required type="number" min="0.01" max="100000000" step="0.01" className={input} value={form.target} onChange={e => set('target', e.target.value)} /></label></>}
        <button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">Open claim</button>
      </fieldset></form>
      {!data ? <p className="py-3">{error ? 'Claims unavailable.' : 'Loading claims…'}</p> : <>
        {!data.items.length && <p className="py-3">No claims recorded.</p>}{data.items.map(item => <article key={item._id} className="mt-4 space-y-2 rounded-lg border p-4"><h3 className="font-semibold">{item.title} · {item.kind} · {item.status}</h3><p className="text-sm">Expected credit: {currency} {item.amount.toLocaleString()}</p><p className="whitespace-pre-wrap text-sm">{item.notes}</p>
          {item.kind === 'scheme' && <p className="text-sm">Recorded goods-receipt value: {currency} {item.recordedReceiptValue.toLocaleString()} / Target: {currency} {item.target.toLocaleString()} ({item.startsOn} to {item.endsOn}, UTC). Gross receipts only; returns, product exclusions and supplier eligibility rules require review. Target progress does not authorize credit.</p>}
          {item.status === 'open' ? <><label className="block text-sm">Supplier response / credit-note reference<textarea disabled={busy} minLength={8} maxLength={1000} className={input} value={responses[item._id] || ''} onChange={e => setResponses(current => ({ ...current, [item._id]: e.target.value }))} /></label><div className="flex flex-wrap gap-3"><button type="button" disabled={busy || (responses[item._id] || '').trim().length < 8} className="min-h-11 rounded-lg border px-4" onClick={() => resolve(item, 'credited')}>Post supplier credit</button><button type="button" disabled={busy || (responses[item._id] || '').trim().length < 8} className="min-h-11 underline" onClick={() => resolve(item, 'rejected')}>Reject claim</button></div></> : <p className="text-sm">Supplier response: {item.response}</p>}
        </article>)}
        <div className="mt-3 flex items-center justify-between gap-3"><button type="button" disabled={busy || page <= 1} className="min-h-11 border px-4" onClick={() => setPage(value => value - 1)}>Previous claims</button><span>Page {page} of {Math.max(1, data.pagination.pages)}</span><button type="button" disabled={busy || page >= data.pagination.pages} className="min-h-11 border px-4" onClick={() => setPage(value => value + 1)}>Next claims</button></div>
      </>}
    </>}
  </details>;
}
