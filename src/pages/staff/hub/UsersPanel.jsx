import React, { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Shield, Eye, EyeOff,
  UserCheck, UserX, RefreshCw, Search, Loader2, Settings2,
  Mail, Phone, Users
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useUsers } from "../../../hooks/useUsers";
import { ConfirmModal } from "../../../components/ui/ModernModal";
import ModernModal from "../../../components/ui/ModernModal";
import { ROLE_CFG, ALL_PERMISSIONS, PERM_KEYS, BASIC_PERMS, inp } from "./staffConfig";

const emptyForm = { name: "", email: "", password: "", role: "cashier", phone: "" };

/* ── Permission Modal ── */
const PermModal = ({ user, isOpen, onClose, onToggle, onGrantAll, onRevokeAll, submitting }) => {
  const groups = [...new Set(ALL_PERMISSIONS.map(p => p.group))];
  const perms = user?.permissions || [];
  const pct = Math.round((perms.length / PERM_KEYS.length) * 100);
  return (
    <ModernModal isOpen={isOpen} onClose={onClose} size="xl"
      title={`Permissions — ${user?.name ?? ""}`}
      subtitle={`${perms.length} of ${PERM_KEYS.length} permissions granted`}
      icon={Shield} iconColor="purple"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <button onClick={() => onGrantAll(user._id)} disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors">
              <UserCheck className="w-3.5 h-3.5" /> Grant All
            </button>
            <button onClick={() => onRevokeAll(user._id)} disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition-colors">
              <UserX className="w-3.5 h-3.5" /> Revoke All
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Close
          </button>
        </div>
      }>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Access level</span><span className="font-semibold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-5">
        {groups.map(group => (
          <div key={group}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />{group}<span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => {
                const has = perms.includes(perm.key);
                return (
                  <button key={perm.key} onClick={() => onToggle(user._id, perm.key)}
                    className={["flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-150",
                      has
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-900/10",
                    ].join(" ")}>
                    <div className={["w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all", has ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-slate-200 dark:bg-slate-700"].join(" ")}>
                      {has && <span className="text-white text-[9px] font-bold">✓</span>}
                    </div>
                    <span className={["text-xs font-medium leading-tight", has ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"].join(" ")}>
                      {perm.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ModernModal>
  );
};

/* ── User Card ── */
const UserCard = ({ user, isAdmin, onEdit, onPerms, onDelete }) => {
  const rc = ROLE_CFG[user.role] || ROLE_CFG.cashier;
  const isActive = user.isActive !== false;
  const permPct = Math.round(((user.permissions?.length || 0) / PERM_KEYS.length) * 100);

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-1 transition-all duration-200">
      {/* Top accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${rc.grad}`} />

      {/* Active pulse indicator */}
      {isActive && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Avatar + identity */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rc.grad} flex items-center justify-center shadow-md`}>
              <span className="text-white font-bold text-xl">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            {!isActive && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✕</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-bold text-slate-900 dark:text-white text-base truncate leading-tight">{user.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-400">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Role badge + status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${rc.cls}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
            {rc.label}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Permission progress */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{user.permissions?.length || 0} permissions</span>
            <span>{permPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${rc.grad} transition-all duration-700`} style={{ width: `${permPct}%` }} />
          </div>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => onEdit(user)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onPerms(user)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 border border-violet-200 dark:border-violet-800 transition-all"
              title="Manage Permissions">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(user)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all"
              title="Delete User">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Panel ── */
const UsersPanel = () => {
  const { state, actions } = useApp();
  const { users, loading, fetchUsers, addUser, editUser, removeUser, editPermissions } = useUsers();
  // Pull grantAll / revokeAll from store
  const { grantAll, revokeAll } = useUsers();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [permUser, setPermUser] = useState(null);
  const [permSubmitting, setPermSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isAdmin = state.currentUser?.role === "admin" || (state.currentUser?.permissions || []).some(p => p.startsWith("users:"));

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line
  useEffect(() => {
    if (permUser) setPermUser(users.find(u => u._id === permUser._id) ?? null);
  }, [users]); // eslint-disable-line

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(emptyForm); setEditingUser(null); setShowPass(false); setShowForm(true); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: "", role: u.role || "cashier", phone: u.phone || "" }); setEditingUser(u); setShowPass(false); setShowForm(true); };
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) { actions.showToast({ message: "Name and email required", type: "error" }); return; }
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...form }; if (!payload.password) delete payload.password;
        await editUser(editingUser._id, payload);
        actions.showToast({ message: "User updated", type: "success" });
      } else {
        if (!form.password) { actions.showToast({ message: "Password required", type: "error" }); setSubmitting(false); return; }
        await addUser(form);
        actions.showToast({ message: "User added", type: "success" });
      }
      setShowForm(false); setEditingUser(null); setForm(emptyForm);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try { await removeUser(deleteTarget._id); actions.showToast({ message: "User deleted", type: "success" }); setDeleteTarget(null); }
    catch (err) { actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" }); }
  };

  const handleToggle   = async (uid, key) => { const u = users.find(x => x._id === uid); if (!u) return; const cur = u.permissions || []; await editPermissions(uid, cur.includes(key) ? cur.filter(p => p !== key) : [...cur, key]).catch(() => {}); };
  const handleGrantAll  = async (uid) => { setPermSubmitting(true); try { await grantAll(uid); actions.showToast({ message: "Full access granted", type: "success" }); } catch { actions.showToast({ message: "Failed to grant access", type: "error" }); } finally { setPermSubmitting(false); } };
  const handleRevokeAll = async (uid) => { setPermSubmitting(true); try { await revokeAll(uid); actions.showToast({ message: "Access revoked", type: "warning" }); } catch { actions.showToast({ message: "Failed to revoke access", type: "error" }); } finally { setPermSubmitting(false); } };

  const active   = users.filter(u => u.isActive !== false).length;
  const admins   = users.filter(u => u.role === "admin").length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers()} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/30">
              <Plus className="w-4 h-4" /> Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Members", value: users.length, color: "text-violet-600 dark:text-violet-400",  bg: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/15 dark:to-purple-900/15", border: "border-violet-100 dark:border-violet-900/30" },
          { label: "Active Now",    value: active,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15",   border: "border-emerald-100 dark:border-emerald-900/30" },
          { label: "Admins",        value: admins,        color: "text-purple-600 dark:text-purple-400",   bg: "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/15 dark:to-indigo-900/15", border: "border-purple-100 dark:border-purple-900/30" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-400">Loading team...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(user => (
            <UserCard key={user._id} user={user} isAdmin={isAdmin}
              onEdit={openEdit} onPerms={setPermUser} onDelete={setDeleteTarget} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ModernModal isOpen={showForm} onClose={() => { setShowForm(false); setEditingUser(null); }}
        title={editingUser ? "Edit User" : "Add New User"} icon={editingUser ? Edit3 : Plus} iconColor="blue"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white transition-all">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? "Saving..." : editingUser ? "Update User" : "Add User"}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label><input value={form.name} onChange={e => f("name", e.target.value)} className={inp} placeholder="John Doe" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label><input type="email" value={form.email} onChange={e => f("email", e.target.value)} className={inp} placeholder="john@shop.com" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} className={inp} placeholder="+92 300 0000000" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
              <select value={form.role} onChange={e => f("role", e.target.value)} className={inp}>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password {editingUser && <span className="text-slate-400 font-normal">(leave blank to keep)</span>}
            </label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => f("password", e.target.value)} className={inp + " pr-10"} placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </ModernModal>

      {permUser && (
        <PermModal user={permUser} isOpen={!!permUser} onClose={() => setPermUser(null)}
          onToggle={handleToggle} onGrantAll={handleGrantAll} onRevokeAll={handleRevokeAll} submitting={permSubmitting} />
      )}

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete" confirmVariant="danger" icon={Trash2} iconColor="red" />
    </div>
  );
};

export default UsersPanel;
