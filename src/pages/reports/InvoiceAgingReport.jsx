import React, { useMemo } from "react";
import { Clock, AlertTriangle, DollarSign, TrendingDown, Phone, FileText, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { useCreditSales } from "../../hooks/useCreditSales";
import EmptyState from "../../components/ui/EmptyState";

const BUCKETS = [
  { label: "Current",   min: 0,   max: 30,  color: "emerald", bg: "bg-emerald-50 dark:bg-emerald-900/10",  border: "border-emerald-200 dark:border-emerald-800",  text: "text-emerald-700 dark:text-emerald-400",  badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { label: "31–60 days",min: 31,  max: 60,  color: "amber",   bg: "bg-amber-50 dark:bg-amber-900/10",      border: "border-amber-200 dark:border-amber-800",      text: "text-amber-700 dark:text-amber-400",      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "61–90 days",min: 61,  max: 90,  color: "orange",  bg: "bg-orange-50 dark:bg-orange-900/10",    border: "border-orange-200 dark:border-orange-800",    text: "text-orange-700 dark:text-orange-400",    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { label: "90+ days",  min: 91,  max: Infinity, color: "red", bg: "bg-red-50 dark:bg-red-900/10",         border: "border-red-200 dark:border-red-800",          text: "text-red-700 dark:text-red-400",          badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

const getDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const getBucket = (days) => BUCKETS.find((b) => days >= b.min && days <= b.max) || BUCKETS[3];

const InvoiceAgingReport = () => {
  const { state }    = useApp();
  const { settings } = state;
  const { rows, loading } = useCreditSales();

  // Only unpaid / partial rows
  const unpaid = useMemo(
    () => rows.filter((r) => r.status !== "paid"),
    [rows]
  );

  const enriched = useMemo(
    () => unpaid.map((r) => ({ ...r, daysOverdue: getDaysOverdue(r.dueDate), bucket: getBucket(getDaysOverdue(r.dueDate)) })),
    [unpaid]
  );

  const bucketTotals = useMemo(() =>
    BUCKETS.map((b) => {
      const items = enriched.filter((r) => r.bucket.label === b.label);
      return { ...b, items, count: items.length, total: items.reduce((s, r) => s + (r.balance || 0), 0) };
    }),
    [enriched]
  );

  const grandTotal = enriched.reduce((s, r) => s + (r.balance || 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoice Aging Report</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Outstanding receivables bucketed by overdue period
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {bucketTotals.map((b) => (
              <div key={b.label} className={`rounded-xl p-4 border ${b.bg} ${b.border}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${b.text}`}>{b.label}</p>
                <p className={`text-xl font-black ${b.text}`}>{formatCurrency(b.total, settings.currency)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.count} invoice{b.count !== 1 ? "s" : ""}</p>
                {/* Mini bar */}
                <div className="mt-2 h-1 rounded-full bg-white/50 dark:bg-slate-800/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.color === "emerald" ? "bg-emerald-500" :
                      b.color === "amber"   ? "bg-amber-500"   :
                      b.color === "orange"  ? "bg-orange-500"  : "bg-red-500"
                    } transition-all duration-700`}
                    style={{ width: grandTotal > 0 ? `${Math.min((b.total / grandTotal) * 100, 100)}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Grand total banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Outstanding Receivables</p>
                <p className="text-2xl font-black text-white">{formatCurrency(grandTotal, settings.currency)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{unpaid.length} unpaid invoices</p>
              <p className="text-xs text-red-400 font-semibold mt-0.5">
                {bucketTotals[3].count} critical (90+ days)
              </p>
            </div>
          </div>

          {/* Bucket tables */}
          {unpaid.length === 0 ? (
            <EmptyState icon={DollarSign} title="No outstanding invoices" description="All credit sales have been paid — great job!" />
          ) : (
            bucketTotals.filter((b) => b.count > 0).map((b) => (
              <div key={b.label} className={`rounded-xl border overflow-hidden ${b.border}`}>
                {/* Bucket header */}
                <div className={`flex items-center justify-between px-5 py-3 ${b.bg}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${b.text}`} />
                    <span className={`font-bold text-sm ${b.text}`}>{b.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.badge}`}>{b.count}</span>
                  </div>
                  <span className={`font-black text-sm ${b.text}`}>{formatCurrency(b.total, settings.currency)}</span>
                </div>

                {/* Rows */}
                <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {b.items.map((row) => (
                    <div key={row._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Invoice */}
                      <div className="flex-shrink-0">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                          {row.invoiceNumber}
                        </span>
                      </div>

                      {/* Customer */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{row.customer}</p>
                        {row.phone && (
                          <a
                            href={`tel:${row.phone}`}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3" />{row.phone}
                          </a>
                        )}
                      </div>

                      {/* Due date */}
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-xs text-slate-400">Due</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(row.dueDate?.split?.("T")[0] || row.dueDate)}
                        </p>
                      </div>

                      {/* Days overdue badge */}
                      <div className="flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.badge}`}>
                          {row.daysOverdue === 0 ? "Due today" : `${row.daysOverdue}d overdue`}
                        </span>
                      </div>

                      {/* Balance */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-400">Balance</p>
                        <p className={`text-sm font-black ${b.text}`}>{formatCurrency(row.balance, settings.currency)}</p>
                      </div>

                      {/* WhatsApp reminder */}
                      {row.phone && (
                        <a
                          href={`https://wa.me/${row.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Assalam o Alaikum ${row.customer},\n\nThis is a reminder that Invoice *${row.invoiceNumber}* of *${settings.currency} ${row.balance?.toFixed(2)}* is overdue by ${row.daysOverdue} day(s).\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\n${settings.shopName}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20"
                        >
                          <FileText className="w-3 h-3" />Remind
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceAgingReport;
