import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle, ClipboardCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { receiveGoods } from "../../api/purchaseOrdersApi";
import ModernModal from "../ui/ModernModal";

/**
 * ReceiveModal — allows recording full or partial goods receipt for a purchase order.
 */
const ReceiveModal = ({ po, isOpen, onClose, onReceived, currency }) => {
  const { actions }           = useApp();
  const [items, setItems]     = useState([]);
  const [notes, setNotes]     = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!po) return;
    setItems((Array.isArray(po.items) ? po.items : []).map((i) => ({
      productId:   i.productId ?? i._id,
      productName: i.productName ?? i.name,
      ordered:     i.quantity,
      received:    i.quantity,
      unitPrice:   i.unitPrice ?? i.price ?? 0,
    })));
    setNotes("");
  }, [po]);

  const setQty = (idx, val) =>
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, received: Math.max(0, Math.min(it.ordered, Number(val))) } : it));

  const handleSubmit = async () => {
    if (!po) return;
    setSaving(true);
    try {
      const res     = await receiveGoods(po._id, { notes, items: items.map((i) => ({ productId: i.productId, productName: i.productName, received: i.received, ordered: i.ordered, unitCost: i.unitPrice })) });
      const updated = res.data.data.order ?? res.data.data;
      actions.showToast({ message: `GRN created for ${po.poNumber}`, type: "success" });
      onReceived(updated);
      onClose();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to receive goods", type: "error" });
    } finally { setSaving(false); }
  };

  const allFull = items.every((i) => i.received >= i.ordered);

  return (
    <ModernModal
      isOpen={isOpen} onClose={onClose}
      title={`Receive Goods — ${po?.poNumber ?? ""}`}
      size="lg" icon={ClipboardCheck} iconColor="emerald"
      subtitle={`Supplier: ${po?.supplierName ?? po?.supplier ?? ""}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">{allFull ? "Full receipt" : "Partial receipt — PO stays open"}</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving..." : "Confirm Receipt"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {["Product", "Ordered", "Receiving", "Unit Price"].map((h) => (
                  <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-slate-500 ${h === "Product" ? "text-left" : h === "Unit Price" ? "text-right" : "text-center"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.productName}</td>
                  <td className="px-3 py-3 text-center text-slate-500">{item.ordered}</td>
                  <td className="px-3 py-3 text-center">
                    <input type="number" min="0" max={item.ordered} value={item.received} onChange={(e) => setQty(i, e.target.value)}
                      className={`w-20 text-center px-2 py-1.5 border rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors ${item.received < item.ordered ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(item.unitPrice, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 2 units damaged on arrival..."
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>

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

export default ReceiveModal;
