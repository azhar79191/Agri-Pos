import PageHeader from "../components/ui/PageHeader";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import FilterBar from "../components/ui/FilterBar";
import React, { useState, useEffect } from "react";
import { FileText, Search, Download, CheckCircle, Clock, Wifi, WifiOff, RefreshCw, RotateCcw, Trash2, X, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "../hooks/useInvoices";
import { useInvoiceActions } from "../hooks/useInvoiceActions";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import EmailInvoiceModal from "../components/invoices/EmailInvoiceModal";
import InvoiceCard from "../components/invoices/InvoiceCard";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { exportInvoices } from "../utils/excelExport";
import { CardSkeleton } from "../components/ui/Skeleton";
import { ConfirmModal } from "../components/ui/ModernModal";
import Pagination from "../components/ui/Pagination";
import Select from "../components/ui/Select";

const LIMIT = 12;

const InvoiceManagement = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const { invoices, loading, error, pagination, fetchInvoices } = useInvoices();
  const isOnline = useOnlineStatus();
  const isAdmin = actions.hasPermission("invoices:edit");

  const {
    refundTarget, setRefundTarget, refunding, handleRefund,
    deleteTarget, setDeleteTarget, deleting, handleDelete,
    statusTarget, setStatusTarget, updatingStatus, confirmStatus,
  } = useInvoiceActions();

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortOrder, setSortOrder] = useState('-createdAt');
  const [page, setPage]                 = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal]       = useState(false);

  const [emailInvoice, setEmailInvoice] = useState(null);

  // Lock body scroll when invoice modal is open

  useEffect(() => {
    const timer = setTimeout(() => fetchInvoices({ page, limit: LIMIT, sort: sortOrder, search: search.trim() || undefined, status: filterStatus === "all" ? undefined : filterStatus, paymentMethod: filterPayment === "all" ? undefined : filterPayment }), 250);
    return () => clearTimeout(timer);
  }, [page, search, filterStatus, filterPayment, sortOrder, fetchInvoices]);

  const fmt = (v) => `${settings.currency} ${(Number(v) || 0).toFixed(2)}`;

  const totalPages = pagination.pages;
  const paginated = invoices;

  const totalRevenue = invoices.filter((i) => i.status === "Completed").reduce((s, i) => s + (i.total || i.grandTotal || 0), 0);
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const todayCount   = invoices.filter((i) => new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  const hasFilters = search || filterStatus !== "all" || filterPayment !== "all";
  const clearFilters = () => { setSearch(""); setFilterStatus("all"); setFilterPayment("all"); setPage(1); };

  const handlePrint = (inv) => { setSelectedInvoice(inv); setShowModal(true); setTimeout(() => window.print(), 500); };

  const STATS = [
    { label: "Loaded invoices", value: invoices.length,   icon: FileText,    grad: "from-slate-500 to-slate-600",  bg: "bg-slate-50 dark:bg-slate-800/60" },
    { label: "Completed page total",        value: fmt(totalRevenue), icon: TrendingUp,  grad: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/15" },
    { label: "Pending on page",        value: pendingCount,      icon: Clock,       grad: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/15" },
    { label: "Today on page",          value: todayCount,        icon: CheckCircle, grad: "from-blue-500 to-indigo-600",  bg: "bg-blue-50 dark:bg-blue-900/15" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">

      <PageHeader title={<>Invoices</>} icon={FileText} actions={<><div className="flex flex-wrap gap-2">
          <button disabled={loading || !!error || !invoices.length} onClick={() => exportInvoices(invoices, settings.currency)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" /> Export loaded page
          </button>
          <button aria-label="Refresh invoices" onClick={() => fetchInvoices()} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div></>}></PageHeader>

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
      <FilterBar className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input aria-label="Search invoices" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by invoice #, customer name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Sort invoices" value={sortOrder} onChange={event => { setSortOrder(event.target.value); setPage(1); }} options={[{ value: "-createdAt", label: "Newest first" }, { value: "createdAt", label: "Oldest first" }, { value: "-total", label: "Highest total" }, { value: "total", label: "Lowest total" }]} />
          {[
            { value: filterStatus, onChange: (v) => { setFilterStatus(v); setPage(1); }, options: [["all","All Status"],["Completed","Completed"],["Pending","Pending"],["Cancelled","Cancelled"]] },
            { value: filterPayment, onChange: (v) => { setFilterPayment(v); setPage(1); }, options: [["all","All Payments"],["Cash","Cash"],["Credit","Credit"],["Online Transfer","Online Transfer"],["Card","Card"]] },
          ].map(({ value, onChange, options }, i) => (
            <div key={i} className="relative">
              <Select aria-label={i === 0 ? "Invoice status" : "Invoice payment method"} value={value} onChange={(e) => onChange(e.target.value)} options={options.map(([value, label]) => ({ value, label }))} />
            </div>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </FilterBar>

      <p className="text-xs text-slate-500">{pagination.total} matching invoices. Cards, summaries and exports cover the loaded page only. Completed invoice totals are not cash collections.</p>
      {/* Cards grid */}
      {error ? (
        <div role="alert" className="card-base space-y-3 p-6"><p>{error}</p><button onClick={() => fetchInvoices()} className="ui-button-primary rounded-xl px-4 py-2">Retry invoices</button></div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : paginated.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices found" description={hasFilters ? "Try adjusting your filters." : "Invoices will appear here after your first sale."} filtered={!!hasFilters} onClear={hasFilters ? clearFilters : undefined} />
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

      {!loading && !error && totalPages > 1 && (
        <div className="workspace-panel bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {emailInvoice && <EmailInvoiceModal invoice={emailInvoice} onClose={() => setEmailInvoice(null)} />}
      {/* Invoice view modal */}
      {showModal && selectedInvoice && (
        <Modal
          isOpen
          onClose={() => setShowModal(false)}
          title={<>Invoice #{selectedInvoice.invoiceNumber}</>}
          size="2xl"
          subtitle={<>
                    {selectedInvoice.customerName || "Walk-in Customer"} • {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </>}
          icon={FileText}
          bodyClassName="app-modal__body--flush">

            {/* Modal Content - Scrollable */}
            <div className="flex-1">
              <Invoice
                invoice={selectedInvoice}
                settings={settings}
                onPrint={() => window.print()}
                onDownload={() => downloadInvoicePDF(selectedInvoice, settings)}
                onEmail={() => { setShowModal(false); setEmailInvoice(selectedInvoice); }}
              />
            </div>
          </Modal>
      )}

      <ConfirmModal isOpen={!!refundTarget} onClose={() => setRefundTarget(null)} onConfirm={handleRefund} title="Refund Invoice" message={`Refund Invoice #${refundTarget?.invoiceNumber}? Stock will be restored and any credit reversed.`} confirmText="Refund" confirmVariant="danger" loading={refunding} icon={RotateCcw} iconColor="amber" />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Invoice" message={`Permanently delete Invoice #${deleteTarget?.invoiceNumber}? This action cannot be undone.`} confirmText="Delete" confirmVariant="danger" loading={deleting} icon={Trash2} iconColor="red" />
      <ConfirmModal isOpen={!!statusTarget} onClose={() => setStatusTarget(null)} onConfirm={confirmStatus} title="Update Invoice Status" message={`Mark Invoice #${statusTarget?.invoice?.invoiceNumber} as ${statusTarget?.newStatus}?`} confirmText="Update" confirmVariant="primary" loading={updatingStatus} icon={CheckCircle} iconColor="emerald" />
    </div>
  );
};

export default InvoiceManagement;
