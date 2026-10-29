import { useState, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useInvoices } from "./useInvoices";
import { useCustomers } from "../context/CustomersContext";
import { generateInvoiceNumber, getTodayDate, getCurrentTime } from "../utils/helpers";
import { holdSale, getHeldSales } from "../components/pos/HeldSalesModal";

/**
 * usePOSCheckout — manages checkout, hold/recall, and quick customer add for POS.
 */
export function usePOSCheckout({ cart, cartCalculations, discountAmount, paymentMethod, cashReceived, selectedCustomer, customer, selectedSalesRep, resetCart, setSelectedCustomer, setDiscount, setCashReceived }) {
  const { state, actions } = useApp();
  const { currentUser }    = state;
  const { addInvoice }     = useInvoices();
  const { addCustomer, refreshCustomer } = useCustomers();

  const attemptKey = `pos-checkout:${currentUser?.shop?._id || currentUser?.shop}:${currentUser?._id || currentUser?.id}`;
  const checkoutInFlight = useRef(false);
  const [hasPendingCheckout, setHasPendingCheckout] = useState(() => !!sessionStorage.getItem(attemptKey));
  const [checkoutLoading, setCheckoutLoading]   = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showReceipt, setShowReceipt]           = useState(false);
  const [heldCount, setHeldCount]               = useState(() => getHeldSales().length);
  const [showHeld, setShowHeld]                 = useState(false);

  // Quick customer add state
  const [showQuickCustomer, setShowQuickCustomer]   = useState(false);
  const [quickCustomerForm, setQuickCustomerForm]   = useState({ name: "", phone: "", address: "" });
  const [addingCustomer, setAddingCustomer]         = useState(false);

  const handleHoldSale = useCallback((customers) => {
    if (cart.length === 0) { actions.showToast({ message: "Cart is empty", type: "error" }); return; }
    const cName = customers.find((c) => c._id === selectedCustomer)?.name || "";
    holdSale(cart, cName, 0);
    setHeldCount(getHeldSales().length);
    actions.clearCart();
    resetCart();
    actions.showToast({ message: "Sale held — cart cleared for next customer", type: "success" });
  }, [cart, selectedCustomer, actions, resetCart]);

  const handleRecallSale = useCallback((sale) => {
    if (cart.length > 0) actions.clearCart();
    sale.cart.forEach((item) => {
      actions.addToCart({ _id: item.productId, name: item.name, price: item.price, unit: item.unit, barcode: item.barcode, stock: 9999 }, item.quantity);
    });
    setDiscount(sale.discount || 0);
    setHeldCount(getHeldSales().length);
    actions.showToast({ message: `Sale recalled: ${sale.label}`, type: "success" });
  }, [cart, actions, setDiscount]);

  const handleQuickAddCustomer = useCallback(async () => {
    if (!quickCustomerForm.name || !quickCustomerForm.phone) {
      actions.showToast({ message: "Name and phone are required", type: "error" });
      return;
    }
    setAddingCustomer(true);
    try {
      const res = await addCustomer({ name: quickCustomerForm.name, phone: quickCustomerForm.phone, address: quickCustomerForm.address || "N/A" });
      const newCustomer = res?._id ? res : res?.data?.data;
      if (newCustomer?._id) {
        setSelectedCustomer(newCustomer._id);
        actions.showToast({ message: `${newCustomer.name} added and selected`, type: "success" });
      }
      setShowQuickCustomer(false);
      setQuickCustomerForm({ name: "", phone: "", address: "" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add customer", type: "error" });
    } finally {
      setAddingCustomer(false);
    }
  }, [quickCustomerForm, addCustomer, setSelectedCustomer, actions]);

  const handleCheckout = useCallback(async () => {
    if (checkoutInFlight.current) return;
    if (!navigator.onLine) {
      actions.showToast({ message: "Connect to the internet to confirm this sale. Your cart is saved.", type: "error" });
      return;
    }
    if (cart.length === 0) { actions.showToast({ message: "Cart is empty", type: "error" }); return; }
    if (paymentMethod === "Cash" && cartCalculations.payableAmount > 0) {
      const received = parseFloat(cashReceived);
      if (!received || received < cartCalculations.payableAmount) {
        actions.showToast({ message: "Insufficient cash received", type: "error" }); return;
      }
    }
    if (paymentMethod === "Credit" && !selectedCustomer) {
      actions.showToast({ message: "Please select a customer for Credit payment", type: "error" }); return;
    }

    const invoiceData = {
      ...(customer?._id && { customer: customer._id }),
      ...(selectedSalesRep && { salesRepId: selectedSalesRep }),
      items: cart.map((item) => ({
        product:     item.productId,
        productName: item.name?.replace(/^\[Bundle\] /, "") || item.name,
        unitPrice:   item.price,
        quantity:    item.quantity,
        discount:    0,
      })),
      paymentMethod,
      amountPaid: paymentMethod === "Cash" ? (parseFloat(cashReceived) || 0) : 0,
      discount:   discountAmount,
      notes:      "",
    };

    const signature = JSON.stringify(invoiceData);
    let attempt;
    try {
      attempt = JSON.parse(sessionStorage.getItem(attemptKey) || "null");
      if (attempt && attempt.signature !== signature) {
        actions.showToast({ message: "A previous checkout is unresolved. Restore its cart and retry before creating another sale.", type: "error" });
        return;
      }
      attempt ||= { signature, id: crypto.randomUUID() };
      sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
    } catch {
      actions.showToast({ message: "Checkout could not save its recovery identifier. Check browser storage and retry.", type: "error" });
      return;
    }
    invoiceData.clientSaleId = attempt.id;
    checkoutInFlight.current = true;
    setCheckoutLoading(true);
    try {
      const invoice       = await addInvoice(invoiceData);
      const invoiceRecord = invoice.invoice ?? invoice;
      const isPending     = invoiceRecord.status === "Pending";
      const transaction   = {
        _id:           invoiceRecord._id,
        customerEmail: customer?.email || '',
        id:            invoiceRecord.invoiceNumber || generateInvoiceNumber(),
        invoiceNumber: invoiceRecord.invoiceNumber,
        date:          getTodayDate(),
        time:          getCurrentTime(),
        customerName:  invoiceRecord.customerName || customer?.name || "Walk-in Customer",
        items:         (invoiceRecord.items || []).length > 0
          ? invoiceRecord.items.map((i) => ({
              name:     i.productName || i.name,
              quantity: i.quantity,
              price:    i.unitPrice ?? i.price ?? 0,
              total:    i.total ?? ((i.unitPrice ?? i.price ?? 0) * i.quantity),
            }))
          : cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })),
        subtotal:      invoiceRecord.subtotal ?? cartCalculations.subtotal,
        tax:           invoiceRecord.taxAmount ?? cartCalculations.tax,
        discount:      invoiceRecord.discount ?? discountAmount,
        grandTotal:    invoiceRecord.total ?? cartCalculations.grandTotal,
        paymentMethod,
        status: invoiceRecord.status,
        createdBy:     currentUser?.name || "System",
      };
      sessionStorage.removeItem(attemptKey);
      setHasPendingCheckout(false);
      actions.createTransaction(invoiceData);
      if (customer?._id) refreshCustomer(customer._id);
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      setCashReceived("");
      resetCart();
      actions.showToast({
        message: isPending
          ? `Invoice #${invoiceRecord.invoiceNumber} created — awaiting admin confirmation`
          : `Sale completed! Invoice #${invoiceRecord.invoiceNumber} generated`,
        type: isPending ? "warning" : "success",
      });
    } catch (error) {
      const status = error.response?.status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) sessionStorage.removeItem(attemptKey);
      setHasPendingCheckout(!!sessionStorage.getItem(attemptKey));
      actions.showToast({
        message: error.response?.data?.message || "Sale confirmation is unknown. Keep this cart and retry the same checkout to reconcile safely.",
        type: "error",
      });
    } finally {
      checkoutInFlight.current = false;
      setCheckoutLoading(false);
    }
  }, [cart, cartCalculations, discountAmount, paymentMethod, cashReceived, selectedCustomer, customer, selectedSalesRep, currentUser, addInvoice, refreshCustomer, actions, resetCart, setCashReceived]);

  const handleRecoverCheckout = useCallback(async () => {
    if (checkoutInFlight.current || !navigator.onLine) return;
    const raw = sessionStorage.getItem(attemptKey);
    if (!raw) { setHasPendingCheckout(false); return; }
    checkoutInFlight.current = true;
    setCheckoutLoading(true);
    try {
      const pending = JSON.parse(raw);
      const payload = JSON.parse(pending.signature);
      const result = await addInvoice({ ...payload, clientSaleId: pending.id });
      const invoice = result.invoice ?? result;
      sessionStorage.removeItem(attemptKey);
      setHasPendingCheckout(false);
      setCompletedTransaction({
        id: invoice.invoiceNumber, invoiceNumber: invoice.invoiceNumber,
        date: getTodayDate(), time: getCurrentTime(), customerName: invoice.customerName,
        items: invoice.items.map(item => ({ name: item.productName, quantity: item.quantity, price: item.unitPrice, total: item.total })),
        subtotal: invoice.subtotal, tax: invoice.taxAmount, discount: invoice.discount,
        grandTotal: invoice.total, paymentMethod: invoice.paymentMethod, status: invoice.status,
        createdBy: currentUser?.name,
      });
      const sameCart = JSON.stringify(cart.map(item => [item.productId, item.quantity])) === JSON.stringify(payload.items.map(item => [item.product, item.quantity]));
      if (sameCart) { actions.clearCart(); resetCart(); }
      setShowReceipt(true);
      actions.showToast({ message: `Recovered invoice #${invoice.invoiceNumber}`, type: "success" });
    } catch (error) {
      actions.showToast({ message: error.response?.data?.message || "Recovery could not be confirmed. The original checkout is retained.", type: "error" });
    } finally { checkoutInFlight.current = false; setCheckoutLoading(false); }
  }, [attemptKey, addInvoice, cart, actions, resetCart, currentUser]);

  return {
    hasPendingCheckout, handleRecoverCheckout,
    checkoutLoading, completedTransaction,
    showReceipt, setShowReceipt,
    heldCount, showHeld, setShowHeld,
    showQuickCustomer, setShowQuickCustomer,
    quickCustomerForm, setQuickCustomerForm,
    addingCustomer,
    handleHoldSale, handleRecallSale,
    handleQuickAddCustomer, handleCheckout,
  };
}
