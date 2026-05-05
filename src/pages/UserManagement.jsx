import React, { useEffect } from "react";
import { Plus, Edit3, Trash2, Shield, Eye, EyeOff, UserCheck, UserX, Settings, RefreshCw, Users, X } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { useUserManagement } from "../hooks/useUserManagement";
import { ConfirmModal } from "../components/ui/ModernModal";
import { AVAILABLE_PERMISSIONS, ALL_PERMISSION_KEYS, USER_ROLE_CONFIG } from "../constants/users";

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

const UserManagement = () => {
  const { users, loading, fetchUsers } = useUsers();
  const {
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
  } = useUserManagement();

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} users in system</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers()} className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          {isAdmin && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm">
              <Plus className="w-4 h-4" />Add User
            </button>
          )}
        </div>
      </div>

      {/* Users grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, i) => {
            const rc = USER_ROLE_CONFIG[user.role] || USER_ROLE_CONFIG.cashier;
            return (
              <div key={user._id} className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden animate-fade-up stagger-${Math.min(i + 1, 4)}`}>
                <div className={`h-1 w-full bg-gradient-to-r ${rc.gradient}`} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white font-bold text-base">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${rc.cls}`}>{rc.label}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Shield className="w-3.5 h-3.5" />{user.permissions?.length || 0} permissions
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.isActive !== false ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : "bg-red-100 text-red-700"}`}>
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => openEdit(user)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />Edit
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowPermissions(true); }} className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" title="Permissions">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleGrantAll(user._id)} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-blue-900/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors" title="Grant All">
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => { setShowAddUser(false); setShowPassword(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingUser ? "Edit User" : "Add New User"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {[
                { label: "Full Name", key: "name",  type: "text",  required: true },
                { label: "Email",     key: "email", type: "email", required: true },
                { label: "Phone",     key: "phone", type: "tel" },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">{label}</label>
                  <input type={type} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className={inputCls} required={required} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                  Password {editingUser && <span className="text-slate-400 font-normal">(leave blank to keep)</span>}
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputCls + " pr-10"} required={!editingUser} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputCls}>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-all">
                  {submitting ? "Saving..." : editingUser ? "Update User" : "Add User"}
                </button>
                <button type="button" onClick={() => { setShowAddUser(false); }} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {showPermissions && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowPermissions(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Permissions — {selectedUser.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedUser.permissions?.length || 0} of {ALL_PERMISSION_KEYS.length} granted</p>
              </div>
              <button onClick={() => setShowPermissions(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
              <button onClick={() => handleGrantAll(selectedUser._id)} disabled={permSubmitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors">
                <UserCheck className="w-3.5 h-3.5" />Grant All
              </button>
              <button onClick={() => handleRevokeAll(selectedUser._id)} disabled={permSubmitting} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors">
                <UserX className="w-3.5 h-3.5" />Revoke All
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const has = (selectedUser.permissions || []).includes(perm.key);
                  return (
                    <button key={perm.key} onClick={() => handlePermissionToggle(selectedUser._id, perm.key)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${has ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-blue-900/15" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                      <div>
                        <p className={`text-xs font-semibold ${has ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>{perm.label}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{perm.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 ml-3 flex items-center justify-center transition-colors ${has ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                        {has && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmText="Delete" confirmVariant="danger" icon={Trash2} iconColor="red" />
    </div>
  );
};

export default UserManagement;
