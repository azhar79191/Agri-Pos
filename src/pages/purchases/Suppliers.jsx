import PageHeader from "../../components/ui/PageHeader";
import SharedButton from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SearchableSelect from "../../components/ui/Select";
import LoadingState, { LoadingIndicator } from "../../components/ui/LoadingState";
import PendingInventoryOperations from "../../components/PendingInventoryOperations";
import SupplierPaymentModal from "../../components/purchases/SupplierPaymentModal";
import SupplierClaims from "../../components/purchases/SupplierClaims";
import React, { useState } from "react";
import SupplierLedgerModal from "../../components/purchases/SupplierLedgerModal";
import { Building2, Plus, Phone, MapPin, Edit2, Trash2, TrendingUp, CreditCard } from "lucide-react";
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
  const { state, actions } = useApp();
  const { settings } = state;
  const isAdmin      = actions.hasPermission('stock:manage');

  const { data: suppliers, loading, error, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh } =
    usePaginatedApi(getSuppliers, { search: "" }, LIMIT);

  const { showModal, setShowModal, editing, saving, deleting, form, setForm, openCreate, openEdit, handleSave, handleDelete } =
    useSupplierForm(refresh);

  const [paymentSupplier, setPaymentSupplier] = useState(null);
  const [ledgerSupplier, setLedgerSupplier] = useState(null);
  const totalOutstanding = suppliers.reduce((s, sup) => s + Math.max(0, (sup.outstanding || 0) - (sup.creditBalance || 0)), 0);

  return (
    <div className="space-y-5 animate-fade-up">
      <PendingInventoryOperations pathPrefix="/suppliers" onRecovered={refresh} />
      {isAdmin && <SupplierClaims suppliers={suppliers} currency={settings.currency} onRecorded={refresh} />}
      {paymentSupplier && <SupplierPaymentModal key={paymentSupplier._id} supplier={paymentSupplier} currency={settings.currency} onClose={() => setPaymentSupplier(null)} onRecorded={refresh} />}
      {ledgerSupplier && <SupplierLedgerModal key={ledgerSupplier._id} supplier={ledgerSupplier} currency={settings.currency} onClose={() => setLedgerSupplier(null)} />}
      <PageHeader title={<>Suppliers</>} description={<>{total} suppliers · Outstanding: {formatCurrency(totalOutstanding, settings.currency)}</>} icon={Building2} actions={<>{isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
            <Plus className="w-4 h-4" />Add Supplier
          </button>
        )}</>}></PageHeader>

      <FilterBar filters={[{ type: "search", key: "search", placeholder: "Search by name or contact..." }]} values={filters} onChange={setFilter} onClear={() => setFilters({ search: "" })} total={total} />

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" onClick={refresh} className="min-h-11 underline">Retry suppliers</button></p>}
      {loading ? (
        <LoadingState variant="cards" label="Loading suppliers" />
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers found" description="Add your product suppliers to manage purchase orders" actionLabel={isAdmin ? "Add Supplier" : undefined} onAction={isAdmin ? openCreate : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s._id} className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 hover:shadow-premium-lg transition-all group">
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
                      {deleting === s._id ? <LoadingIndicator /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                {s.phone   && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                {s.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.address}</span>}
              </div>
              {(s.creditBalance || 0) > (s.outstanding || 0) && <p className="mb-3 rounded-lg bg-emerald-50 p-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Supplier credit: {formatCurrency(Math.max(0, (s.creditBalance || 0) - (s.outstanding || 0)), settings.currency)}</p>}
              {isAdmin && (s.outstanding || 0) > (s.creditBalance || 0) && <SharedButton type="button" onClick={() => setPaymentSupplier(s)} className="mb-3 mr-4 min-h-11 rounded-lg px-3 text-sm font-semibold">Record payment</SharedButton>}
              <button type="button" onClick={() => setLedgerSupplier(s)} className="mb-3 min-h-11 text-sm font-semibold text-blue-600 underline">View balance movements</button>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <div><p className="text-xs text-slate-400">Net Purchases</p><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.totalPurchases || 0, settings.currency)}</p></div>
                </div>
                {(s.outstanding || 0) > (s.creditBalance || 0) && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <div><p className="text-xs text-slate-400">Outstanding</p><p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(Math.max(0, (s.outstanding || 0) - (s.creditBalance || 0)), settings.currency)}</p></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      <ModernModal busy={saving} isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Supplier" : "Add Supplier"}
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" data-modal-dismiss>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--pos-primary)" }}>
              {saving ? <LoadingIndicator /> : <Building2 className="w-4 h-4" />}
              {editing ? "Update" : "Add Supplier"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {FIELDS.map(({ l, k, type }) => (
            <FormField key={k} label={<>{l}</>}>

              <input type={type} value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all" />
            </FormField>
          ))}
          <FormField label={<>Payment Terms</>}>

            <SearchableSelect value={form.paymentTerms} onChange={(e) => setForm((p) => ({ ...p, paymentTerms: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[var(--pos-primary)]/20 focus:border-[var(--pos-primary)] transition-all">
              {["COD", "Net 7", "Net 15", "Net 30", "Net 60"].map((t) => <option key={t} value={t}>{t}</option>)}
            </SearchableSelect>
          </FormField>
        </div>
      </ModernModal>
    </div>
  );
};

export default Suppliers;
