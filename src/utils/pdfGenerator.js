// Lazy-loaded PDF generator — jsPDF only loads when first PDF is requested

const buildDoc = async (invoice, settings) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const currency = settings?.currency || 'Rs.';

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings?.shopName || 'AgroCare POS', 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (settings?.address) doc.text(settings.address, 14, 23);
  if (settings?.phone)   doc.text(`Phone: ${settings.phone}`, 14, 29);
  if (settings?.email)   doc.text(`Email: ${settings.email}`, 14, 35);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageW - 14, 16, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoice.invoiceNumber || invoice._id}`, pageW - 14, 24, { align: 'right' });
  doc.text(new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-PK'), pageW - 14, 31, { align: 'right' });

  // Bill To
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.customerName || 'Walk-in Customer', 14, 55);
  if (invoice.customerPhone) doc.text(invoice.customerPhone, 14, 61);
  if (invoice.customerAddress) {
    doc.text(doc.splitTextToSize(invoice.customerAddress, 80), 14, 67);
  }

  // Invoice details
  const dY = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Payment Method:', pageW - 70, dY);
  doc.text('Status:', pageW - 70, dY + 7);
  doc.text('Cashier:', pageW - 70, dY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.paymentMethod || 'Cash', pageW - 14, dY, { align: 'right' });
  doc.text(invoice.paymentStatus || invoice.status || 'Paid', pageW - 14, dY + 7, { align: 'right' });
  doc.text(invoice.processedByName || '—', pageW - 14, dY + 14, { align: 'right' });

  // Items table
  autoTable(doc, {
    startY: 82,
    head: [['#', 'Product', 'SKU', 'Qty', 'Unit', 'Unit Price', 'Total']],
    body: (invoice.items || []).map((item, i) => [
      i + 1,
      item.productName || item.name || '—',
      item.sku || '—',
      item.quantity,
      item.unit || 'pcs',
      `${currency} ${(item.unitPrice || item.price || 0).toFixed(2)}`,
      `${currency} ${(item.total || 0).toFixed(2)}`,
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 255, 250] },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 3: { halign: 'center' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 3 },
  });

  // Totals
  let offset = 6;
  const addRow = (label, value, bold = false, color = null) => {
    const y = doc.lastAutoTable.finalY + offset;
    offset += 7;
    doc.setTextColor(...(color || [60, 60, 60]));
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.text(label, pageW - 70, y);
    doc.text(value, pageW - 14, y, { align: 'right' });
  };

  addRow('Subtotal:', `${currency} ${(invoice.subtotal || 0).toFixed(2)}`);
  addRow(`Tax (${invoice.taxRate || 0}%):`, `${currency} ${(invoice.taxAmount || 0).toFixed(2)}`);
  if (invoice.discount > 0) addRow('Discount:', `- ${currency} ${invoice.discount.toFixed(2)}`);

  const divY = doc.lastAutoTable.finalY + offset;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(pageW - 70, divY, pageW - 14, divY);
  offset += 4;

  addRow('TOTAL:', `${currency} ${(invoice.total || 0).toFixed(2)}`, true, [16, 120, 80]);
  if (invoice.amountPaid > 0) addRow('Amount Paid:', `${currency} ${invoice.amountPaid.toFixed(2)}`);
  if (invoice.changeAmount > 0) addRow('Change:', `${currency} ${invoice.changeAmount.toFixed(2)}`);
  if (invoice.creditAmount > 0) addRow('Credit:', `${currency} ${invoice.creditAmount.toFixed(2)}`, false, [220, 100, 0]);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 4, pageW - 14, footerY - 4);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(settings?.receiptFooter || 'Thank you for your business!', pageW / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-PK')}`, pageW / 2, footerY + 6, { align: 'center' });

  return doc;
};

export const downloadInvoicePDF = async (invoice, settings) => {
  const doc = await buildDoc(invoice, settings);
  doc.save(`Invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
};

export const printInvoicePDF = async (invoice, settings) => {
  const doc = await buildDoc(invoice, settings);
  const url = URL.createObjectURL(doc.output('blob'));
  const win = window.open(url);
  win?.print();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const generateInvoicePDF = buildDoc;
