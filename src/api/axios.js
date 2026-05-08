import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for auth requests with shorter timeout
export const AuthAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for auth requests
  headers: {
    'Content-Type': 'application/json',
  },
});

AuthAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  
  return req;
});

AuthAPI.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    // Provide better error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The server is taking too long to respond. Please try again.';
    } else if (error.message === 'Network Error') {
      error.message = 'Network error. Please check your internet connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  
  return req;
});

API.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // 401 — token expired / invalid → force logout
    if (status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 403 with a shop-status code → notify the app to re-check shop status
    // This fires when the backend rejects a request because the shop was
    // suspended / plan expired while the user was already logged in.
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
