import React, { useState, useCallback } from "react";
import {
  ClipboardCheck, Package, CheckCircle, AlertCircle,
  Loader2, ChevronDown, Search, Eye, Truck, Plus
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getPurchaseOrders, receiveGoods } from "../../api/purchaseOrdersApi";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";

const LIMIT = 12;

const statusCfg = {
  Sent:                { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       dot: "bg-blue-500" },
  "Partially Received":{ cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",  dot: "bg-amber-500" },
  Completed:           { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
};

/* ── Receive Modal ── */
const ReceiveModal = ({ po, isOpen, onClose, onReceived, currency }) => {
  const { actions } = useApp();
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!po) return;
    const src = Array.isArray(po.items) ? po.items : [];
    setItems(src.map(i => ({
      productId:   i.productId ?? i._id,
      productName: i.productName ?? i.name,
      ordered:     i.quantity,
      received:    i.quantity,   // default to full receipt
      unitPrice:   i.unitPrice ?? i.price ?? 0,
    })));
    setNotes("");
  }, [po]);

  const setQty = (idx, val) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, received: Math.max(0, Math.min(it.ordered, Number(val))) } : it));

  const handleSubmit = async () => {
    if (!po) return;
    const payload = {
      notes,
      items: items.map(i => ({
        productId:   i.productId,
        productName: i.productName,
        received:    i.received,
        ordered:     i.ordered,
        unitCost:    i.unitPrice,
      })),
    };
    setSaving(true);
    try {
      const res = await receiveGoods(po._id, payload);
      const updated = res.data.data.order ?? res.data.data;
      actions.showToast({ message: `GRN created for ${po.poNumber}`, type: "success" });
      onReceived(updated);
      onClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to receive goods", type: "error" });
    } finally { setSaving(false); }
  };

  const allFull = items.every(i => i.received >= i.ordered);

  return (
    <ModernModal
      isOpen={isOpen} onClose={onClose}
      title={`Receive Goods — ${po?.poNumber ?? ""}`}
      size="lg" icon={ClipboardCheck} iconColor="emerald"
      subtitle={`Supplier: ${po?.supplierName ?? po?.supplier ?? ""}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            {allFull ? "Full receipt" : "Partial receipt — PO stays open"}
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving..." : "Confirm Receipt"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Items table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Product</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500">Ordered</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500">Receiving</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.productName}</td>
                  <td className="px-3 py-3 text-center text-slate-500">{item.ordered}</td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="number" min="0" max={item.ordered}
                      value={item.received}
                      onChange={e => setQty(i, e.target.value)}
                      className={`w-20 text-center px-2 py-1.5 border rounded-lg text-sm font-semibold transition-colors outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        item.received < item.ordered
                          ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(item.unitPrice, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. 2 units damaged on arrival..."
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>

        {/* Partial warning */}
        {!allFull && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Partial receipt — the PO will be marked <strong>Partially Received</strong> and remain open for the remaining items.
            </p>
          </div>
        )}
      </div>
    </ModernModal>
  );
};

/* ── PO Card for GRN ── */
const GRNCard = ({ po, currency, onReceive, onView }) => {
  const sc = statusCfg[po.status] || statusCfg.Sent;
  const items = Array.isArray(po.items) ? po.items : [];
  const canReceive = po.status === "Sent" || po.status === "Partially Received";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{po.poNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(po.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{po.status}
          </span>
        </div>

        {/* Supplier */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{po.supplierName ?? po.supplier}</p>
          <p className="text-xs text-slate-400 mt-0.5">Expected: {formatDate(po.expectedDate)}</p>
        </div>

        {/* Items preview */}
        {items.length > 0 && (
          <div className="space-y-1.5">
            {items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">{item.productName ?? item.name}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">×{item.quantity}</span>
              </div>
            ))}
            {items.length > 3 && <p className="text-xs text-slate-400">+{items.length - 3} more items</p>}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(po.total ?? po.totalAmount ?? 0, currency)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onView(po)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {canReceive && (
            <button onClick={() => onReceive(po)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Receive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Detail View Modal ── */
const DetailModal = ({ po, isOpen, onClose, currency }) => (
  <ModernModal isOpen={isOpen} onClose={onClose} title={po?.poNumber ?? "PO Detail"} size="lg" icon={Package} iconColor="blue"
    footer={<div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button></div>}>
    {po && (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Supplier",  value: po.supplierName ?? po.supplier },
            { label: "Status",    value: po.status },
            { label: "Created",   value: formatDate(po.createdAt) },
            { label: "Expected",  value: formatDate(po.expectedDate) },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value ?? "—"}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Product</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500">Qty</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Unit Price</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(Array.isArray(po.items) ? po.items : []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{item.productName ?? item.name}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{formatCurrency(item.unitPrice ?? item.price ?? 0, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.quantity * (item.unitPrice ?? item.price ?? 0), currency)}
                  </td>
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

/* ── Main Page ── */
const GoodsReceiving = () => {
  const { state } = useApp();
  const { settings } = state;

  const { data: orders, loading, error, page, totalPages, total, setFilter, setPage, refresh } =
    usePaginatedApi(getPurchaseOrders, { status: "Sent", search: "" }, LIMIT);

  const [statusFilter, setStatusFilter] = useState("Sent");
  const [receivePO, setReceivePO] = useState(null);
  const [viewPO, setViewPO] = useState(null);

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setFilter("status", s === "all" ? "" : s);
  };

  const handleReceived = useCallback(() => { refresh(); }, [refresh]);

  const stats = {
    pending:   orders.filter(o => o.status === "Sent").length,
    partial:   orders.filter(o => o.status === "Partially Received").length,
    completed: orders.filter(o => o.status === "Completed").length,
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Goods Receiving</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{total} purchase order{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Awaiting Receipt", value: stats.pending,   color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/15",    icon: Truck },
          { label: "Partially Received", value: stats.partial, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/15",  icon: AlertCircle },
          { label: "Completed",        value: stats.completed, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/15", icon: CheckCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input onChange={e => setFilter("search", e.target.value)}
            placeholder="Search by PO # or supplier..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => handleStatusFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/30">
            <option value="all">All Status</option>
            <option value="Sent">Awaiting Receipt</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
          <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(po => (
            <GRNCard key={po._id} po={po} currency={settings.currency}
              onReceive={setReceivePO} onView={setViewPO} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <EmptyState icon={ClipboardCheck} title="No purchase orders found"
          description="Sent purchase orders will appear here for receiving" />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <ReceiveModal po={receivePO} isOpen={!!receivePO} onClose={() => setReceivePO(null)}
        onReceived={handleReceived} currency={settings.currency} />
      <DetailModal po={viewPO} isOpen={!!viewPO} onClose={() => setViewPO(null)} currency={settings.currency} />
    </div>
  );
};

export default GoodsReceiving;
