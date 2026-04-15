import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getCustomers, createCustomer, updateCustomer,
  deleteCustomer, updateCustomerCredit,
} from "../api/customersApi";

const CustomersContext = createContext();

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers(params);
      const data = res.data.data;
      setCustomers(Array.isArray(data) ? data : data?.customers ?? data?.docs ?? []);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = async (data) => {
    const res = await createCustomer(data);
    setCustomers((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const editCustomer = async (id, data) => {
    const res = await updateCustomer(id, data);
    setCustomers((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
    return res.data.data;
  };

  const removeCustomer = async (id) => {
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c._id !== id));
  };

  const editCredit = async (id, data) => {
    const res = await updateCustomerCredit(id, data);
    setCustomers((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
    return res.data.data;
  };

  return (
    <CustomersContext.Provider value={{ customers, loading, error, fetchCustomers, addCustomer, editCustomer, removeCustomer, editCredit }}>
      {children}
    </CustomersContext.Provider>
  );
}

export const useCustomers = () => {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
};
