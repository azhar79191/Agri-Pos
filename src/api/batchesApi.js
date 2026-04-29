import API from './axios';

export const getBatches = (params) => API.get('/batches', { params });
export const getExpiringSoon = (days = 30) => API.get('/batches/expiring-soon', { params: { days } });
export const createBatch = (data) => API.post('/batches', data);
export const updateBatch = (id, data) => API.put(`/batches/${id}`, data);
export const deleteBatch = (id) => API.delete(`/batches/${id}`);
