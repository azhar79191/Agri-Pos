import React, { forwardRef } from "react";
import { Printer, Download, Mail, Phone, MapPin, Calendar, Clock, Hash, User, CreditCard, FileText } from "lucide-react";
import { formatCurrency as formatCurrencyHelper } from "../utils/helpers";
import { normalizeInvoiceItems } from "../utils/normalizeInvoiceItems";

const Invoice = forwardRef(({ invoice, settings = {}, onPrint, onDownload, onEmail }, ref) => {
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return `${settings.currency || "Rs."} 0.00`;
    return `${settings.currency || "Rs."} ${num.toFixed(2)}`;
  };
  
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-IN');
  };
  
  const formatTime = (time) => {
    if (!time) return new Date().toLocaleTimeString('en-IN');
    return time;
  };

  // Extract shop data from settings
  const shopName = settings.shopName || "Shop Name";
  const shopAddress = settings.address || "Shop Address";
  const shopPhone = settings.phone || "Phone Number";
  const shopEmail = settings.email || "email@shop.com";
  const shopLogo = settings.shopLogo;
  const receiptFooter = settings.receiptFooter || "Thank you for your business!";
  
  // Get shop initials for logo
  const shopInitials = shopName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header Actions - Hidden in print */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Invoice #{invoice.invoiceNumber || invoice.id}</h2>
              <p className="text-xs text-blue-100">{formatDate(invoice.createdAt || invoice.date)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm text-sm font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onEmail}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm text-sm font-semibold"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={ref} className="p-4 sm:p-8 print:p-6">
        {/* Company Header */}
        <div className="border-b-2 border-blue-600 dark:border-blue-500 pb-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {shopLogo ? (
                <img src={shopLogo} alt={shopName} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold text-white">{shopInitials}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{shopName}</h1>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {shopAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{shopAddress}</span>
                    </div>
                  )}
                  {shopPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{shopPhone}</span>
                    </div>
                  )}
                  {shopEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{shopEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 sm:p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h2 className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">INVOICE</h2>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-semibold">#{invoice.invoiceNumber || invoice.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{formatDate(invoice.createdAt || invoice.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{formatTime(invoice.time)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Transaction Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              Bill To
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{invoice.customerName || invoice.customer?.name || "Walk-in Customer"}</p>
              {(invoice.customerPhone || invoice.customer?.phone) && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  {invoice.customerPhone || invoice.customer?.phone}
                </p>
              )}
              {(invoice.customerAddress || invoice.customer?.address) && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  {invoice.customerAddress || invoice.customer?.address}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              Payment Details
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{invoice.paymentMethod || "Cash"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === 'Completed' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : invoice.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {invoice.status || "Completed"}
                </span>
              </div>
              {(invoice.createdBy || invoice.user?.name) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Served By:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{invoice.createdBy || invoice.user?.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-t-xl">
            <h3 className="text-sm sm:text-base font-semibold">Items Purchased</h3>
          </div>
          <div className="border border-gray-200 dark:border-slate-700 rounded-b-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Item</th>
                    <th className="text-center p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Qty</th>
                    <th className="text-center p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">Unit</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Rate</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizeInvoiceItems(invoice.items).map((item, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/30">
                      <td className="p-3 sm:p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{item.name}</p>
                          {item.barcode && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Barcode: {item.barcode}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center font-medium text-xs sm:text-sm dark:text-white">{item.quantity}</td>
                      <td className="p-3 sm:p-4 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">{item.unit || "—"}</td>
                      <td className="p-3 sm:p-4 text-right font-medium text-xs sm:text-sm dark:text-white">{formatCurrency(item.price)}</td>
                      <td className="p-3 sm:p-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <div className="w-full sm:w-auto sm:min-w-[320px]">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Subtotal:</span>
                <span className="font-medium dark:text-white">{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              
              {(invoice.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-sm">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(invoice.discount || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Tax ({invoice.taxRate || invoice.taxAmount || settings.taxRate || 0}%):</span>
                <span className="font-medium dark:text-white">{formatCurrency(invoice.tax || invoice.taxAmount || 0)}</span>
              </div>
              
              <div className="border-t border-gray-300 dark:border-slate-600 pt-3">
                <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.total || invoice.grandTotal || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Terms & Conditions</h4>
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• All sales are final unless defective</li>
                <li>• Returns accepted within 7 days with receipt</li>
                <li>• Warranty as per manufacturer terms</li>
                <li>• Payment due within 30 days for credit sales</li>
              </ul>
            </div>
            <div className="text-left md:text-right">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{receiptFooter}</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">{shopName}</p>
                {shopEmail && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{shopEmail}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This is a computer generated invoice
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";

export default Invoice;
