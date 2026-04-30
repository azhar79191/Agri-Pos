import React, { useState } from "react";
import { UserCheck, Plus, Edit3, Trash2, Loader2, MapPin, Phone, TrendingUp, DollarSign, Award } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { usePaginatedApi } from "../../../hooks/usePaginatedApi";
import { getSalesReps, createSalesRep, updateSalesRep, deleteSalesRep } from "../../../api/salesRepsApi";
import { formatCurrency } from "../../../utils/helpers";
import ModernModal from "../../../components/ui/ModernModal";
import { ConfirmModal } from "../../../components/ui/ModernModal";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import { inp } from "./staffConfig";

const LIMIT = 12;
const EMPTY = { name: "", phone: "", territory: "", commission: "5", status: "active" };

const GRAD_POOL = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

/* ── Rep Card ── */
const RepCard = ({ rep, currency, maxSales, rank, onEdit, onDelete }) => {
  const isActive = rep.status === "active";
  const grad = GRAD_POOL[rank % GRAD_POOL.length];
  const salesPct = maxSales > 0 ? Math.round(((rep.totalSales || 0) / maxSales) * 100) : 0;
  const isTop = rank === 0;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-200">
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${grad}`} />

      {/* Top badge */}
      {isTop && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
          <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">TOP REP</span>
        </div>
      )}

      <div className="p-5">
        {/* Avatar + identity */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-black text-xl">{rep.name?.[0]?.toUpperCase()}</span>
            </div>
            {/* Commission ring overlay */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{rep.commission}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-bold text-slate-900 dark:text-white text-base truncate">{rep.name}</p>
            {rep.phone && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />{rep.phone}
              </p>
            )}
            {rep.territory && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />{rep.territory}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-slate-400 font-medium">#{rank + 1} rank</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total Sales</span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{formatCurrency(rep.totalSales || 0, currency)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Earned</span>
            </div>
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 truncate">{formatCurrency(rep.earned || 0, currency)}</p>
          </div>
        </div>

        {/* Sales performance bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span>Performance vs top</span><span className="font-semibold">{salesPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`} style={{ width: `${salesPct}%` }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => onEdit(rep)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(rep)}
            className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Panel ── */
const RepsPanel = () => {
  const { state, actions } = useApp();
  const { settings } = state;

  const { data: reps, loading, page, totalPages, total, setPage, refresh } =
    usePaginatedApi(getSalesReps, {}, LIMIT);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalEarned = reps.reduce((s, r) => s + (r.earned || 0), 0);
  const totalSales  = reps.reduce((s, r) => s + (r.totalSales || 0), 0);
  const maxSales    = Math.max(...reps.map(r => r.totalSales || 0), 1);
  const sorted      = [...reps].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm({ name: r.name, phone: r.phone || "", territory: r.territory || "", commission: String(r.commission || 5), status: r.status || "active" }); setEditing(r); setShowModal(true); };
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { actions.showToast({ message: "Name is required", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, commission: parseFloat(form.commission) || 5 };
      if (editing) { await updateSalesRep(editing._id, payload); actions.showToast({ message: "Rep updated", type: "success" }); }
      else          { await createSalesRep(payload);              actions.showToast({ message: "Rep added",   type: "success" }); }
      setShowModal(false); refresh();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteSalesRep(deleteTarget._id); actions.showToast({ message: "Rep removed", type: "success" }); setDeleteTarget(null); refresh(); }
    catch (err) { actions.showToast({ message: err.response?.data?.message || "Failed", type: "error" }); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Representatives</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} reps · Commission paid: {formatCurrency(totalEarned, settings.currency)}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/30">
          <Plus className="w-4 h-4" /> Add Rep
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Reps",  value: total,                                         color: "text-violet-600 dark:text-violet-400",  bg: "from-violet-50 to-purple-50 dark:from-violet-900/15 dark:to-purple-900/15",   border: "border-violet-100 dark:border-violet-900/30" },
          { label: "Total Sales", value: formatCurrency(totalSales, settings.currency), color: "text-blue-600 dark:text-blue-400",       bg: "from-blue-50 to-cyan-50 dark:from-blue-900/15 dark:to-cyan-900/15",           border: "border-blue-100 dark:border-blue-900/30" },
          { label: "Commission",  value: formatCurrency(totalEarned, settings.currency),color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15",     border: "border-emerald-100 dark:border-emerald-900/30" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 text-center`}>
            <p className={`text-base font-black ${color} truncate`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-400">Loading reps...</p>
        </div>
      ) : reps.length === 0 ? (
        <EmptyState icon={UserCheck} title="No sales reps yet" description="Add your field representatives to track commissions and performance" actionLabel="Add Rep" onAction={openAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((r, i) => (
            <RepCard key={r._id} rep={r} currency={settings.currency} maxSales={maxSales} rank={i}
              onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Modal */}
      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? "Edit Sales Rep" : "Add Sales Rep"} icon={UserCheck} iconColor="blue"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving..." : editing ? "Update" : "Add Rep"}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name *</label><input value={form.name} onChange={e => f("name", e.target.value)} className={inp} placeholder="Rep name" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} className={inp} placeholder="+92 300 0000000" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Territory</label><input value={form.territory} onChange={e => f("territory", e.target.value)} className={inp} placeholder="e.g. Multan Region" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Commission (%)</label><input type="number" min="0" max="100" step="0.5" value={form.commission} onChange={e => f("commission", e.target.value)} className={inp} /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select value={form.status} onChange={e => f("status", e.target.value)} className={inp}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </ModernModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Sales Rep" message={`Remove "${deleteTarget?.name}" from the team?`}
        confirmText="Remove" confirmVariant="danger" icon={Trash2} iconColor="red" />
    </div>
  );
};

export default RepsPanel;
