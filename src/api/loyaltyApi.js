import API from './axios';
import { financialCommand } from './financialCommand';
export const getLoyaltyMembers = (params) => API.get('/loyalty', { params });
export const redeemPoints = (customerId, data) => financialCommand('post', `/loyalty/${customerId}/redeem`, data, { idField: 'clientOperationId', label: 'loyalty redemption' });
export const getPointsHistory = (customerId, params) => API.get(`/loyalty/${customerId}/history`, { params });
