import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getInvoices, getInvoice, createInvoice, updateInvoiceStatus, getTodaySales, getRecentTransactions } from "../api/invoicesApi";

let requestVersion = 0;

export const useInvoiceStore = create(
  persist(
    (set, get) => ({
      invoices: [],
      loading: false,
      error: null,
      pagination: { page: 1, pages: 0, total: 0 },
      lastParams: {},

      fetchInvoices: async (params) => {
        const version = ++requestVersion;
        const query = params ?? get().lastParams;
        set({ loading: true, error: null, lastParams: query });
        try {
          const res = await getInvoices(query);
          if (version !== requestVersion) return;
          const data = res.data.data;
          set({ invoices: Array.isArray(data) ? data : data?.invoices ?? data?.docs ?? [], pagination: data?.pagination ?? { page: 1, pages: 1, total: Array.isArray(data) ? data.length : 0 }, loading: false });
          return res.data;
        } catch (err) {
          if (version !== requestVersion) return;
          set({ invoices: [], pagination: { page: 1, pages: 0, total: 0 }, error: err.response?.data?.message || "Failed to fetch invoices", loading: false });
        }
      },

      fetchInvoice: async (id) => {
        const res = await getInvoice(id);
        return res.data.data;
      },

      addInvoice: async (data) => {
        const res = await createInvoice(data);
        const invoice = res.data.data?.invoice ?? res.data.data;
        set((s) => ({ invoices: [invoice, ...s.invoices] }));
        return invoice;
      },

      changeStatus: async (id, status) => {
        const res = await updateInvoiceStatus(id, status);
        const invoice = res.data.data?.invoice ?? res.data.data;
        set((s) => ({ invoices: s.invoices.map((inv) => (inv._id === id ? invoice : inv)) }));
        return invoice;
      },

      fetchTodaySales: async () => (await getTodaySales()).data.data,
      fetchRecentTransactions: async () => (await getRecentTransactions()).data.data,
    }),
    { name: "pos-invoices", version: 2, migrate: () => ({}), partialize: () => ({}) }
  )
);

window.addEventListener("business-session-reset", () => { requestVersion += 1; useInvoiceStore.setState(useInvoiceStore.getInitialState(), true); });
