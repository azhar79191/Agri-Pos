import API from "./axios";

export const getCustomers = (params) => API.get("/customers", { params });
export const getCustomer = (id) => API.get(`/customers/${id}`);
export const getCustomersWithCredit = () => API.get("/customers/credit/list");
export const getCustomerPurchases = (id) => API.get(`/customers/${id}/purchases`);
export const createCustomer = (data) => API.post("/customers", data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const depositCredit = (id, data) => API.post(`/customers/${id}/deposit`, data);
export const walletDeposit = (id, data) => API.post(`/customers/${id}/wallet/deposit`, data);
export const updateCustomerCredit = (id, data) => API.put(`/customers/${id}/credit`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
