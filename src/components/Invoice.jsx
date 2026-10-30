import { documentStatus, documentDate } from '../utils/documentSettings';
import { themePalette } from '../utils/theme';
import React, { forwardRef } from 'react';
import { normalizeInvoiceItems } from '../utils/normalizeInvoiceItems';
import './invoiceDocument.css';

const Invoice = forwardRef(({ invoice, settings = {}, onPrint, onDownload, onEmail, preview = false }, ref) => {
  const template = settings.receiptTemplate || 'standard';
  const name = settings.brandName || settings.shopName || settings.name || 'Your company';
  const logo = settings.brandLogo || settings.shopLogo || settings.logo;
  const money = value => `${settings.currency || 'Rs.'} ${Number(value || 0).toLocaleString('en-PK', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const date = invoice.createdAt || invoice.date;
  const dateText = documentDate(date,settings);
  const total = invoice.total ?? invoice.grandTotal ?? 0;
  const paid = invoice.amountPaid;
  const balance = ['Refunded','Cancelled'].includes(invoice.status)?0:invoice.creditAmount ?? (paid == null ? null : Math.max(0,total-paid-(invoice.advanceUsed||0)));
  const color = /^#[0-9a-f]{6}$/i.test(settings.brandColor || '') ? settings.brandColor : '#047857';
  return <div className="invoice-shell">
    {!preview && <div className="invoice-actions print:hidden flex flex-wrap justify-end gap-2 p-4">{[[onPrint,'Print'],[onDownload,'Download PDF'],[onEmail,'Email invoice']].map(([action,label])=><button type="button" key={label} disabled={!action} onClick={action} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">{label}</button>)}</div>}
    <article ref={ref} className="receipt receipt-paper invoice-document" data-receipt-template={template} style={{'--invoice-accent':color,'--invoice-foreground':themePalette(color).foreground,fontFamily:settings.fontFamily==='serif'?'Georgia,serif':'Arial,Helvetica,sans-serif'}}>
      <header className="document-header"><div className="document-brand">{logo?<img src={logo} alt={`${name} logo`}/>:<div className="document-monogram">{name.slice(0,2).toUpperCase()}</div>}<div><h1>{name}</h1>{settings.brandTagline&&<p className="document-tagline">{settings.brandTagline}</p>}</div></div><div className="document-title"><span className="document-eyebrow">Sales invoice</span><h2>INVOICE</h2><p>#{invoice.invoiceNumber || invoice.id || invoice._id}</p></div></header>
      <div className="document-contact">{[settings.shopAddress||settings.address,settings.shopPhone||settings.phone,settings.shopEmail||settings.email].filter(Boolean).map((value,i)=><span key={i}>{value}</span>)}{settings.taxRegistrationNumber&&<span>Tax registration: {settings.taxRegistrationNumber}</span>}</div>
      <section className="document-parties"><div><span className="document-eyebrow">Billed to</span><h3>{invoice.customerName || invoice.customer?.name || 'Walk-in Customer'}</h3>{(invoice.customerPhone||invoice.customer?.phone)&&<p>{invoice.customerPhone||invoice.customer.phone}</p>}{(invoice.customerAddress||invoice.customer?.address)&&<p>{invoice.customerAddress||invoice.customer.address}</p>}</div><dl><div><dt>Issue date</dt><dd>{dateText}</dd></div><div><dt>Payment method</dt><dd>{invoice.paymentMethod || 'Cash'}</dd></div><div><dt>Status</dt><dd>{documentStatus(invoice)}</dd></div>{(invoice.processedByName||invoice.user?.name||typeof invoice.createdBy==='string')&&<div><dt>Served by</dt><dd>{invoice.processedByName||invoice.user?.name||invoice.createdBy}</dd></div>}</dl></section>
      <table className="document-items"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{normalizeInvoiceItems(invoice.items).map((item,i)=><tr key={i}><td><strong>{item.name}</strong>{item.sku&&<small>SKU {item.sku}</small>}</td><td>{item.quantity}{item.unit?` ${item.unit}`:''}</td><td>{money(item.price)}</td><td>{money(item.total)}</td></tr>)}</tbody></table>
      <section className="document-settlement"><div className="document-note"><span className="document-eyebrow">Thank you for your business</span><p>{settings.receiptFooter ?? 'We appreciate your trust in our company.'}</p>{invoice.notes&&<p>{invoice.notes}</p>}{settings.paymentInstructions&&<><span className="document-eyebrow document-note-label">Payment instructions</span><p>{settings.paymentInstructions}</p></>}{settings.invoiceTerms&&<><span className="document-eyebrow document-note-label">Terms &amp; conditions</span><p>{settings.invoiceTerms}</p></>}</div><dl className="document-totals"><div><dt>Subtotal</dt><dd>{money(invoice.subtotal)}</dd></div>{Number(invoice.discount)>0&&<div><dt>Discount</dt><dd>− {money(invoice.discount)}</dd></div>}<div><dt>Tax{invoice.taxRate!=null?` (${invoice.taxRate}%)`:''}</dt><dd>{money(invoice.taxAmount??invoice.tax)}</dd></div><div className="document-grand-total"><dt>Total</dt><dd>{money(total)}</dd></div>{paid!=null&&<div><dt>Amount paid</dt><dd>{money(paid)}</dd></div>}{invoice.advanceUsed>0&&<div><dt>Customer credit used</dt><dd>{money(invoice.advanceUsed)}</dd></div>}{invoice.refundAmount>0&&<div><dt>Refunded amount</dt><dd>{money(invoice.refundAmount)}</dd></div>}{balance!=null&&balance>0&&<div><dt>Balance due</dt><dd>{money(balance)}</dd></div>}{invoice.changeAmount>0&&<div><dt>Change</dt><dd>{money(invoice.changeAmount)}</dd></div>}</dl></section>
      <footer className="document-footer"><span>{name}</span><span>Invoice {invoice.invoiceNumber || invoice.id || ''}</span></footer>
    </article>
  </div>;
});
Invoice.displayName='Invoice';
export default Invoice;
