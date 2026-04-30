import React from "react";
import { Eye, Send, Package } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/helpers";
import { STATUS_CFG } from "./poConfig";

const POCard = ({ po, currency, onView, onSend }) => {
  const sc = STATUS_CFG[po.status] || STATUS_CFG.Draft;
  const SIcon = sc.icon;
  const itemCount = Array.isArray(po.items) ? po.items.length : (po.itemCount ?? po.items ?? 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{po.poNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(po.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.cls}`}>
            <SIcon className="w-3 h-3" />{po.status}
          </span>
        </div>

        {/* Supplier */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{po.supplierName || po.supplier}</p>
          <p className="text-xs text-slate-400 mt-0.5">Expected: {formatDate(po.expectedDate)}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />{itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(po.total ?? po.totalAmount ?? 0, currency)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onView(po)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {po.status === "Draft" && (
            <button
              onClick={() => onSend(po)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Send PO
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default POCard;
