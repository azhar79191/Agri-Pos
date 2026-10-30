export const DOCUMENT_DEFAULTS = {
  receiptTemplate:'standard',emailTemplate:'standard',emailFooter:'',receiptFooter:'Thank you for your purchase!',
  invoiceTerms:'',paymentInstructions:'',taxRegistrationNumber:'',emailReplyTo:'',
  invoiceEmailSubject:'{company}: Invoice {invoiceNumber}',
  invoiceEmailMessage:'Thank you for choosing {company}. Your purchase details are below.',
  documentTimezone:'Asia/Karachi',documentDateFormat:'long',
};
export const DOCUMENT_KEYS=Object.keys(DOCUMENT_DEFAULTS);
export function documentSettings(source={}) {
  return Object.fromEntries(DOCUMENT_KEYS.map(key=>[key,source[key]??DOCUMENT_DEFAULTS[key]]));
}
export function documentStatus(invoice) {
  if(['Refunded','Cancelled'].includes(invoice.status))return invoice.status;
  return invoice.paymentStatus||invoice.status||'Completed';
}
export function documentDate(value,settings={}) {
  if(!value)return '—';
  const date=new Date(value);if(Number.isNaN(date.getTime()))return '—';
  const dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(String(value));
  let parts;
  try { parts=new Intl.DateTimeFormat('en-GB',{timeZone:dateOnly?'UTC':settings.documentTimezone||'Asia/Karachi',day:'2-digit',month:settings.documentDateFormat==='long'||!settings.documentDateFormat?'short':'2-digit',year:'numeric'}).formatToParts(date); }
  catch {parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric'}).formatToParts(date);}
  const part=type=>parts.find(p=>p.type===type)?.value||'';
  return settings.documentDateFormat==='iso'?`${part('year')}-${part('month')}-${part('day')}`:settings.documentDateFormat==='short'?`${part('day')}/${part('month')}/${part('year')}`:`${part('day')} ${part('month')} ${part('year')}`;
}
