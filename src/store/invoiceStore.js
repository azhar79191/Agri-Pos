import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getInvoices, getInvoice, createInvoice, updateInvoiceStatus, getTodaySales, getRecentTransactions } from "../api/invoicesApi";

export const useInvoiceStore = create(
  persist(
    (set) => ({
      invoices: [],
      loading: false,
      error: null,

      fetchInvoices: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await getInvoices(params);
          const data = res.data.data;
          set({ invoices: Array.isArray(data) ? data : data?.invoices ?? data?.docs ?? [], loading: false });
          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed to fetch invoices", loading: false });
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
    { name: "pos-invoices", partialize: (s) => ({ invoices: s.invoices }) }
  )
);
