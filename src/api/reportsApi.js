import API from "./axios";

export const getDashboard = () => API.get("/reports/dashboard");
export const getSalesReport = (params) => API.get("/reports/sales", { params });
export const getTopProducts = (params) => API.get("/reports/top-products", { params });
export const getInventoryReport = () => API.get("/reports/inventory");
export const getPaymentDistribution = (params) => API.get("/reports/payment-distribution", { params });
export const getCustomerReport = (params) => API.get("/reports/customers", { params });
export const exportReport = (params) => API.get("/reports/export", { params });
