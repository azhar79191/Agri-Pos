import { useEffect, useState } from 'react';
import API from '../api/axios';
export default function RecordReference({ model, label, value, onChange, required = true, disabled = false }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => API.get(`/dealer-records/lookup/${model}`, { params: { search } }).then(r => { if (active) { setItems(r.data.data.items); setError(''); } }).catch(() => { if (active) setError('Search unavailable. Check access and try another search.'); }), 250);
    return () => { active = false; clearTimeout(timer); };
  }, [model, search]);
  const cls = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
  return <div className="space-y-1"><label className="block text-sm">Search {label}<input disabled={disabled} type="search" className={cls} value={search} onChange={e => { setSearch(e.target.value); onChange(''); }} /></label><label className="block text-sm">{label}<select aria-label={label} required={required} disabled={disabled} className={cls} value={value || ''} onChange={e => onChange(e.target.value)}><option value="">Select {label}</option>{items.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}</div>;
}
