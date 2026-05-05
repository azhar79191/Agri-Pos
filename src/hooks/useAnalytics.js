import { useState, useEffect } from "react";
import { getAnalytics } from "../api/reportsApi";

/**
 * useAnalytics — fetches analytics data for the Analytics dashboard page.
 */
export function useAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
