import API, { AuthAPI } from "./axios";

export const loginUser = (data) => AuthAPI.post("/auth/login", data);
export const registerUser = (data) => AuthAPI.post("/auth/register", data);
export const registerShopWithAdmin = (data) => AuthAPI.post("/auth/register-shop", data);
export const getSetupStatus = () => AuthAPI.get("/auth/setup-status");
export const getProfile = () => AuthAPI.get("/auth/profile");
export const updateProfile = (data) => AuthAPI.put("/auth/profile", data);
export const updatePassword = (data) => AuthAPI.put("/auth/password", data);
export const logoutUser = () => AuthAPI.post("/auth/logout");

// Forgot Password Flow
export const requestPasswordReset = (data) => AuthAPI.post("/auth/forgot-password", data);
export const verifyResetCode = (data) => AuthAPI.post("/auth/verify-reset-code", data);
export const resetPassword = (data) => AuthAPI.post("/auth/reset-password", data);
export const resendResetCode = (data) => AuthAPI.post("/auth/resend-reset-code", data);
