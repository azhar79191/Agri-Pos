import React, { useState, useCallback } from "react";
import { ClipboardCheck, AlertCircle, Loader2, ChevronDown, Search, Truck, CheckCircle, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getPurchaseOrders } from "../../api/purchaseOrdersApi";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";
import GRNCard from "../../components/purchases/GRNCard";
import ReceiveModal from "../../components/purchases/ReceiveModal";

const LIMIT = 12;

/** Inline detail modal — lightweight, no need for a separate file */
const DetailModal = ({ po, isOpen, onClose, currency }) => (
  <ModernModal isOpen={isOpen} onClose={onClose} title={po?.poNumber ?? "PO Detail"} size="lg" icon={Package} iconColor="blue"
    footer={<div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button></div>}>
    {po && (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Supplier", value: po.supplierName ?? po.supplier }, { label: "Status", value: po.status }, { label: "Created", value: formatDate(po.createdAt) }, { label: "Expected", value: formatDate(po.expectedDate) }].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value ?? "—"}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>{["Product", "Qty", "Unit Price", "Subtotal"].map((h) => <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-slate-500 ${h === "Product" ? "text-left" : "text-right"}`}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(Array.isArray(po.items) ? po.items : []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{item.productName ?? item.name}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{formatCurrency(item.unitPrice ?? item.price ?? 0, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.quantity * (item.unitPrice ?? item.price ?? 0), currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {po.notes && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Notes</p>
            <p className="text-xs text-amber-800 dark:text-amber-300">{po.notes}</p>
          </div>
        )}
      </div>
    )}
  </ModernModal>
);

const GoodsReceiving = () => {
  const { state }    = useApp();
  const { settings } = state;

  const { data: orders, loading, error, page, totalPages, total, setFilter, setPage, refresh } =
    usePaginatedApi(getPurchaseOrders, { status: "Sent", search: "" }, LIMIT);

  const [statusFilter, setStatusFilter] = useState("Sent");
  const [receivePO, setReceivePO]       = useState(null);
  const [viewPO, setViewPO]             = useState(null);

  const handleStatusFilter = (s) => { setStatusFilter(s); setFilter("status", s === "all" ? "" : s); };
  const handleReceived     = useCallback(() => { refresh(); }, [refresh]);

  const stats = {
    pending:   orders.filter((o) => o.status === "Sent").length,
    partial:   orders.filter((o) => o.status === "Partially Received").length,
    completed: orders.filter((o) => o.status === "Completed").length,
  };

  const STAT_CARDS = [
    { label: "Awaiting Receipt",    value: stats.pending,   color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/15",    icon: Truck },
    { label: "Partially Received",  value: stats.partial,   color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/15",  icon: AlertCircle },
    { label: "Completed",           value: stats.completed, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/15", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm"><ClipboardCheck className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Goods Receiving</h1><p className="text-sm text-slate-500 dark:text-slate-400">{total} purchase order{total !== 1 ? "s" : ""}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div><p className={`text-xl font-bold ${color}`}>{value}</p><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input onChange={(e) => setFilter("search", e.target.value)} placeholder="Search by PO # or supplier..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/30">
            <option value="all">All Status</option>
            <option value="Sent">Awaiting Receipt</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
          <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}
      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((po) => <GRNCard key={po._id} po={po} currency={settings.currency} onReceive={setReceivePO} onView={setViewPO} />)}
        </div>
      )}
      {!loading && !error && orders.length === 0 && <EmptyState icon={ClipboardCheck} title="No purchase orders found" description="Sent purchase orders will appear here for receiving" />}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      <ReceiveModal po={receivePO} isOpen={!!receivePO} onClose={() => setReceivePO(null)} onReceived={handleReceived} currency={settings.currency} />
      <DetailModal po={viewPO} isOpen={!!viewPO} onClose={() => setViewPO(null)} currency={settings.currency} />
    </div>
  );
};

export default GoodsReceiving;
