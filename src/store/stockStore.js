import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStockLogs, getStockAlerts, getStockLevels, getStockSummary, adjustStock, bulkAdjustStock } from "../api/stockApi";
import { useProductStore } from "./productStore";

export const useStockStore = create(
  persist(
    (set) => ({
      logs: [],
      alerts: [],
      loading: false,
      error: null,

      fetchLogs: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await getStockLogs(params);
          const data = res.data.data;
          set({ logs: Array.isArray(data) ? data : data?.logs ?? data?.docs ?? [], loading: false });
          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed to fetch stock logs", loading: false });
        }
      },

      fetchAlerts: async () => {
        try {
          const res = await getStockAlerts();
          const data = res.data.data;
          const alerts = Array.isArray(data) ? data : data?.lowStock?.products ?? data?.alerts ?? [];
          set({ alerts });
          return alerts;
        } catch { return []; }
      },

      fetchLevels: async () => {
        const res = await getStockLevels();
        const data = res.data.data;
        return Array.isArray(data) ? data : data?.products ?? [];
      },

      fetchSummary: async () => (await getStockSummary()).data.data,

      adjust: async (data) => {
        const res = await adjustStock(data);
        const result = res.data.data;
        if (result?.product?._id) useProductStore.getState().editProduct(result.product._id, result.product);
        return result;
      },

      bulkAdjust: async (data) => {
        const res = await bulkAdjustStock(data);
        await useProductStore.getState().fetchProducts();
        return res.data.data;
      },
    }),
    { name: "pos-stock", partialize: (s) => ({ logs: s.logs, alerts: s.alerts }) }
  )
);
