import React from "react";
import { Eye, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helpers";

const STATUS_CFG = {
  Sent:                 { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       dot: "bg-blue-500" },
  "Partially Received": { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",  dot: "bg-amber-500" },
  Completed:            { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
};

/**
 * GRNCard — displays a single purchase order card in the Goods Receiving page.
 */
const GRNCard = ({ po, currency, onReceive, onView }) => {
  const sc        = STATUS_CFG[po.status] || STATUS_CFG.Sent;
  const items     = Array.isArray(po.items) ? po.items : [];
  const canReceive = po.status === "Sent" || po.status === "Partially Received";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{po.poNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(po.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{po.status}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{po.supplierName ?? po.supplier}</p>
          <p className="text-xs text-slate-400 mt-0.5">Expected: {formatDate(po.expectedDate)}</p>
        </div>

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

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(po.total ?? po.totalAmount ?? 0, currency)}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onView(po)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {canReceive && (
            <button onClick={() => onReceive(po)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Receive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GRNCard;
