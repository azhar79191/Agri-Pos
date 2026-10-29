import { useEffect, useState } from 'react';
import API from '../api/axios';
import Select from './ui/Select';
export default function RecordReference({ model, label, value, onChange, required = true, disabled = false }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => API.get(`/dealer-records/lookup/${model}`, { params: { search } }).then(r => { if (active) { setItems(r.data.data.items); setError(''); } }).catch(() => { if (active) setError('Search unavailable. Check access and try another search.'); }).finally(() => { if (active) setLoading(false); }), 250);
    return () => { active = false; clearTimeout(timer); };
  }, [model, search]);
  const options = selected && !items.some(item => item.id === selected.id) ? [selected, ...items] : items;
  return <Select label={label} aria-label={label} required={required} disabled={disabled} loading={loading} error={error} value={value || ''} placeholder={`Select ${label}`} onSearchChange={setSearch} options={options.map(item => ({ value: item.id, label: item.label }))} onChange={event => { setSelected(options.find(item => item.id === event.target.value)); onChange(event.target.value); }} />;
}
