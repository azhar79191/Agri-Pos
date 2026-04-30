import API from './axios';
export const getPurchaseReturns = (params) => API.get('/purchase-returns', { params });
export const getPurchaseReturn = (id) => API.get(`/purchase-returns/${id}`);
export const createPurchaseReturn = (data) => API.post('/purchase-returns', data);
export const updateReturnStatus = (id, status) => API.put(`/purchase-returns/${id}/status`, { status });
