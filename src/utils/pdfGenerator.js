import { documentDate, documentStatus } from './documentSettings';
import { companyName } from './company';
import { themePalette } from './theme';
import { normalizeInvoiceItems } from './normalizeInvoiceItems';

async function pdfLogo(source) {
  if (source?.startsWith('data:image/')) return source;
  if (!/^https:\/\//i.test(source || '') || typeof Image === 'undefined') return '';
  return new Promise(resolve => {
    const image = new Image(); image.crossOrigin='anonymous';
    const timer=setTimeout(()=>resolve(''),5000);
    image.onerror=()=>{clearTimeout(timer);resolve('');};
    image.onload=()=>{
      clearTimeout(timer);
      try { const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const context=canvas.getContext('2d');const scale=Math.min(256/image.width,256/image.height);context.drawImage(image,(256-image.width*scale)/2,(256-image.height*scale)/2,image.width*scale,image.height*scale);resolve(canvas.toDataURL('image/png')); }
      catch {resolve('');}
    };
    image.src=source;
  });
}

const buildDoc = async (invoice, settings = {}) => {
  const [{default:jsPDF},{default:autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
  const compact=settings.receiptTemplate==='compact', minimal=settings.receiptTemplate==='minimal', letterhead=settings.receiptTemplate==='letterhead';
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:compact?'a5':'a4'});
  const width=doc.internal.pageSize.getWidth(),height=doc.internal.pageSize.getHeight(),margin=compact?10:17;
  const brand=themePalette(settings.brandColor),money=v=>`${settings.currency||'Rs.'} ${Number(v||0).toFixed(2)}`;
  const name=companyName(settings), logo=await pdfLogo(settings.brandLogo||settings.shopLogo);
  let logoWidth=0;
  if(logo?.startsWith('data:image/')) {try{const properties=doc.getImageProperties(logo);const w=14*properties.width/properties.height;doc.addImage(logo,properties.fileType,margin,16,Math.min(w,22),14);logoWidth=Math.min(w,22)+5;}catch{/* Invalid logos do not prevent an invoice download. */}}
  doc.setFillColor(...brand.rgb);
  if(!minimal&&!letterhead)doc.rect(0,0,width,3,'F');
  doc.setTextColor(23,32,51);doc.setFont(letterhead?'times':'helvetica','bold');doc.setFontSize(compact?16:21);
  const titleWidth=width-2*margin-logoWidth-(compact?37:51);
  const companyLines=doc.splitTextToSize(name,Math.max(30,titleWidth));
  doc.text(companyLines,margin+logoWidth,21);
  let y=Math.max(34,23+(companyLines.length-1)*8);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(100,116,139);
  if(settings.brandTagline){const lines=doc.splitTextToSize(settings.brandTagline,width-2*margin);doc.text(lines,margin,y);y+=lines.length*4+3;}
  doc.setFontSize(compact?17:23);doc.setTextColor(...(letterhead?brand.rgb:[23,32,51]));doc.text('INVOICE',width-margin,21,{align:'right'});
  doc.setFontSize(9);doc.setTextColor(100,116,139);doc.text(`#${invoice.invoiceNumber||invoice.id||invoice._id||''}`,width-margin,28,{align:'right'});
  doc.setDrawColor(...(minimal?[203,213,225]:brand.rgb));doc.setLineWidth(letterhead?.3:.6);doc.line(margin,y,width-margin,y);y+=7;
  doc.setFontSize(8);
  for(const contact of [settings.shopAddress||settings.address,settings.shopPhone||settings.phone,settings.shopEmail||settings.email,settings.taxRegistrationNumber?`Tax registration: ${settings.taxRegistrationNumber}`:null].filter(Boolean)){
    const lines=doc.splitTextToSize(String(contact),width-2*margin);doc.text(lines,margin,y);y+=lines.length*4;
  }
  y+=10;
  doc.setTextColor(100,116,139);doc.setFontSize(8);doc.setFont('helvetica','bold');doc.text('BILLED TO',margin,y);
  const rightX=width/2+5;doc.text('INVOICE DETAILS',rightX,y);y+=7;
  const customer=doc.splitTextToSize(invoice.customerName||invoice.customer?.name||'Walk-in Customer',width/2-margin-8);
  doc.setFontSize(10);doc.setTextColor(23,32,51);doc.text(customer,margin,y);
  let customerY=y+customer.length*5;
  doc.setFont('helvetica','normal');doc.setFontSize(8);
  for(const contact of [invoice.customerPhone||invoice.customer?.phone,invoice.customerAddress||invoice.customer?.address].filter(Boolean)){
    const lines=doc.splitTextToSize(String(contact),width/2-margin-8);doc.text(lines,margin,customerY);customerY+=lines.length*4;
  }
  const date=documentDate(invoice.createdAt||invoice.date,settings);
  const details=[['Issue date',date],['Payment',invoice.paymentMethod||'Cash'],['Status',documentStatus(invoice)]];
  for(const [label,value] of details){doc.setTextColor(100,116,139);doc.text(label,rightX,y);doc.setTextColor(23,32,51);const lines=doc.splitTextToSize(String(value),width-rightX-margin-22);doc.text(lines,width-margin,y,{align:'right'});y+=Math.max(6,lines.length*4);}
  y=Math.max(y,customerY)+10;
  autoTable(doc,{
    startY:y,head:[['Description','Qty','Rate','Amount']],
    body:normalizeInvoiceItems(invoice.items).map(item=>[item.name+(item.sku?`\nSKU ${item.sku}`:''),`${item.quantity}${item.unit?' '+item.unit:''}`,money(item.price),money(item.total)]),
    theme:'plain',styles:{font:'helvetica',fontSize:compact?8:9,cellPadding:compact?3:4,overflow:'linebreak',lineColor:[226,232,240],lineWidth:{bottom:.2}},
    headStyles:{fillColor:minimal?[255,255,255]:letterhead?[241,245,249]:brand.rgb,textColor:minimal||letterhead?[23,32,51]:brand.foreground==='#ffffff'?255:[16,34,27],fontStyle:'bold'},
    columnStyles:{0:{cellWidth:'auto'},1:{halign:'right',cellWidth:compact?16:22},2:{halign:'right',cellWidth:compact?27:35},3:{halign:'right',cellWidth:compact?28:38}},
    margin:{left:margin,right:margin,top:15,bottom:28},rowPageBreak:'avoid',
  });
  y=doc.lastAutoTable.finalY+10;
  const rows=[['Subtotal',money(invoice.subtotal)],...(Number(invoice.discount)>0?[['Discount',`- ${money(invoice.discount)}`]]:[]),['Tax',money(invoice.taxAmount??invoice.tax)],['Total',money(invoice.total??invoice.grandTotal),true],...(invoice.amountPaid!=null?[['Amount paid',money(invoice.amountPaid)]]:[]),...(invoice.advanceUsed>0?[['Customer credit used',money(invoice.advanceUsed)]]:[]),...(invoice.refundAmount>0?[['Refunded amount',money(invoice.refundAmount)]]:[]),...(!['Refunded','Cancelled'].includes(invoice.status)&&invoice.creditAmount>0?[['Balance due',money(invoice.creditAmount)]]:[]),...(invoice.changeAmount>0?[['Change',money(invoice.changeAmount)]]:[])];
  const note=doc.splitTextToSize(settings.receiptFooter??'Thank you for your business.',width-2*margin);
  const needed=rows.length*8+15;
  if(y+needed>height-28){doc.addPage();y=22;}
  for(const [label,value,bold] of rows){
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(bold?14:9);
    if(bold){doc.setDrawColor(...brand.rgb);doc.line(width/2,y-4,width-margin,y-4);y+=3;}
    doc.setTextColor(100,116,139);doc.text(label,width/2,y);doc.setTextColor(...(bold?brand.rgb:[23,32,51]));doc.text(value,width-margin,y,{align:'right'});y+=bold?11:8;
  }
  y+=5;
  const writeNote=(text,heading='')=>{
    if(!text)return;
    doc.setFontSize(8);doc.setTextColor(100,116,139);
    const lines=doc.splitTextToSize(String(text),width-2*margin);
    if(y+15>height-28){doc.addPage();y=22;}
    if(heading){doc.setFont('helvetica','bold');doc.text(heading,margin,y);y+=6;}
    doc.setFont('helvetica','normal');
    for(const line of lines){if(y>height-28){doc.addPage();y=22;}doc.text(line,margin,y);y+=4;}
    y+=6;
  };
  writeNote(note.join('\n'));
  writeNote(invoice.notes,'INVOICE NOTES');
  writeNote(settings.paymentInstructions,'PAYMENT INSTRUCTIONS');
  writeNote(settings.invoiceTerms,'TERMS & CONDITIONS');
  const pages=doc.getNumberOfPages();
  for(let page=1;page<=pages;page++){
    doc.setPage(page);doc.setDrawColor(226,232,240);doc.line(margin,height-19,width-margin,height-19);doc.setFontSize(8);doc.setTextColor(100,116,139);
    doc.text(doc.splitTextToSize(name,width-2*margin-25)[0],margin,height-13);doc.text(`${page} / ${pages}`,width-margin,height-13,{align:'right'});
  }
  return doc;
};
export const downloadInvoicePDF=async(invoice,settings)=>{const doc=await buildDoc(invoice,settings);doc.save(`Invoice-${invoice.invoiceNumber||invoice.id||invoice._id}.pdf`);};
export const printInvoicePDF=async(invoice,settings)=>{const doc=await buildDoc(invoice,settings);const url=URL.createObjectURL(doc.output('blob'));const win=window.open(url);win?.print();setTimeout(()=>URL.revokeObjectURL(url),10000);};
export const generateInvoicePDF=buildDoc;
