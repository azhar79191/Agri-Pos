import { financialCommand } from "./financialCommand";
import API from './axios';

export const getSuppliers = (params) => API.get('/suppliers', { params });
export const getSupplier = (id) => API.get(`/suppliers/${id}`);
export const createSupplier = (data) => API.post('/suppliers', data);
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

export const getSupplierLedger = (id, params) => API.get(`/suppliers/${id}/ledger`, { params });

export const recordSupplierPayment = (id, data) => financialCommand("post", `/suppliers/${id}/payment`, data, { idField: "clientOperationId", label: "supplier payment" });
