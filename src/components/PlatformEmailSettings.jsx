import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function PlatformEmailSettings() {
  const [form,setForm] = useState(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [recipient,setRecipient] = useState('');
  const [dirty,setDirty] = useState(false);
  const load = data => { setForm({...data, EMAIL_PROVIDER:data.EMAIL_PROVIDER||'smtp', EMAIL_PORT:data.EMAIL_PORT||'587', EMAIL_SECURE:data.EMAIL_SECURE||'false', SENDGRID_REGION:data.SENDGRID_REGION||'global', EMAIL_PASS:'',SENDGRID_API_KEY:''}); setDirty(false); };
  useEffect(() => { API.get('/superadmin/email-settings').then(r=>load(r.data.data)).catch(e=>setMessage(e.response?.data?.message||'Could not load email settings')); },[]);
  const change = (key,value) => { setForm(f=>({...f,[key]:value}));setDirty(true);setMessage(''); };
  const run = async action => {
    setBusy(true);setMessage('');
    try {
      if(action==='save') {
        const keys=['EMAIL_PROVIDER','EMAIL_HOST','EMAIL_PORT','EMAIL_SECURE','EMAIL_USER','EMAIL_PASS','EMAIL_FROM','SENDGRID_API_KEY','SENDGRID_REGION'];
        const r=await API.put('/superadmin/email-settings',Object.fromEntries(keys.map(k=>[k,form[k]||''])));
        load(r.data.data);setMessage('Saved. New email requests use these settings immediately. Run the configuration check before sending a test.');
      } else {
        const r=await API.post('/superadmin/email-settings/'+action, action==='test'?{email:recipient}:{});
        setMessage(r.data.data.message || (r.data.data.success?'Test accepted by provider. Check the recipient inbox and provider activity.':'Email check failed.'));
      }
    } catch(e) {setMessage(e.response?.data?.message||'Request could not be confirmed. Check provider activity before retrying a send.');}
    finally {setBusy(false);}
  };
  const field = (key,label,type='text',placeholder='') => <label className="block text-sm font-medium" key={key}>{label}<input className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900" type={type} value={form[key]||''} placeholder={placeholder} autoComplete="off" onChange={e=>change(key,e.target.value)}/></label>;
  return <details className="card-base mb-6 rounded-xl border p-5"><summary className="cursor-pointer text-lg font-semibold">Platform email settings</summary><p className="my-3 text-sm text-slate-500">Super admin only. These settings apply to all shops, receipts, recovery emails and activity alerts. Credentials are encrypted and never returned to the browser. Blank password or API key keeps the existing credential.</p>{message&&<p role="status" className="my-3 rounded-lg border p-3 text-sm">{message}</p>}{form&&<fieldset disabled={busy} className="space-y-4"><label className="block text-sm font-medium">Provider<select value={form.EMAIL_PROVIDER} onChange={e=>change('EMAIL_PROVIDER',e.target.value)} className="ml-3 rounded-lg border p-2 dark:bg-slate-900"><option value="smtp">SMTP</option><option value="sendgrid">SendGrid API</option><option value="auto">Automatic (environment compatibility)</option><option value="sendgrid-api">SendGrid API (existing)</option></select></label><div className="grid gap-4 sm:grid-cols-2">{field('EMAIL_FROM','Verified sender address','email')}{form.EMAIL_PROVIDER!=='smtp'&&<>{field('SENDGRID_API_KEY','SendGrid API key','password',form.SENDGRID_API_KEY_SET?'Credential saved — leave blank to keep':'Enter API key')}<label className="block text-sm font-medium">SendGrid region<select className="ml-3 rounded-lg border p-2 dark:bg-slate-900" value={form.SENDGRID_REGION} onChange={e=>change('SENDGRID_REGION',e.target.value)}><option value="global">Global</option><option value="eu">EU</option></select></label></>}{!['sendgrid','sendgrid-api'].includes(form.EMAIL_PROVIDER)&&<>{field('EMAIL_HOST','SMTP host')}{field('EMAIL_PORT','SMTP port','number')}{field('EMAIL_USER','SMTP username')}{field('EMAIL_PASS','SMTP password / app password','password',form.EMAIL_PASS_SET?'Credential saved — leave blank to keep':'Enter password')}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.EMAIL_SECURE==='true'} onChange={e=>change('EMAIL_SECURE',String(e.target.checked))}/>Implicit TLS (port 465). Uncheck for STARTTLS (port 587).</label></>}</div><p className="text-xs text-slate-500">Use a sender verified by your provider. Check Mail Send permissions, SMTP access, IP restrictions and app password requirements in your provider account. Check provider activity before retrying an uncertain send.</p><div className="flex flex-wrap gap-3"><button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={()=>run('save')}>Save email settings</button><button type="button" disabled={dirty} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={()=>run('check')}>Check saved configuration</button></div><div className="flex flex-wrap gap-3"><input aria-label="Platform test email recipient" type="email" className="rounded-lg border p-2 dark:bg-slate-900" value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Test recipient"/><button type="button" disabled={dirty||!recipient.trim()} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={()=>run('test')}>Send one test email</button></div>{dirty&&<p className="text-xs">Save changes before checking or testing.</p>}</fieldset>}</details>;
}
