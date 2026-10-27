import Select from "../../components/ui/Select";
import { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import { getSettings, updateSettings } from '../../api/settingsApi';
import { useApp } from '../../context/AppContext';
import ShopLogo from '../../components/ui/ShopLogo';
import { themePalette } from '../../utils/theme';
import { THEME_PRESETS } from './settingsConfig';

const keys = ['brandName', 'brandTagline', 'brandLogo', 'brandColor', 'emailFooter', 'actionEmailsEnabled', 'theme', 'shopName', 'shopEmail', 'shopPhone', 'shopAddress', 'receiptFooter'];
const input = 'mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
export default function BrandingPanel() {
  const { state, actions } = useApp();
  const [form, setForm] = useState(null), [baseline, setBaseline] = useState(null);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false), [delivery, setDelivery] = useState(null);
  const [file, setFile] = useState(null), [preview, setPreview] = useState('');
  const fileInput = useRef(null);
  const canEdit = actions.hasPermission('settings:edit');
  const load = () => {
    setError('');
    API.get('/settings/email-status').then(response => setDelivery(response.data.data)).catch(() => setDelivery(null));
    getSettings().then(response => { setForm(response.data.data.settings); setBaseline(response.data.data.settings); }).catch(e => setError(e.response?.data?.message || 'Company settings could not be loaded'));
  };
  useEffect(load, []);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const discard = () => { setForm(baseline); setFile(null); setPreview(''); setError(''); setMessage(''); if (fileInput.current) fileInput.current.value = ''; };
  const dirty = !!file || JSON.stringify(form) !== JSON.stringify(baseline);
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const chooseLogo = event => {
    const image = event.target.files?.[0]; if (!image) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.type) || image.size > 2 * 1024 * 1024) { setError('Choose a PNG, JPEG or WebP logo up to 2 MB.'); event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { setFile(image); setPreview(String(reader.result)); setError(''); };
    reader.onerror = () => setError('The image could not be read. Choose it again.');
    reader.readAsDataURL(image);
  };
  const save = async event => {
    event.preventDefault();
    const expectedShop = state.currentUser?.shop?._id || state.currentUser?.shop;
    setBusy(true); setError(''); setMessage('');
    try {
      const payload = Object.fromEntries(keys.map(key => [key, form[key]]));
      payload.brandLogo = form.brandLogo || form.shopLogo || '';
      let response;
      if (file) { const upload = new FormData(); upload.append('logo', file); upload.append('settings', JSON.stringify(payload)); response = await API.post('/settings/logo', upload, { headers: { 'Content-Type': 'multipart/form-data' } }); }
      else response = await updateSettings(payload);
      const saved = response.data.data.settings;
      setForm(saved); setBaseline(saved); setFile(null); setPreview('');
      if (fileInput.current) fileInput.current.value = '';
      actions.applyCompanySettings(saved, expectedShop);
      setMessage('Branding and email preferences saved. Delivery also requires the server email worker and provider configuration.');
    } catch (e) { setError(e.response?.data?.message || 'Company settings could not be saved. Your edits are retained.'); }
    finally { setBusy(false); }
  };
  const field = (key, label, maxLength, type = 'text', required = false) => <label className="block text-sm font-medium">{label}<input required={required} type={type} maxLength={maxLength} className={input} value={key === 'brandLogo' && form[key]?.startsWith('data:') ? '' : form[key] || ''} onChange={e => { set(key, e.target.value); if (key === 'brandLogo') { setFile(null); setPreview(''); if (fileInput.current) fileInput.current.value = ''; } }} /></label>;
  if (!form) return <section className="card-base p-6">{error ? <p role="alert">{error}<button type="button" onClick={load} className="ml-3 underline">Retry</button></p> : <p role="status">Loading company identity...</p>}</section>;
  const brand = themePalette(form.brandColor);
  const logo = preview || form.brandLogo || form.shopLogo || '';
  return <form onSubmit={save} className="space-y-6">
    <header className="workspace-hero"><p className="workspace-eyebrow">Your company workspace</p><h1>Brand studio</h1><p>Make this shop recognizably yours. Identity, contact details and appearance are saved only for your company.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{message}</p>}
    {!canEdit && <p className="rounded-xl border p-4 text-sm">You can preview company settings. Ask a shop administrator for permission to edit branding.</p>}
    <fieldset disabled={busy || !canEdit} className="min-w-0 space-y-6">
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
      <div className="min-w-0 space-y-6">
        <section className="card-base space-y-5 p-5"><div><h2 className="text-lg font-semibold">Company identity</h2><p className="mt-1 text-sm text-slate-500">The display name and logo appear in your app header, navigation and receipt header.</p></div>
          {field('brandName', 'Brand name', 100)}{field('brandTagline', 'Tagline', 160)}
          <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600"><div className="flex items-center gap-4"><ShopLogo logo={logo} name={form.brandName || form.shopName} size="w-16 h-16" /><div className="min-w-0"><p className="font-semibold">Company logo</p><p className="mt-1 text-xs text-slate-500">PNG, JPEG or WebP. Maximum 2 MB. Transparent or square artwork works best.</p></div></div><label className="mt-4 block text-sm font-medium">Upload company logo<input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseLogo} disabled={busy} className="mt-2 block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-3 file:text-slate-800 dark:file:bg-slate-700 dark:file:text-white" /></label>{file && <p className="mt-2 text-xs text-slate-500">New logo ready. It will be uploaded when you save.</p>}<button type="button" disabled={busy || !logo} onClick={() => { setForm(current => ({ ...current, brandLogo: '', shopLogo: '' })); setFile(null); setPreview(''); if (fileInput.current) fileInput.current.value = ''; }} className="mt-2 min-h-11 text-sm text-red-700 underline dark:text-red-300">Remove logo</button></div>
          {field('brandLogo', 'Logo image URL (HTTPS)', 200000, 'text')}
          <p className="text-xs text-slate-500">Upload for permanent storage with your shop record, or use an HTTPS URL. Uploaded logos are not shown as a long data URL in this field.</p>
        </section>
        <section className="card-base space-y-5 p-5"><h2 className="text-lg font-semibold">Business details</h2>{field('shopName', 'Registered shop / company name', 200, 'text', true)}{field('shopEmail', 'Business email', 200, 'email')}{field('shopPhone', 'Business phone', 20, 'tel')}{field('shopAddress', 'Business address', 500)}{field('receiptFooter', 'Receipt footer', 500)}</section>
        <section className="card-base space-y-5 p-5"><h2 className="text-lg font-semibold">Company appearance</h2><div className="flex flex-wrap gap-2" aria-label="Company color presets">{THEME_PRESETS.map(({ label, color }) => <button key={color} type="button" aria-label={`${label} company theme`} aria-pressed={brand.hex === color} onClick={() => set('brandColor', color)} className="min-h-11 rounded-xl border px-3 text-sm font-medium" style={{ background: color, color: themePalette(color).foreground, outline: brand.hex === color ? `3px solid ${color}` : undefined, outlineOffset: 2 }}>{label}</button>)}</div><label className="block text-sm font-medium">Brand accent<input aria-label="Brand accent" type="color" className="ml-3 h-11 w-16 align-middle" value={brand.hex} onChange={e => set('brandColor', e.target.value)} /></label><Select label="Company appearance" aria-label="Company appearance" value={form.theme || 'light'} onChange={event => set('theme', event.target.value)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /><p className="text-xs text-slate-500">This theme is shared by all staff in this company. Other companies keep their own logo, colors and appearance.</p></section>
        <section className="card-base space-y-5 p-5"><h2 className="text-lg font-semibold">Email identity</h2>{field('emailFooter', 'Email footer', 500)}<label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5" checked={!!form.actionEmailsEnabled} onChange={e => set('actionEmailsEnabled', e.target.checked)} />Enable confirmations to the signed-in staff account. Provider and worker configuration are required; customer marketing is separate.</label>{delivery && <div aria-label="Email delivery status" className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800"><p>Provider: {delivery.providerConfigured ? 'configured (unverified)' : 'not configured'} | Worker: {delivery.workerEnabled ? 'enabled' : 'disabled'}</p><p className="mt-2 text-xs text-slate-500">{delivery.jobs.length} recent confirmations. Sent means provider acceptance, not inbox delivery.</p></div>}</section>
      </div>
      <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start"><section className="card-base overflow-hidden"><div className="p-5" style={{ background: brand.hex, color: brand.foreground }}><p className="text-xs font-semibold uppercase tracking-widest">Live preview</p><div className="mt-5 flex items-center gap-3"><ShopLogo logo={logo} name={form.brandName || form.shopName} size="w-12 h-12" /><div className="min-w-0"><h2 className="break-words text-lg font-bold" style={{ color: brand.foreground }}>{form.brandName || form.shopName}</h2><p className="mt-1 break-words text-xs">{form.brandTagline || 'Your company tagline'}</p></div></div></div><div className="space-y-4 p-5"><p className="text-sm font-semibold">Receipt identity</p><p className="break-words text-sm">{form.shopName}</p><p className="break-words text-xs text-slate-500">{form.shopAddress}</p><p className="break-words text-xs text-slate-500">{form.shopPhone} {form.shopEmail}</p><div className="border-t border-dashed pt-4 text-center text-xs text-slate-500">{form.receiptFooter}</div></div></section><p className="px-1 text-xs leading-relaxed text-slate-500">Preview changes are not public until saved. Uploads are optimized to PNG. Uploaded logos are included inline in new action emails. Some email clients may hide images until the recipient allows them.</p></aside>
    </div>
    <footer className="card-base flex flex-wrap items-center justify-between gap-3 p-4"><p role="status" className="text-sm text-slate-500">{dirty ? 'You have unsaved company changes' : 'Company settings are up to date'}</p><div className="flex flex-wrap gap-3"><button type="button" disabled={busy || !dirty} onClick={discard} className="min-h-11 rounded-xl border px-4 disabled:opacity-40">Discard changes</button><button disabled={busy || !dirty} className="min-h-11 rounded-xl px-5 font-semibold disabled:opacity-40" style={{ background: brand.hex, color: brand.foreground }}>{busy ? 'Saving...' : 'Save brand settings'}</button></div></footer>
    </fieldset>
  </form>;
}
