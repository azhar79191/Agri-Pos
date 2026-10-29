import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { getBatches, createBatch } from "../api/batchesApi";
import { usePaginatedApi } from "./usePaginatedApi";
import { EMPTY_BATCH_FORM } from "../constants/batches";

/**
 * useBatches — manages batch list fetching and add form for BatchExpiry page.
 */
export function useBatches() {
  const { actions } = useApp();
  const { data: batches, loading, error, refresh: reload, page, total, totalPages, setPage, filters, setFilter, setFilters } = usePaginatedApi(getBatches, { search: "", status: "" }, 15);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_BATCH_FORM);


  const handleAdd = useCallback(async () => {
    if (!form.productName || !form.batchNo || !form.expiryDate) {
      actions.showToast({ message: "Fill required fields", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await createBatch({
        ...form,
        quantity:  parseInt(form.quantity)  || 0,
        costPrice: parseFloat(form.costPrice) || 0,
      });
      reload();
      setShowModal(false);
      setForm(EMPTY_BATCH_FORM);
      actions.showToast({ message: "Batch added successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add batch", type: "error" });
    } finally { setSaving(false); }
  }, [form, actions, reload]);

  return { batches, loading, error, reload, page, total, totalPages, setPage, filters, setFilter, setFilters, showModal, setShowModal, saving, form, setForm, handleAdd };
}
