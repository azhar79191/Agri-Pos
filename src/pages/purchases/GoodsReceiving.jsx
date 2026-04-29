import React, { useState, useEffect } from "react";
import { ClipboardCheck, Package, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { getPurchaseOrders } from "../../api/purchaseOrdersApi";
import EmptyState from "../../components/ui/EmptyState";

const GoodsReceiving = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPurchaseOrders({ status: "Completed" })
      .then(res => {
        const orders = res.data.data.orders || [];
        // Flatten GRNs from all orders
        const allGrns = orders.flatMap(po =>
          (po.grns || []).map(grn => ({
            ...grn,
            poNumber: po.poNumber,
            supplier: po.supplierName,
          }))
        );
        setGrns(allGrns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-glow-sm"><ClipboardCheck className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Goods Receiving (GRN)</h1><p className="text-sm text-slate-500 dark:text-slate-400">Receive and verify incoming goods</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : grns.length === 0 ? (
        <EmptyState icon={Package} title="No goods received yet" description="GRNs are created when you receive goods against a Purchase Order" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grns.map((grn, i) => (
            <div key={grn._id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div><p className="font-bold text-slate-900 dark:text-white">{grn.grnNumber || `GRN-${i + 1}`}</p><p className="text-xs text-slate-400 mt-0.5">PO: {grn.poNumber} · {formatDate(grn.receivedDate?.split?.("T")[0] || grn.receivedDate)}</p></div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${grn.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                  {grn.status === "Completed" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}{grn.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{grn.supplier}</p><p className="text-xs text-slate-400">Received by: {grn.receivedBy || "—"}</p></div>
              {(grn.items || []).length > 0 && (
                <div className="space-y-2">
                  {grn.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.productName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Ordered: {item.ordered}</span>
                        <span className={`text-xs font-bold ${item.received >= item.ordered ? "text-emerald-600" : "text-amber-600"}`}>Received: {item.received}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default GoodsReceiving;
