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
  
  console.log('🔐 Auth Request:', {
    method: req.method?.toUpperCase(),
    url: req.baseURL + req.url,
    timeout: req.timeout + 'ms'
  });
  
  return req;
});

AuthAPI.interceptors.response.use(
  (res) => {
    console.log('✅ Auth Response:', {
      status: res.status,
      url: res.config.url
    });
    return res;
  },
  (error) => {
    console.error('❌ Auth Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      isTimeout: error.code === 'ECONNABORTED',
      isNetworkError: error.message === 'Network Error'
    });
    
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
  
  // Log request details for debugging
  console.log('📤 Axios Request:', {
    method: req.method?.toUpperCase(),
    url: req.baseURL + req.url,
    headers: {
      ...req.headers,
      Authorization: req.headers.Authorization ? `Bearer ${req.headers.Authorization.substring(7, 20)}...` : 'None'
    },
    data: req.data
  });
  
  return req;
});

API.interceptors.response.use(
  (res) => {
    // Log successful response
    console.log('📥 Axios Response:', {
      status: res.status,
      statusText: res.statusText,
      url: res.config.url,
      data: res.data
    });
    return res;
  },
  (error) => {
    // Log error details
    console.error('❌ Axios Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
      isTimeout: error.code === 'ECONNABORTED',
      isNetworkError: error.message === 'Network Error'
    });
    
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
