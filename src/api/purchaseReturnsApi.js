import API from './axios';
export const getPurchaseReturns = (params) => API.get('/purchase-returns', { params });
export const getPurchaseReturn = (id) => API.get(`/purchase-returns/${id}`);
export const createPurchaseReturn = (data) => API.post('/purchase-returns', data);
export const updatePurchaseReturn = (id, data) => API.put(`/purchase-returns/${id}`, data);
export const updateReturnStatus = (id, status) => API.put(`/purchase-returns/${id}/status`, { status });
export const deletePurchaseReturn = (id) => API.delete(`/purchase-returns/${id}`);
export const getSupplierProducts = (supplierId) => API.get(`/purchase-returns/supplier/${supplierId}/products`);
