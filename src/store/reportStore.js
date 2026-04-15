import { create } from "zustand";
import {
  getDashboard, getSalesReport, getTopProducts,
  getInventoryReport, getPaymentDistribution,
  getCustomerReport, exportReport,
} from "../api/reportsApi";

export const useReportStore = create((set) => ({
  dashboard: null,
  salesData: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getDashboard();
      const data = res.data.data;
      set({ dashboard: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchSalesReport: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await getSalesReport(params);
      const data = res.data.data;
      set({ salesData: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchTopProducts: async (params) => {
    set({ loading: true });
    try {
      const res = await getTopProducts(params);
      set({ loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchInventory: async () => {
    set({ loading: true });
    try {
      const res = await getInventoryReport();
      set({ loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchPaymentDistribution: async (params) => {
    set({ loading: true });
    try {
      const res = await getPaymentDistribution(params);
      set({ loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchCustomerReport: async (params) => {
    set({ loading: true });
    try {
      const res = await getCustomerReport(params);
      set({ loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed", loading: false });
    }
  },

  fetchExport: async (params) => {
    const res = await exportReport(params);
    return res.data;
  },
}));
