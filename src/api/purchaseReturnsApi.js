import { financialCommand } from "./financialCommand";
import API from './axios';
export const getPurchaseReturns = (params) => API.get('/purchase-returns', { params });
export const getPurchaseReturn = (id) => API.get(`/purchase-returns/${id}`);
export const createPurchaseReturn = (data) => financialCommand('post', '/purchase-returns', data, { idField: 'clientOperationId', label: 'supplier return creation' });
export const updatePurchaseReturn = (id, data) => financialCommand('put', `/purchase-returns/${id}`, data, { idField: 'clientOperationId', label: 'supplier return edit' });
export const updateReturnStatus = (id, status) => financialCommand('put', `/purchase-returns/${id}/status`, { status }, { idField: 'clientOperationId', label: 'supplier return status' });
export const deletePurchaseReturn = (id) => financialCommand('delete', `/purchase-returns/${id}`, {}, { idField: 'clientOperationId', label: 'supplier return deletion' });
export const getSupplierProducts = (supplierId) => API.get(`/purchase-returns/supplier/${supplierId}/products`);
