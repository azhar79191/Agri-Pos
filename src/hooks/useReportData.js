import { useState, useCallback } from "react";
import { useReports } from "./useReports";

/**
 * useReportData — fetches and transforms report data for the Reports page.
 */
export function useReportData() {
  const { fetchSalesReport, fetchTopProducts, fetchInventory, fetchPaymentDistribution, loading } = useReports();

  const [summary, setSummary]               = useState({ totalSales: 0, totalTransactions: 0, avgOrderValue: 0, totalItems: 0 });
  const [dailySalesData, setDailySalesData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [topProducts, setTopProducts]       = useState([]);
  const [inventoryData, setInventoryData]   = useState({ products: [], lowStock: [], outOfStock: 0 });

  const getDateParams = useCallback((dateRange) => {
    const end   = new Date().toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return { startDate: start.toISOString().split("T")[0], endDate: end };
  }, []);

  const loadSalesReport = useCallback(async (params) => {
    const data = await fetchSalesReport(params);
    if (!data) return;
    const s = data.summary || {};
    setSummary({ totalSales: s.totalSales || 0, totalTransactions: s.invoiceCount || 0, avgOrderValue: s.avgOrderValue || 0, totalItems: s.itemCount || 0 });
    setDailySalesData((data.salesData || []).map((d) => ({
      date:  new Date(d._id.year, (d._id.month || 1) - 1, d._id.day || 1).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      sales: d.totalSales || 0,
    })));
  }, [fetchSalesReport]);

  const loadPaymentDistribution = useCallback(async (params) => {
    const data = await fetchPaymentDistribution(params);
    if (!data) return;
    setPaymentMethodData((data.distribution || []).map((d) => ({ name: d._id, value: d.total })));
  }, [fetchPaymentDistribution]);

  const loadTopProducts = useCallback(async (params) => {
    const data = await fetchTopProducts(params);
    if (data) setTopProducts(data.topProducts || data);
  }, [fetchTopProducts]);

  const loadInventory = useCallback(async () => {
    const data = await fetchInventory();
    if (!data) return;
    setInventoryData({
      products:   data.products || [],
      lowStock:   (data.products || []).filter((p) => p.status === "Low Stock"),
      outOfStock: data.summary?.outOfStockCount || 0,
    });
  }, [fetchInventory]);

  return {
    loading,
    summary, dailySalesData, paymentMethodData, topProducts, inventoryData,
    getDateParams, loadSalesReport, loadPaymentDistribution, loadTopProducts, loadInventory,
  };
}
