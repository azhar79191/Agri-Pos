import React, { useState, useEffect } from "react";
import { Send, Package, Calendar, FileText, Loader2 } from "lucide-react";
import ModernModal from "../../../components/ui/ModernModal";
import { getPurchaseOrder, sendPurchaseOrder } from "../../../api/purchaseOrdersApi";
import { formatCurrency, formatDate } from "../../../utils/helpers";
import { useApp } from "../../../context/AppContext";
import { STATUS_CFG } from "./poConfig";

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{value}</span>
  </div>
);

const PODetailModal = ({ po, isOpen, onClose, onSent, currency }) => {
  const { actions } = useApp();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen || !po) return;
    setDetail(null);
    setLoading(true);
    getPurchaseOrder(po._id)
      .then(r => setDetail(r.data.data.order ?? r.data.data))
      .catch(() => setDetail(po))
      .finally(() => setLoading(false));
  }, [isOpen, po]);

  const handleSend = async () => {
    if (!detail) return;
    setSending(true);
    try {
      const res = await sendPurchaseOrder(detail._id);
      const updated = res.data.data.order ?? res.data.data;
      actions.showToast({ message: `${detail.poNumber} sent to supplier`, type: "success" });
      onSent(updated);
      onClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to send PO", type: "error" });
    } finally { setSending(false); }
  };

  const data = detail ?? po;
  const sc = data ? (STATUS_CFG[data.status] || STATUS_CFG.Draft) : null;
  const SIcon = sc?.icon;
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? data?.totalAmount ?? items.reduce((s, i) => s + (i.quantity * (i.unitPrice ?? i.price ?? 0)), 0);

  return (
    <ModernModal
      isOpen={isOpen} onClose={onClose}
      title={data?.poNumber ?? "Purchase Order"} size="lg"
      icon={FileText} iconColor="blue"
      subtitle={data ? `Created ${formatDate(data.createdAt)}` : ""}
      footer={
        data?.status === "Draft" ? (
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Close
            </button>
            <button onClick={handleSend} disabled={sending}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending..." : "Send to Supplier"}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Close
            </button>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Status badge */}
          {sc && SIcon && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.cls}`}>
                <SIcon className="w-3.5 h-3.5" />{data.status}
              </span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Supplier</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{data.supplierName ?? data.supplier}</p>
              {data.supplierPhone && <p className="text-xs text-slate-400">{data.supplierPhone}</p>}
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dates</p>
              <Row label="Created" value={formatDate(data.createdAt)} />
              <Row label="Expected" value={formatDate(data.expectedDate)} />
              {data.receivedDate && <Row label="Received" value={formatDate(data.receivedDate)} />}
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Items ({items.length})
            </p>
            {items.length > 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Product</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">Unit Price</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-medium">{item.productName ?? item.name}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.unitPrice ?? item.price ?? 0, currency)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency((item.quantity * (item.unitPrice ?? item.price ?? 0)), currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">Grand Total</td>
                      <td className="px-4 py-2.5 text-right text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(total, currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No items</p>
            )}
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Notes</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">{data.notes}</p>
            </div>
          )}
        </div>
      ) : null}
    </ModernModal>
  );
};

export default PODetailModal;
