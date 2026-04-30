import API from "./axios";

export const getUsers = (params) => API.get("/users", { params });
export const getUser = (id) => API.get(`/users/${id}`);
export const getAllPermissions = () => API.get("/users/permissions/all");
export const getUserPermissions = (id) => API.get(`/users/${id}/permissions`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const updateUserPermissions = (id, permissions) => API.put(`/users/${id}/permissions`, { permissions });
export const grantAllPermissions = (id) => API.put(`/users/${id}/permissions/grant-all`);
export const revokeAllPermissions = (id) => API.put(`/users/${id}/permissions/revoke-all`);
export const resetUserPassword = (id, data) => API.put(`/users/${id}/reset-password`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
