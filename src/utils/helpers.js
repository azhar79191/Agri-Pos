// Format currency
export const formatCurrency = (amount, currency = "Rs.") => {
  const num = Number(amount);
  return `${currency} ${isNaN(num) ? "0.00" : num.toFixed(2)}`;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

// Format time
export const formatTime = (timeString) => {
  if (!timeString) return "-";
  return timeString;
};

// Generate unique ID
export const generateId = (prefix = "ID") => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate invoice number
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}${day}-${random}`;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Get current time in HH:MM:SS format
export const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-PK", { hour12: false });
};

// Check if product is low stock
export const isLowStock = (stock) => {
  return stock <= 5;
};

// Check if product is out of stock
export const isOutOfStock = (stock) => {
  return stock <= 0;
};

// Calculate tax amount
export const calculateTax = (amount, taxRate) => {
  return (amount * taxRate) / 100;
};

// Calculate grand total
export const calculateGrandTotal = (subtotal, tax, discount) => {
  return subtotal + tax - discount;
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, fields) => {
  if (!searchTerm) return array;
  const lowerSearch = searchTerm.toLowerCase();
  return array.filter((item) =>
    fields.some((field) =>
      String(item[field]).toLowerCase().includes(lowerSearch)
    )
  );
};

// Sort array by field
export const sortByField = (array, field, order = "asc") => {
  return [...array].sort((a, b) => {
    if (order === "asc") {
      return a[field] > b[field] ? 1 : -1;
    }
    return a[field] < b[field] ? 1 : -1;
  });
};

// Paginate array
export const paginate = (array, page, itemsPerPage) => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return array.slice(start, end);
};

// Get total pages
export const getTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

// Group by field
export const groupBy = (array, field) => {
  return array.reduce((acc, item) => {
    const key = item[field];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

// Calculate sum by field
export const sumByField = (array, field) => {
  return array.reduce((sum, item) => sum + (item[field] || 0), 0);
};

// Get unique values from array
export const getUniqueValues = (array, field) => {
  return [...new Set(array.map((item) => item[field]))];
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Validate required fields
export const validateRequired = (obj, fields) => {
  const errors = {};
  fields.forEach((field) => {
    if (!obj[field] || String(obj[field]).trim() === "") {
      errors[field] = `${field} is required`;
    }
  });
  return errors;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (str, length = 50) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Get color based on stock level
export const getStockColor = (stock) => {
  if (stock <= 0) return "text-red-600 bg-red-50";
  if (stock <= 5) return "text-amber-600 bg-amber-50";
  return "text-green-600 bg-green-50";
};

// Get stock status text
export const getStockStatus = (stock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 5) return "Low Stock";
  return "In Stock";
};
