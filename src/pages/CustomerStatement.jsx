import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, CreditCard, ShoppingBag, Wallet, TrendingUp, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import { getCustomer, getCustomerPurchases } from "../api/customersApi";
import { downloadInvoicePDF } from "../utils/pdfGenerator";
import { formatCurrency, formatDate } from "../utils/helpers";

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
      } catch {
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, page]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!customer) return null;

  const totalSpent = invoices.reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/customers")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="page-title">Customer Statement</h1>
          <p className="page-subtitle">{customer.name} · {customer.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Purchases", value: formatCurrency(customer.totalPurchases || 0, settings.currency), icon: TrendingUp, color: "emerald" },
          { label: "Credit Balance", value: formatCurrency(customer.creditBalance || 0, settings.currency), icon: CreditCard, color: customer.creditBalance > 0 ? "red" : "emerald" },
          { label: "Wallet Balance", value: formatCurrency(customer.walletBalance || 0, settings.currency), icon: Wallet, color: "blue" },
          { label: "Total Invoices", value: pagination.total, icon: ShoppingBag, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padding="md" className="flex items-center gap-3">
            <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex-shrink-0`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Customer Info */}
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Name", value: customer.name },
            { label: "Phone", value: customer.phone },
            { label: "Email", value: customer.email || "—" },
            { label: "Address", value: customer.address || "—" },
            { label: "City", value: customer.city || "—" },
            { label: "Last Purchase", value: customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate.split("T")[0]) : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Purchase History */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Purchase History</h3>
          <span className="text-sm text-gray-500">{pagination.total} invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No purchases yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoices.map(inv => (
              <div key={inv._id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{inv.invoiceNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(inv.createdAt?.split("T")[0])}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        inv.paymentMethod === "Credit" ? "bg-orange-100 text-orange-700" :
                        inv.paymentMethod === "Cash" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{inv.paymentMethod}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        inv.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                        inv.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{inv.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(inv.total, settings.currency)}</p>
                    <p className="text-xs text-gray-400">{inv.items?.length || 0} items</p>
                  </div>
                  <button onClick={() => downloadInvoicePDF(inv, settings)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Download PDF">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerStatement;
