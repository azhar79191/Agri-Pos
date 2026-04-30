import React, { useState, useEffect } from "react";
import { Users, Plus, X, Eye, EyeOff, Loader2, Shield, UserCheck, ShoppingCart } from "lucide-react";
import ShopCard from "./ShopCard";
import { inp } from "./shopConfig";
import { getShopUsers, addUserToShop } from "../../api/shopApi";
import { useApp } from "../../context/AppContext";

const ROLE_CFG = {
  admin:   { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",   icon: Shield,      label: "Admin" },
  manager: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",           icon: UserCheck,   label: "Manager" },
  cashier: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", icon: ShoppingCart, label: "Cashier" },
};

const EMPTY = { name: "", email: "", phone: "", password: "", role: "cashier" };

const TeamPanel = ({ shopId }) => {
  const { actions } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [showPass, setShowPass] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    getShopUsers(shopId)
      .then(r => setUsers(r.data.data?.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopId]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      actions.showToast({ message: "Name, email and password are required", type: "error" }); return;
    }
    setAdding(true);
    try {
      const res = await addUserToShop(shopId, form);
      setUsers(prev => [...prev, res.data.data?.user]);
      actions.showToast({ message: `${form.name} added to team`, type: "success" });
      setShowForm(false); setForm(EMPTY);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add member", type: "error" });
    } finally { setAdding(false); }
  };

  return (
    <div className="space-y-5">
      <ShopCard title="Team Members" desc={`${users.length} member${users.length !== 1 ? "s" : ""} in your shop`}
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )
        }>
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading team...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {users.length === 0 && !showForm && (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No team members yet</p>
                <p className="text-xs text-slate-400 mt-1">Add managers and cashiers to your shop</p>
              </div>
            )}

            {users.map(u => {
              const rc = ROLE_CFG[u.role] || ROLE_CFG.cashier;
              const RIcon = rc.icon;
              const initial = u.name?.[0]?.toUpperCase() || "U";
              return (
                <div key={u._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{initial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${rc.cls}`}>
                    <RIcon className="w-3 h-3" />{rc.label}
                  </span>
                </div>
              );
            })}

            {/* Add member form */}
            {showForm && (
              <div className="mt-3 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">New Team Member</p>
                  <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                    <input value={form.name} onChange={e => f("name", e.target.value)} placeholder="John Doe" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="john@shop.com" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+92 300 0000000" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Role</label>
                    <select value={form.role} onChange={e => f("role", e.target.value)} className={inp}>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Password *</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} value={form.password}
                        onChange={e => f("password", e.target.value)} placeholder="Min 6 characters" className={inp + " pr-10"} />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => { setShowForm(false); setForm(EMPTY); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} disabled={adding}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors">
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {adding ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </ShopCard>
    </div>
  );
};

export default TeamPanel;
