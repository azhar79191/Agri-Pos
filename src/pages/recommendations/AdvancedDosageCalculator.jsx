import PageHeader from "../../components/ui/PageHeader";
import { useState } from 'react';
import Select from '../../components/ui/Select';
import { labelQuantity } from '../../utils/labelQuantity';

export default function AdvancedDosageCalculator() {
  const [form, setForm] = useState({ product: '', source: '', area: '', areaUnit: 'acre', rate: '', rateAreaUnit: 'acre', quantityUnit: 'ml', checked: false });
  const [result, setResult] = useState(null), [error, setError] = useState('');
  const change = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setResult(null); setError(''); };
  const input = 'mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  const calculate = event => {
    event.preventDefault();
    if (!form.product.trim() || !form.source.trim() || !form.checked) return setError('Enter the product and label reference, and confirm the rate is applicable.');
    try { setResult(labelQuantity(form)); } catch (e) { setError(e.message); }
  };
  return <div className="mx-auto max-w-4xl space-y-6">
    <PageHeader title={<>Calculate from a product label</>} description={<>Scale an applicable label rate to your field area. This worksheet performs arithmetic; it does not choose a treatment, validate a label or recommend a rate.</>}><p className="workspace-eyebrow">Label quantity worksheet</p></PageHeader>
    <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">Use the registered product label for the exact formulation, crop, target and application method. Follow its limits, protective equipment, re-entry and harvest intervals. Obtain qualified advice if the label is unclear. AI-generated and sample rates are unavailable.</p>
    <form onSubmit={calculate} className="card-base space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label>Product and formulation<input required maxLength={160} className={input} value={form.product} onChange={e => change('product', e.target.value)} /></label>
        <label>Label reference or registration number<input required maxLength={250} className={input} value={form.source} onChange={e => change('source', e.target.value)} /></label>
        <label>Field area<input required type="number" min="0.000001" step="any" className={input} value={form.area} onChange={e => change('area', e.target.value)} /></label>
        <label>Field area unit<Select value={form.areaUnit} onChange={e => change('areaUnit', e.target.value)} options={[{ value: 'acre', label: 'Acres' }, { value: 'hectare', label: 'Hectares' }]} /></label>
        <label>Rate printed on label<input required type="number" min="0.000001" step="any" className={input} value={form.rate} onChange={e => change('rate', e.target.value)} /></label>
        <label>Quantity unit<Select value={form.quantityUnit} onChange={e => change('quantityUnit', e.target.value)} options={['g', 'kg', 'ml', 'L'].map(value => ({ value, label: value }))} /></label>
        <label>Label rate applies per<Select value={form.rateAreaUnit} onChange={e => change('rateAreaUnit', e.target.value)} options={[{ value: 'acre', label: 'Acre' }, { value: 'hectare', label: 'Hectare' }]} /></label>
      </div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={form.checked} onChange={e => change('checked', e.target.checked)} className="mt-1 h-4 w-4" />I checked that this label rate applies to this product, crop, target and application method. This is a user-entered reference, not software verification.</label>
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{error}</p>}
      <button className="ui-button-primary min-h-11 rounded-xl px-5">Calculate label quantity</button>
      {result && <section aria-live="polite" className="rounded-xl border border-emerald-300 p-5"><h2 className="font-semibold">Calculated quantity: {result.total.toLocaleString(undefined, { maximumSignificantDigits: 8 })} {result.quantityUnit}</h2><p className="mt-2 text-sm">{form.product} | Label reference: {form.source}</p><p className="mt-2 text-sm">{form.rate} {form.quantityUnit} per {form.rateAreaUnit}, scaled to {form.area} {form.areaUnit}. No dilution, mixing compatibility, repeat applications or purchase quantity is inferred.</p></section>}
    </form>
  </div>;
}
