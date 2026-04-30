import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, Search, Eye, Printer, Download, DollarSign, User,
  CreditCard, CheckCircle, Clock, AlertCircle, Wifi, WifiOff,
  RefreshCw, Check, ChevronDown, Banknote, Smartphone, Trash2,
  TrendingUp, Package, RotateCcw, Filter, X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "../hooks/useInvoices";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { exportInvoices } from "../utils/excelExport";
import { CardSkeleton } from "../components/ui/Skeleton";
import { refundInvoice, deleteInvoice } from "../api/invoicesApi";
import { ConfirmModal } from "../components/ui/ModernModal";
import Pagination from "../components/ui/Pagination";

const LIMIT = 12;

const STATUS_CFG = {
  Completed: { icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800" },
  Pending:   { icon: Clock,       cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         dot: "bg-amber-500",  border: "border-amber-200 dark:border-amber-800" },
  Cancelled: { icon: AlertCircle, cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 dot: "bg-red-500",    border: "border-red-200 dark:border-red-800" },
};

const PAY_CFG = {
  Cash:             { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", icon: Banknote },
  Credit:           { cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",    icon: CreditCard },
  "Online Transfer":{ cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",            icon: Smartphone },
  Card:             { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",    icon: CreditCard },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Invoice Card ── */
const InvoiceCard = ({ invoice, currency, isAdmin, onView, onPrint, onDownload, onMarkComplete, onRefund, onDelete }) => {
  const sc = STATUS_CFG[invoice.status] || STATUS_CFG.Pending;
  const pc = PAY_CFG[invoice.paymentMethod] || { cls: "bg-slate-100 text-slate-700", icon: CreditCard };
  const PayIcon = pc.icon;
  const StatusIcon = sc.icon;
  const fmt = (v) => `${currency} ${(Number(v) || 0).toFixed(2)}`;

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-200 ${sc.border}`}>
      {/* Status accent top bar */}
      <div className={`h-1 w-full ${invoice.status === "Completed" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : invoice.status === "Pending" ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />

      <div className="p-4 space-y-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">#{invoice.invoiceNumber}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />{fmtDate(invoice.createdAt)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${sc.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {invoice.status}
          </span>
        </div>

        {/* Customer block */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shrink-0">
            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              {(invoice.customerName || "W")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{invoice.customerName || "Walk-in Customer"}</p>
            {invoice.customerPhone && <p className="text-[10px] text-slate-400 truncate">{invoice.customerPhone}</p>}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${pc.cls}`}>
            <PayIcon className="w-3 h-3" />{invoice.paymentMethod}
          </span>
        </div>

        {/* Items preview */}
        {invoice.items?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {invoice.items.slice(0, 3).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                <Package className="w-2.5 h-2.5" />{item.productName || item.name} ×{item.quantity}
              </span>
            ))}
            {invoice.items.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">+{invoice.items.length - 3} more</span>
            )}
          </div>
        )}

        {/* Amount */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400">
            {invoice.items?.length || 0} item{invoice.items?.length !== 1 ? "s" : ""}
            {invoice.discount > 0 && <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">−{fmt(invoice.discount)} off</span>}
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmt(invoice.total || invoice.grandTotal || 0)}</p>
        </div>

        {/* Action bar */}
        <div className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => onView(invoice)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button onClick={() => onPrint(invoice)} title="Print"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDownload(invoice)} title="Download PDF"
            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
          {invoice.status === "Pending" && isAdmin && (
            <button onClick={() => onMarkComplete(invoice)} title="Mark Completed"
              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {invoice.status === "Completed" && isAdmin && (
            <button onClick={() => onRefund(invoice)} title="Refund"
              className="p-2 rounded-xl text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-orange-200 dark:border-orange-800 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(invoice)} title="Delete"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const InvoiceManagement = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { invoices, loading, fetchInvoices, changeStatus } = useInvoices();
  const isOnline = useOnlineStatus();
  const isAdmin = currentUser?.role === "admin";

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [page, setPage]               = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => { fetchInvoices(); }, []); // eslint-disable-line

  const fmt = (v) => `${settings.currency} ${(Number(v) || 0).toFixed(2)}`;

  const filtered = useMemo(() => invoices.filter(inv => {
    const ms = inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
               inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
               inv.customerPhone?.includes(search);
    return ms && (filterStatus === "all" || inv.status === filterStatus) &&
                 (filterPayment === "all" || inv.paymentMethod === filterPayment);
  }), [invoices, search, filterStatus, filterPayment]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  // Stats
  const totalRevenue  = invoices.filter(i => i.status === "Completed").reduce((s, i) => s + (i.total || i.grandTotal || 0), 0);
  const pendingCount  = invoices.filter(i => i.status === "Pending").length;
  const todayCount    = invoices.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await refundInvoice(refundTarget._id);
      actions.showToast({ message: `Invoice #${refundTarget.invoiceNumber} refunded`, type: "success" });
      fetchInvoices(); setRefundTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Refund failed", type: "error" });
    } finally { setRefunding(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget._id);
      actions.showToast({ message: `Invoice #${deleteTarget.invoiceNumber} deleted`, type: "success" });
      fetchInvoices(); setDeleteTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Delete failed", type: "error" });
    } finally { setDeleting(false); }
  };

  const confirmStatus = async () => {
    if (!statusTarget) return;
    setUpdatingStatus(true);
    try {
      await changeStatus(statusTarget.invoice._id, statusTarget.newStatus);
      actions.showToast({ message: `Invoice marked as ${statusTarget.newStatus}`, type: "success" });
      fetchInvoices(); setStatusTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally { setUpdatingStatus(false); }
  };

  const handlePrint = (inv) => { setSelectedInvoice(inv); setShowModal(true); setTimeout(() => window.print(), 500); };

  const clearFilters = () => { setSearch(""); setFilterStatus("all"); setFilterPayment("all"); setPage(1); };
  const hasFilters = search || filterStatus !== "all" || filterPayment !== "all";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
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
          <button onClick={() => exportInvoices(invoices, settings.currency)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => fetchInvoices()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invoices", value: invoices.length,                                                    icon: FileText,    grad: "from-slate-500 to-slate-600",    bg: "bg-slate-50 dark:bg-slate-800/60" },
          { label: "Revenue",        value: fmt(totalRevenue),                                                  icon: TrendingUp,  grad: "from-emerald-500 to-teal-600",   bg: "bg-emerald-50 dark:bg-emerald-900/15" },
          { label: "Pending",        value: pendingCount,                                                       icon: Clock,       grad: "from-amber-500 to-orange-500",   bg: "bg-amber-50 dark:bg-amber-900/15" },
          { label: "Today",          value: todayCount,                                                         icon: CheckCircle, grad: "from-blue-500 to-indigo-600",    bg: "bg-blue-50 dark:bg-blue-900/15" },
        ].map(({ label, value, icon: Icon, grad, bg }) => (
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

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by invoice #, customer name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1); }}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer">
              <option value="all">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
              <option value="Online Transfer">Online Transfer</option>
              <option value="Card">Card</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors hover:bg-red-100 dark:hover:bg-red-900/30">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400 opacity-40" />
          </div>
          <p className="font-bold text-slate-500 dark:text-slate-400">No invoices found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {hasFilters ? "Try adjusting your filters" : "No invoices generated yet"}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map(invoice => (
            <InvoiceCard key={invoice._id} invoice={invoice} currency={settings.currency} isAdmin={isAdmin}
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

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* ── Invoice View Modal ── */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base font-bold text-slate-900">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Invoice invoice={selectedInvoice} settings={settings}
              onPrint={() => window.print()}
              onDownload={() => downloadInvoicePDF(selectedInvoice, settings)}
              onEmail={() => {}} />
          </div>
        </div>
      )}

      {/* ── Confirm Modals ── */}
      <ConfirmModal isOpen={!!refundTarget} onClose={() => setRefundTarget(null)} onConfirm={handleRefund}
        title="Refund Invoice"
        message={`Refund Invoice #${refundTarget?.invoiceNumber}? Stock will be restored and any credit reversed.`}
        confirmText="Refund" confirmVariant="danger" loading={refunding}
        icon={RotateCcw} iconColor="amber" />

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Invoice"
        message={`Permanently delete Invoice #${deleteTarget?.invoiceNumber}? This action cannot be undone.`}
        confirmText="Delete" confirmVariant="danger" loading={deleting}
        icon={Trash2} iconColor="red" />

      <ConfirmModal isOpen={!!statusTarget} onClose={() => setStatusTarget(null)} onConfirm={confirmStatus}
        title="Update Invoice Status"
        message={`Mark Invoice #${statusTarget?.invoice?.invoiceNumber} as ${statusTarget?.newStatus}?`}
        confirmText="Update" confirmVariant="primary" loading={updatingStatus}
        icon={CheckCircle} iconColor="emerald" />
    </div>
  );
};

export default InvoiceManagement;
