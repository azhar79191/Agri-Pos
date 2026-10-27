import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { financialCommand } from '../../api/financialCommand';
const input = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
const labels = { unverified: 'Unverified', manufacturer_confirmed: 'Manufacturer confirmation recorded by staff', suspicious: 'Suspicious — staff reported' };
export default function ProductAuthenticity({ products, canEdit }) {
  const [productId, setProductId] = useState('');
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ code: '', batchNo: '', outcome: 'unverified', evidence: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [saved, setSaved] = useState(false);
  const path = `/products/${productId}/authenticity`;
  useEffect(() => {
    let active = true;
    setData(null); setError(''); setSaved(false); setForm({ code: '', batchNo: '', outcome: 'unverified', evidence: '' });
    if (productId) API.get(path).then(r => { if (active) setData(r.data.data); }).catch(e => { if (active) setError(e.response?.data?.message || 'Checks could not be loaded'); });
    return () => { active = false; };
  }, [productId, path, reload]);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const response = await financialCommand('post', path, form, { idField: 'clientOperationId', label: 'manufacturer authenticity check' });
      setData(current => ({ ...current, checks: [response.data.data.item, ...current.checks.filter(item => item._id !== response.data.data.item._id)].slice(0, 20) }));
      setSaved(true); setForm({ code: '', batchNo: '', outcome: 'unverified', evidence: '' });
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  return <details className="rounded-xl border p-4 text-slate-900 dark:text-white"><summary className="min-h-11 cursor-pointer font-semibold">Manufacturer authenticity checks</summary>
    <p className="my-3 text-sm">Use the manufacturers added in company brands. Scan or enter the package code, contact the manufacturer, and record their response. Automatic manufacturer verification is not connected.</p>
    <label className="block text-sm">Product from current search page<select disabled={busy} className={input} value={productId} onChange={e => setProductId(e.target.value)}><option value="">Select a product</option>{products.map(product => <option key={product._id} value={product._id}>{product.name} · {product.manufacturer || 'No manufacturer'}</option>)}</select></label>
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}{saved && <p role="status">Check recorded.</p>}
    {productId && <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setReload(value => value + 1)}>Reload checks</button>}
    {data && <><p className="my-3 text-sm">Manufacturer: {data.manufacturer || 'Not set'} · {data.registered ? 'Registered in company brands' : 'Add this manufacturer in company brands to record checks'}</p>
      {canEdit && data.registered && <form onSubmit={save}><fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Package verification code<input required maxLength={200} className={input} value={form.code} onChange={e => set('code', e.target.value)} /></label>
        <label className="text-sm">Batch number (optional)<input maxLength={100} className={input} value={form.batchNo} onChange={e => set('batchNo', e.target.value)} /></label>
        <label className="text-sm">Recorded outcome<select className={input} value={form.outcome} onChange={e => set('outcome', e.target.value)}>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-sm">Evidence or manufacturer response<textarea required={form.outcome !== 'unverified'} minLength={form.outcome !== 'unverified' ? 8 : undefined} maxLength={1000} className={input} value={form.evidence} onChange={e => set('evidence', e.target.value)} /></label>
        <button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">{busy ? 'Recording…' : 'Record manual check'}</button>
      </fieldset></form>}
      <h3 className="mt-4 font-semibold">Latest 20 checks</h3>{!data.checks.length && <p className="py-3 text-sm">No checks recorded. Authenticity is unverified.</p>}{data.checks.map(item => <article key={item._id} className="mt-3 space-y-1 rounded-lg border p-3 text-sm"><p className="font-semibold">{labels[item.outcome]}</p><p className="break-all">Code: {item.code} · Batch: {item.batchNo || 'Not recorded'}</p><p>{item.manufacturer} · {item.checkedByName} · {new Date(item.createdAt).toLocaleString()}</p><p className="whitespace-pre-wrap">{item.evidence}</p></article>)}
    </>}
  </details>;
}
