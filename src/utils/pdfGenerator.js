import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice, settings) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const currency = settings?.currency || "Rs.";

  // ── Header ────────────────────────────────────────────────────
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageW, 38, "F");

  // Shop logo placeholder or name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.shopName || "AgroCare POS", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (settings?.address) doc.text(settings.address, 14, 23);
  if (settings?.phone)   doc.text(`Phone: ${settings.phone}`, 14, 29);
  if (settings?.email)   doc.text(`Email: ${settings.email}`, 14, 35);

  // Invoice label (right side)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageW - 14, 16, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${invoice.invoiceNumber || invoice._id}`, pageW - 14, 24, { align: "right" });
  doc.text(new Date(invoice.createdAt || Date.now()).toLocaleDateString("en-PK"), pageW - 14, 31, { align: "right" });

  // ── Bill To ───────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 14, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoice.customerName || "Walk-in Customer", 14, 55);
  if (invoice.customerPhone) doc.text(invoice.customerPhone, 14, 61);
  if (invoice.customerAddress) {
    const addr = doc.splitTextToSize(invoice.customerAddress, 80);
    doc.text(addr, 14, 67);
  }

  // Invoice details (right)
  const detailsY = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Payment Method:", pageW - 70, detailsY);
  doc.text("Status:", pageW - 70, detailsY + 7);
  doc.text("Cashier:", pageW - 70, detailsY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.paymentMethod || "Cash", pageW - 14, detailsY, { align: "right" });
  doc.text(invoice.paymentStatus || invoice.status || "Paid", pageW - 14, detailsY + 7, { align: "right" });
  doc.text(invoice.processedByName || "—", pageW - 14, detailsY + 14, { align: "right" });

  // ── Items Table ───────────────────────────────────────────────
  const items = invoice.items || [];
  autoTable(doc, {
    startY: 82,
    head: [["#", "Product", "SKU", "Qty", "Unit", "Unit Price", "Total"]],
    body: items.map((item, i) => [
      i + 1,
      item.productName || item.name || "—",
      item.sku || "—",
      item.quantity,
      item.unit || "pcs",
      `${currency} ${(item.unitPrice || item.price || 0).toFixed(2)}`,
      `${currency} ${(item.total || 0).toFixed(2)}`,
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 255, 250] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      3: { halign: "center" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 3 },
  });

  // ── Totals ────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6;
  const totalsX = pageW - 70;

  const addRow = (label, value, bold = false, color = null) => {
    const y = doc.lastAutoTable.finalY + (addRow._offset || 6);
    addRow._offset = (addRow._offset || 6) + 7;
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.text(label, totalsX, y);
    doc.text(value, pageW - 14, y, { align: "right" });
  };

  addRow._offset = 6;
  addRow("Subtotal:", `${currency} ${(invoice.subtotal || 0).toFixed(2)}`);
  addRow(`Tax (${invoice.taxRate || 0}%):`, `${currency} ${(invoice.taxAmount || 0).toFixed(2)}`);
  if (invoice.discount > 0) addRow("Discount:", `- ${currency} ${invoice.discount.toFixed(2)}`);

  // Divider
  const divY = doc.lastAutoTable.finalY + (addRow._offset || 6);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(totalsX, divY, pageW - 14, divY);
  addRow._offset += 4;

  addRow("TOTAL:", `${currency} ${(invoice.total || 0).toFixed(2)}`, true, [16, 120, 80]);
  if (invoice.amountPaid > 0) addRow("Amount Paid:", `${currency} ${invoice.amountPaid.toFixed(2)}`);
  if (invoice.changeAmount > 0) addRow("Change:", `${currency} ${invoice.changeAmount.toFixed(2)}`);
  if (invoice.creditAmount > 0) addRow("Credit:", `${currency} ${invoice.creditAmount.toFixed(2)}`, false, [220, 100, 0]);

  // ── Footer ────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 4, pageW - 14, footerY - 4);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(settings?.receiptFooter || "Thank you for your business!", pageW / 2, footerY, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleString("en-PK")}`, pageW / 2, footerY + 6, { align: "center" });

  return doc;
};

export const downloadInvoicePDF = (invoice, settings) => {
  const doc = generateInvoicePDF(invoice, settings);
  doc.save(`Invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
};

export const printInvoicePDF = (invoice, settings) => {
  const doc = generateInvoicePDF(invoice, settings);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  win?.print();
};
