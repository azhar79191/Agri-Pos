import LoadingState from "../components/ui/LoadingState";
import { useEffect, useState } from 'react';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
import PendingInventoryOperations from '../components/PendingInventoryOperations';
import RecordReference from '../components/RecordReference';
import PackWorkspace from '../components/PackWorkspace';
import CustomerOrders from '../components/CustomerOrders';
import DealerNetwork from '../components/DealerNetwork';
const input = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
const guidance = {
  visits: 'Assign visits and record field notes. Use customer orders below to capture demand; collections must be posted through the customer account to generate a ledger receipt.',
  substitutions: 'Record label-based alternatives for human review. Matching ingredients alone does not establish equivalent use, concentration, crop suitability or dosage.',
  'soil-tests': 'Record laboratory results with the stated units. Manager review records a human assessment; the software does not generate a fertilizer prescription.',
  complaints: 'Keep farmer-reported, staff-observed and expert-verified outcomes distinct. Evidence references may include photo/report links. Do not attribute yield changes without supporting evidence.',
  'supplier-offers': 'Compare offers for the SAME product and base unit. Costs include goods tax after discount and untaxed freight. Payment terms and supplier eligibility require separate review.',
};
export default function DealerWorkspace() {
  const [schemas, setSchemas] = useState({});
  const [kind, setKind] = useState('');
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  useEffect(() => {
    let active = true;
    API.get('/dealer-records/schemas').then(r => { if (active) { setSchemas(r.data.data.schemas); setKind(Object.keys(r.data.data.schemas)[0] || ''); } }).catch(() => { if (active) setError('Workspace configuration could not be loaded. Reload the page to retry.'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    if (kind) API.get(`/dealer-records/${kind}`, { params: { page } }).then(r => { if (active) setData(r.data.data); }).catch(e => { if (active) setError(e.response?.data?.message || 'Records unavailable'); });
    return () => { active = false; };
  }, [kind, page, reload]);
  const schema = schemas[kind];
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const fields = Object.fromEntries(Object.entries(schema.fields).filter(([key]) => form[key] !== '' && form[key] != null).map(([key, rule]) => [key, ['number', 'integer'].includes(rule.type) ? Number(form[key]) : form[key]]));
    try {
      await financialCommand('post', `/dealer-records/${kind}`, { fields }, { idField: 'clientOperationId', label: schema.title });
      setForm({}); setPage(1); setReload(value => value + 1); setMessage('Record saved.');
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  const review = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await financialCommand('patch', `/dealer-records/${kind}/${editing._id}`, { status: editing.status, version: editing.version, reviewNotes: editing.reviewNotes }, { idField: 'clientOperationId', label: 'record review' });
      setEditing(null); setReload(value => value + 1);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  return <main className="space-y-5 text-slate-900 dark:text-white"><header className="workspace-hero p-5"><h1 className="text-2xl font-bold">Dealer workspace</h1><p className="mt-2 text-sm">Field service, reviewed records, purchasing decisions and customer orders.</p></header>
    <PackWorkspace /><CustomerOrders /><DealerNetwork />
    <PendingInventoryOperations pathPrefix="/dealer-records" onRecovered={() => setReload(value => value + 1)} />
    <div className="flex flex-wrap gap-2">{Object.entries(schemas).map(([key, value]) => <button type="button" disabled={busy} aria-pressed={kind === key} key={key} onClick={() => { setKind(key); setPage(1); setForm({}); setEditing(null); setMessage(''); }} className={`min-h-11 rounded-lg border px-4 ${kind === key ? 'bg-emerald-700 text-white' : ''}`}>{value.title}</button>)}</div>
    {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status">{message}</p>}
    {schema && <><h2 className="text-xl font-semibold">{schema.title}</h2><p className="text-sm">{guidance[kind]}</p><button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setReload(value => value + 1)}>Reload records</button>
      <div className="grid gap-5 xl:grid-cols-2"><section className="space-y-3" aria-label="Saved records">
        {!data ? <div>{error ? <p role="alert">{'Records unavailable.'}</p> : <LoadingState label="Loading records" />}</div> : <>{data.items.length === 0 && <p>No records yet.</p>}{data.items.map(item => <article key={item._id} className="space-y-2 rounded-xl border p-4"><h3 className="font-semibold">{item.fields.title} · {item.status}</h3><dl className="space-y-2 text-sm">{Object.entries(item.fields).filter(([key]) => key !== 'title').map(([key, value]) => <div key={key}><dt className="font-semibold">{schema.fields[key]?.label || key}</dt><dd className="whitespace-pre-wrap break-words">{schema.fields[key]?.type === 'reference' ? item.labels?.[key] || 'Linked record' : String(value)}</dd></div>)}</dl>
          {item.comparison && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-slate-900">Landed total: {item.comparison.total.toLocaleString()} · Base units: {item.comparison.baseUnits.toLocaleString()} · Cost per base unit: {item.comparison.costPerBaseUnit.toFixed(4)}. {item.comparison.assumption}</p>}
          {item.fields.customer && <a className="block min-h-11 py-3 underline" href={`/customers/${item.fields.customer}/statement`}>Customer statement and collection history</a>}
          {item.reviewNotes && <p className="whitespace-pre-wrap text-sm">Latest review: {item.reviewNotes} · {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : ''}</p>}
          {schema.canEdit && <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setEditing({ ...item, reviewNotes: '' })}>Update status or review</button>}
          {editing?._id === item._id && <form onSubmit={review} className="space-y-3"><label className="block text-sm">Status<select aria-label="Record status" disabled={busy} className={input} value={editing.status} onChange={e => setEditing(current => ({ ...current, status: e.target.value }))}>{schema.states.filter(status => status !== 'reviewed' || schema.canReview).map(status => <option key={status}>{status}</option>)}</select></label><label className="block text-sm">Review / resolution notes<textarea required maxLength={2000} disabled={busy} className={input} value={editing.reviewNotes} onChange={e => setEditing(current => ({ ...current, reviewNotes: e.target.value }))} /></label><button disabled={busy} className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">Save review</button></form>}
        </article>)}<div className="flex items-center justify-between gap-3"><button type="button" disabled={busy || page <= 1} className="min-h-11 border px-4" onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, data.pagination.pages)}</span><button type="button" disabled={busy || page >= data.pagination.pages} className="min-h-11 border px-4" onClick={() => setPage(value => value + 1)}>Next</button></div></>}
      </section>{schema.canEdit && <form onSubmit={save} className="h-fit rounded-xl border p-4"><h3 className="mb-3 font-semibold">Add {schema.title.toLowerCase()} record</h3><fieldset disabled={busy} className="space-y-3">{Object.entries(schema.fields).map(([key, rule]) => rule.type === 'reference' ? <RecordReference key={key} model={rule.model} label={rule.label} value={form[key]} onChange={value => update(key, value)} required={rule.required} disabled={busy} /> : <label key={key} className="block text-sm">{rule.label}{rule.type === 'textarea' ? <textarea className={input} required={rule.required} maxLength={2000} value={form[key] || ''} onChange={e => update(key, e.target.value)} /> : rule.type === 'select' ? <select aria-label={rule.label} className={input} required={rule.required} value={form[key] || ''} onChange={e => update(key, e.target.value)}><option value="">Select</option>{rule.options.map(value => <option key={value}>{value}</option>)}</select> : <input className={input} required={rule.required} type={['number', 'integer'].includes(rule.type) ? 'number' : rule.type === 'date' ? 'date' : 'text'} min={rule.min} max={rule.max} step={rule.type === 'integer' ? 1 : rule.type === 'number' ? 'any' : undefined} maxLength={300} value={form[key] ?? ''} onChange={e => update(key, e.target.value)} />}</label>)}<button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">{busy ? 'Saving…' : 'Save record'}</button></fieldset></form>}</div>
    </>}
  </main>;
}
