import API from "./axios";

export const getInvoices = (params) => API.get("/invoices", { params });
export const getInvoice = (id) => API.get(`/invoices/${id}`);
export const getInvoiceByNumber = (number) => API.get(`/invoices/number/${number}`);
export const getTodaySales = () => API.get("/invoices/today/sales");
export const getRecentTransactions = () => API.get("/invoices/recent/transactions");
export const createInvoice = (data) => API.post("/invoices", data);
export const updateInvoiceStatus = (id, status) => API.put(`/invoices/${id}/status`, { status });
export const refundInvoice = (id) => API.post(`/invoices/${id}/refund`);
