import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getDashboard, getSalesReport, getTopProducts,
  getInventoryReport, getPaymentDistribution,
  getCustomerReport, exportReport,
} from "../api/reportsApi";

/** Shared error handler — extracts message from axios error */
const errMsg = (err) => err.response?.data?.message || "Failed to load data";

export const useReportStore = create(
  persist(
    (set) => ({
      dashboard: null,
      salesData: null,
      loading: false,
      error: null,

      fetchDashboard: async () => {
        set({ loading: true, error: null });
        try {
          const data = (await getDashboard()).data.data;
          set({ dashboard: data, loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchSalesReport: async (params) => {
        set({ loading: true, error: null });
        try {
          const data = (await getSalesReport(params)).data.data;
          set({ salesData: data, loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchTopProducts: async (params) => {
        set({ loading: true, error: null });
        try {
          const data = (await getTopProducts(params)).data.data;
          set({ loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchInventory: async () => {
        set({ loading: true, error: null });
        try {
          const data = (await getInventoryReport()).data.data;
          set({ loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchPaymentDistribution: async (params) => {
        set({ loading: true, error: null });
        try {
          const data = (await getPaymentDistribution(params)).data.data;
          set({ loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchCustomerReport: async (params) => {
        set({ loading: true, error: null });
        try {
          const data = (await getCustomerReport(params)).data.data;
          set({ loading: false });
          return data;
        } catch (err) {
          set({ error: errMsg(err), loading: false });
        }
      },

      fetchExport: async (params) => (await exportReport(params)).data,
    }),
    { name: "pos-reports", partialize: (s) => ({ dashboard: s.dashboard, salesData: s.salesData }) }
  )
);
