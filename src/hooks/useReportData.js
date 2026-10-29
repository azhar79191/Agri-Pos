import { reportSchemas } from '../utils/reportSchemas';
import { getSalesReport, getPaymentDistribution, getTopProducts, getInventoryReport } from '../api/reportsApi';
import useReportResource from './useReportResource';

const getDateParams = days => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - Number(days)); return {startDate:start.toISOString().slice(0,10),endDate:end.toISOString().slice(0,10)}; };
async function loadReport({type,...params}) {
  if (type === 'daily') {
    const [sales,payments] = await Promise.all([getSalesReport(params),getPaymentDistribution(params)]);
    const data=sales.data.data, distribution=payments.data.data;
    if (!data || !Array.isArray(data.salesData) || !Array.isArray(distribution?.distribution) || !['totalSales','invoiceCount','itemCount','avgOrderValue'].every(key=>Number.isFinite(data.summary?.[key]))) throw new Error('The report response was incomplete.');
    const s=data.summary||{};
    return {summary:{totalSales:s.totalSales||0,totalTransactions:s.invoiceCount||0,avgOrderValue:s.avgOrderValue||0,totalItems:s.itemCount||0},dailySalesData:(data.salesData||[]).map(d=>({date:new Date(d._id.year,(d._id.month||1)-1,d._id.day||1).toLocaleDateString('en-PK',{month:'short',day:'numeric'}),sales:d.totalSales||0})),paymentMethodData:(distribution.distribution||[]).map(d=>({name:d._id,value:d.total}))};
  }
  if(type==='products'){const d=(await getTopProducts(params)).data.data;if(!Array.isArray(d?.topProducts||d))throw new Error('The report response was incomplete.');return {topProducts:d.topProducts||d};}
  const d=(await getInventoryReport()).data.data;if(!reportSchemas.inventory(d))throw new Error('The report response was incomplete.');return {inventoryData:{products:d.products||[],lowStock:(d.products||[]).filter(p=>p.status==='Low Stock'),outOfStock:d.summary?.outOfStockCount||0}};
}
export function useReportData(type='daily',days='7') {
  const result=useReportResource(loadReport,{type,...getDateParams(days)}), data=result.data||{};
  return {...result,summary:data.summary||{totalSales:0,totalTransactions:0,avgOrderValue:0,totalItems:0},dailySalesData:data.dailySalesData||[],paymentMethodData:data.paymentMethodData||[],topProducts:data.topProducts||[],inventoryData:data.inventoryData||{},getDateParams};
}
