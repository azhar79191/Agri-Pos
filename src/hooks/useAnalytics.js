import { reportSchemas } from '../utils/reportSchemas';
import { getAnalytics } from '../api/reportsApi';
import useReportResource from './useReportResource';
export function useAnalytics(dateRange) {
  const params = dateRange?.start && dateRange?.end ? {startDate:dateRange.start,endDate:dateRange.end} : {};
  const {data,loading,error,retry} = useReportResource(getAnalytics,params,reportSchemas.analytics);
  return {loading,error,retry,salesData:data?.salesData||[],categoryData:data?.categoryData||[],currentMonthSales:data?.currentMonthSales||0,growthRate:data?.growthRate||0,totalCustomers:data?.totalCustomers||0,totalInvoices:data?.totalInvoices||0};
}
