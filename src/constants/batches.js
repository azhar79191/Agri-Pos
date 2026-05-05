/** Returns expiry status label, color classes, dot color, and days remaining */
export const getExpiryStatus = (expiryDate) => {
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (days <= 0)  return { label: "Expired",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",         dot: "bg-red-500",    days };
  if (days <= 30) return { label: "< 30 days", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",         dot: "bg-red-500",    days };
  if (days <= 60) return { label: "< 60 days", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500", days };
  if (days <= 90) return { label: "< 90 days", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500",   days };
  return { label: "Good", color: "bg-emerald-100 text-emerald-700 dark:bg-blue-900/20 dark:text-emerald-400", dot: "bg-emerald-500", days };
};

export const EMPTY_BATCH_FORM = { productName: "", batchNo: "", mfgDate: "", expiryDate: "", quantity: "", costPrice: "" };

/** Fallback mock data used when API is unavailable */
export const MOCK_BATCHES = [
  { _id: "b1", productName: "Roundup Herbicide",       batchNo: "LOT-2025-001", mfgDate: "2025-01-15", expiryDate: "2026-08-15", quantity: 12, remaining: 8,  costPrice: 350 },
  { _id: "b2", productName: "Malathion Insecticide",   batchNo: "LOT-2025-002", mfgDate: "2025-03-10", expiryDate: "2026-06-20", quantity: 20, remaining: 5,  costPrice: 280 },
  { _id: "b3", productName: "Dithane Fungicide",       batchNo: "LOT-2024-015", mfgDate: "2024-06-01", expiryDate: "2025-12-10", quantity: 15, remaining: 3,  costPrice: 220 },
  { _id: "b4", productName: "Hybrid Tomato Seeds",     batchNo: "LOT-2024-008", mfgDate: "2024-02-20", expiryDate: "2025-10-30", quantity: 25, remaining: 0,  costPrice: 700 },
  { _id: "b5", productName: "Urea Fertilizer",         batchNo: "LOT-2025-010", mfgDate: "2025-06-01", expiryDate: "2027-01-01", quantity: 50, remaining: 42, costPrice: 140 },
  { _id: "b6", productName: "Imidacloprid Insecticide",batchNo: "LOT-2025-003", mfgDate: "2025-02-14", expiryDate: "2026-02-14", quantity: 10, remaining: 6,  costPrice: 520 },
];
