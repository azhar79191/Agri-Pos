import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { getBatches, createBatch } from "../api/batchesApi";
import { EMPTY_BATCH_FORM } from "../constants/batches";

/**
 * useBatches — manages batch list fetching and add form for BatchExpiry page.
 */
export function useBatches() {
  const { actions } = useApp();
  const [batches, setBatches]   = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_BATCH_FORM);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBatches();
      setBatches(res.data.data.batches);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load batches. Displayed data may be stale.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const handleAdd = useCallback(async () => {
    if (!form.productName || !form.batchNo || !form.expiryDate) {
      actions.showToast({ message: "Fill required fields", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await createBatch({
        ...form,
        quantity:  parseInt(form.quantity)  || 0,
        costPrice: parseFloat(form.costPrice) || 0,
      });
      setBatches((prev) => [...prev, res.data.data.batch]);
      setShowModal(false);
      setForm(EMPTY_BATCH_FORM);
      actions.showToast({ message: "Batch added successfully", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add batch", type: "error" });
    } finally { setSaving(false); }
  }, [form, actions]);

  return { batches, loading, error, reload, showModal, setShowModal, saving, form, setForm, handleAdd };
}
