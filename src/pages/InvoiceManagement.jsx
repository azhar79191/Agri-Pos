import React, { useState, useEffect } from "react";
import {
  FileText, Search, Eye, Printer, Download, DollarSign, User,
  CreditCard, CheckCircle, Clock, AlertCircle, Wifi, WifiOff,
  RefreshCw, Check, ChevronDown, Banknote, Smartphone
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "../hooks/useInvoices";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { exportInvoices } from "../utils/excelExport";
import { CardSkeleton } from "../components/ui/Skeleton";
import { refundInvoice } from "../api/invoicesApi";
import { ConfirmModal } from "../components/ui/ModernModal";
import ModernButton from "../components/ui/ModernButton";

const statusConfig = {
  Completed: { icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  Pending:   { icon: Clock,        cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   dot: "bg-amber-500" },
  Cancelled: { icon: AlertCircle,  cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           dot: "bg-red-500" },
};

const paymentConfig = {
  Cash:             { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Banknote },
  Credit:           { cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",    icon: CreditCard },
  "Online Transfer":{ cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",            icon: Smartphone },
  Card:             { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",    icon: CreditCard },
};

const selectCls = "appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer";

const InvoiceManagement = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { invoices, loading, fetchInvoices, changeStatus } = useInvoices();
  const isOnline = useOnlineStatus();
  const isAdmin = currentUser?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => { fetchInvoices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesPayment = filterPayment === "all" || invoice.paymentMethod === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await refundInvoice(refundTarget._id);
      actions.showToast({ message: `Invoice #${refundTarget.invoiceNumber} refunded`, type: "success" });
      fetchInvoices(); setRefundTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Refund failed", type: "error" });
      setRefundTarget(null);
    } finally { setRefunding(false); }
  };

  const handleStatusUpdate = (invoice, newStatus) => {
    if (!isAdmin && newStatus === "Completed" && invoice.paymentMethod === "Online Transfer") {
      actions.showToast({ message: "Only admin can mark online paid invoices as completed", type: "error" }); return;
    }
    setStatusUpdateTarget({ invoice, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateTarget) return;
    setUpdatingStatus(true);
    try {
      await changeStatus(statusUpdateTarget.invoice._id, statusUpdateTarget.newStatus);
      actions.showToast({ message: `Invoice #${statusUpdateTarget.invoice.invoiceNumber} marked as ${statusUpdateTarget.newStatus}`, type: "success" });
      fetchInvoices(); setStatusUpdateTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Status update failed", type: "error" });
    } finally { setUpdatingStatus(false); }
  };

  const fmt = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? `${settings.currency || "Rs."} 0.00` : `${settings.currency || "Rs."} ${num.toFixed(2)}`;
  };
  const fmtDate = (date) => date ? new Date(date).toLocaleDateString("en-PK") : "—";

  // Summary stats
  const totalRevenue = invoices.filter(i => i.status === "Completed").reduce((s, i) => s + (i.total || i.grandTotal || 0), 0);
  const pendingCount = invoices.filter(i => i.status === "Pending").length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoice Management</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{filteredInvoices.length} invoices</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isOnline ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => exportInvoices(invoices, settings.currency)} icon={Download} size="sm">Export</ModernButton>
          <ModernButton variant="secondary" onClick={() => fetchInvoices()} icon={RefreshCw} size="sm">Refresh</ModernButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length, cls: "text-slate-900 dark:text-white", bg: "bg-slate-100 dark:bg-slate-800", icon: FileText },
          { label: "Completed", value: invoices.filter(i => i.status === "Completed").length, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle },
          { label: "Pending", value: pendingCount, cls: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
          { label: "Total Revenue", value: fmt(totalRevenue), cls: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: DollarSign },
        ].map(({ label, value, cls, bg, icon: Icon }, i) => (
          <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${cls}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`font-bold text-sm mt-0.5 ${cls}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by invoice #, customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className={selectCls}>
            <option value="all">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
            <option value="Online Transfer">Online Transfer</option>
            <option value="Card">Card</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Invoice Cards */}
      {loading ? <CardSkeleton count={6} /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice, i) => {
            const sc = statusConfig[invoice.status] || statusConfig.Pending;
            const pc = paymentConfig[invoice.paymentMethod] || { cls: "bg-slate-100 text-slate-700", icon: CreditCard };
            const PayIcon = pc.icon;
            return (
              <div key={invoice._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden animate-fade-up stagger-${Math.min(i + 1, 4)}`}>
                {/* Card top stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="p-4 space-y-3">
                  {/* Invoice # and status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">#{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtDate(invoice.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {invoice.status}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{invoice.customerName || "Walk-in Customer"}</p>
                      {invoice.customerPhone && <p className="text-xs text-slate-400 truncate">{invoice.customerPhone}</p>}
                    </div>
                  </div>

                  {/* Amount + payment */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pc.cls}`}>
                      <PayIcon className="w-3 h-3" />{invoice.paymentMethod}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(invoice.total || invoice.grandTotal || 0)}</p>
                      <p className="text-xs text-slate-400">{invoice.items?.length || 0} items</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => { setSelectedInvoice(invoice); setShowInvoiceModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <Eye className="w-3.5 h-3.5" />View
                    </button>
                    <button onClick={() => { setSelectedInvoice(invoice); setShowInvoiceModal(true); setTimeout(() => window.print(), 500); }}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Print">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => downloadInvoicePDF(invoice, settings)}
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download PDF">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {invoice.status === "Pending" && (
                      <button onClick={() => handleStatusUpdate(invoice, "Completed")} disabled={!isAdmin && invoice.paymentMethod === "Online Transfer"}
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40" title="Mark Completed">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {invoice.status === "Completed" && (
                      <button onClick={() => setRefundTarget(invoice)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Refund">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredInvoices.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-500 dark:text-slate-400">No invoices found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {searchTerm || filterStatus !== "all" || filterPayment !== "all" ? "Try adjusting your filters" : "No invoices generated yet"}
          </p>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base font-bold text-slate-900">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 text-xl leading-none">×</button>
            </div>
            <Invoice invoice={selectedInvoice} settings={settings} onPrint={() => window.print()} onDownload={() => downloadInvoicePDF(selectedInvoice, settings)} onEmail={() => {}} />
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!refundTarget} onClose={() => setRefundTarget(null)} onConfirm={handleRefund}
        title="Refund Invoice" message={`Refund Invoice #${refundTarget?.invoiceNumber}? Stock will be restored and credit reversed.`}
        confirmText="Refund" confirmVariant="danger" loading={refunding} />

      <ConfirmModal isOpen={!!statusUpdateTarget} onClose={() => setStatusUpdateTarget(null)} onConfirm={confirmStatusUpdate}
        title="Update Invoice Status" message={`Mark Invoice #${statusUpdateTarget?.invoice?.invoiceNumber} as ${statusUpdateTarget?.newStatus}?`}
        confirmText="Update Status" confirmVariant="primary" loading={updatingStatus} />
    </div>
  );
};

export default InvoiceManagement;
