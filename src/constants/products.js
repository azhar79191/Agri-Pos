export const DEFAULT_CATEGORIES = [
  "Herbicides", "Insecticides", "Fungicides", "Fertilizers", "Seeds", "Other",
];

export const UNIT_OPTIONS = [
  { value: "liter",  label: "Liter" },
  { value: "ml",     label: "ML (Milliliter)" },
  { value: "kg",     label: "KG (Kilogram)" },
  { value: "gram",   label: "Gram" },
  { value: "packet", label: "Packet" },
  { value: "bottle", label: "Bottle" },
  { value: "box",    label: "Box" },
  { value: "piece",  label: "Piece" },
];

export const SUB_UNIT_OPTIONS = {
  liter: [
    { value: "250ml",  label: "250 ML" },
    { value: "500ml",  label: "500 ML" },
    { value: "1liter", label: "1 Liter" },
    { value: "2liter", label: "2 Liter" },
    { value: "5liter", label: "5 Liter" },
  ],
  kg: [
    { value: "0.5kg", label: "0.5 KG" },
    { value: "1kg",   label: "1 KG" },
    { value: "2kg",   label: "2 KG" },
    { value: "3kg",   label: "3 KG" },
    { value: "5kg",   label: "5 KG" },
    { value: "10kg",  label: "10 KG" },
    { value: "15kg",  label: "15 KG" },
  ],
  packet: [
    { value: "0.5kg", label: "1/2 KG" },
    { value: "1kg",   label: "1 KG" },
    { value: "2kg",   label: "2 KG" },
    { value: "5kg",   label: "5 KG" },
    { value: "250g",  label: "250 Gram" },
    { value: "500g",  label: "500 Gram" },
  ],
};

export const CATEGORY_COLORS = {
  Herbicides:  "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Insecticides:"bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  Fungicides:  "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Fertilizers: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Seeds:       "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Other:       "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export const EMPTY_PRODUCT_FORM = {
  name: "", category: "", brand: "", price: "", costPrice: "", stock: "",
  unit: "", subUnit: "", expiryDate: "", description: "", barcode: "", minStockLevel: "5",
};

/** Generates a SKU from product name and category */
export const generateSKU = (name, category) => {
  const prefix   = category ? category.substring(0, 3).toUpperCase() : "PRD";
  const namePart = name.replace(/\s+/g, "").substring(0, 4).toUpperCase();
  const random   = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${namePart}-${random}`;
};
