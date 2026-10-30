import { companyName } from './company';
import { normalizeInvoiceItems } from './normalizeInvoiceItems';
import { documentDate, documentStatus } from './documentSettings';

export function buildReceiptMessage(invoice,settings={}) {
  const name=companyName(settings),currency=settings.currency||'Rs.';
  const money=value=>`${currency} ${Number(value||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const lines=[`*${name}*`,settings.brandTagline||null,'',`*Invoice ${invoice.invoiceNumber||invoice.id||''}*`,`Date: ${documentDate(invoice.createdAt||invoice.date,settings)}`,`Customer: ${invoice.customerName||invoice.customer?.name||'Walk-in Customer'}`,`Payment: ${invoice.paymentMethod||'Cash'}`,`Status: ${documentStatus(invoice)}`,'',...normalizeInvoiceItems(invoice.items).map((item,index)=>`${index+1}. ${item.name}\n   ${item.quantity}${item.unit?' '+item.unit:''} × ${money(item.price)} = ${money(item.total)}`),'',`Subtotal: ${money(invoice.subtotal)}`,invoice.discount>0?`Discount: - ${money(invoice.discount)}`:null,`Tax: ${money(invoice.taxAmount??invoice.tax)}`,`*Total: ${money(invoice.total??invoice.grandTotal)}*`,invoice.amountPaid!=null?`Amount paid: ${money(invoice.amountPaid)}`:null,invoice.advanceUsed>0?`Customer credit used: ${money(invoice.advanceUsed)}`:null,invoice.refundAmount>0?`Refunded amount: ${money(invoice.refundAmount)}`:null,!['Refunded','Cancelled'].includes(invoice.status)&&invoice.creditAmount>0?`Balance due: ${money(invoice.creditAmount)}`:null,invoice.changeAmount>0?`Change: ${money(invoice.changeAmount)}`:null,'',invoice.notes||null,settings.paymentInstructions?`Payment instructions:\n${settings.paymentInstructions}`:null,settings.invoiceTerms?`Terms & conditions:\n${settings.invoiceTerms}`:null,settings.taxRegistrationNumber?`Tax registration: ${settings.taxRegistrationNumber}`:null,'',settings.shopAddress||settings.address||null,settings.shopPhone||settings.phone||null,settings.shopEmail||settings.email||null,settings.receiptFooter??'Thank you for your business!'];
  return lines.filter(line=>line!==null).join('\n');
}
export function shareReceiptOnWhatsApp(invoice,settings,phone='') {
  const recipient=phone.replace(/\D/g,'');
  const url=`https://wa.me/${recipient}?text=${encodeURIComponent(buildReceiptMessage(invoice,settings))}`;
  window.open(url,'_blank','noopener,noreferrer');
}
