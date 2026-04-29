import API from './axios';

export const getSalesReps = (params) => API.get('/sales-reps', { params });
export const getSalesRep = (id) => API.get(`/sales-reps/${id}`);
export const createSalesRep = (data) => API.post('/sales-reps', data);
export const updateSalesRep = (id, data) => API.put(`/sales-reps/${id}`, data);
export const deleteSalesRep = (id) => API.delete(`/sales-reps/${id}`);
