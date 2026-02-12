import React, { forwardRef } from "react";
import { Printer, Download, Mail, Phone, MapPin, Calendar, Clock, Hash, User, CreditCard } from "lucide-react";

const Invoice = forwardRef(({ invoice, onPrint, onDownload, onEmail }, ref) => {
  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
  const formatTime = (time) => time || new Date().toLocaleTimeString('en-IN');

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
      {/* Header Actions - Hidden in print */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Invoice #{invoice.id}</h2>
          <div className="flex gap-3">
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onEmail}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={ref} className="p-8 print:p-6">
        {/* Company Header */}
        <div className="border-b-2 border-emerald-500 pb-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">AC</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AgroCare Pesticide Shop</h1>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>123, Krishi Mandi Road, District Center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>contact@agrocare.com</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">INVOICE</h2>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Hash className="w-4 h-4" />
                    <span className="font-semibold">#{invoice.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(invoice.time)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Transaction Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Bill To
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{invoice.customerName || "Walk-in Customer"}</p>
              {invoice.customerPhone && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {invoice.customerPhone}
                </p>
              )}
              {invoice.customerAddress && (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {invoice.customerAddress}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">{invoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === 'Completed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              {invoice.createdBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Served By:</span>
                  <span className="font-semibold text-gray-900">{invoice.createdBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-t-xl">
            <h3 className="text-lg font-semibold">Items Purchased</h3>
          </div>
          <div className="border border-gray-200 rounded-b-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Item</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Qty</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Unit</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Rate</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.barcode && (
                          <p className="text-sm text-gray-500">Barcode: {item.barcode}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">{item.quantity}</td>
                    <td className="p-4 text-center text-gray-600">{item.unit}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(item.price)}</td>
                    <td className="p-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 p-6 rounded-xl space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All sales are final unless defective</li>
                <li>• Returns accepted within 7 days with receipt</li>
                <li>• Warranty as per manufacturer terms</li>
                <li>• Payment due within 30 days for credit sales</li>
              </ul>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <p className="text-sm text-gray-600 mb-2">Thank you for your business!</p>
                <p className="font-semibold text-emerald-700">AgroCare Pesticide Shop</p>
                <p className="text-xs text-gray-500 mt-2">
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