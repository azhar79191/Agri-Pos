import { useState, useCallback } from "react";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";

const EMPTY_FORM = { name: "", phone: "", address: "", creditBalance: "" };

/**
 * useCustomerForm — manages add/edit/delete state and handlers for the Customers page.
 */
export function useCustomerForm() {
  const { addCustomer, editCustomer, removeCustomer } = useCustomers();
  const { actions } = useApp();

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm]    = useState(null);
  const [formData, setFormData]              = useState(EMPTY_FORM);
  const [submitting, setSubmitting]          = useState(false);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setEditingCustomer(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((customer) => {
    setEditingCustomer(customer);
    setFormData({
      name:          customer.name,
      phone:         customer.phone,
      address:       customer.address,
      creditBalance: customer.walletBalance?.toString() || "0",
    });
    setIsModalOpen(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name:    formData.name,
        phone:   formData.phone,
        address: formData.address,
        balance: parseFloat(formData.creditBalance) || 0,
      };
      if (editingCustomer) {
        await editCustomer(editingCustomer._id, payload);
        actions.showToast({ message: "Customer updated successfully", type: "success" });
      } else {
        await addCustomer(payload);
        actions.showToast({ message: "Customer added successfully", type: "success" });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingCustomer, addCustomer, editCustomer, actions, resetForm]);

  const confirmDelete = useCallback(async () => {
    try {
      await removeCustomer(deleteConfirm._id);
      actions.showToast({ message: "Customer deleted", type: "success" });
      setDeleteConfirm(null);
    } catch {
      actions.showToast({ message: "Delete failed", type: "error" });
    }
  }, [deleteConfirm, removeCustomer, actions]);

  return {
    isModalOpen, setIsModalOpen,
    editingCustomer,
    deleteConfirm, setDeleteConfirm,
    formData,
    submitting,
    openAdd, openEdit,
    handleChange, handleSubmit, confirmDelete,
    resetForm,
  };
}
