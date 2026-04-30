import API from './axios';
export const getLoyaltyMembers = (params) => API.get('/loyalty', { params });
export const redeemPoints = (customerId, data) => API.post(`/loyalty/${customerId}/redeem`, data);
export const getPointsHistory = (customerId, params) => API.get(`/loyalty/${customerId}/history`, { params });
