import React, { useState, useEffect } from "react";
import { UserCheck, Plus, DollarSign, TrendingUp, Loader2, X, Edit2, Trash2, BarChart3, Phone, MapPin, RefreshCw } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getSalesReps, createSalesRep, updateSalesRep, deleteSalesRep, getSalesRepStats } from "../../api/salesRepsApi";

const LIMIT = 12;

const emptyForm = { name: "", phone: "", territory: "", commission: "5", status: "active" };

const SalesReps = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const isAdmin = state.currentUser?.role === "admin" || state.currentUser?.role === "manager";

  const { data: reps, loading, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh } =
    usePaginatedApi(getSalesReps, { status: "", search: "" }, LIMIT);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [statsModal, setStatsModal] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const totalEarned = reps.reduce((s, r) => s + (r.earned || 0), 0);
  const totalSales = reps.reduce((s, r) => s + (r.totalSales || 0), 0);
  const activeCount = reps.filter(r => r.status === "active").length;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, phone: r.phone || "", territory: r.territory || "", commission: String(r.commission || 5), status: r.status || "active" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { actions.showToast({ message: "Name is required", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, commission: parseFloat(form.commission) || 5 };
      if (editing) {
        await updateSalesRep(editing._id, payload);
        actions.showToast({ message: "Sales rep updated", type: "success" });
      } else {
        await createSalesRep(payload);
        actions.showToast({ message: "Sales rep added", type: "success" });
      }
      setShowModal(false);
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteSalesRep(id);
      actions.showToast({ message: "Sales rep deleted", type: "success" });
      refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to delete", type: "error" });
    } finally { setDeleting(null); }
  };

  const openStats = async (rep) => {
    setStatsModal(rep);
    setStatsData(null);
    setStatsLoading(true);
    try {
      const res = await getSalesRepStats(rep._id);
      setStatsData(res.data.data);
    } catch { setStatsData(null); }
    finally { setStatsLoading(false); }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Representatives</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {total} reps · {activeCount} active · Commission earned: {formatCurrency(totalEarned, settings.currency)}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
            <Plus className="w-4 h-4" />Add Rep
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sales", value: formatCurrency(totalSales, settings.currency), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: TrendingUp },
          { label: "Commission Earned", value: formatCurrency(totalEarned, settings.currency), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: DollarSign },
          { label: "Active Reps", value: activeCount, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: UserCheck },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p><p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search by name or territory...' },
          { type: 'select', key: 'status', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
        values={filters}
        onChange={setFilter}
        onClear={() => setFilters({ search: '', status: '' })}
        total={total}
      />

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : reps.length === 0 ? (
        <EmptyState icon={UserCheck} title="No sales representatives" description="Add sales reps to track their performance and commission" actionLabel={isAdmin ? "Add Rep" : undefined} onAction={isAdmin ? openCreate : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reps.map(r => (
            <div key={r._id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium hover:shadow-premium-lg transition-all group overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-600" />
              <div className="p-5 space-y-4">
                {/* Rep info */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">{r.name?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.phone && <span className="flex items-center gap-1 text-xs text-slate-400"><Phone className="w-3 h-3" />{r.phone}</span>}
                      {r.territory && <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" />{r.territory}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${r.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                    {r.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-400">Sales</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{formatCurrency(r.totalSales || 0, settings.currency)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-400">Rate</p>
                    <p className="font-bold text-sm text-blue-600 dark:text-blue-400 mt-0.5">{r.commission}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/15">
                    <p className="text-xs text-slate-400">Earned</p>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(r.earned || 0, settings.currency)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => openStats(r)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <BarChart3 className="w-3.5 h-3.5" />Stats
                  </button>
                  {isAdmin && <>
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                      {deleting === r._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10000 w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">{editing ? "Edit Sales Rep" : "Add Sales Rep"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[{ l: "Full Name *", k: "name", t: "text" }, { l: "Phone", k: "phone", t: "tel" }, { l: "Territory / Area", k: "territory", t: "text" }, { l: "Commission Rate (%)", k: "commission", t: "number" }].map(({ l, k, t }) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all" style={{ background: "var(--pos-primary)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                {editing ? "Update" : "Add Rep"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {statsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setStatsModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10000 w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-scale-in max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">{statsModal.name?.[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{statsModal.name}</h3>
                  <p className="text-xs text-slate-400">{statsModal.territory} · {statsModal.commission}% commission</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openStats(statsModal)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                <button onClick={() => setStatsModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading stats...</span></div>
              ) : statsData ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Total Sales", v: formatCurrency(statsData.stats.totalSales, settings.currency), c: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/15" },
                      { l: "Commission Earned", v: formatCurrency(statsData.stats.totalCommission, settings.currency), c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/15" },
                      { l: "Total Invoices", v: statsData.stats.invoiceCount, c: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/15" },
                      { l: "Avg Order Value", v: formatCurrency(statsData.stats.avgOrderValue || 0, settings.currency), c: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/15" },
                    ].map(({ l, v, c, bg }) => (
                      <div key={l} className={`p-3.5 rounded-xl ${bg}`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{l}</p>
                        <p className={`text-lg font-bold mt-0.5 ${c}`}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {statsData.recentInvoices?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Sales</p>
                      <div className="space-y-2">
                        {statsData.recentInvoices.map(inv => (
                          <div key={inv._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{inv.customerName || "Walk-in"} · {formatDate(inv.createdAt?.split?.("T")[0])}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(inv.total, settings.currency)}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">+{formatCurrency(inv.commissionAmount || 0, settings.currency)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">No sales data available for this rep yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReps;
