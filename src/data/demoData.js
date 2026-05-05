/**
 * DEMO MODE
 * All actions are in-memory only. Nothing is saved to the database.
 * Dummy products, customers, and invoices are pre-loaded.
 */

export const DEMO_PRODUCTS = [
  { _id: "demo-p1", name: "Imidacloprid 200SL", category: "Insecticides", price: 850, costPrice: 600, stock: 45, unit: "liter", manufacturer: "Bayer", barcode: "8901234567890", minStockLevel: 5, sku: "INS-IMID-001" },
  { _id: "demo-p2", name: "Glyphosate 41%", category: "Herbicides", price: 1200, costPrice: 900, stock: 30, unit: "liter", manufacturer: "Syngenta", barcode: "8901234567891", minStockLevel: 5, sku: "HER-GLYP-002" },
  { _id: "demo-p3", name: "Urea Fertilizer", category: "Fertilizers", price: 3500, costPrice: 2800, stock: 120, unit: "kg", manufacturer: "FFC", barcode: "8901234567892", minStockLevel: 20, sku: "FER-UREA-003" },
  { _id: "demo-p4", name: "Mancozeb 80WP", category: "Fungicides", price: 650, costPrice: 450, stock: 8, unit: "kg", manufacturer: "BASF", barcode: "8901234567893", minStockLevel: 10, sku: "FUN-MANC-004" },
  { _id: "demo-p5", name: "Hybrid Cotton Seeds", category: "Seeds", price: 2200, costPrice: 1600, stock: 60, unit: "packet", manufacturer: "Pioneer", barcode: "8901234567894", minStockLevel: 10, sku: "SEE-COTT-005" },
  { _id: "demo-p6", name: "Chlorpyrifos 40EC", category: "Insecticides", price: 720, costPrice: 520, stock: 3, unit: "liter", manufacturer: "FMC", barcode: "8901234567895", minStockLevel: 5, sku: "INS-CHLO-006" },
  { _id: "demo-p7", name: "DAP Fertilizer", category: "Fertilizers", price: 4200, costPrice: 3500, stock: 80, unit: "kg", manufacturer: "Engro", barcode: "8901234567896", minStockLevel: 15, sku: "FER-DAP-007" },
  { _id: "demo-p8", name: "Cypermethrin 10EC", category: "Insecticides", price: 480, costPrice: 340, stock: 25, unit: "liter", manufacturer: "Syngenta", barcode: "8901234567897", minStockLevel: 5, sku: "INS-CYPR-008" },
];

export const DEMO_CUSTOMERS = [
  { _id: "demo-c1", name: "Ahmed Khan", phone: "0300-1234567", address: "Village Chak 45, Faisalabad", walletBalance: 500, creditBalance: 0, totalPurchases: 45000 },
  { _id: "demo-c2", name: "Muhammad Ali", phone: "0321-9876543", address: "Chak 12, Sahiwal", walletBalance: 0, creditBalance: 2500, totalPurchases: 28000 },
  { _id: "demo-c3", name: "Tariq Mehmood", phone: "0333-5551234", address: "Mandi Bahauddin", walletBalance: 1200, creditBalance: 0, totalPurchases: 67000 },
];

export const DEMO_INVOICES = [
  { _id: "demo-inv1", invoiceNumber: "INV-DEMO-001", customerName: "Ahmed Khan", total: 4250, paymentMethod: "Cash", status: "Completed", createdAt: new Date().toISOString(), items: [{ productName: "Imidacloprid 200SL", quantity: 2, unitPrice: 850, total: 1700 }, { productName: "Urea Fertilizer", quantity: 1, unitPrice: 3500, total: 3500 }] },
  { _id: "demo-inv2", invoiceNumber: "INV-DEMO-002", customerName: "Muhammad Ali", total: 2400, paymentMethod: "Credit", status: "Pending", createdAt: new Date(Date.now() - 86400000).toISOString(), items: [{ productName: "Glyphosate 41%", quantity: 2, unitPrice: 1200, total: 2400 }] },
];

export const DEMO_SETTINGS = {
  shopName: "Demo Agri Shop",
  currency: "Rs.",
  taxRate: 5,
  address: "Demo Address, Pakistan",
  phone: "0300-0000000",
  email: "demo@agrinest.com",
  receiptFooter: "Thank you! (DEMO MODE — No data is saved)",
};

export const isDemoMode = () => localStorage.getItem("agrinest_demo_mode") === "1";
export const enableDemoMode  = () => localStorage.setItem("agrinest_demo_mode", "1");
export const disableDemoMode = () => localStorage.removeItem("agrinest_demo_mode");
