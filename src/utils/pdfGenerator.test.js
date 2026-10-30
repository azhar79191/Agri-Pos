import {expect,it} from 'vitest';
import {generateInvoicePDF} from './pdfGenerator';
it.each(['standard','letterhead','minimal','compact'])('generates a paginated %s PDF without clipping totals after long invoices',async template=>{
 const doc=await generateInvoicePDF({invoiceNumber:'TEST-1',customerName:'Sample customer',subtotal:10000,total:0,grandTotal:10000,taxAmount:0,items:Array.from({length:65},(_,i)=>({productName:`Agricultural product ${i+1}`,quantity:2,unitPrice:100,total:200}))},{shopName:'Sample Company',receiptTemplate:template,brandColor:'#047857',receiptFooter:'Thank you for your business.'});
 expect(doc.getNumberOfPages()).toBeGreaterThan(1);
 const output=doc.output();expect(output).toContain('TEST-1');expect(output).toContain('(Rs. 0.00)');
 for(let page=1;page<=doc.getNumberOfPages();page++){
  expect(doc.internal.pages[page].join(' ')).toContain(`${page} / ${doc.getNumberOfPages()}`);
 }
});

it('paginates long configurable terms after totals and includes notes and refund details',async()=>{
 const doc=await generateInvoicePDF({invoiceNumber:'REF-1',createdAt:'2026-01-15',status:'Refunded',paymentStatus:'Paid',total:100,refundAmount:100,items:[],notes:'Customer note'},{shopName:'Company',receiptTemplate:'compact',documentDateFormat:'iso',taxRegistrationNumber:'TAX-1',paymentInstructions:'Account 123',invoiceTerms:('Detailed company terms and conditions.\n').repeat(45)+'END TERMS'});
 const content=doc.output();expect(content).toContain('TERMS & CONDITIONS');expect(content).toContain('END TERMS');expect(content).toContain('Refunded');expect(content).toContain('Account 123');expect(content).toContain('TAX-1');expect(doc.getNumberOfPages()).toBeGreaterThan(1);
});
