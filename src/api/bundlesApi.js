import API from './axios';
export const getBundles = (params) => API.get('/bundles', { params });
export const getBundle = (id) => API.get(`/bundles/${id}`);
export const createBundle = (data) => API.post('/bundles', data);
export const updateBundle = (id, data) => API.put(`/bundles/${id}`, data);
export const deleteBundle = (id) => API.delete(`/bundles/${id}`);
