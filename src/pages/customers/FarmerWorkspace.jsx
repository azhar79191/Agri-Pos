import { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import { financialCommand } from '../../api/financialCommand';
import { useApp } from '../../context/AppContext';
import PendingInventoryOperations from '../../components/PendingInventoryOperations';

const initial = { customer: '', crop: '', season: '', village: '', area: '', areaUnit: 'acre', sowingDate: '', language: 'Urdu', consent: false, title: '', kind: 'crop_visit', dueDate: '', notes: '' };
const control = 'mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';

export default function FarmerWorkspace() {
  const { actions } = useApp();
  const requestVersion = useRef(0);
  const [editingTask, setEditingTask] = useState(null);
  const [tab, setTab] = useState('seasons');
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initial);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('open');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const canEdit = actions.hasPermission('customers:edit');
  const refresh = async () => {
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    try {
      const response = await API.get(`/farmer-workspace/${tab}`, { params: { page, limit: 12, ...(tab === 'tasks' ? { status } : {}) } });
      if (version !== requestVersion.current) return;
      setItems(response.data.data.items); setPages(response.data.data.pagination.pages);
    } catch (e) { if (version === requestVersion.current) setError(e.response?.data?.message || e.message); }
    finally { if (version === requestVersion.current) setLoading(false); }
  };
  useEffect(() => { refresh(); }, [tab, page, status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      API.get('/customers', { params: { search, limit: 20, page: 1 } }).then(response => {
        if (active) setCustomers(response.data.data.customers || []);
      }).catch(e => { if (active) setError(e.response?.data?.message || 'Customer search failed'); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const payload = tab === 'seasons'
      ? { customer: form.customer, crop: form.crop, season: form.season, village: form.village, area: Number(form.area), areaUnit: form.areaUnit, sowingDate: form.sowingDate, language: form.language, consent: form.consent }
      : { customer: form.customer, title: form.title, kind: form.kind, dueDate: form.dueDate, notes: form.notes };
    try {
      await financialCommand('post', `/farmer-workspace/${tab}`, payload, { idField: 'clientOperationId', label: tab === 'seasons' ? 'crop season' : 'follow-up' });
      setForm(initial); setMessage('Saved successfully.'); await refresh();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  const complete = async (item, changes = {}) => {
    setBusy(true); setError('');
    try {
      await financialCommand('patch', `/farmer-workspace/tasks/${item._id}`, { status: item.status === 'open' ? 'completed' : 'open', dueDate: item.dueDate, notes: item.notes || '', ...changes }, { idField: 'clientOperationId', label: 'follow-up status' });
      setEditingTask(null); await refresh();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  const field = (key, label, type = 'text', extra = {}) => <label className="block text-sm font-medium">{label}<input className={control} type={type} value={form[key]} onChange={e => set(key, e.target.value)} required {...extra} /></label>;
  return <div className="space-y-5 text-slate-900 dark:text-white">
    <header className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Farmer relationships</p><h1 className="mt-2 text-2xl font-bold">Farmer workspace</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Keep crop seasons and follow-ups connected to the customer account. Contact is manual; no messages are sent.</p></header>
    <div className="flex flex-wrap gap-2" aria-label="Workspace views">{[['seasons', 'Crop seasons'], ['tasks', 'Follow-up inbox']].map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} disabled={busy || loading} onClick={() => { setTab(key); setPage(1); setItems([]); setEditingTask(null); }} className={`min-h-11 rounded-lg px-4 font-semibold ${tab === key ? 'bg-emerald-700 text-white' : 'border border-slate-300'}`}>{label}</button>)}</div>
    <PendingInventoryOperations pathPrefix="/farmer-workspace" onRecovered={async () => { setForm(initial); await refresh(); }} />
    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
    {message && <p role="status">{message}</p>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
      <section aria-label={tab === 'seasons' ? 'Saved crop seasons' : 'Follow-up tasks'} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{tab === 'seasons' ? 'Crop-season records' : 'Follow-up inbox'}</h2><button type="button" disabled={loading} onClick={refresh} className="min-h-11 rounded-lg border px-4">Refresh</button></div>
        {tab === 'tasks' && <label className="block text-sm">Task status<select aria-label="Task status" className={control} disabled={loading} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="open">Open</option><option value="completed">Completed</option></select></label>}
        {loading ? <p role="status">Loading records…</p> : items.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6">{error ? 'Records unavailable. Try refreshing.' : 'No records in this view yet.'}</p> : items.map(item => <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><p className="text-sm text-emerald-700 dark:text-emerald-400">{item.customer?.name || 'Customer unavailable'}</p><h3 className="mt-1 font-semibold">{tab === 'seasons' ? `${item.crop} · ${item.season}` : item.title}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tab === 'seasons' ? `${item.area} ${item.areaUnit} · Sown ${item.sowingDate} · ${item.language}` : `${item.kind.replace('_', ' ')} · Due ${item.dueDate} · ${item.status}`}</p>{tab === 'seasons' && item.village && <p className="mt-1 text-sm">{item.village}</p>}{tab === 'tasks' && <><p className="mt-2 whitespace-pre-wrap text-sm">{item.notes}</p>{canEdit && <button type="button" disabled={busy} onClick={() => complete(item)} className="mt-3 min-h-11 rounded-lg border border-emerald-600 px-4 text-sm font-semibold">{item.status === 'open' ? 'Mark completed' : 'Reopen task'}</button>}</>}{tab === 'tasks' && canEdit && <button type="button" disabled={busy} onClick={() => setEditingTask({ ...item })} className="ml-2 min-h-11 px-3 text-sm underline">Edit or reschedule</button>}{item.customer?._id && <a href={`/customers/${item.customer._id}/statement`} className="mt-3 block min-h-11 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">View customer statement</a>}{editingTask?._id === item._id && <form className="mt-3 space-y-3 border-t pt-3" onSubmit={event => { event.preventDefault(); complete(item, { status: item.status, dueDate: editingTask.dueDate, notes: editingTask.notes }); }}><label className="block text-sm">Rescheduled due date<input required type="date" className={control} value={editingTask.dueDate} onChange={event => setEditingTask(current => ({ ...current, dueDate: event.target.value }))} /></label><label className="block text-sm">Contact notes<textarea maxLength={1000} className={control} value={editingTask.notes} onChange={event => setEditingTask(current => ({ ...current, notes: event.target.value }))} /></label><button disabled={busy} className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">Save follow-up</button><button type="button" onClick={() => setEditingTask(null)} className="ml-2 min-h-11 px-3">Cancel</button></form>}</article>)}
        <div className="flex items-center justify-between gap-3"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Previous</button><span className="text-sm">Page {page} of {Math.max(1, pages)}</span><button type="button" disabled={page >= pages || loading} onClick={() => setPage(p => p + 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Next</button></div>
      </section>
      {canEdit && <form onSubmit={save} className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="text-lg font-semibold">{tab === 'seasons' ? 'Add crop season' : 'Add follow-up'}</h2><label className="block text-sm font-medium">Find customer<input type="search" className={control} value={search} onChange={e => { setSearch(e.target.value); set('customer', ''); }} placeholder="Search by name or phone" /></label><label className="block text-sm font-medium">Customer<select aria-label="Customer" required className={control} value={form.customer} onChange={e => set('customer', e.target.value)}><option value="">Select a customer</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>)}</select></label>
        {tab === 'seasons' ? <>{field('crop', 'Crop', 'text', { maxLength: 100 })}{field('season', 'Season name', 'text', { maxLength: 100, placeholder: 'e.g. Rabi 2026–27' })}{field('area', 'Cultivated area', 'number', { min: 0.01, max: 1000000, step: 0.01 })}<label className="block text-sm">Area unit<select aria-label="Area unit" className={control} value={form.areaUnit} onChange={e => set('areaUnit', e.target.value)}><option value="acre">Acres</option><option value="hectare">Hectares</option></select></label>{field('sowingDate', 'Sowing date', 'date')}{field('village', 'Village (optional)', 'text', { required: false, maxLength: 150 })}<label className="block text-sm">Preferred language<select aria-label="Preferred language" className={control} value={form.language} onChange={e => set('language', e.target.value)}>{['Urdu', 'English', 'Punjabi'].map(language => <option key={language}>{language}</option>)}</select></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-1 h-5 w-5" />The farmer agreed to recording these crop details. This does not authorize marketing messages.</label></> : <>{field('title', 'Follow-up title', 'text', { maxLength: 150 })}<label className="block text-sm">Task type<select aria-label="Task type" className={control} value={form.kind} onChange={e => set('kind', e.target.value)}><option value="crop_visit">Crop visit</option><option value="collection">Collection</option><option value="reorder">Reorder</option></select></label>{field('dueDate', 'Due date', 'date')}<label className="block text-sm">Notes<textarea className={control} rows={3} maxLength={1000} value={form.notes} onChange={e => set('notes', e.target.value)} /></label></>}
        <button disabled={busy} className="min-h-11 w-full rounded-lg bg-emerald-700 px-4 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : tab === 'seasons' ? 'Save crop season' : 'Create follow-up'}</button>
      </form>}
    </div>
  </div>;
}
