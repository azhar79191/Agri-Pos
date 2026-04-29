import API from "./axios";

export const getMyShop = () => API.get("/shops/my");
export const getShops = () => API.get("/shops");
export const getShop = (id) => API.get(`/shops/${id}`);
export const createShop = (data) => API.post("/shops", data);
export const updateShop = (id, data) => API.put(`/shops/${id}`, data);
export const deleteShop = (id) => API.delete(`/shops/${id}`);
export const getShopUsers = (id) => API.get(`/shops/${id}/users`);
export const addUserToShop = (id, data) => API.post(`/shops/${id}/users`, data);
export const addBrand = (id, brand) => API.post(`/shops/${id}/brands`, { brand });
export const deleteBrand = (id, brand) => API.delete(`/shops/${id}/brands/${encodeURIComponent(brand)}`);
export const addCategory = (id, category) => API.post(`/shops/${id}/categories`, { category });
export const deleteCategory = (id, category) => API.delete(`/shops/${id}/categories/${encodeURIComponent(category)}`);
