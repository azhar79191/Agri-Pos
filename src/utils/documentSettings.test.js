// @vitest-environment jsdom
import {expect,it,vi,afterEach} from 'vitest';
import {documentSettings,documentDate,documentStatus} from './documentSettings';
import {buildReceiptMessage,shareReceiptOnWhatsApp} from './whatsappShare';
afterEach(()=>vi.restoreAllMocks());
it('uses the configured timezone and date format without shifting date-only values',()=>{
 expect(documentDate('2026-01-15T23:30:00Z',{documentTimezone:'Asia/Karachi',documentDateFormat:'iso'})).toBe('2026-01-16');
 expect(documentDate('2026-01-15',{documentTimezone:'America/Los_Angeles',documentDateFormat:'short'})).toBe('15/01/2026');
 expect(documentDate('invalid')).toBe('—');expect(documentDate('2026-01-15')).toBe('15 Jan 2026');
});
it('resets document defaults per company and preserves intentional blank fields',()=>{
 expect(documentSettings({receiptTemplate:'minimal',invoiceTerms:'',emailFooter:''})).toMatchObject({receiptTemplate:'minimal',invoiceTerms:'',emailFooter:''});
 expect(documentSettings({})).toMatchObject({receiptTemplate:'standard',invoiceTerms:''});
});
it('prioritizes refunded status and uses backend total fields without replacing zero',()=>{
 const invoice={invoiceNumber:'INV-1',status:'Refunded',paymentStatus:'Paid',createdAt:'2026-01-15',total:0,grandTotal:999,taxAmount:0,tax:999,refundAmount:50,creditAmount:20,amountPaid:50,items:[]};
 expect(documentStatus(invoice)).toBe('Refunded');
 const text=buildReceiptMessage(invoice,{shopName:'Company',invoiceTerms:'Custom terms',paymentInstructions:'Account 123',taxRegistrationNumber:'ABC'});
 expect(text).toContain('Status: Refunded');expect(text).toContain('*Total: Rs. 0.00*');expect(text).toContain('Tax: Rs. 0.00');expect(text).not.toContain('Balance due:');expect(text).toContain('Refunded amount: Rs. 50.00');expect(text).toContain('Custom terms');expect(text).not.toContain('Premium Pesticide');
});
it('only opens a WhatsApp compose link when explicitly requested',()=>{
 const open=vi.spyOn(window,'open').mockImplementation(()=>null);
 buildReceiptMessage({items:[]},{});expect(open).not.toHaveBeenCalled();
 shareReceiptOnWhatsApp({invoiceNumber:'1',items:[]},{shopName:'A'},'+92 300 1234567');
 expect(open.mock.calls[0][0]).toMatch(/^https:\/\/wa.me\/923001234567\?text=/);
});
