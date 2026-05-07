/**
 * shareReceiptOnWhatsApp
 * Builds a premium WhatsApp-formatted receipt message with enhanced design
 */
import { normalizeInvoiceItems } from './normalizeInvoiceItems';

export const shareReceiptOnWhatsApp = (transaction, settings, phone = "") => {
  const shop   = settings?.shopName       || "AgriNest POS";
  const curr   = settings?.currency       || "Rs.";
  const footer = settings?.receiptFooter  || "Thank you for your business!";
  const address = settings?.shopAddress   || "";
  const contact = settings?.shopPhone     || "";

  const fmt = (n) => `${curr} ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Format date and time
  const dateObj = transaction.date ? new Date(transaction.date) : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-PK", { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString("en-PK", { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Build items list with better formatting
  const itemLines = normalizeInvoiceItems(transaction.items)
    .map((i, idx) => {
      const itemTotal = fmt(i.total);
      const itemName = i.name.length > 25 ? i.name.substring(0, 25) + '...' : i.name;
      return `${idx + 1}. *${itemName}*\n   Qty: ${i.quantity} × ${fmt(i.price)} = ${itemTotal}`;
    })
    .join("\n\n");

  // Calculate totals
  const subtotal = fmt(transaction.subtotal);
  const discount = transaction.discount > 0 ? fmt(transaction.discount) : null;
  const tax = fmt(transaction.tax);
  const grandTotal = fmt(transaction.grandTotal);

  // Build the premium receipt
  const lines = [
    "╔═══════════════════════════╗",
    `║   � *${shop}* 🌾   ║`,
    "╚═══════════════════════════╝",
    "",
    "┌─────────────────────────────┐",
    "│      📋 *INVOICE DETAILS*      │",
    "└─────────────────────────────┘",
    "",
    `🔖 *Invoice No:* ${transaction.invoiceNumber || transaction.id}`,
    `📅 *Date:* ${formattedDate}`,
    `🕐 *Time:* ${formattedTime}`,
    transaction.customerName ? `👤 *Customer:* ${transaction.customerName}` : null,
    transaction.customerPhone ? `� *Phone:* ${transaction.customerPhone}` : null,
    `�💳 *Payment:* ${transaction.paymentMethod}`,
    "",
    "┌─────────────────────────────┐",
    "│       🛒 *ITEMS ORDERED*       │",
    "└─────────────────────────────┘",
    "",
    itemLines,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `📊 *Subtotal:*${' '.repeat(Math.max(1, 20 - subtotal.length))}${subtotal}`,
    discount ? `🎁 *Discount:*${' '.repeat(Math.max(1, 20 - discount.length))}-${discount}` : null,
    `📈 *Tax:*${' '.repeat(Math.max(1, 25 - tax.length))}${tax}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `💰 *GRAND TOTAL:*${' '.repeat(Math.max(1, 14 - grandTotal.length))}*${grandTotal}*`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    transaction.paymentStatus === 'paid' ? "✅ *Status:* PAID" : "⏳ *Status:* PENDING",
    "",
    address ? `📍 ${address}` : null,
    contact ? `☎️ ${contact}` : null,
    "",
    "┌─────────────────────────────┐",
    `│  _${footer}_  │`,
    "└─────────────────────────────┘",
    "",
    "🌟 *Powered by AgriNest POS* 🌟",
    "_Premium Pesticide Management System_",
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
