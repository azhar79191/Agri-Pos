import React, { useState, useMemo, useEffect } from "react";
import { CreditCard, DollarSign, Clock, AlertTriangle, Search, Loader2, CheckCircle, Edit2, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { getCreditSalesReport } from "../../api/reportsApi";
import { updateInvoicePayment } from "../../api/invoicesApi";
import EmptyState from "../../components/ui/EmptyState";
import ModernModal from "../../components/ui/ModernModal";

const CreditSales = () => {
  const { state, actions } = useApp();
  const { settings } = state;
  const [rows, setRows] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    getCreditSalesReport()
      .then(res => {
        setRows(res.data.data.rows);
        setTotalOutstanding(res.data.data.totalOutstanding);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => rows.filter(s => {
    const m = (s.customer || "").toLowerCase().includes(search.toLowerCase()) ||
              (s.invoiceNumber || "").toLowerCase().includes(search.toLowerCase());
    return m && (filter === "all" || s.status === filter);
  }), [rows, search, filter]);

  const overdueCount = rows.filter(s => s.status === "overdue").length;

  const openPaymentModal = (sale) => {
    setPaymentModal(sale);
    setPaymentAmount(sale.balance.toString());
    setPaymentMethod("Cash");
    setPaymentNotes("");
  };

  const handlePayment = async () => {
    if (!paymentModal || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      actions.showToast({ message: "Enter valid payment amount", type: "error" });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > paymentModal.balance) {
      actions.showToast({ message: "Payment amount cannot exceed balance", type: "error" });
      return;
    }

    // Use _id if invoiceId is not available
    const invoiceId = paymentModal.invoiceId || paymentModal._id;
    
    if (!invoiceId) {
      actions.showToast({ message: "Invalid invoice ID", type: "error" });
      return;
    }

    setProcessing(true);
    try {
      await updateInvoicePayment(invoiceId, {
        amount,
        method: paymentMethod,
        notes: paymentNotes
      });
      actions.showToast({ message: "Payment recorded successfully", type: "success" });
      setPaymentModal(null);
      loadData();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Payment failed", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm"><CreditCard className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Credit Sales</h1><p className="text-sm text-slate-500 dark:text-slate-400">Outstanding: {formatCurrency(totalOutstanding, settings.currency)} · {overdueCount} overdue</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Outstanding", value: formatCurrency(totalOutstanding, settings.currency), color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: DollarSign },
          { label: "Credit Sales", value: rows.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: CreditCard },
          { label: "Overdue", value: overdueCount, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: AlertTriangle },
          { label: "Paid", value: rows.filter(s => s.status === "paid").length, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-blue-900/20", icon: Clock },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p><p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p></div></div></div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" /></div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
          {[{ id: "all", l: "All" }, { id: "pending", l: "Pending" }, { id: "partial", l: "Partial" }, { id: "overdue", l: "Overdue" }, { id: "paid", l: "Paid" }].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === t.id ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium min-w-[800px]">
              <thead><tr>{["Invoice", "Customer", "Total", "Paid", "Balance", "Due Date", "Status", "Actions"].map(h => <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{s.invoiceNumber}</span></td>
                  <td className="px-4 py-3.5"><p className="font-semibold text-slate-900 dark:text-white text-sm">{s.customer}</p><p className="text-xs text-slate-400">{s.phone}</p></td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(s.total, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm text-emerald-600 font-semibold">{formatCurrency(s.paid, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-red-600">{formatCurrency(s.balance, settings.currency)}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(s.dueDate?.split?.("T")[0] || s.dueDate)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      s.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400" : 
                      s.status === "overdue" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                      s.status === "partial" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {s.status === "paid" ? "Paid" : s.status === "overdue" ? "Overdue" : s.status === "partial" ? "Partial" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.status !== "paid" && (
                      <button 
                        onClick={() => openPaymentModal(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
                        title="Record Payment"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {!loading && filtered.length === 0 && <EmptyState icon={CreditCard} title="No credit sales found" />}
      </div>

      {/* Payment Modal */}
      <ModernModal
        isOpen={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        title="Record Payment"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={() => setPaymentModal(null)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors order-1 sm:order-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Record Payment
            </button>
          </div>
        }
      >
        {paymentModal && (
          <div className="space-y-4">
            {/* Invoice Info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invoice</p>
                  <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{paymentModal.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{paymentModal.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(paymentModal.total, settings.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Already Paid</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(paymentModal.paid, settings.currency)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Outstanding Balance</p>
                <p className="text-xl font-black text-red-600 dark:text-red-400">{formatCurrency(paymentModal.balance, settings.currency)}</p>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max={paymentModal.balance}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Enter amount"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={() => setPaymentAmount((paymentModal.balance / 2).toFixed(2))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Half
                </button>
                <button
                  onClick={() => setPaymentAmount(paymentModal.balance.toString())}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  Full Amount
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Add payment notes..."
              />
            </div>
          </div>
        )}
      </ModernModal>
    </div>
  );
};
export default CreditSales;
