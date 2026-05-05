/**
 * shareReceiptOnWhatsApp
 * Builds a clean WhatsApp-formatted receipt message and opens wa.me
 */
import { normalizeInvoiceItems } from './normalizeInvoiceItems';

export const shareReceiptOnWhatsApp = (transaction, settings, phone = "") => {
  const shop   = settings?.shopName       || "AgriNest POS";
  const curr   = settings?.currency       || "Rs.";
  const footer = settings?.receiptFooter  || "Thank you for your business!";

  const fmt = (n) => `${curr} ${Number(n || 0).toFixed(2)}`;

  const itemLines = normalizeInvoiceItems(transaction.items)
    .map((i) => `  • ${i.name} ×${i.quantity}  ${fmt(i.total)}`)
    .join("\n");

  const lines = [
    `🌿 *${shop}*`,
    `📋 Invoice: *${transaction.invoiceNumber || transaction.id}*`,
    `📅 Date: ${transaction.date || new Date().toLocaleDateString("en-PK")}`,
    transaction.customerName ? `👤 Customer: ${transaction.customerName}` : null,
    `💳 Payment: ${transaction.paymentMethod}`,
    "",
    "*Items:*",
    itemLines,
    "",
    `Subtotal:  ${fmt(transaction.subtotal)}`,
    transaction.discount > 0 ? `Discount:  -${fmt(transaction.discount)}` : null,
    `Tax:       ${fmt(transaction.tax)}`,
    `*Total:    ${fmt(transaction.grandTotal)}*`,
    "",
    `_${footer}_`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const encoded = encodeURIComponent(lines);
  // If phone provided, open direct chat; otherwise open share dialog
  const url = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, "_blank", "noopener,noreferrer");
};
