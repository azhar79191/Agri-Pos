import API from "./axios";

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const registerShopWithAdmin = (data) => API.post("/auth/register-shop", data);
export const getSetupStatus = () => API.get("/auth/setup-status");
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const updatePassword = (data) => API.put("/auth/password", data);
export const logoutUser = () => API.post("/auth/logout");

// Forgot Password Flow
export const requestPasswordReset = (data) => API.post("/auth/forgot-password", data);
export const verifyResetCode = (data) => API.post("/auth/verify-reset-code", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const resendResetCode = (data) => API.post("/auth/resend-reset-code", data);
