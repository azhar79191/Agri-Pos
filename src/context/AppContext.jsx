import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef } from "react";
import { hasPermission } from "../data/users";
import { generateInvoiceNumber, getTodayDate, getCurrentTime } from "../utils/helpers";
import { disconnectSocket } from "../hooks/useSocket";
import { getProfile } from "../api/authApi";

// ── Bootstrap from storage synchronously (no flash, no extra render) ──
const _savedUser = (() => {
  try { return JSON.parse(localStorage.getItem("user") || localStorage.getItem("posUser")); } catch { return null; }
})();
const _savedShop = _savedUser?.shop && typeof _savedUser.shop === "object" ? _savedUser.shop : null;
const _savedDarkMode = localStorage.getItem("posDarkMode") === "true";
const _savedThemeColor = localStorage.getItem("posThemeColor") || "#10b981";
const _savedCart = (() => {
  try { return JSON.parse(sessionStorage.getItem("posCart") || "[]"); } catch { return []; }
})();

// Apply dark class and theme color before React renders
if (_savedDarkMode) document.documentElement.classList.add("dark");
document.documentElement.style.setProperty("--pos-primary", _savedThemeColor);

const initialState = {
  currentUser: _savedUser || null,
  isAuthenticated: !!_savedUser && !!localStorage.getItem("token"),
  cart: _savedCart,
  currentPage: "dashboard",
  darkMode: _savedDarkMode,
  themeColor: _savedThemeColor,
  toast: null,
  modal: null,
  sidebarCollapsed: false,
  settings: {
    shopName:          _savedShop?.name          || "",
    taxRate:           _savedShop?.taxRate        ?? 5,
    currency:          _savedShop?.currency       || "Rs.",
    address:           _savedShop?.address        || "",
    phone:             _savedShop?.phone          || "",
    email:             _savedShop?.email          || "",
    shopLogo:          _savedShop?.logo           || "",
    receiptFooter:     _savedShop?.receiptFooter  || "Thank you for your purchase!",
    lowStockThreshold: _savedShop?.lowStockThreshold ?? 5,
  },
};

const A = {
  LOGIN: "LOGIN", LOGOUT: "LOGOUT", SET_PAGE: "SET_PAGE",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR", ADD_TO_CART: "ADD_TO_CART",
  UPDATE_CART_QUANTITY: "UPDATE_CART_QUANTITY", REMOVE_FROM_CART: "REMOVE_FROM_CART",
  CLEAR_CART: "CLEAR_CART", UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_DARK_MODE: "SET_DARK_MODE", SET_THEME_COLOR: "SET_THEME_COLOR", SHOW_TOAST: "SHOW_TOAST", HIDE_TOAST: "HIDE_TOAST",
  SHOW_MODAL: "SHOW_MODAL", HIDE_MODAL: "HIDE_MODAL", UPDATE_USER: "UPDATE_USER",
};

function appReducer(state, action) {
  switch (action.type) {
    case A.LOGIN:
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case A.UPDATE_USER:
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload, shop: action.payload.shop ?? state.currentUser?.shop },
        isAuthenticated: true,
      };
    case A.LOGOUT:
      return { ...initialState, darkMode: state.darkMode };
    case A.SET_PAGE:
      return { ...state, currentPage: action.payload };
    case A.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case A.ADD_TO_CART: {
      const existing = state.cart.find(i => i.productId === action.payload.productId);
      if (existing) {
        return { ...state, cart: state.cart.map(i => i.productId === action.payload.productId ? { ...i, quantity: i.quantity + action.payload.quantity } : i) };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }
    case A.UPDATE_CART_QUANTITY:
      return { ...state, cart: state.cart.map(i => i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i) };
    case A.REMOVE_FROM_CART:
      return { ...state, cart: state.cart.filter(i => i.productId !== action.payload) };
    case A.CLEAR_CART:
      return { ...state, cart: [] };
    case A.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case A.SET_DARK_MODE:
      return { ...state, darkMode: action.payload };
    case A.SET_THEME_COLOR:
      return { ...state, themeColor: action.payload };
    case A.SHOW_TOAST:
      return { ...state, toast: action.payload };
    case A.HIDE_TOAST:
      return { ...state, toast: null };
    case A.SHOW_MODAL:
      return { ...state, modal: action.payload };
    case A.HIDE_MODAL:
      return { ...state, modal: null };
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const toastTimerRef = useRef(null);
  // Keep a ref to current state so actions don't go stale
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Dark mode side-effect
  useEffect(() => {
    localStorage.setItem("posDarkMode", state.darkMode);
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  // Theme color side-effect
  useEffect(() => {
    localStorage.setItem("posThemeColor", state.themeColor);
    document.documentElement.style.setProperty("--pos-primary", state.themeColor);
  }, [state.themeColor]);

  // Persist user
  useEffect(() => {
    if (state.currentUser) localStorage.setItem("posUser", JSON.stringify(state.currentUser));
    else localStorage.removeItem("posUser");
  }, [state.currentUser]);

  // Persist cart
  useEffect(() => {
    sessionStorage.setItem("posCart", JSON.stringify(state.cart));
  }, [state.cart]);

  // Cross-tab user sync
  useEffect(() => {
    localStorage.removeItem("posSettings");
    const handleUserUpdate = (e) => {
      const incoming = e.detail || (e.newValue ? JSON.parse(e.newValue) : null);
      if (incoming) dispatch({ type: A.UPDATE_USER, payload: incoming });
    };
    window.addEventListener("user-updated", handleUserUpdate);
    const handleStorage = (e) => { if (e.key === "user" && e.newValue) handleUserUpdate(e); };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // ── Refresh permissions from backend on startup ──
  // This ensures any permission changes made by admin are reflected immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !state.isAuthenticated) return;
    getProfile()
      .then(res => {
        const fresh = res.data?.data?.user ?? res.data?.user;
        if (!fresh) return;
        // Only update if permissions actually changed
        const current = stateRef.current.currentUser;
        const freshPerms = JSON.stringify(fresh.permissions || []);
        const currentPerms = JSON.stringify(current?.permissions || []);
        if (freshPerms !== currentPerms || fresh.isActive !== current?.isActive) {
          dispatch({ type: A.UPDATE_USER, payload: fresh });
          localStorage.setItem("user", JSON.stringify({ ...current, ...fresh }));
        }
      })
      .catch(() => {}); // silent — don't break app if backend is down
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Memoized actions — stable reference, no re-renders on state change ──
  const actions = useMemo(() => ({
    login: (email, password, preloadedUser = null) => {
      if (!preloadedUser) return;
      dispatch({ type: A.LOGIN, payload: preloadedUser });
      localStorage.removeItem("posSettings");
      localStorage.setItem("user", JSON.stringify(preloadedUser));
      const shop = preloadedUser.shop;
      dispatch({
        type: A.UPDATE_SETTINGS,
        payload: shop && typeof shop === "object" ? {
          shopName: shop.name || "", taxRate: shop.taxRate ?? 5,
          currency: shop.currency || "Rs.", address: shop.address || "",
          phone: shop.phone || "", email: shop.email || "",
          shopLogo: shop.logo || "", receiptFooter: shop.receiptFooter || "Thank you for your purchase!",
        } : { shopName: "", address: "", phone: "", email: "", shopLogo: "" },
      });
      // Welcome toast
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      dispatch({ type: A.SHOW_TOAST, payload: { message: `Welcome back, ${preloadedUser.name}!`, type: "success", id: Date.now() } });
      toastTimerRef.current = setTimeout(() => dispatch({ type: A.HIDE_TOAST }), 3000);
      return true;
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("posCart");
      disconnectSocket();
      dispatch({ type: A.LOGOUT });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      dispatch({ type: A.SHOW_TOAST, payload: { message: "Logged out successfully", type: "info", id: Date.now() } });
      toastTimerRef.current = setTimeout(() => dispatch({ type: A.HIDE_TOAST }), 3000);
    },

    setPage: (page) => dispatch({ type: A.SET_PAGE, payload: page }),
    toggleSidebar: () => dispatch({ type: A.TOGGLE_SIDEBAR }),
    hasPermission: (permission) => hasPermission(stateRef.current.currentUser, permission),

    addToCart: (product, quantity = 1) => {
      if (product.stock < quantity) {
        // inline toast to avoid circular ref
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        dispatch({ type: A.SHOW_TOAST, payload: { message: "Insufficient stock", type: "error", id: Date.now() } });
        toastTimerRef.current = setTimeout(() => dispatch({ type: A.HIDE_TOAST }), 3000);
        return false;
      }
      dispatch({
        type: A.ADD_TO_CART,
        payload: { productId: product._id || product.id, name: product.name, price: product.price, quantity, unit: product.unit, barcode: product.barcode },
      });
      return true;
    },

    updateCartQuantity: (productId, quantity) => {
      dispatch({ type: A.UPDATE_CART_QUANTITY, payload: { productId, quantity } });
      return true;
    },

    removeFromCart: (productId) => dispatch({ type: A.REMOVE_FROM_CART, payload: productId }),
    clearCart: () => dispatch({ type: A.CLEAR_CART }),

    createTransaction: (data) => {
      const t = { id: generateInvoiceNumber(), date: getTodayDate(), time: getCurrentTime(), ...data, status: "Completed", createdBy: stateRef.current.currentUser?.name || "System" };
      dispatch({ type: A.CLEAR_CART });
      return t;
    },
    createInvoice: (t) => t,

    updateSettings: (settings) => dispatch({ type: A.UPDATE_SETTINGS, payload: settings }),
    toggleDarkMode: () => dispatch({ type: A.SET_DARK_MODE, payload: !stateRef.current.darkMode }),
    setThemeColor: (color) => dispatch({ type: A.SET_THEME_COLOR, payload: color }),

    showToast: (toast) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      dispatch({ type: A.SHOW_TOAST, payload: { ...toast, id: Date.now() } });
      toastTimerRef.current = setTimeout(() => dispatch({ type: A.HIDE_TOAST }), 3000);
    },
    hideToast: () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      dispatch({ type: A.HIDE_TOAST });
    },
    showModal: (modal) => dispatch({ type: A.SHOW_MODAL, payload: modal }),
    hideModal: () => dispatch({ type: A.HIDE_MODAL }),
    syncOfflineData: () => {},
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoize context value — only re-renders consumers when state changes
  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
