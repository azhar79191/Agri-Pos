import API from './axios';

export const getAuditLogs = (params) => API.get('/audit-logs', { params });
export const logAction = (data) => API.post('/audit-logs', data);
