import React, { useState, useEffect, useCallback } from "react";
import {
  Shield, Store, Users, CheckCircle, XCircle, Clock,
  TrendingUp, Trash2, RefreshCw, Eye, EyeOff,
  AlertTriangle, Crown, Zap, X, Loader2, LogOut,
  Copy, Check, Phone, Mail, User, Key, Calendar,
  Activity, Lock, ChevronDown, ChevronUp, Search,
} from "lucide-react";
import {
  getSuperAdminStats, getAllShops, approveShop,
  grantPlan, suspendShop, unsuspendShop,
  deleteSuperAdminShop, getShopUsers,
} from "../api/superAdminApi";
import { useApp } from "../context/AppContext";

const PLANS = [
  { id: "starter",      label: "Starter",      price: "Free",         icon: Zap,        maxUsers: 2,   maxProducts: 100   },
  { id: "professional", label: "Professional", price: "Rs. 2,999/mo", icon: TrendingUp, maxUsers: 10,  maxProducts: 5000  },
  { id: "enterprise",   label: "Enterprise",   price: "Custom",       icon: Crown,      maxUsers: 999, maxProducts: 99999 },
];

const PLAN_COLORS = {
  none:         "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  starter:      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  professional: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  enterprise:   "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  active:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  expired:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/* ── Copy button ── */
const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy} className="ml-1 p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex-shrink-0">
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
  const map = {
    superadmin: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    admin:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    manager:    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    cashier:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${map[role] || map.cashier}`}>{role}</span>;
};

/* ── Field display ── */
const Field = ({ icon: Icon, label, value, mono = false, copy = false }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}{label}
    </p>
    <div className="flex items-center gap-1 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-h-[36px]">
      <span className={`text-sm flex-1 truncate text-slate-800 dark:text-slate-200 ${mono ? "font-mono" : "font-medium"}`}>{value || "—"}</span>
      {copy && value && value !== "—" && <CopyBtn value={value} />}
    </div>
  </div>
);

/* ── Shop Users Modal ── */
const ShopUsersModal = ({ shop, onClose }) => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [showPwd, setShowPwd]   = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getShopUsers(shop._id)
      .then(res => { setUsers(res.data.data.users || []); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || "Failed to load users"); setLoading(false); });
  }, [shop._id]);

  const filtered = users.filter(u =>
    [u.name, u.email, u.phone, u.role].some(v => v?.toLowerCase?.().includes(search.toLowerCase()))
  );

  const fmt = d => d ? new Date(d).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-5xl max-h-[90vh] flex flex-col" style={{ animation: "scale-in 0.15s ease both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Users — {shop.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""} · All database fields`}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, role…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading user data…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{search ? "No users match your search" : "No users found"}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(user => {
                const isExp = expanded === user._id;
                const spwd  = showPwd[user._id];
                return (
                  <div key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Row */}
                    <div className="px-6 py-4 flex items-center gap-4 flex-wrap lg:flex-nowrap">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </div>

                      {/* Name + role */}
                      <div className="min-w-0 w-36 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
                          <CopyBtn value={user.name} />
                        </div>
                        <RoleBadge role={user.role} />
                      </div>

                      {/* Email */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate font-mono">{user.email}</span>
                          <CopyBtn value={user.email} />
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500 font-mono">{user.phone}</span>
                            <CopyBtn value={user.phone} />
                          </div>
                        )}
                      </div>

                      {/* Password hash */}
                      <div className="w-48 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-mono text-slate-500 truncate flex-1">
                            {user.password ? (spwd ? user.password : "••••••••••••••••••••") : <em className="text-slate-400">hidden</em>}
                          </span>
                          {user.password && (
                            <>
                              <button onClick={() => setShowPwd(p => ({ ...p, [user._id]: !p[user._id] }))} className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                {spwd ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <CopyBtn value={user.password} />
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 ml-5">bcrypt hash</p>
                      </div>

                      {/* Status */}
                      <div className="w-16 flex-shrink-0 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${user.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Expand */}
                      <button onClick={() => setExpanded(p => p === user._id ? null : user._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded panel */}
                    {isExp && (
                      <div className="px-6 pb-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                          <Field icon={Key}      label="User ID"        value={user._id?.toString()}   mono copy />
                          <Field icon={Store}    label="Shop ID"        value={user.shop?.toString()}  mono copy />
                          <Field icon={User}     label="Full Name"      value={user.name}              copy />
                          <Field icon={Mail}     label="Email"          value={user.email}             mono copy />
                          <Field icon={Phone}    label="Phone"          value={user.phone}             copy={!!user.phone} />
                          <Field icon={Shield}   label="Role"           value={user.role} />
                          <Field icon={Activity} label="Address"        value={user.address} />
                          <Field icon={Activity} label="Status"         value={user.isActive ? "Active" : "Inactive"} />
                          <Field icon={Calendar} label="Last Login"     value={fmt(user.lastLogin)} />
                          <Field icon={Calendar} label="Created At"     value={fmt(user.createdAt)} />
                          <Field icon={Calendar} label="Updated At"     value={fmt(user.updatedAt)} />

                          {/* Full password hash */}
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Lock className="w-3 h-3" />Password Hash (bcrypt)
                            </p>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all flex-1 leading-relaxed">
                                {user.password
                                  ? (spwd ? user.password : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••")
                                  : <em className="text-slate-400">Password not returned by API</em>}
                              </code>
                              {user.password && (
                                <div className="flex gap-1 flex-shrink-0">
                                  <button onClick={() => setShowPwd(p => ({ ...p, [user._id]: !p[user._id] }))}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    {spwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <CopyBtn value={user.password} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Permissions */}
                          {user.permissions?.length > 0 && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Permissions ({user.permissions.length})
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {user.permissions.map(p => (
                                  <span key={p} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-mono">{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-400">{filtered.length} of {users.length} users{search && ` · filtered by "${search}"`}</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

/* ── Plan modal ── */
const PlanModal = ({ shop, onClose, onSave }) => {
  const [plan, setPlan]     = useState(shop?.plan !== "none" ? shop.plan : "starter");
  const [days, setDays]     = useState(30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!shop.isApproved) await approveShop(shop._id, { plan, durationDays: days });
      else await grantPlan(shop._id, { plan, durationDays: days });
      onSave(); onClose();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md" style={{ animation: "scale-in 0.15s ease both" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">{shop?.isApproved ? "Change Plan" : "Approve Shop"} — {shop?.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Plan</label>
            <div className="space-y-2">
              {PLANS.map(p => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${plan === p.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                  <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                  <p.icon className={`w-4 h-4 flex-shrink-0 ${plan === p.id ? "text-blue-600" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.label}</p>
                    <p className="text-xs text-slate-400">{p.maxUsers} users · {p.maxProducts === 99999 ? "Unlimited" : p.maxProducts} products · {p.price}</p>
                  </div>
                  {plan === p.id && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (days)</label>
            <div className="flex gap-2">
              {[30, 90, 180, 365].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${days === d ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {shop?.isApproved ? "Update Plan" : "Approve & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Suspend modal ── */
const SuspendModal = ({ shop, onClose, onSave }) => {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await suspendShop(shop._id, { reason: reason || "Suspended by admin" }); onSave(); onClose(); }
    catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm" style={{ animation: "scale-in 0.15s ease both" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Suspend — {shop?.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reason (optional)</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="e.g. Payment overdue..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main dashboard ── */
const SuperAdminDashboard = () => {
  const { actions } = useApp();
  const [stats, setStats]             = useState(null);
  const [shops, setShops]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [planModal, setPlanModal]     = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [usersModal, setUsersModal]   = useState(null);
  const [deleting, setDeleting]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, shopsRes] = await Promise.all([getSuperAdminStats(), getAllShops()]);
      setStats(statsRes.data.data);
      setShops(shopsRes.data.data.shops);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnsuspend = async (shop) => {
    try { await unsuspendShop(shop._id); load(); } catch {}
  };

  const handleDelete = async (shop) => {
    if (!window.confirm(`Delete "${shop.name}" and ALL its data? This cannot be undone.`)) return;
    setDeleting(shop._id);
    try { await deleteSuperAdminShop(shop._id); load(); } catch {}
    finally { setDeleting(null); }
  };

  const filtered = shops.filter(s => {
    const q = search.toLowerCase();
    const match = s.name.toLowerCase().includes(q) || s.owner?.email?.toLowerCase().includes(q);
    if (filter === "pending")   return match && !s.isApproved;
    if (filter === "active")    return match && s.planStatus === "active";
    if (filter === "suspended") return match && s.planStatus === "suspended";
    return match;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Super Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Platform management · AgriNest POS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => actions.logout()} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-sm font-semibold">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Store}       label="Total Shops"  value={stats.totalShops}    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
          <StatCard icon={CheckCircle} label="Approved"     value={stats.approvedShops} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
          <StatCard icon={Clock}       label="Pending"      value={stats.pendingShops}  color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
          <StatCard icon={Users}       label="Total Users"  value={stats.totalUsers}    color="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
        </div>
      )}

      {/* Plan breakdown */}
      {stats?.planBreakdown && (
        <div className="grid grid-cols-3 gap-3">
          {PLANS.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
              <p.icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">{p.label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{stats.planBreakdown[p.id] || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops or owner email..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {["all","pending","active","suspended"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Shops table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading shops...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No shops found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Shop", "Owner", "Plan", "Status", "Members", "Expiry", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(shop => (
                  <tr key={shop._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Shop */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">{shop.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{shop.name}</p>
                          <p className="text-[10px] text-slate-400">{shop.phone || "—"}</p>
                        </div>
                      </div>
                    </td>
                    {/* Owner */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{shop.owner?.name}</p>
                      <p className="text-xs text-slate-400">{shop.owner?.email}</p>
                    </td>
                    {/* Plan */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${PLAN_COLORS[shop.plan] || PLAN_COLORS.none}`}>
                        {shop.plan === "none" ? "No Plan" : shop.plan}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {!shop.isApproved ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">⏳ Pending</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[shop.planStatus] || STATUS_COLORS.pending}`}>
                          {shop.planStatus}
                        </span>
                      )}
                    </td>
                    {/* Members */}
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {shop.memberCount || 0} / {shop.maxUsers || 1}
                    </td>
                    {/* Expiry */}
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {shop.planExpiry ? new Date(shop.planExpiry).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* View Users */}
                        <button onClick={() => setUsersModal(shop)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                          <Users className="w-3 h-3" /> Users
                        </button>

                        {/* Approve / Change Plan */}
                        <button onClick={() => setPlanModal(shop)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            !shop.isApproved
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200"
                          }`}>
                          {!shop.isApproved ? <><CheckCircle className="w-3 h-3" /> Approve</> : <><Crown className="w-3 h-3" /> Plan</>}
                        </button>

                        {/* Suspend / Unsuspend */}
                        {shop.isApproved && shop.planStatus !== "suspended" && (
                          <button onClick={() => setSuspendModal(shop)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 transition-colors">
                            <AlertTriangle className="w-3 h-3" /> Suspend
                          </button>
                        )}
                        {shop.planStatus === "suspended" && (
                          <button onClick={() => handleUnsuspend(shop)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                            <CheckCircle className="w-3 h-3" /> Restore
                          </button>
                        )}

                        {/* Delete */}
                        <button onClick={() => handleDelete(shop)} disabled={deleting === shop._id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                          {deleting === shop._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {planModal    && <PlanModal    shop={planModal}    onClose={() => setPlanModal(null)}    onSave={load} />}
      {suspendModal && <SuspendModal shop={suspendModal} onClose={() => setSuspendModal(null)} onSave={load} />}
      {usersModal   && <ShopUsersModal shop={usersModal} onClose={() => setUsersModal(null)} />}
    </div>
  );
};

export default SuperAdminDashboard;
