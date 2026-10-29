import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { getCreditSalesReport } from "../api/reportsApi";
import { updateInvoicePayment } from "../api/invoicesApi";

/**
 * useCreditSales — fetches credit sales data and handles payment recording.
 */
export function useCreditSales() {
  const { actions }                         = useApp();
  const [rows, setRows]                     = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading]               = useState(true);
  const [paymentModal, setPaymentModal]     = useState(null);
  const [paymentAmount, setPaymentAmount]   = useState("");
  const [paymentMethod, setPaymentMethod]   = useState("Cash");
  const [paymentNotes, setPaymentNotes]     = useState("");
  const [processing, setProcessing]         = useState(false);

  const loadVersion=useRef(0);
  const loadData = useCallback(() => {
    const version=++loadVersion.current;
    setLoading(true); setError('');
    return getCreditSalesReport()
      .then(res=>{if(version!==loadVersion.current)return;const data=res.data.data;if(!Array.isArray(data?.rows)||!Number.isFinite(data?.totalOutstanding))throw new Error('The credit report response was incomplete. Please retry.');setRows(data.rows);setTotalOutstanding(data.totalOutstanding);})
      .catch(error => { if(version!==loadVersion.current)return;setRows([]); setTotalOutstanding(0); setError(error.response?.data?.message || error.message || 'Credit report unavailable'); })
      .finally(() => {if(version===loadVersion.current)setLoading(false);});
  }, []);

  useEffect(() => { loadData(); return()=>{loadVersion.current++;}; }, [loadData]);

  const openPaymentModal = useCallback((sale) => {
    setPaymentModal(sale);
    setPaymentAmount(sale.balance.toString());
    setPaymentMethod("Cash");
    setPaymentNotes("");
  }, []);

  const handlePayment = useCallback(async () => {
    if (!paymentModal || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      actions.showToast({ message: "Enter valid payment amount", type: "error" }); return;
    }
    const amount = parseFloat(paymentAmount);
    if (amount > paymentModal.balance) {
      actions.showToast({ message: "Payment amount cannot exceed balance", type: "error" }); return;
    }
    const invoiceId = paymentModal.invoiceId || paymentModal._id;
    if (!invoiceId) { actions.showToast({ message: "Invalid invoice ID", type: "error" }); return; }
    setProcessing(true);
    try {
      await updateInvoicePayment(invoiceId, { amount, method: paymentMethod, notes: paymentNotes });
      actions.showToast({ message: "Payment recorded successfully", type: "success" });
      setPaymentModal(null);
      loadData();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || err.message || "Payment failed", type: "error" });
    } finally { setProcessing(false); }
  }, [paymentModal, paymentAmount, paymentMethod, paymentNotes, actions, loadData]);

  return {
    rows, totalOutstanding, loading, error, retry:loadData,
    paymentModal, setPaymentModal,
    paymentAmount, setPaymentAmount,
    paymentMethod, setPaymentMethod,
    paymentNotes, setPaymentNotes,
    processing,
    openPaymentModal, handlePayment,
  };
}
