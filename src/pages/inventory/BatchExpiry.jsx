import PageHeader from "../../components/ui/PageHeader";
import SharedButton from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SearchableSelect from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import React, { useState, useMemo } from "react";
import { Package, AlertTriangle, Clock, Calendar, Search, ChevronDown, Plus } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import { useBatches } from "../../hooks/useBatches";
import { getExpiryStatus } from "../../constants/batches";

const STATS_CFG = (stats) => [
  { label: "Total Batches",   value: stats.total,       color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30",   icon: Package },
  { label: "Expiring < 30d",  value: stats.expiring30,  color: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30",     icon: AlertTriangle },
  { label: "Expiring < 60d",  value: stats.expiring60,  color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-100 dark:bg-orange-900/30",icon: Clock },
  { label: "Expired",         value: stats.expired,     color: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30",     icon: AlertTriangle },
];

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm";

const BatchExpiry = () => {
  const { batches, loading, error, reload, page, total, totalPages, setPage, filters, setFilter, showModal, setShowModal, saving, form, setForm, handleAdd } = useBatches();
  const search = filters.search;
  const filterStatus = filters.status || "all";
  const setSearch = value => setFilter("search", value);
  const setFilterStatus = value => setFilter("status", value === "all" ? "" : value);

  const filtered = batches;

  const stats = useMemo(() => ({
    total:      batches.length,
    expiring30: batches.filter((b) => { const d = getExpiryStatus(b.expiryDate).days; return d > 0 && d <= 30; }).length,
    expiring60: batches.filter((b) => { const d = getExpiryStatus(b.expiryDate).days; return d > 30 && d <= 60; }).length,
    expired:    batches.filter((b) => getExpiryStatus(b.expiryDate).days <= 0).length,
  }), [batches]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-up">
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
        <p>{error}</p><button type="button" onClick={reload} className="mt-2 min-h-11 underline font-semibold">Retry loading batches</button>
      </div>}
      <PageHeader title={<>Batch & Expiry</>} description={<>Track batches, lots, and expiry dates</>} icon={Calendar} actions={<><SharedButton onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all">
          <Plus className="w-4 h-4" />Add Batch
        </SharedButton></>}></PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS_CFG(stats).map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      <FilterBar className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input aria-label="Search by product or batch #" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or batch #..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        </div>
        <div className="relative">
          <SearchableSelect aria-label="All Batches" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm cursor-pointer">
            <option value="all">All Batches</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </SearchableSelect>
        </div>
      </FilterBar>

      <div className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable loading={loading} loadingLabel="Loading batches" emptyState={false} className="w-full table-premium">
            <thead>
              <tr>{["Product", "Batch/Lot #", "Mfg Date", "Expiry Date", "Qty", "Remaining", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((batch) => {
                const expiry = getExpiryStatus(batch.expiryDate);
                return (
                  <tr key={batch._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white text-sm">{batch.productName}</td>
                    <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{batch.batchNo}</span></td>
                    <td data-sort-value={batch.mfgDate} className="px-4 py-3.5 text-sm text-slate-500">{formatDate(batch.mfgDate)}</td>
                    <td data-sort-value={batch.expiryDate} className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(batch.expiryDate)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{batch.quantity}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{batch.remaining}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${expiry.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${expiry.dot}`} />{expiry.label} {expiry.days > 0 ? `(${expiry.days}d)` : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
          {!loading && filtered.length === 0 && <EmptyState icon={Package} title="No batches found" description="Add batch tracking to your products" />}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} limit={15} onPageChange={setPage} />
      <ModernModal busy={saving} isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Batch"
        footer={<SharedButton onClick={handleAdd} disabled={saving} className="px-5 py-2.5 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors">{saving ? "Saving..." : "Add Batch"}</SharedButton>}>
        <div className="space-y-4">
          <FormField label={<>Product Name *</>}><input value={form.productName} onChange={set("productName")} className={inputCls} placeholder="Product name" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={<>Batch/Lot # *</>}><input value={form.batchNo} onChange={set("batchNo")} className={inputCls} /></FormField>
            <FormField label={<>Quantity</>}><input type="number" value={form.quantity} onChange={set("quantity")} className={inputCls} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={<>Mfg Date</>}><input type="date" value={form.mfgDate} onChange={set("mfgDate")} className={inputCls} /></FormField>
            <FormField label={<>Expiry Date *</>}><input type="date" value={form.expiryDate} onChange={set("expiryDate")} className={inputCls} /></FormField>
          </div>
          <FormField label={<>Cost Price</>}><input type="number" value={form.costPrice} onChange={set("costPrice")} className={inputCls} placeholder="0" /></FormField>
        </div>
      </ModernModal>
    </div>
  );
};

export default BatchExpiry;
