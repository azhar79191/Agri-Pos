import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { getSettings, updateSettings } from '../../api/settingsApi';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';

export default function BrandingPanel() {
  const { actions } = useApp();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState(null);
  const load = () => {
    setError('');
    API.get('/settings/email-status').then(response => setDelivery(response.data.data)).catch(() => setDelivery(null));
    getSettings().then(response => setForm(response.data.data.settings)).catch(e => setError(e.response?.data?.message || 'Brand settings could not be loaded'));
  };
  useEffect(load, []);
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const payload = Object.fromEntries(['brandName', 'brandTagline', 'brandLogo', 'brandColor', 'emailFooter', 'actionEmailsEnabled', 'theme'].map(key => [key, form[key]]));
      const response = await updateSettings(payload);
      const saved = response.data.data.settings;
      setForm(saved); actions.updateSettings(saved); actions.setThemeColor(saved.brandColor || '#047857');
      setMessage('Branding and email preferences saved. Delivery also requires the server email worker and provider configuration.');
    } catch (e) { setError(e.response?.data?.message || 'Settings could not be saved'); }
    finally { setBusy(false); }
  };
  const input = 'mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  return <SettingsCard title="Branding & action emails" desc="Configure your shop identity and confirmations for signed-in staff.">
    {error && <p role="alert" className="mb-4 text-red-700 dark:text-red-300">{error}<button type="button" className="ml-3 min-h-11 underline" onClick={load}>Reload</button></p>}
    {message && <p role="status" className="mb-4 text-sm">{message}</p>}
    {!form ? <p>Loading brand settings…</p> : <form onSubmit={save} className="space-y-5">
      {[['brandName', 'Brand name', 100], ['brandTagline', 'Tagline', 160], ['brandLogo', 'Logo image URL (HTTPS)', 1000], ['emailFooter', 'Email footer', 500]].map(([key, label, maxLength]) => <label key={key} className="block text-sm font-medium">{label}<input type={key === 'brandLogo' ? 'url' : 'text'} maxLength={maxLength} className={input} value={form[key] || ''} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} /></label>)}
      <label className="block text-sm font-medium">Company appearance<select aria-label="Company appearance" className={input} value={form.theme || "light"} onChange={e => setForm(current => ({ ...current, theme: e.target.value }))}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <label className="block text-sm font-medium">Brand accent<input type="color" className="ml-3 h-11 w-16 align-middle" value={form.brandColor || '#047857'} onChange={e => setForm(current => ({ ...current, brandColor: e.target.value }))} /></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5" checked={!!form.actionEmailsEnabled} onChange={e => setForm(current => ({ ...current, actionEmailsEnabled: e.target.checked }))} />Enable action confirmations to the signed-in staff member’s account email. Customer marketing emails are separate.</label>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><div className="p-5 text-white" style={{ background: form.brandColor || '#047857' }}>{form.brandLogo && /^https:\/\//i.test(form.brandLogo) && <img src={form.brandLogo} alt="Brand logo preview" className="mb-3 h-12 max-w-full object-contain" />}<h3 className="text-xl font-bold text-white">{form.brandName || form.shopName}</h3><p className="mt-1 text-sm">{form.brandTagline}</p></div><div className="space-y-3 p-5"><p className="font-semibold">Action confirmation preview</p><p className="text-sm">Hello, your action was recorded successfully.</p><p className="text-xs text-slate-500">{form.emailFooter}</p></div></div>
      <p className="text-xs text-slate-500">Templates cover sales, invoice changes/payments, stock/product changes, supplier returns/payments, loyalty redemption and farmer workspace actions. Password-reset emails keep their existing security flow. Email delivery can be delayed or retried.</p>
      {delivery && <section aria-label="Email delivery status" className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-semibold">Delivery status</h3><p className="text-sm">Provider: {delivery.providerConfigured ? 'configured (delivery unverified)' : 'not configured'} | Worker: {delivery.workerEnabled ? 'enabled' : 'disabled'}</p><p className="text-xs text-slate-500">Recent confirmations: {delivery.jobs.length}. Sent means the provider accepted the message; it does not confirm inbox delivery.</p>{delivery.jobs.map(job => <div key={job._id} className="flex flex-wrap justify-between gap-2 border-t py-2 text-xs"><span>{job.eventKey.split(':')[0]}</span><span>{job.status} ? {job.attempts} attempts</span></div>)}</section>}
      <button disabled={busy} className="min-h-11 rounded-lg px-5 font-semibold text-white disabled:opacity-50" style={{ background: form.brandColor || '#047857' }}>{busy ? 'Saving…' : 'Save brand settings'}</button>
    </form>}
  </SettingsCard>;
}
