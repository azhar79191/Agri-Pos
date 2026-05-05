import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useStock } from "./useStock";

/**
 * useStockAdjustment — manages stock adjustment form state and submission.
 */
export function useStockAdjustment(fetchLevels, setStockLevels) {
  const { actions, state } = useApp();
  const { fetchLogs, fetchAlerts, adjust } = useStock();
  const isAdmin = state.currentUser?.role === "admin";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType]   = useState("add");
  const [quantity, setQuantity]               = useState("");
  const [reason, setReason]                   = useState("");
  const [submitting, setSubmitting]           = useState(false);

  const handleAdjust = useCallback(async () => {
    if (!isAdmin) { actions.showToast({ message: "Only admin can adjust stock", type: "error" }); return; }
    if (!selectedProduct || !quantity || !reason) return;
    setSubmitting(true);
    try {
      await adjust({ product: selectedProduct, action: adjustmentType, quantity: parseInt(quantity), reason });
      actions.showToast({ message: "Stock adjusted successfully", type: "success" });
      fetchLogs();
      fetchAlerts();
      fetchLevels().then((data) => { if (data) setStockLevels(data); }).catch(() => {});
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Adjustment failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [isAdmin, selectedProduct, adjustmentType, quantity, reason, adjust, fetchLogs, fetchAlerts, fetchLevels, setStockLevels, actions]);

  return {
    isAdmin,
    selectedProduct, setSelectedProduct,
    adjustmentType, setAdjustmentType,
    quantity, setQuantity,
    reason, setReason,
    submitting, handleAdjust,
  };
}
