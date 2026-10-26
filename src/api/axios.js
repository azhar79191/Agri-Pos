import axios from "axios";
import { clearAuthToken, readAuthToken } from "../utils/authStorage";

const getToken = () => readAuthToken();

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const attachAuthHeader = (req) => {
  const token = getToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
};

AuthAPI.interceptors.request.use((req) => attachAuthHeader(req));

AuthAPI.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. The server is taking too long to respond. Please try again.";
    } else if (error.message === "Network Error") {
      error.message = "Network error. Please check your internet connection and try again.";
    }
    return Promise.reject(error);
  }
);

API.interceptors.request.use((req) => attachAuthHeader(req));

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401) {
      const token = getToken();
      if (token) {
        clearAuthToken();
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (
      status === 403 &&
      (code === "SHOP_SUSPENDED" ||
        code === "SHOP_PENDING_APPROVAL" ||
        code === "PLAN_EXPIRED")
    ) {
      window.dispatchEvent(new CustomEvent("shop-status-changed", { detail: { code } }));
    }

    return Promise.reject(error);
  }
);

export default API;
