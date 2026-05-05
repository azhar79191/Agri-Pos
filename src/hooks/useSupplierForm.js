import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { createSupplier, updateSupplier, deleteSupplier } from "../api/suppliersApi";

const EMPTY_FORM = { name: "", contact: "", phone: "", email: "", address: "", paymentTerms: "Net 30" };

/**
 * useSupplierForm — manages add/edit/delete for the Suppliers page.
 */
export function useSupplierForm(refresh) {
  const { actions }             = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const openCreate = useCallback(() => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }, []);

  const openEdit = useCallback((s) => {
    setEditing(s);
    setForm({ name: s.name, contact: s.contact || "", phone: s.phone || "", email: s.email || "", address: s.address || "", paymentTerms: s.paymentTerms || "Net 30" });
    setShowModal(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { actions.showToast({ message: "Supplier name required", type: "error" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(editing._id, form);
        actions.showToast({ message: "Supplier updated", type: "success" });
      } else {
        await createSupplier(form);
        actions.showToast({ message: "Supplier added", type: "success" });
      }
      setShowModal(false);
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally { setSaving(false); }
  }, [form, editing, actions, refresh]);

  const handleDelete = useCallback(async (id) => {
    setDeleting(id);
    try {
      await deleteSupplier(id);
      actions.showToast({ message: "Supplier deleted", type: "success" });
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to delete", type: "error" });
    } finally { setDeleting(null); }
  }, [actions, refresh]);

  return { showModal, setShowModal, editing, saving, deleting, form, setForm, openCreate, openEdit, handleSave, handleDelete };
}
