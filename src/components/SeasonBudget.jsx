import { useEffect, useState } from 'react';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
import HarvestSchedule from './HarvestSchedule';

const input = 'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
export default function SeasonBudget({ season, canEdit, currency }) {
  const [data, setData] = useState(null);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [saved, setSaved] = useState(false);
  const path = `/farmer-workspace/seasons/${season._id}/budget`;
  useEffect(() => {
    let active = true;
    setData(null); setError(''); setSaved(false);
    API.get(path).then(response => {
      if (!active) return;
      setData(response.data.data); setLines(response.data.data.lines);
    }).catch(e => { if (active) setError(e.response?.data?.message || 'Budget could not be loaded'); });
    return () => { active = false; };
  }, [path, reload]);
  const update = (index, key, value) => {
    setSaved(false);
    setLines(current => current.map((line, i) => i === index ? { ...line, [key]: value } : line));
  };
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const response = await financialCommand('put', path, {
        version: data.version,
        lines: lines.map(line => ({ label: line.label, basis: line.basis, planned: Number(line.planned), actual: Number(line.actual) })),
      }, { idField: 'clientOperationId', label: 'season budget' });
      setData(response.data.data); setLines(response.data.data.lines); setSaved(true);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setBusy(false); }
  };
  const fmt = value => `${currency || ''} ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return <section aria-label="Crop budget" className="mt-4 space-y-3 border-t pt-4">
    <h4 className="font-semibold">Crop budget</h4>
    <p className="text-sm">Plan costs for {season.area} {season.areaUnit}. Actual costs are manually recorded totals for this season; they are not automatically calculated from invoices.</p>
    {error && <p role="alert" className="text-red-700 dark:text-red-400">{error}</p>}
    <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setReload(value => value + 1)}>Reload saved budget</button>
    {!data ? <p role="status">{error ? 'Budget unavailable.' : 'Loading budget…'}</p> : <>
      <p className="text-sm">Saved plan: {fmt(data.planned)} · Recorded actual: {fmt(data.actual)} · Remaining: {fmt(data.remaining)}</p>
      {saved && <p role="status">Budget saved.</p>}
      <form onSubmit={save} className="space-y-3">
        {lines.length === 0 && <p className="text-sm">No budget lines recorded.</p>}
        <fieldset disabled={!canEdit || busy} className="space-y-3">
          {lines.map((line, index) => <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
            <label className="text-sm">Cost item<input required maxLength={100} className={input} value={line.label} onChange={e => update(index, 'label', e.target.value)} /></label>
            <label className="text-sm">Estimate basis<select className={input} value={line.basis} onChange={e => update(index, 'basis', e.target.value)}><option value="total">Whole season</option><option value="per_area">Per {season.areaUnit}</option></select></label>
            <label className="text-sm">Planned cost ({currency})<input required type="number" min="0" max="100000000" step="0.01" className={input} value={line.planned} onChange={e => update(index, 'planned', e.target.value)} /></label>
            <label className="text-sm">Actual season cost ({currency})<input required type="number" min="0" max="100000000" step="0.01" className={input} value={line.actual} onChange={e => update(index, 'actual', e.target.value)} /></label>
            {canEdit && <button type="button" className="min-h-11 text-left underline" onClick={() => { setLines(current => current.filter((_, i) => i !== index)); setSaved(false); }}>Remove item {index + 1}</button>}
          </div>)}
          {canEdit && <div className="flex flex-wrap gap-3"><button type="button" disabled={lines.length >= 30} className="min-h-11 rounded-lg border px-4" onClick={() => { setLines(current => [...current, { label: '', basis: 'total', planned: 0, actual: 0 }]); setSaved(false); }}>Add cost item</button><button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">{busy ? 'Saving…' : 'Save budget'}</button></div>}
        </fieldset>
      </form>
    </>}
    <HarvestSchedule key={season._id} season={season} canEdit={canEdit} currency={currency} />
  </section>;
}
