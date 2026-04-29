import API from "./axios";

export const getDashboard = () => API.get("/reports/dashboard");
export const getSalesReport = (params) => API.get("/reports/sales", { params });
export const getTopProducts = (params) => API.get("/reports/top-products", { params });
export const getInventoryReport = (params) => API.get("/reports/inventory", { params });
export const getPaymentDistribution = (params) => API.get("/reports/payment-distribution", { params });
export const getCustomerReport = (params) => API.get("/reports/customers", { params });
export const getProfitReport = (params) => API.get("/reports/profit", { params });
export const getMarginReport = (params) => API.get("/reports/margin", { params });
export const getAnalytics = () => API.get("/reports/analytics");
export const getForecasting = () => API.get("/reports/forecasting");
export const getCustomerPurchaseHistory = () => API.get("/reports/purchase-history");
export const getCreditSalesReport = () => API.get("/reports/credit-sales");
export const exportReport = (params) => API.get("/reports/export", { params });
