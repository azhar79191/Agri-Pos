import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { getCustomers, depositCredit } from "../api/customersApi";

const LIMIT = 15;

/**
 * useCustomerDues — fetches customers with outstanding credit and handles deposit collection.
 */
export function useCustomerDues() {
  const { state, actions } = useApp();
  const { settings }       = state;

  const [dues, setDues]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  const fetchDues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, hasCredit: "true" };
      if (search) params.search = search;
      const res        = await getCustomers(params);
      const data       = res.data.data;
      const customers  = Array.isArray(data) ? data : data?.customers ?? data?.docs ?? [];
      const pagination = data?.pagination ?? {};
      const withDues   = customers.filter((c) => (c.creditBalance || 0) > 0);
      setDues(withDues);
      setTotal(pagination.total ?? withDues.length);
      setTotalPages(pagination.pages ?? Math.ceil(withDues.length / LIMIT));
    } catch {
      actions.showToast({ message: "Failed to load customer dues", type: "error" });
    } finally { setLoading(false); }
  }, [page, search, actions]);

  useEffect(() => { fetchDues(); }, [page, search]); // eslint-disable-line

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { actions.showToast({ message: "Enter valid amount", type: "error" }); return; }
    setDepositing(true);
    try {
      await depositCredit(depositModal._id, { amount });
      actions.showToast({ message: `${settings.currency} ${amount} deposited for ${depositModal.name}`, type: "success" });
      setDepositModal(null);
      setDepositAmount("");
      fetchDues();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Deposit failed", type: "error" });
    } finally { setDepositing(false); }
  }, [depositAmount, depositModal, settings.currency, actions, fetchDues]);

  const totalDue     = dues.reduce((s, d) => s + (d.creditBalance || 0), 0);
  const overdueCount = dues.filter((d) => (d.creditBalance || 0) > 5000).length;

  return {
    dues, loading, page, setPage, totalPages, total,
    search, setSearch,
    depositModal, setDepositModal,
    depositAmount, setDepositAmount,
    depositing, handleDeposit,
    totalDue, overdueCount,
    settings,
  };
}
