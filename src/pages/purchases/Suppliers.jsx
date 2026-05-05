import React from "react";
import { Building2, Plus, Phone, MapPin, Edit2, Trash2, Loader2, TrendingUp, CreditCard } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getSuppliers } from "../../api/suppliersApi";
import ModernModal from "../../components/ui/ModernModal";
import { useSupplierForm } from "../../hooks/useSupplierForm";

const LIMIT = 12;

const FIELDS = [
  { l: "Company Name *", k: "name",    type: "text" },
  { l: "Contact Person", k: "contact", type: "text" },
  { l: "Phone",          k: "phone",   type: "tel" },
  { l: "Email",          k: "email",   type: "email" },
  { l: "Address",        k: "address", type: "text" },
];

const Suppliers = () => {
  const { state }    = useApp();
  const { settings } = state;
  const isAdmin      = state.currentUser?.role === "admin" || state.currentUser?.role === "manager";

  const { data: suppliers, loading, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh } =
    usePaginatedApi(getSuppliers, { search: "" }, LIMIT);

  const { showModal, setShowModal, editing, saving, deleting, form, setForm, openCreate, openEdit, handleSave, handleDelete } =
    useSupplierForm(refresh);

  const totalOutstanding = suppliers.reduce((s, sup) => s + (sup.outstanding || 0), 0);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0"><Building2 className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Suppliers</h1><p className="text-sm text-slate-500 dark:text-slate-400">{total} suppliers · Outstanding: {formatCurrency(totalOutstanding, settings.currency)}</p></div>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
            <Plus className="w-4 h-4" />Add Supplier
          </button>
        )}
      </div>

      <FilterBar filters={[{ type: "search", key: "search", placeholder: "Search by name or contact..." }]} values={filters} onChange={setFilter} onClear={() => setFilters({ search: "" })} total={total} />

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading suppliers...</span></div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers found" description="Add your product suppliers to manage purchase orders" actionLabel={isAdmin ? "Add Supplier" : undefined} onAction={isAdmin ? openCreate : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s._id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 hover:shadow-premium-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{s.name?.[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.contact || "—"} · <span className="font-medium text-slate-500">{s.paymentTerms}</span></p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s._id)} disabled={deleting === s._id} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                      {deleting === s._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                {s.phone   && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                {s.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.address}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <div><p className="text-xs text-slate-400">Total Purchases</p><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.totalPurchases || 0, settings.currency)}</p></div>
                </div>
                {(s.outstanding || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <div><p className="text-xs text-slate-400">Outstanding</p><p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(s.outstanding, settings.currency)}</p></div>
                  </div>
                )}
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

      <ModernModal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Supplier" : "Add Supplier"}
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--pos-primary)" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {editing ? "Update" : "Add Supplier"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {FIELDS.map(({ l, k, type }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{l}</label>
              <input type={type} value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Terms</label>
            <select value={form.paymentTerms} onChange={(e) => setForm((p) => ({ ...p, paymentTerms: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all">
              {["COD", "Net 7", "Net 15", "Net 30", "Net 60"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </ModernModal>
    </div>
  );
};

export default Suppliers;
