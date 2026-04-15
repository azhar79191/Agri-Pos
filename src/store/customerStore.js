import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, updateCustomerCredit, depositCredit } from "../api/customersApi";

export const useCustomerStore = create(
  persist(
    (set) => ({
      customers: [],
      loading: false,
      error: null,

      fetchCustomers: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await getCustomers(params);
          const data = res.data.data;
          set({ customers: Array.isArray(data) ? data : data?.customers ?? data?.docs ?? [], loading: false });
          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed to fetch customers", loading: false });
        }
      },

      addCustomer: async (data) => {
        const res = await createCustomer(data);
        const customer = res.data.data?.customer ?? res.data.data;
        set((s) => ({ customers: [customer, ...s.customers] }));
        return customer;
      },

      editCustomer: async (id, data) => {
        const res = await updateCustomer(id, data);
        const customer = res.data.data?.customer ?? res.data.data;
        set((s) => ({ customers: s.customers.map((c) => (c._id === id ? customer : c)) }));
        return customer;
      },

      removeCustomer: async (id) => {
        await deleteCustomer(id);
        set((s) => ({ customers: s.customers.filter((c) => c._id !== id) }));
      },

      editCredit: async (id, data) => {
        const res = await updateCustomerCredit(id, data);
        const customer = res.data.data?.customer ?? res.data.data;
        set((s) => ({ customers: s.customers.map((c) => (c._id === id ? customer : c)) }));
        return customer;
      },

      deposit: async (id, data) => {
        const res = await depositCredit(id, data);
        const customer = res.data.data?.customer ?? res.data.data;
        set((s) => ({ customers: s.customers.map((c) => (c._id === id ? { ...c, ...customer } : c)) }));
        return customer;
      },

      deductCredit: (customerId, amount) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c._id === customerId ? { ...c, creditBalance: (c.creditBalance ?? 0) - amount } : c
          ),
        }));
      },
    }),
    { name: "pos-customers", partialize: (s) => ({ customers: s.customers }) }
  )
);
