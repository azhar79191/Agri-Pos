import API from "./axios";

export const getSuperAdminStats  = ()         => API.get("/superadmin/stats");
export const getAllShops          = ()         => API.get("/superadmin/shops");
export const getShopDetail        = (id)       => API.get(`/superadmin/shops/${id}`);
export const approveShop          = (id, data) => API.post(`/superadmin/shops/${id}/approve`, data);
export const grantPlan            = (id, data) => API.post(`/superadmin/shops/${id}/grant-plan`, data);
export const suspendShop          = (id, data) => API.post(`/superadmin/shops/${id}/suspend`, data);
export const unsuspendShop        = (id)       => API.post(`/superadmin/shops/${id}/unsuspend`);
export const deleteSuperAdminShop = (id)       => API.delete(`/superadmin/shops/${id}`);
