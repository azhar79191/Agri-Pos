import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, ShoppingBag, Wallet, TrendingUp, Calendar, User, MapPin, Phone, Mail } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getCustomer, getCustomerPurchases } from "../api/customersApi";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { formatCurrency, formatDate } from "../utils/helpers";

const statusCls = {
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};
const paymentCls = {
  Credit: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Cash:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const CustomerStatement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const { settings } = state;

  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [custRes, invRes] = await Promise.all([
          getCustomer(id),
          getCustomerPurchases(id, { page, limit: 10 }),
        ]);
        setCustomer(custRes.data.data?.customer);
        const invData = invRes.data.data;
        setInvoices(invData?.invoices || []);
        if (invData?.pagination) setPagination(invData.pagination);
      } catch { navigate("/customers"); }
      finally { setLoading(false); }
    };
    load();
  }, [id, page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!customer) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/customers")} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Statement</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{customer.name} · {customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Purchases", value: formatCurrency(customer.totalPurchases || 0, settings.currency), icon: TrendingUp, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Wallet Balance", value: formatCurrency(customer.walletBalance || 0, settings.currency), icon: Wallet, cls: (customer.walletBalance || 0) > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400", bg: (customer.walletBalance || 0) > 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800" },
          { label: "Total Invoices", value: pagination.total, icon: ShoppingBag, cls: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
        ].map(({ label, value, icon: Icon, cls, bg }, i) => (
          <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${cls}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`font-bold text-sm mt-0.5 ${cls}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Customer Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Full Name", value: customer.name, icon: User },
            { label: "Phone", value: customer.phone, icon: Phone },
            { label: "Email", value: customer.email || "—", icon: Mail },
            { label: "Address", value: customer.address || "—", icon: MapPin },
            { label: "City", value: customer.city || "—", icon: MapPin },
            { label: "Last Purchase", value: customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate.split("T")[0]) : "—", icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Icon className="w-3 h-3" />{label}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Purchase History</h3>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{pagination.total} invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-14">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No purchases yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map(inv => (
              <div key={inv._id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{inv.invoiceNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(inv.createdAt?.split("T")[0])}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${paymentCls[inv.paymentMethod] || "bg-blue-100 text-blue-700"}`}>{inv.paymentMethod}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusCls[inv.status] || statusCls.Pending}`}>{inv.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(inv.total, settings.currency)}</p>
                    <p className="text-xs text-slate-400">{inv.items?.length || 0} items</p>
                  </div>
                  <button onClick={() => downloadInvoicePDF(inv, settings)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Download PDF">
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStatement;
