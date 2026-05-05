import { useState, useEffect, useCallback } from "react";
import { getAnalytics } from "../api/reportsApi";

export function useAnalytics(dateRange) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = dateRange?.start && dateRange?.end ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    getAnalytics(params)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateRange?.start, dateRange?.end]); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  return {
    loading,
    salesData:           data?.salesData           || [],
    categoryData:        data?.categoryData         || [],
    currentMonthSales:   data?.currentMonthSales    || 0,
    growthRate:          data?.growthRate           || 0,
    totalCustomers:      data?.totalCustomers       || 0,
    totalInvoices:       data?.totalInvoices        || 0,
  };
}
