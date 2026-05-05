import { useState, useCallback, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useUsers } from "./useUsers";
import { EMPTY_USER_FORM } from "../constants/users";

/**
 * useUserManagement — manages add/edit/delete/permissions state and handlers for UserManagement page.
 */
export function useUserManagement() {
  const { state, actions } = useApp();
  const { users, fetchUsers, addUser, editUser, removeUser, editPermissions, grantAll, revokeAll } = useUsers();

  const [showAddUser, setShowAddUser]       = useState(false);
  const [editingUser, setEditingUser]       = useState(null);
  const [showPassword, setShowPassword]     = useState(false);
  const [formData, setFormData]             = useState(EMPTY_USER_FORM);
  const [selectedUser, setSelectedUser]     = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [permSubmitting, setPermSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState(null);

  // Keep selectedUser in sync when users list updates
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find((u) => u._id === selectedUser._id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = useCallback(() => {
    setFormData(EMPTY_USER_FORM);
    setEditingUser(null);
    setShowAddUser(true);
  }, []);

  const openEdit = useCallback((user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role || "cashier", phone: user.phone || "" });
    setShowAddUser(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await editUser(editingUser._id, payload);
        actions.showToast({ message: "User updated successfully", type: "success" });
      } else {
        await addUser(formData);
        actions.showToast({ message: "User added successfully", type: "success" });
      }
      setFormData(EMPTY_USER_FORM);
      setEditingUser(null);
      setShowAddUser(false);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Operation failed", type: "error" });
    } finally { setSubmitting(false); }
  }, [formData, editingUser, addUser, editUser, actions]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await removeUser(deleteTarget._id || deleteTarget.id);
      actions.showToast({ message: "User deleted successfully", type: "success" });
      setDeleteTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
      setDeleteTarget(null);
    }
  }, [deleteTarget, removeUser, actions]);

  const handleGrantAll = useCallback(async (userId) => {
    setPermSubmitting(true);
    try {
      await grantAll(userId);
      actions.showToast({ message: "Full access granted", type: "success" });
      fetchUsers();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" });
    } finally { setPermSubmitting(false); }
  }, [grantAll, fetchUsers, actions]);

  const handleRevokeAll = useCallback(async (userId) => {
    setPermSubmitting(true);
    try {
      await revokeAll(userId);
      actions.showToast({ message: "Access revoked to minimum", type: "warning" });
      fetchUsers();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" });
    } finally { setPermSubmitting(false); }
  }, [revokeAll, fetchUsers, actions]);

  const handlePermissionToggle = useCallback(async (userId, permKey) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;
    const current = user.permissions || [];
    const updated = current.includes(permKey) ? current.filter((p) => p !== permKey) : [...current, permKey];
    try {
      await editPermissions(userId, updated);
      fetchUsers();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" });
    }
  }, [users, editPermissions, fetchUsers, actions]);

  const isAdmin = state.currentUser?.role === "admin" || (state.currentUser?.permissions || []).some((p) => p.startsWith("users:"));

  return {
    isAdmin,
    showAddUser, setShowAddUser,
    editingUser,
    showPassword, setShowPassword,
    formData, setFormData,
    selectedUser, setSelectedUser,
    showPermissions, setShowPermissions,
    submitting, permSubmitting,
    deleteTarget, setDeleteTarget,
    openAdd, openEdit,
    handleSubmit, handleDelete,
    handleGrantAll, handleRevokeAll, handlePermissionToggle,
  };
}
