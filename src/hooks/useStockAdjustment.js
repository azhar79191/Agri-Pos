import { usePageUnsaved } from '../context/UnsavedChangesContext';
import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useStock } from "./useStock";

/**
 * useStockAdjustment — manages stock adjustment form state and submission.
 */
export function useStockAdjustment(fetchLevels, setStockLevels, stockLevels = []) {
  const { actions, state } = useApp();
  const { fetchLogs, fetchAlerts, adjust } = useStock();
  const isAdmin = actions.hasPermission('stock:manage');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType]   = useState("add");
  const [quantity, setQuantity]               = useState("");
  const [reason, setReason]                   = useState("");
  const [submitting, setSubmitting]           = useState(false);

  const handleAdjust = useCallback(async () => {
    if (!isAdmin) { actions.showToast({ message: "Only admin can adjust stock", type: "error" }); return; }
    if (!selectedProduct || quantity === "" || !reason.trim()) return;
    const count = Number(quantity);
    if (!Number.isSafeInteger(count) || count < (adjustmentType === "set" ? 0 : 1)) {
      actions.showToast({ message: "Enter a valid whole quantity", type: "error" }); return;
    }
    const selected = stockLevels.find(product => product._id === selectedProduct);
    if (adjustmentType === "set" && !selected) {
      actions.showToast({ message: "Refresh the stock list before setting a count", type: "error" }); return;
    }
    setSubmitting(true);
    try {
      await adjust({ product: selectedProduct, action: adjustmentType, quantity: count, reason: reason.trim(), ...(adjustmentType === "set" ? { expectedStock: selected.stock } : {}) });
      actions.showToast({ message: "Stock adjusted successfully", type: "success" });
      fetchLogs();
      fetchAlerts();
      fetchLevels().then((data) => { if (data) setStockLevels(data); }).catch(() => {});
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || err.message || "Adjustment failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [isAdmin, selectedProduct, adjustmentType, quantity, reason, adjust, fetchLogs, fetchAlerts, fetchLevels, setStockLevels, stockLevels, actions]);

  usePageUnsaved({dirty:quantity!==''||reason!=='',busy:submitting,onDiscard:()=>{setQuantity('');setReason('');setSelectedProduct(null);}});
  return {
    isAdmin,
    selectedProduct, setSelectedProduct,
    adjustmentType, setAdjustmentType,
    quantity, setQuantity,
    reason, setReason,
    submitting, handleAdjust,
  };
}
