import * as XLSX from "xlsx";

const download = (wb, filename) => {
  XLSX.writeFile(wb, filename);
};

export const exportProducts = (products, currency = "Rs.") => {
  const rows = products.map((p, i) => ({
    "#": i + 1,
    SKU: p.sku || "",
    Name: p.name || "",
    Category: p.category || "",
    Brand: p.manufacturer || "",
    "Sale Price": p.price || 0,
    "Cost Price": p.costPrice || 0,
    Stock: p.stock || 0,
    Unit: p.unit || "",
    "Min Stock": p.minStockLevel || 0,
    Status: p.stock === 0 ? "Out of Stock" : p.stock <= p.minStockLevel ? "Low Stock" : "In Stock",
    Barcode: p.barcode || "",
    "Expiry Date": p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 4 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 16 },
    { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  download(wb, `Products_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const exportCustomers = (customers, currency = "Rs.") => {
  const rows = customers.map((c, i) => ({
    "#": i + 1,
    Name: c.name || "",
    Phone: c.phone || "",
    Email: c.email || "",
    Address: c.address || "",
    City: c.city || "",
    "Credit Balance": c.creditBalance || 0,
    "Wallet Balance": c.walletBalance || 0,
    "Total Purchases": c.totalPurchases || 0,
    "Last Purchase": c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : "",
    Status: c.isActive ? "Active" : "Inactive",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 4 }, { wch: 20 }, { wch: 14 }, { wch: 24 }, { wch: 30 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  download(wb, `Customers_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const exportInvoices = (invoices, currency = "Rs.") => {
  const rows = invoices.map((inv, i) => ({
    "#": i + 1,
    "Invoice #": inv.invoiceNumber || "",
    Date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "",
    Customer: inv.customerName || "Walk-in",
    Phone: inv.customerPhone || "",
    "Payment Method": inv.paymentMethod || "",
    "Payment Status": inv.paymentStatus || "",
    Status: inv.status || "",
    Subtotal: inv.subtotal || 0,
    "Tax Amount": inv.taxAmount || 0,
    Discount: inv.discount || 0,
    Total: inv.total || 0,
    "Amount Paid": inv.amountPaid || 0,
    "Items Count": inv.items?.length || 0,
    Cashier: inv.processedByName || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 4 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 14 },
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  download(wb, `Invoices_${new Date().toISOString().split("T")[0]}.xlsx`);
};
