import React, { createContext, useContext, useReducer, useEffect } from "react";
import { hasPermission } from "../data/users";
import { generateInvoiceNumber, getTodayDate, getCurrentTime } from "../utils/helpers";
import { disconnectSocket } from "../hooks/useSocket";

// Initial state
const initialState = {
  // Authentication
  currentUser: null,
  isAuthenticated: false,

  // Cart
  cart: [],

  // UI State
  currentPage: "dashboard",
  darkMode: false,
  toast: null,
  modal: null,
  sidebarCollapsed: false,

  // Settings — populated from shop on login
  settings: {
    shopName: "",
    taxRate: 5,
    currency: "Rs.",
    address: "",
    phone: "",
    email: "",
    shopLogo: "",
    receiptFooter: "Thank you for your purchase!",
    lowStockThreshold: 5,
  }
};

// Action types
const ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  SET_PAGE: "SET_PAGE",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  ADD_TO_CART: "ADD_TO_CART",
  UPDATE_CART_QUANTITY: "UPDATE_CART_QUANTITY",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  CLEAR_CART: "CLEAR_CART",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_DARK_MODE: "SET_DARK_MODE",
  SHOW_TOAST: "SHOW_TOAST",
  HIDE_TOAST: "HIDE_TOAST",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return { ...state, currentUser: action.payload, isAuthenticated: true };

    case ACTIONS.UPDATE_USER:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload,
          // Never overwrite shop with null/undefined from a partial update
          shop: action.payload.shop ?? state.currentUser?.shop,
        },
        isAuthenticated: true,
      };

    case ACTIONS.LOGOUT:
      return { ...initialState, darkMode: state.darkMode };

    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };

    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case ACTIONS.ADD_TO_CART: {
      const existing = state.cart.find(i => i.productId === action.payload.productId);
      if (existing) {
        return { ...state, cart: state.cart.map(i => i.productId === action.payload.productId ? { ...i, quantity: i.quantity + action.payload.quantity } : i) };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case ACTIONS.UPDATE_CART_QUANTITY:
      return { ...state, cart: state.cart.map(i => i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i) };

    case ACTIONS.REMOVE_FROM_CART:
      return { ...state, cart: state.cart.filter(i => i.productId !== action.payload) };

    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };

    case ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case ACTIONS.SET_DARK_MODE:
      return { ...state, darkMode: action.payload };

    case ACTIONS.SHOW_TOAST:
      return { ...state, toast: action.payload };

    case ACTIONS.HIDE_TOAST:
      return { ...state, toast: null };

    case ACTIONS.SHOW_MODAL:
      return { ...state, modal: action.payload };

    case ACTIONS.HIDE_MODAL:
      return { ...state, modal: null };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    // Clear stale cached settings — shop data now comes from user.shop
    localStorage.removeItem("posSettings");
    const savedDarkMode = localStorage.getItem("posDarkMode");
    const savedUser = localStorage.getItem("user") || localStorage.getItem("posUser");
    
    if (savedDarkMode) {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: savedDarkMode === "true" });
    }
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: ACTIONS.LOGIN, payload: user });
        // Sync shop from saved user
        const shop = user.shop;
        if (shop && typeof shop === 'object') {
          dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: {
            shopName: shop.name || "",
            taxRate: shop.taxRate ?? 5,
            currency: shop.currency || "Rs.",
            address: shop.address || "",
            phone: shop.phone || "",
            email: shop.email || "",
            shopLogo: shop.logo || "",
            receiptFooter: shop.receiptFooter || "Thank you for your purchase!",
          }});
        }
      } catch (e) {
        console.error("Error loading user:", e);
      }
    }

    // Re-sync when user is updated (same tab via custom event or cross-tab via storage)
    const handleUserUpdate = (e) => {
      const incoming = e.detail || (e.newValue ? JSON.parse(e.newValue) : null);
      if (incoming) dispatch({ type: ACTIONS.UPDATE_USER, payload: incoming });
    };
    window.addEventListener("user-updated", handleUserUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "user" && e.newValue) handleUserUpdate(e);
    });
    
    // Listen for online status changes
    const handleOnlineStatusChange = (event) => {
      if (event.detail.isOnline) {
        actions.syncOfflineData();
      }
    };
    
    window.addEventListener('online-status-changed', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online-status-changed', handleOnlineStatusChange);
      window.removeEventListener("user-updated", handleUserUpdate);
    };
  }, []);

  // Save dark mode to localStorage only
  useEffect(() => {
    localStorage.setItem("posDarkMode", state.darkMode);
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  // Save user to localStorage
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem("posUser", JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem("posUser");
    }
  }, [state.currentUser]);

  // Actions
  const actions = {
    // Auth
    login: (email, password, preloadedUser = null) => {
      if (preloadedUser) {
        dispatch({ type: ACTIONS.LOGIN, payload: preloadedUser });
        localStorage.removeItem("posSettings");
        localStorage.setItem("user", JSON.stringify(preloadedUser));
        const shop = preloadedUser.shop;
        const shopSettings = shop && typeof shop === 'object' ? {
          shopName: shop.name || "",
          taxRate: shop.taxRate ?? 5,
          currency: shop.currency || "Rs.",
          address: shop.address || "",
          phone: shop.phone || "",
          email: shop.email || "",
          shopLogo: shop.logo || "",
          receiptFooter: shop.receiptFooter || "Thank you for your purchase!",
        } : { shopName: "", address: "", phone: "", email: "", shopLogo: "" };
        dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: shopSettings });
        dispatch({ type: ACTIONS.SHOW_TOAST, payload: { message: `Welcome back, ${preloadedUser.name}!`, type: "success", id: Date.now() } });
        setTimeout(() => dispatch({ type: ACTIONS.HIDE_TOAST }), 3000);
        return true;
      }
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      disconnectSocket();
      dispatch({ type: ACTIONS.LOGOUT });
      actions.showToast({ message: "Logged out successfully", type: "info" });
    },

    // Navigation
    setPage: (page) => dispatch({ type: ACTIONS.SET_PAGE, payload: page }),
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),

    // Permission check
    hasPermission: (permission) => hasPermission(state.currentUser, permission),

    // Cart
    addToCart: (product, quantity = 1) => {
      if (product.stock < quantity) {
        actions.showToast({ message: "Insufficient stock", type: "error" });
        return false;
      }
      dispatch({
        type: ACTIONS.ADD_TO_CART,
        payload: {
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          quantity,
          unit: product.unit,
          barcode: product.barcode
        }
      });
      return true;
    },

    updateCartQuantity: (productId, quantity) => {
      dispatch({ type: ACTIONS.UPDATE_CART_QUANTITY, payload: { productId, quantity } });
      return true;
    },

    removeFromCart: (productId) => dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId }),
    clearCart: () => dispatch({ type: ACTIONS.CLEAR_CART }),

    // Transactions (local fallback only)
    createTransaction: (data) => {
      const t = { id: generateInvoiceNumber(), date: getTodayDate(), time: getCurrentTime(), ...data, status: "Completed", createdBy: state.currentUser?.name || "System" };
      actions.clearCart();
      return t;
    },
    createInvoice: (t) => t,

    // Settings
    updateSettings: (settings) => {
      dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
    },

    // UI
    toggleDarkMode: () => dispatch({ type: ACTIONS.SET_DARK_MODE, payload: !state.darkMode }),

    showToast: (toast) => {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { ...toast, id: Date.now() } });
      setTimeout(() => dispatch({ type: ACTIONS.HIDE_TOAST }), 3000);
    },
    hideToast: () => dispatch({ type: ACTIONS.HIDE_TOAST }),
    showModal: (modal) => dispatch({ type: ACTIONS.SHOW_MODAL, payload: modal }),
    hideModal: () => dispatch({ type: ACTIONS.HIDE_MODAL }),

    // Sync offline data (stub)
    syncOfflineData: () => {},
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
