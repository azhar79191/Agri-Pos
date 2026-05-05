import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "./useInvoices";
import { refundInvoice, deleteInvoice } from "../api/invoicesApi";

/**
 * useInvoiceActions — manages refund, delete, and status-change operations for InvoiceManagement.
 */
export function useInvoiceActions() {
  const { actions } = useApp();
  const { fetchInvoices, changeStatus } = useInvoices();

  const [refundTarget, setRefundTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [statusTarget, setStatusTarget]   = useState(null);
  const [refunding, setRefunding]         = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleRefund = useCallback(async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await refundInvoice(refundTarget._id);
      actions.showToast({ message: `Invoice #${refundTarget.invoiceNumber} refunded`, type: "success" });
      fetchInvoices();
      setRefundTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Refund failed", type: "error" });
    } finally { setRefunding(false); }
  }, [refundTarget, actions, fetchInvoices]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget._id);
      actions.showToast({ message: `Invoice #${deleteTarget.invoiceNumber} deleted`, type: "success" });
      fetchInvoices();
      setDeleteTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    } finally { setDeleting(false); }
  }, [deleteTarget, actions, fetchInvoices]);

  const confirmStatus = useCallback(async () => {
    if (!statusTarget) return;
    setUpdatingStatus(true);
    try {
      await changeStatus(statusTarget.invoice._id, statusTarget.newStatus);
      actions.showToast({ message: `Invoice marked as ${statusTarget.newStatus}`, type: "success" });
      fetchInvoices();
      setStatusTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally { setUpdatingStatus(false); }
  }, [statusTarget, actions, fetchInvoices, changeStatus]);

  return {
    refundTarget, setRefundTarget, refunding, handleRefund,
    deleteTarget, setDeleteTarget, deleting, handleDelete,
    statusTarget, setStatusTarget, updatingStatus, confirmStatus,
  };
}
