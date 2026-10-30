import Invoice from '../Invoice';
import Modal from "../ui/Modal";
import React, { useState } from "react";
import EmailInvoiceModal from "../invoices/EmailInvoiceModal";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Receipt, Printer, Download, MessageCircle, Mail } from "lucide-react";
import { downloadInvoicePDF } from "../../utils/pdfGenerator";
import { shareReceiptOnWhatsApp } from "../../utils/whatsappShare";

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
          size="xl"
          subtitle={<>{transaction.invoiceNumber || transaction.id}</>}
          icon={Receipt}
          className="receipt-modal"
          data-receipt-template={settings.receiptTemplate || "standard"}
          footer={<div className="flex flex-wrap gap-2 print:hidden">
            <ReceiptEmail transaction={transaction} />
            <Motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
              className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Close
            </Motion.button>
            <Motion.button whileTap={{ scale: 0.96 }} onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Printer className="w-4 h-4" />Print
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => shareReceiptOnWhatsApp(transaction, settings, transaction.customerPhone)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />WhatsApp
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => downloadInvoicePDF(transaction, settings)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />PDF
            </Motion.button>
          </div>}><div className="space-y-4">

          {/* Receipt content */}
          <div className="">
            <div className="bg-white">
              {/* Pending notice */}
              {transaction.status === "Pending" && (
                <Motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center"
                >
                  <p className="text-amber-700 font-semibold text-sm">⏳ Payment Pending Confirmation</p>
                  <p className="text-amber-600 text-xs mt-0.5">Awaiting admin confirmation.</p>
                </Motion.div>
              )}

              <Invoice invoice={{...transaction,processedByName:transaction.processedByName||currentUserName}} settings={settings} preview />
            </div>
          </div>

        </div></Modal>
    )}
  </AnimatePresence>
);

export default ReceiptModal;
