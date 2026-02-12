import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Download, 
  Mail,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import Invoice from "../components/Invoice";
import StatusManagement from "../components/StatusManagement";

const InvoiceManagement = () => {
  const { state, actions } = useApp();
  const { transactions, invoices } = state;
  const isOnline = useOnlineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Combine transactions and invoices for display
  const allInvoices = [
    ...transactions.map(transaction => ({
      ...transaction,
      customerName: transaction.customerName || "Walk-in Customer",
      customerPhone: transaction.customerPhone || "",
      customerAddress: transaction.customerAddress || "",
      taxRate: transaction.taxRate || 5,
      type: "transaction"
    })),
    ...invoices.map(invoice => ({
      ...invoice,
      type: "invoice"
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customerPhone && invoice.customerPhone.includes(searchTerm));
    
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesPayment = filterPayment === "all" || invoice.paymentMethod === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleSyncData = () => {
    actions.syncOfflineData();
  };

  const pendingCount = allInvoices.filter(i => i.syncStatus === "pending").length;

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownloadInvoice = (invoice) => {
    // In a real app, this would generate and download a PDF
    console.log("Downloading invoice:", invoice.id);
  };

  const handleEmailInvoice = (invoice) => {
    // In a real app, this would open email client or send email
    console.log("Emailing invoice:", invoice.id);
  };

  const formatCurrency = (amount) => `Rs ${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-PK');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Cash':
        return 'bg-emerald-100 text-emerald-700';
      case 'Card':
        return 'bg-blue-100 text-blue-700';
      case 'UPI':
        return 'bg-purple-100 text-purple-700';
      case 'Credit':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400">{filteredInvoices.length} invoices found</p>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? "Online" : "Offline"}
              </div>
              {pendingCount > 0 && (
                <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                  {pendingCount} pending sync
                </div>
              )}
            </div>
          </div>
        </div>
        {pendingCount > 0 && isOnline && (
          <button
            onClick={handleSyncData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Data
          </button>
        )}
      </div>

      {/* Filters */}
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
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Credit">Credit</option>
          </select>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Invoice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">Invoice #{invoice.id}</h3>
                  <p className="text-blue-100 text-sm">{formatDate(invoice.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.syncStatus === "pending" && (
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" title="Pending sync" />
                  )}
                  <StatusManagement 
                    item={invoice} 
                    type={invoice.type === "invoice" ? "invoice" : "transaction"}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                  {invoice.customerPhone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerPhone}</p>
                  )}
                </div>
              </div>

              {/* Payment & Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(invoice.paymentMethod)}`}>
                    {invoice.paymentMethod}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(invoice.grandTotal)}</p>
                  <p className="text-xs text-gray-500">{invoice.items.length} items</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleViewInvoice(invoice)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handlePrintInvoice(invoice)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadInvoice(invoice)}
                  className="flex items-center justify-center px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEmailInvoice(invoice)}
                  className="flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== "all" || filterPayment !== "all" 
              ? "Try adjusting your search or filters" 
              : "No invoices have been generated yet"}
          </p>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Invoice #{selectedInvoice.id}</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <Invoice
              invoice={selectedInvoice}
              onPrint={() => window.print()}
              onDownload={() => handleDownloadInvoice(selectedInvoice)}
              onEmail={() => handleEmailInvoice(selectedInvoice)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;