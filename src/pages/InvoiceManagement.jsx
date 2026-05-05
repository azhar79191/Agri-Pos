import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, Search, Download, CheckCircle, Clock,
  Wifi, WifiOff, RefreshCw, ChevronDown, RotateCcw, Trash2, X, TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "../hooks/useInvoices";
import { useInvoiceActions } from "../hooks/useInvoiceActions";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import InvoiceCard from "../components/invoices/InvoiceCard";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { exportInvoices } from "../utils/excelExport";
import { CardSkeleton } from "../components/ui/Skeleton";
import { ConfirmModal } from "../components/ui/ModernModal";
import Pagination from "../components/ui/Pagination";

const LIMIT = 12;

const InvoiceManagement = () => {
  const { state } = useApp();
  const { settings, currentUser } = state;
  const { invoices, loading, fetchInvoices } = useInvoices();
  const isOnline = useOnlineStatus();
  const isAdmin  = currentUser?.role === "admin";

  const {
    refundTarget, setRefundTarget, refunding, handleRefund,
    deleteTarget, setDeleteTarget, deleting, handleDelete,
    statusTarget, setStatusTarget, updatingStatus, confirmStatus,
  } = useInvoiceActions();

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [page, setPage]                 = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal]       = useState(false);

  useEffect(() => { fetchInvoices(); }, []); // eslint-disable-line

  const fmt = (v) => `${settings.currency} ${(Number(v) || 0).toFixed(2)}`;

  const filtered = useMemo(() =>
    invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerPhone?.includes(search);
      return matchSearch &&
        (filterStatus === "all" || inv.status === filterStatus) &&
        (filterPayment === "all" || inv.paymentMethod === filterPayment);
    }),
    [invoices, search, filterStatus, filterPayment]
  );

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const totalRevenue = invoices.filter((i) => i.status === "Completed").reduce((s, i) => s + (i.total || i.grandTotal || 0), 0);
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const todayCount   = invoices.filter((i) => new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  const hasFilters = search || filterStatus !== "all" || filterPayment !== "all";
  const clearFilters = () => { setSearch(""); setFilterStatus("all"); setFilterPayment("all"); setPage(1); };

  const handlePrint = (inv) => { setSelectedInvoice(inv); setShowModal(true); setTimeout(() => window.print(), 500); };

  const STATS = [
    { label: "Total Invoices", value: invoices.length,   icon: FileText,    grad: "from-slate-500 to-slate-600",  bg: "bg-slate-50 dark:bg-slate-800/60" },
    { label: "Revenue",        value: fmt(totalRevenue), icon: TrendingUp,  grad: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/15" },
    { label: "Pending",        value: pendingCount,      icon: Clock,       grad: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/15" },
    { label: "Today",          value: todayCount,        icon: CheckCircle, grad: "from-blue-500 to-indigo-600",  bg: "bg-blue-50 dark:bg-blue-900/15" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50 dark:shadow-blue-900/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Invoices</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} of {invoices.length} invoices</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${isOnline ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportInvoices(invoices, settings.currency)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => fetchInvoices()} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, grad, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-transparent`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                <p className="font-black text-slate-900 dark:text-white text-sm mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by invoice #, customer name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
        </div>
        <div className="flex gap-2">
          {[
            { value: filterStatus, onChange: (v) => { setFilterStatus(v); setPage(1); }, options: [["all","All Status"],["Completed","Completed"],["Pending","Pending"],["Cancelled","Cancelled"]] },
            { value: filterPayment, onChange: (v) => { setFilterPayment(v); setPage(1); }, options: [["all","All Payments"],["Cash","Cash"],["Credit","Credit"],["Online Transfer","Online Transfer"],["Card","Card"]] },
          ].map(({ value, onChange, options }, i) => (
            <div key={i} className="relative">
              <select value={value} onChange={(e) => onChange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400 opacity-40" />
          </div>
          <p className="font-bold text-slate-500 dark:text-slate-400">No invoices found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{hasFilters ? "Try adjusting your filters" : "No invoices generated yet"}</p>
          {hasFilters && <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">Clear Filters</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              currency={settings.currency}
              isAdmin={isAdmin}
              onView={(inv) => { setSelectedInvoice(inv); setShowModal(true); }}
              onPrint={handlePrint}
              onDownload={(inv) => downloadInvoicePDF(inv, settings)}
              onMarkComplete={(inv) => setStatusTarget({ invoice: inv, newStatus: "Completed" })}
              onRefund={setRefundTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Invoice view modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base font-bold text-slate-900">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Invoice invoice={selectedInvoice} settings={settings} onPrint={() => window.print()} onDownload={() => downloadInvoicePDF(selectedInvoice, settings)} onEmail={() => {}} />
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!refundTarget} onClose={() => setRefundTarget(null)} onConfirm={handleRefund} title="Refund Invoice" message={`Refund Invoice #${refundTarget?.invoiceNumber}? Stock will be restored and any credit reversed.`} confirmText="Refund" confirmVariant="danger" loading={refunding} icon={RotateCcw} iconColor="amber" />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Invoice" message={`Permanently delete Invoice #${deleteTarget?.invoiceNumber}? This action cannot be undone.`} confirmText="Delete" confirmVariant="danger" loading={deleting} icon={Trash2} iconColor="red" />
      <ConfirmModal isOpen={!!statusTarget} onClose={() => setStatusTarget(null)} onConfirm={confirmStatus} title="Update Invoice Status" message={`Mark Invoice #${statusTarget?.invoice?.invoiceNumber} as ${statusTarget?.newStatus}?`} confirmText="Update" confirmVariant="primary" loading={updatingStatus} icon={CheckCircle} iconColor="emerald" />
    </div>
  );
};

export default InvoiceManagement;
