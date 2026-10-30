import DocumentContentSettings from './DocumentContentSettings';
import { templateSample } from './templateSample';
import { useEffect, useRef, useState } from 'react';
import Invoice from '../../components/Invoice';
import API from '../../api/axios';
import { generateInvoicePDF, downloadInvoicePDF } from '../../utils/pdfGenerator';


const designs=[
  {id:'standard',name:'Signature',description:'A confident brand accent, clear hierarchy and a polished item table.'},
  {id:'letterhead',name:'Letterhead',description:'An elegant company heading with restrained lines and a formal finish.'},
  {id:'minimal',name:'Minimal',description:'An airy white layout with quiet typography and crisp, simple details.'},
];
export default function DocumentTemplateStudio({form,onChange,logo,canEdit}) {
  const [tab,setTab]=useState('invoice'),[email,setEmail]=useState(''),[pdf,setPdf]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false),[scenario,setScenario]=useState('paid'),[emailSubject,setEmailSubject]=useState('');
  const request=useRef(0),pdfRef=useRef('');
  const settings={...form,brandLogo:logo};
  const sample=templateSample(scenario);
  const fingerprint=JSON.stringify({...settings,previewScenario:scenario});
  useEffect(()=>{setEmail('');setPdf('');setError('');setLoading(false);request.current++;if(pdfRef.current){URL.revokeObjectURL(pdfRef.current);pdfRef.current='';}},[fingerprint]);
  useEffect(()=>()=>{request.current++;if(pdfRef.current)URL.revokeObjectURL(pdfRef.current);},[]);
  const preview=async target=>{
    setTab(target);if(target==='invoice')return;
    const id=++request.current;setLoading(true);setError('');
    try {
      if(target==='email') {
        // Logo uploads are local draft images; the server accepts saved logos or HTTPS URLs.
        const payload={...settings,previewScenario:scenario};delete payload.brandLogo;
        const response=await API.post('/settings/email-preview',payload);
        if(id===request.current){
          const document=new DOMParser().parseFromString(response.data.data.html,'text/html');
          if(logo){let img=document.querySelector('img');if(!img){img=document.createElement('img');img.width=56;img.alt='Company logo';document.querySelector('td table td')?.prepend(img);}img.src=logo;}
          else document.querySelectorAll('img').forEach(img=>img.remove());
          setEmail('<!doctype html>'+document.documentElement.outerHTML);setEmailSubject(response.data.data.subject||'');
        }
      } else {
        const doc=await generateInvoicePDF(sample,settings);
        if(id===request.current){if(pdfRef.current)URL.revokeObjectURL(pdfRef.current);pdfRef.current=URL.createObjectURL(doc.output('blob'));setPdf(pdfRef.current);}
      }
    }catch(e){if(id===request.current)setError(e.response?.data?.message||'Preview could not be generated. Try again.');}
    finally{if(id===request.current)setLoading(false);}
  };
  return <section className="card-base space-y-5 overflow-hidden p-5" aria-label="Invoice and email template studio">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Customer-facing documents</p><h2 className="mt-1 text-xl font-semibold">Invoice &amp; email template studio</h2><p className="mt-2 text-sm text-slate-500">Choose a coordinated design, or choose invoice and email styles separately. Previews use your current edits and sample data. Save brand settings to apply them to your company.</p></div>
    <div className="grid gap-3 md:grid-cols-3">{designs.map(design=><button type="button" key={design.id} aria-label={`Use ${design.name} design for invoices and emails`} disabled={!canEdit} aria-pressed={form.receiptTemplate===design.id&&form.emailTemplate===design.id} onClick={()=>{onChange('receiptTemplate',design.id);onChange('emailTemplate',design.id);setTab('invoice');}} className={`rounded-xl border p-4 text-left transition-colors ${form.receiptTemplate===design.id&&form.emailTemplate===design.id?'border-emerald-600 bg-emerald-50 text-slate-900 dark:bg-emerald-950 dark:text-white':'border-slate-200 dark:border-slate-700'}`}><div className="mb-4 h-16 rounded-lg border border-slate-200 bg-white p-3" aria-hidden="true"><div className="mb-2 h-1.5 w-12" style={{background:design.id==='minimal'?'#cbd5e1':form.brandColor||'#047857'}}/><div className="h-1 w-3/4 bg-slate-100"/><div className="mt-2 h-1 w-full bg-slate-100"/><div className="mt-2 h-1 w-1/2 bg-slate-100"/></div><span className="font-semibold">{design.name}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{design.description}</span></button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2">{[['receiptTemplate','Invoice design'],['emailTemplate','Email design']].map(([key,label])=><label key={key} className="text-sm font-medium">{label}<select aria-label={label} disabled={!canEdit} value={form[key]||'standard'} onChange={e=>onChange(key,e.target.value)} className="mt-2 block w-full rounded-xl border bg-white p-3 dark:bg-slate-800">{designs.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}<option value="compact">Compact (legacy)</option></select></label>)}</div>
    <DocumentContentSettings form={form} onChange={onChange} canEdit={canEdit}/>
    <label className="block text-sm font-medium">Preview example<select aria-label="Preview example" className="ml-3 rounded-lg border bg-white p-2 dark:bg-slate-800" value={scenario} onChange={e=>setScenario(e.target.value)}><option value="paid">Paid invoice</option><option value="partial">Partial payment / balance due</option><option value="refunded">Refunded invoice</option></select></label>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2" aria-label="Document preview type">{[['invoice','Full invoice'],['pdf','Generated PDF'],['email','Email']].map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} disabled={loading} onClick={()=>preview(id)} className={`min-h-11 rounded-lg border px-4 text-sm ${tab===id?'bg-slate-900 text-white':'bg-white text-slate-700'}`}>{label}</button>)}</div><button type="button" className="text-sm underline" onClick={()=>downloadInvoicePDF(sample,settings)}>Download sample PDF</button></div>
    <p className="text-xs text-slate-500">Preview only · PREVIEW-001 · no invoice is created and no email is sent. Email clients may render fonts and spacing differently.</p>
    {error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-sm text-red-700">{error}</p>}
    {loading&&<p role="status" className="p-5 text-sm">Preparing complete preview…</p>}
    {!loading&&tab==='invoice'&&<div className="max-h-[850px] overflow-auto rounded-xl border bg-slate-100 p-2 sm:p-5"><Invoice invoice={sample} settings={settings} preview/></div>}
    {!loading&&tab==='email'&&email&&<div className="rounded-xl border p-3 text-sm"><p><strong>Subject:</strong> {emailSubject}</p>{form.emailReplyTo&&<p><strong>Reply-To:</strong> {form.emailReplyTo}</p>}</div>}
    {!loading&&tab==='email'&&(email?<iframe title="Complete email preview" sandbox="" srcDoc={email} className="h-[850px] w-full rounded-xl border bg-white"/>:<button type="button" onClick={()=>preview('email')} className="rounded-lg border p-4">Refresh email preview with current edits</button>)}
    {!loading&&tab==='pdf'&&(pdf?<iframe title="Generated invoice PDF preview" src={pdf} className="h-[850px] w-full rounded-xl border bg-white"/>:<button type="button" onClick={()=>preview('pdf')} className="rounded-lg border p-4">Refresh PDF preview with current edits</button>)}
  </section>;
}
