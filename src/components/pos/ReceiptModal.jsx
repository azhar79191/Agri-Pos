import Modal from "../ui/Modal";
import React, { useState } from "react";
import EmailInvoiceModal from "../invoices/EmailInvoiceModal";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Printer, Download, MessageCircle, Mail } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { downloadInvoicePDF } from "../../utils/pdfGenerator";
import { shareReceiptOnWhatsApp } from "../../utils/whatsappShare";
import { normalizeInvoiceItems } from "../../utils/normalizeInvoiceItems";

const ReceiptEmail = ({ transaction }) => {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-700"><Mail className="h-4 w-4" />Email</button>{open && <EmailInvoiceModal invoice={transaction} onClose={() => setOpen(false)} />}</>;
};
const ReceiptModal = ({ isOpen, onClose, transaction, settings, currentUserName }) => (
  <AnimatePresence>
    {isOpen && transaction && (
      <Modal
          isOpen
          onClose={onClose}
          title="Receipt"
          size="md"
          subtitle={<>{transaction.invoiceNumber || transaction.id}</>}
          icon={Receipt}
          className="receipt-modal"
          data-receipt-template={settings.receiptTemplate || "standard"}
          footer={<div className="flex flex-wrap gap-2 print:hidden">
            <ReceiptEmail transaction={transaction} />
            <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
              className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Close
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Printer className="w-4 h-4" />Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => shareReceiptOnWhatsApp(transaction, settings, transaction.customerPhone)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />WhatsApp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => downloadInvoicePDF(transaction, settings)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />PDF
            </motion.button>
          </div>}><div className="space-y-4">

          {/* Receipt content */}
          <div className="">
            <div className="receipt receipt-paper bg-white rounded-lg border border-dashed border-slate-200 p-5">
              {/* Pending notice */}
              {transaction.status === "Pending" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center"
                >
                  <p className="text-amber-700 font-semibold text-sm">⏳ Payment Pending Confirmation</p>
                  <p className="text-amber-600 text-xs mt-0.5">Awaiting admin confirmation.</p>
                </motion.div>
              )}

              {/* Shop info */}
              <div className="text-center mb-5">
                {(settings.brandLogo || settings.shopLogo) && (
                  <img src={settings.brandLogo || settings.shopLogo} alt={settings.brandName || settings.shopName} className="w-14 h-14 object-contain mx-auto mb-2" />
                )}
                <h2 className="text-xl font-bold text-gray-900">{settings.brandName || settings.shopName}</h2>
                {settings.brandTagline && <p className="text-xs text-gray-500">{settings.brandTagline}</p>}
                <p className="text-xs text-gray-500">{settings.address}</p>
                <p className="text-xs text-gray-500">{settings.phone}</p>
                <div className="mt-3 border-t border-b border-gray-200 py-2">
                  <p className="text-base font-bold text-gray-900">INVOICE</p>
                  <p className="text-xs text-gray-500 font-mono">{transaction.invoiceNumber || transaction.id}</p>
                  <p className="text-xs text-gray-500">{transaction.date} {transaction.time}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="mb-4 text-xs space-y-1 text-gray-700">
                <p><span className="font-semibold">Customer:</span> {transaction.customerName}</p>
                <p><span className="font-semibold">Payment:</span> {transaction.paymentMethod}</p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={`font-bold ${transaction.status === "Pending" ? "text-amber-600" : "text-emerald-600"}`}>
                    {transaction.status}
                  </span>
                </p>
                <p><span className="font-semibold">Cashier:</span> {transaction.createdBy || currentUserName}</p>
              </div>

              {/* Items table */}
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 font-semibold text-gray-600">Item</th>
                    <th className="text-center py-1.5 font-semibold text-gray-600">Qty</th>
                    <th className="text-right py-1.5 font-semibold text-gray-600">Price</th>
                    <th className="text-right py-1.5 font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizeInvoiceItems(transaction.items).map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-800">{item.name}</td>
                      <td className="text-center text-gray-600">{item.quantity}</td>
                      <td className="text-right text-gray-600">{formatCurrency(item.price, settings.currency)}</td>
                      <td className="text-right font-medium text-gray-800">{formatCurrency(item.total, settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>{formatCurrency(transaction.subtotal, settings.currency)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax ({settings.taxRate}%):</span><span>{formatCurrency(transaction.tax, settings.currency)}</span></div>
                {transaction.discount > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Discount:</span><span>-{formatCurrency(transaction.discount, settings.currency)}</span></div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 text-gray-900">
                  <span>Grand Total:</span><span className="text-emerald-600">{formatCurrency(transaction.grandTotal, settings.currency)}</span>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-gray-500">
                <p>{settings.receiptFooter || "Thank you for your business!"}</p>
                {settings.email && <p className="mt-0.5">{settings.email}</p>}
              </div>
            </div>
          </div>

        </div></Modal>
    )}
  </AnimatePresence>
);

export default ReceiptModal;
