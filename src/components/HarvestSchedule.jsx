import { usePageUnsaved, useSafeTransition } from '../context/UnsavedChangesContext';
import LoadingState from "./ui/LoadingState";
import { useEffect, useState } from 'react';
import API from '../api/axios';
import { financialCommand } from '../api/financialCommand';
const input = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
export default function HarvestSchedule({ season, canEdit, currency }) {
  const safeTransition=useSafeTransition();
  const [baseline,setBaseline]=useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [message, setMessage] = useState('');
  const path = `/farmer-workspace/seasons/${season._id}/payment-schedule`;
  useEffect(() => {
    let active = true;
    setData(null); setError(''); setMessage('');
    API.get(path).then(r => { if (active) {setData(r.data.data); setBaseline(r.data.data);} }).catch(e => { if (active) setError(e.response?.data?.message || 'Schedule could not be loaded'); });
    return () => { active = false; };
  }, [path, reload]);
  usePageUnsaved({dirty:!!data&&!!baseline&&(data.harvestDate!==baseline.harvestDate||JSON.stringify(data.installments)!==JSON.stringify(baseline.installments)),busy,onDiscard:()=>setData(baseline)});
  const update = (index, key, value) => setData(current => ({ ...current, installments: current.installments.map((line, i) => index === i ? { ...line, [key]: value } : line) }));
  const save = async e => {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const result = await financialCommand('put', path, { version: data.version, harvestDate: data.harvestDate, installments: data.installments.map(line => ({ dueDate: line.dueDate, amount: Number(line.amount), promise: line.promise })) }, { idField: 'clientOperationId', label: 'harvest payment schedule' });
      setData(current => ({ ...current, ...result.data.data })); setBaseline(current=>({...current,...result.data.data}));setMessage('Payment promises saved. No payment was recorded.');
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setBusy(false); }
  };
  return <section className="mt-5 space-y-3 border-t pt-4" aria-label="Harvest payment schedule">
    <h4 className="font-semibold">Harvest-linked payment schedule</h4>
    <p className="text-sm">Record agreed installments and contact notes. These promises do not settle invoices. Record collections through the customer account and review the statement.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status">{message}</p>}
    <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => safeTransition(()=>setReload(value => value + 1))}>Reload payment schedule</button>
    {!data ? <div>{error ? <p>{'Schedule unavailable.'}</p> : <LoadingState label="Loading schedule" />}</div> : <>
      <p className="text-sm">Current customer dues across all seasons: {data.currentDues == null ? 'Unavailable' : `${currency} ${data.currentDues.toLocaleString()}`}</p>
      <p className="text-sm">Planned installments: {currency} {data.installments.reduce((sum, line) => sum + Number(line.amount || 0), 0).toLocaleString()}</p>
      <a className="block min-h-11 py-3 underline" href={`/customers/${season.customer?._id || season.customer}/statement`}>Review collections in customer statement</a>
      <form onSubmit={save}><fieldset disabled={!canEdit || busy} className="space-y-3">
        <label className="block text-sm">Expected harvest date<input required type="date" className={input} value={data.harvestDate} onChange={e => setData(current => ({ ...current, harvestDate: e.target.value }))} /></label>
        {data.installments.map((line, index) => <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
          <label className="text-sm">Installment due date<input required type="date" className={input} value={line.dueDate} onChange={e => update(index, 'dueDate', e.target.value)} /></label>
          <label className="text-sm">Agreed amount ({currency})<input required type="number" min="0.01" max="100000000" step="0.01" className={input} value={line.amount} onChange={e => update(index, 'amount', e.target.value)} /></label>
          <label className="text-sm sm:col-span-2">Payment promise or contact notes<textarea maxLength={500} className={input} value={line.promise} onChange={e => update(index, 'promise', e.target.value)} /></label>
          {canEdit && <button type="button" className="min-h-11 text-left underline" onClick={() => setData(current => ({ ...current, installments: current.installments.filter((_, i) => i !== index) }))}>Remove installment {index + 1}</button>}
        </div>)}
        {canEdit && <div className="flex flex-wrap gap-3"><button type="button" disabled={data.installments.length >= 24} className="min-h-11 rounded-lg border px-4" onClick={() => setData(current => ({ ...current, installments: [...current.installments, { dueDate: current.harvestDate, amount: '', promise: '' }] }))}>Add installment</button><button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">{busy ? 'Saving…' : 'Save payment schedule'}</button></div>}
      </fieldset></form>
    </>}
  </section>;
}
