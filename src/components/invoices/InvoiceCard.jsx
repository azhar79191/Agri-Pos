import React from "react";
import { Eye, Printer, Download, Check, RotateCcw, Trash2, Clock, Package } from "lucide-react";
import { STATUS_CFG, PAY_CFG } from "../../constants/invoices";

const fmt = (v, currency) => `${currency} ${(Number(v) || 0).toFixed(2)}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * InvoiceCard — single invoice card with status, customer info, items preview and action buttons.
 */
const InvoiceCard = ({ invoice, currency, isAdmin, onView, onPrint, onDownload, onMarkComplete, onRefund, onDelete }) => {
  const sc = STATUS_CFG[invoice.status] || STATUS_CFG.Pending;
  const pc = PAY_CFG[invoice.paymentMethod] || { cls: "bg-slate-100 text-slate-700", icon: () => null };
  const PayIcon = pc.icon;

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-200 ${sc.border}`}>
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
            {invoice.discount > 0 && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                −{fmt(invoice.discount, currency)} off
              </span>
            )}
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {fmt(invoice.total || invoice.grandTotal || 0, currency)}
          </p>
        </div>

        {/* Action bar */}
        <div className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => onView(invoice)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button onClick={() => onPrint(invoice)} title="Print" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDownload(invoice)} title="Download PDF" className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
          {invoice.status === "Pending" && isAdmin && (
            <button onClick={() => onMarkComplete(invoice)} title="Mark Completed" className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {invoice.status === "Completed" && isAdmin && (
            <button onClick={() => onRefund(invoice)} title="Refund" className="p-2 rounded-xl text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-orange-200 dark:border-orange-800 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(invoice)} title="Delete" className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
