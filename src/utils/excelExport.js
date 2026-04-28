// Lazy-loaded Excel export — ExcelJS only loads when export is triggered

const saveFile = async (wb, filename) => {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

const applyHeader = (ws, columns) => {
  ws.columns = columns;
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 20;
};

const getExcelJS = () => import('exceljs').then(m => m.default);

export const exportProducts = async (products) => {
  const ExcelJS = await getExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Products');
  applyHeader(ws, [
    { header: '#', key: 'no', width: 5 },
    { header: 'SKU', key: 'sku', width: 14 },
    { header: 'Name', key: 'name', width: 26 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Brand', key: 'brand', width: 16 },
    { header: 'Sale Price', key: 'price', width: 12 },
    { header: 'Cost Price', key: 'costPrice', width: 12 },
    { header: 'Stock', key: 'stock', width: 8 },
    { header: 'Unit', key: 'unit', width: 8 },
    { header: 'Min Stock', key: 'minStock', width: 10 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Barcode', key: 'barcode', width: 16 },
    { header: 'Expiry Date', key: 'expiry', width: 14 },
  ]);
  products.forEach((p, i) => ws.addRow({
    no: i + 1, sku: p.sku || '', name: p.name || '', category: p.category || '',
    brand: p.manufacturer || '', price: p.price || 0, costPrice: p.costPrice || 0,
    stock: p.stock || 0, unit: p.unit || '', minStock: p.minStockLevel || 0,
    status: p.stock === 0 ? 'Out of Stock' : p.stock <= p.minStockLevel ? 'Low Stock' : 'In Stock',
    barcode: p.barcode || '', expiry: p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '',
  }));
  await saveFile(wb, `Products_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCustomers = async (customers) => {
  const ExcelJS = await getExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Customers');
  applyHeader(ws, [
    { header: '#', key: 'no', width: 5 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Phone', key: 'phone', width: 14 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'City', key: 'city', width: 14 },
    { header: 'Credit Balance', key: 'credit', width: 16 },
    { header: 'Wallet Balance', key: 'wallet', width: 16 },
    { header: 'Total Purchases', key: 'purchases', width: 16 },
    { header: 'Last Purchase', key: 'lastPurchase', width: 14 },
    { header: 'Status', key: 'status', width: 10 },
  ]);
  customers.forEach((c, i) => ws.addRow({
    no: i + 1, name: c.name || '', phone: c.phone || '', email: c.email || '',
    address: c.address || '', city: c.city || '', credit: c.creditBalance || 0,
    wallet: c.walletBalance || 0, purchases: c.totalPurchases || 0,
    lastPurchase: c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : '',
    status: c.isActive ? 'Active' : 'Inactive',
  }));
  await saveFile(wb, `Customers_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportInvoices = async (invoices) => {
  const ExcelJS = await getExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Invoices');
  applyHeader(ws, [
    { header: '#', key: 'no', width: 5 },
    { header: 'Invoice #', key: 'invoice', width: 18 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Customer', key: 'customer', width: 22 },
    { header: 'Phone', key: 'phone', width: 14 },
    { header: 'Payment Method', key: 'paymentMethod', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Tax', key: 'tax', width: 10 },
    { header: 'Discount', key: 'discount', width: 10 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Amount Paid', key: 'paid', width: 12 },
    { header: 'Items', key: 'items', width: 8 },
    { header: 'Cashier', key: 'cashier', width: 16 },
  ]);
  invoices.forEach((inv, i) => ws.addRow({
    no: i + 1, invoice: inv.invoiceNumber || '',
    date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
    customer: inv.customerName || 'Walk-in', phone: inv.customerPhone || '',
    paymentMethod: inv.paymentMethod || '', status: inv.status || '',
    subtotal: inv.subtotal || 0, tax: inv.taxAmount || 0, discount: inv.discount || 0,
    total: inv.total || 0, paid: inv.amountPaid || 0,
    items: inv.items?.length || 0, cashier: inv.processedByName || '',
  }));
  await saveFile(wb, `Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
};
