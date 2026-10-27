import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  getCustomers, getCustomer, createCustomer, updateCustomer,
  deleteCustomer, updateCustomerCredit,
} from "../api/customersApi";

const CustomersContext = createContext();

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    const reset = () => { requestVersion.current++; setLoading(false); setCustomers([]); setError(null); };
    window.addEventListener("business-session-reset", reset);
    return () => window.removeEventListener("business-session-reset", reset);
  }, []);

  const fetchCustomers = useCallback(async (params) => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers(params);
      if (version !== requestVersion.current) return;
      const data = res.data.data;
      setCustomers(Array.isArray(data) ? data : data?.customers ?? data?.docs ?? []);
      return res.data;
    } catch (err) {
      if (version === requestVersion.current) setError(err.response?.data?.message || "Failed to fetch customers");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  // Re-fetch a single customer from backend and update in local list
  const refreshCustomer = useCallback(async (id) => {
    try {
      const res = await getCustomer(id);
      const updated = res.data.data?.customer ?? res.data.data;
      setCustomers(prev => prev.map(c => c._id === id ? updated : c));
      return updated;
    } catch { /* silent */ }
  }, []);

  const addCustomer = async (data) => {
    const res = await createCustomer(data);
    const customer = res.data.data?.customer ?? res.data.data;
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  };

  const editCustomer = async (id, data) => {
    const res = await updateCustomer(id, data);
    const customer = res.data.data?.customer ?? res.data.data;
    setCustomers((prev) => prev.map((c) => (c._id === id ? customer : c)));
    return customer;
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
    <CustomersContext.Provider value={{ customers, loading, error, fetchCustomers, refreshCustomer, addCustomer, editCustomer, removeCustomer, editCredit }}>
      {children}
    </CustomersContext.Provider>
  );
}

export const useCustomers = () => {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
};
