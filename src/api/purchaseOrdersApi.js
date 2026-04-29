import API from './axios';

export const getPurchaseOrders = (params) => API.get('/purchase-orders', { params });
export const getPurchaseOrder = (id) => API.get(`/purchase-orders/${id}`);
export const createPurchaseOrder = (data) => API.post('/purchase-orders', data);
export const updatePurchaseOrder = (id, data) => API.put(`/purchase-orders/${id}`, data);
export const receiveGoods = (id, data) => API.post(`/purchase-orders/${id}/receive`, data);
export const deletePurchaseOrder = (id) => API.delete(`/purchase-orders/${id}`);
