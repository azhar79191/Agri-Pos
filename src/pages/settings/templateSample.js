export const TEMPLATE_SAMPLE = {
  invoiceNumber:'PREVIEW-001',createdAt:'2026-01-15T10:30:00Z',customerName:'Ayesha Farms',customerPhone:'+92 300 1234567',customerAddress:'18 Garden Road, Lahore',
  status:'Completed',paymentMethod:'Cash',processedByName:'Sales team',subtotal:5000,discount:250,taxAmount:237.5,taxRate:5,total:4987.5,amountPaid:4987.5,
  items:[{name:'Crop nutrition blend',sku:'CN-100',quantity:2,unitPrice:1850,total:3700},{name:'Garden care essentials',sku:'GC-200',quantity:1,unitPrice:1300,total:1300}],
};

export function templateSample(scenario='paid') {
  if(scenario==='partial')return {...TEMPLATE_SAMPLE,paymentMethod:'Credit',paymentStatus:'Partial',amountPaid:2000,creditAmount:2987.5};
  if(scenario==='refunded')return {...TEMPLATE_SAMPLE,status:'Refunded',paymentStatus:'Paid',refundAmount:4987.5,creditAmount:0};
  return {...TEMPLATE_SAMPLE,paymentStatus:'Paid'};
}
