import React, { useState, useEffect } from "react";
import {
  FileText, Search, Filter, Eye, Printer, Download, Mail,
  DollarSign, User, CreditCard, CheckCircle, Clock, AlertCircle,
  Wifi, WifiOff, RefreshCw, Check, X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "../hooks/useInvoices";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import { downloadInvoicePDF, printInvoicePDF } from "../utils/pdfGenerator";
import { exportInvoices } from "../utils/excelExport";
import { CardSkeleton } from "../components/ui/Skeleton";
import { refundInvoice } from "../api/invoicesApi";
import { ConfirmModal } from "../components/ui/ModernModal";
import ModernButton from "../components/ui/ModernButton";

const InvoiceManagement = () => {
  const { state, actions } = useApp();
  const { settings, currentUser } = state;
  const { invoices, loading, fetchInvoices, changeStatus } = useInvoices();
  const isOnline = useOnlineStatus();
  const isAdmin = currentUser?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchInvoices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerPhone?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesPayment = filterPayment === "all" || invoice.paymentMethod === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding] = useState(false);

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await refundInvoice(refundTarget._id);
      actions.showToast({ message: `Invoice #${refundTarget.invoiceNumber} refunded`, type: "success" });
      fetchInvoices();
      setRefundTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Refund failed", type: "error" });
      setRefundTarget(null);
    } finally { setRefunding(false); }
  };

  const handleStatusUpdate = async (invoice, newStatus) => {
    if (!isAdmin && newStatus === "Completed" && invoice.paymentMethod === "Online Transfer") {
      actions.showToast({ message: "Only admin can mark online paid invoices as completed", type: "error" });
      return;
    }
    setStatusUpdateTarget({ invoice, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateTarget) return;
    setUpdatingStatus(true);
    try {
      await changeStatus(statusUpdateTarget.invoice._id, statusUpdateTarget.newStatus);
      actions.showToast({ 
        message: `Invoice #${statusUpdateTarget.invoice.invoiceNumber} marked as ${statusUpdateTarget.newStatus}`, 
        type: "success" 
      });
      fetchInvoices();
      setStatusUpdateTarget(null);
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Status update failed", type: "error" });
    } finally { 
      setUpdatingStatus(false);
    }
  };
  const handleViewInvoice = (invoice) => { setSelectedInvoice(invoice); setShowInvoiceModal(true); };
  const handlePrintInvoice = (invoice) => { setSelectedInvoice(invoice); setShowInvoiceModal(true); setTimeout(() => window.print(), 500); };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return `${settings.currency || "Rs."} 0.00`;
    return `${settings.currency || "Rs."} ${num.toFixed(2)}`;
  };
  
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-PK");
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "Pending") return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getPaymentMethodColor = (method) => {
    const map = { Cash: "bg-emerald-100 text-emerald-700", Card: "bg-blue-100 text-blue-700", UPI: "bg-purple-100 text-purple-700", Credit: "bg-orange-100 text-orange-700" };
    return map[method] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400">{filteredInvoices.length} invoices found</p>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportInvoices(invoices, settings.currency)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />Export Excel
          </button>
          <button onClick={() => fetchInvoices()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Credit">Credit</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />Advanced Filter
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <div key={invoice._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-semibold">Invoice #{invoice.invoiceNumber}</h3>
                    <p className="text-blue-100 text-sm">{formatDate(invoice.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{invoice.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.customerName || "Walk-in Customer"}</p>
                    {invoice.customerPhone && <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerPhone}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(invoice.paymentMethod)}`}>
                      {invoice.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(invoice.total || invoice.grandTotal || 0)}</p>
                    <p className="text-xs text-gray-500">{invoice.items?.length || 0} items</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => handleViewInvoice(invoice)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />View
                  </button>
                  <button onClick={() => handlePrintInvoice(invoice)} className="flex items-center justify-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => downloadInvoicePDF(invoice, settings)} className="flex items-center justify-center px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  {invoice.status === "Pending" && (
                    <button 
                      onClick={() => handleStatusUpdate(invoice, "Completed")} 
                      className="flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors" 
                      title="Mark as Completed"
                      disabled={!isAdmin && invoice.paymentMethod === "Online Transfer"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {invoice.status === "Completed" && (
                    <button onClick={() => setRefundTarget(invoice)} className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors" title="Refund">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== "all" || filterPayment !== "all" ? "Try adjusting your search or filters" : "No invoices have been generated yet"}
          </p>
        </div>
      )}

      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl">×</button>
            </div>
            <Invoice 
              invoice={selectedInvoice} 
              settings={settings}
              onPrint={() => window.print()} 
              onDownload={() => downloadInvoicePDF(selectedInvoice, settings)} 
              onEmail={() => {}} 
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefund}
        title="Refund Invoice"
        message={`Refund Invoice #${refundTarget?.invoiceNumber}? Stock will be restored and credit reversed.`}
        confirmText="Refund"
        confirmVariant="danger"
        loading={refunding}
      />

      <ConfirmModal
        isOpen={!!statusUpdateTarget}
        onClose={() => setStatusUpdateTarget(null)}
        onConfirm={confirmStatusUpdate}
        title="Update Invoice Status"
        message={`Mark Invoice #${statusUpdateTarget?.invoice?.invoiceNumber} as ${statusUpdateTarget?.newStatus}?`}
        confirmText="Update Status"
        confirmVariant="primary"
        loading={updatingStatus}
      />
    </div>
  );
};

export default InvoiceManagement;
