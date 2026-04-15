import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Shield, Eye, EyeOff, UserCheck, UserX, Settings, Crown, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useUsers } from "../hooks/useUsers";
import { ConfirmModal } from "../components/ui/ModernModal";

// Must match backend validPermissions exactly
const availablePermissions = [
  { key: "dashboard:view",      label: "Dashboard",         description: "View main dashboard" },
  { key: "pos:view",            label: "POS View",          description: "Access POS screen" },
  { key: "pos:process",         label: "POS Process",       description: "Process sales transactions" },
  { key: "products:view",       label: "Products View",     description: "View products" },
  { key: "products:create",     label: "Products Create",   description: "Add new products" },
  { key: "products:edit",       label: "Products Edit",     description: "Edit products" },
  { key: "products:delete",     label: "Products Delete",   description: "Delete products" },
  { key: "customers:view",      label: "Customers View",    description: "View customers" },
  { key: "customers:create",    label: "Customers Create",  description: "Add customers" },
  { key: "customers:edit",      label: "Customers Edit",    description: "Edit customers" },
  { key: "customers:delete",    label: "Customers Delete",  description: "Delete customers" },
  { key: "invoices:view",       label: "Invoices View",     description: "View invoices" },
  { key: "invoices:create",     label: "Invoices Create",   description: "Create invoices" },
  { key: "invoices:print",      label: "Invoices Print",    description: "Print invoices" },
  { key: "reports:view",        label: "Reports View",      description: "View reports" },
  { key: "reports:export",      label: "Reports Export",    description: "Export reports" },
  { key: "stock:view",          label: "Stock View",        description: "View stock levels" },
  { key: "stock:manage",        label: "Stock Manage",      description: "Adjust stock" },
  { key: "users:view",          label: "Users View",        description: "View users" },
  { key: "users:create",        label: "Users Create",      description: "Add users" },
  { key: "users:edit",          label: "Users Edit",        description: "Edit users" },
  { key: "users:delete",        label: "Users Delete",      description: "Delete users" },
  { key: "settings:view",       label: "Settings View",     description: "View settings" },
  { key: "settings:edit",       label: "Settings Edit",     description: "Edit settings" },
];

const ALL_PERMISSIONS = availablePermissions.map((p) => p.key);
const BASIC_PERMISSIONS = ["dashboard:view", "pos:view", "pos:process"];

const emptyForm = { name: "", email: "", password: "", role: "cashier", phone: "" };

const roleColors = { admin: "purple", manager: "blue", cashier: "emerald" };
const roleLabels = { admin: "Administrator", manager: "Manager", cashier: "Cashier" };

const UserManagement = () => {
  const { state, actions } = useApp();
  const { users, loading, fetchUsers, addUser, editUser, removeUser, editPermissions } = useUsers();

  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permSubmitting, setPermSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep selectedUser in sync with users array
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find((u) => u._id === selectedUser._id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);

  const handleSubmit = async (e) => {
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
      setFormData(emptyForm);
      setEditingUser(null);
      setShowAddUser(false);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Operation failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role || "cashier", phone: user.phone || "" });
    setShowAddUser(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    try {
      await removeUser(id);
      actions.showToast({ message: "User deleted successfully", type: "success" });
      setDeleteTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
      setDeleteTarget(null);
    }
  };

  const handleGrantAll = async (userId) => {
    setPermSubmitting(true);
    try {
      await editPermissions(userId, ALL_PERMISSIONS);
      actions.showToast({ message: "Full access granted", type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to update permissions", type: "error" });
    } finally {
      setPermSubmitting(false);
    }
  };

  const handleRevokeAll = async (userId) => {
    setPermSubmitting(true);
    try {
      await editPermissions(userId, BASIC_PERMISSIONS);
      actions.showToast({ message: "Access revoked", type: "warning" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to update permissions", type: "error" });
    } finally {
      setPermSubmitting(false);
    }
  };

  const handlePermissionToggle = async (userId, permKey) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;
    const current = user.permissions || [];
    const updated = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey];
    try {
      await editPermissions(userId, updated);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to update permission", type: "error" });
    }
  };

  const isAdmin = state.currentUser?.role === "admin" ||
    (state.currentUser?.permissions || []).some(p => p.startsWith("users:"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} users in system</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers()} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => { setFormData(emptyForm); setEditingUser(null); setShowAddUser(true); }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />Add User
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No users found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => {
            const color = roleColors[user.role] || "emerald";
            const permCount = user.permissions?.length || 0;
            return (
              <div key={user._id} className="card-base p-5 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-${color}-600 dark:text-${color}-400 font-bold text-lg`}>
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />{permCount} permissions
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${user.isActive !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700"}`}>
                    {user.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(user)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                      <Edit3 className="w-3 h-3" />Edit
                    </button>
                    <button onClick={() => { setSelectedUser(user); setShowPermissions(true); }} className="flex items-center justify-center px-2.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors" title="Permissions">
                      <Settings className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleGrantAll(user._id)} className="flex items-center justify-center px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg transition-colors" title="Grant All">
                      <UserCheck className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleteTarget(user)} className="flex items-center justify-center px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => { setShowAddUser(false); setEditingUser(null); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-[10000] w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingUser ? "Edit User" : "Add New User"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email", required: true },
                { label: "Phone", key: "phone", type: "tel" },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                  <input type={type} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    required={required} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password {editingUser && <span className="text-gray-400">(leave blank to keep)</span>}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-10"
                    required={!editingUser} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition-colors">
                  {submitting ? "Saving..." : editingUser ? "Update" : "Add User"}
                </button>
                <button type="button" onClick={() => { setShowAddUser(false); setEditingUser(null); setFormData(emptyForm); }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-medium text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissions && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowPermissions(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-[10000] w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Permissions — {selectedUser.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.permissions?.length || 0} of {ALL_PERMISSIONS.length} granted</p>
              </div>
              <button onClick={() => setShowPermissions(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={() => handleGrantAll(selectedUser._id)} disabled={permSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <UserCheck className="w-4 h-4" />Grant All
              </button>
              <button onClick={() => handleRevokeAll(selectedUser._id)} disabled={permSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <UserX className="w-4 h-4" />Revoke All
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePermissions.map((perm) => {
                  const has = (selectedUser.permissions || []).includes(perm.key);
                  return (
                    <button key={perm.key} onClick={() => handlePermissionToggle(selectedUser._id, perm.key)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        has ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}>
                      <div>
                        <p className={`text-sm font-medium ${has ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>{perm.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 ml-3 flex items-center justify-center ${has ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-600"}`}>
                        {has && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will deactivate their account.`}
        confirmText="Delete"
        confirmVariant="danger"
        icon={Trash2}
        iconColor="red"
      />
    </div>
  );
};

export default UserManagement;
