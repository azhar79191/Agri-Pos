import React, { createContext, useContext, useReducer, useEffect } from "react";
import { initialProducts } from "../data/products";
import { initialCustomers } from "../data/customers";
import { initialTransactions } from "../data/transactions";
import { initialExpenses } from "../data/expenses";
import { initialPromotions } from "../data/promotions";
import { initialInvoices } from "../data/invoices";
import { initialLoyaltyMembers } from "../data/loyalty";
import { initialEmployees } from "../data/employees";
import { initialStores } from "../data/stores";
import { users, hasPermission } from "../data/users";
import { generateInvoiceNumber, getTodayDate, getCurrentTime } from "../utils/helpers";

// Initial state
const initialState = {
  // Data
  products: initialProducts,
  customers: initialCustomers,
  transactions: initialTransactions,
  stockHistory: [],
  expenses: initialExpenses,
  promotions: initialPromotions,
  invoices: initialInvoices,
  loyaltyMembers: initialLoyaltyMembers,
  employees: initialEmployees,
  stores: initialStores,
  
  // Authentication
  currentUser: null,
  isAuthenticated: false,
  
  // Cart
  cart: [],
  appliedPromotion: null,
  
  // UI State
  currentPage: "dashboard",
  darkMode: false,
  toast: null,
  modal: null,
  sidebarCollapsed: false,
  
  // Settings
  settings: {
    shopName: "AgroCare Pesticide Shop",
    taxRate: 5,
    currency: "Rs.",
    address: "123, Krishi Mandi Road, Faisalabad, Punjab",
    phone: "+92 300 1234567",
    email: "contact@agrocare.pk",
    lowStockThreshold: 5,
    barcodePrefix: "AGR",
    loyaltyPointsRate: 1,
    currentStore: 1
  }
};

// Action types
const ACTIONS = {
  // Auth
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  
  // Navigation
  SET_PAGE: "SET_PAGE",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  
  // Products
  ADD_PRODUCT: "ADD_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  UPDATE_PRODUCT_STOCK: "UPDATE_PRODUCT_STOCK",
  
  // Stock Management
  ADD_STOCK: "ADD_STOCK",
  REMOVE_STOCK: "REMOVE_STOCK",
  ADJUST_STOCK: "ADJUST_STOCK",
  
  // Customers
  ADD_CUSTOMER: "ADD_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",
  UPDATE_CUSTOMER_CREDIT: "UPDATE_CUSTOMER_CREDIT",
  
  // Transactions
  ADD_TRANSACTION: "ADD_TRANSACTION",
  
  // Cart
  ADD_TO_CART: "ADD_TO_CART",
  UPDATE_CART_QUANTITY: "UPDATE_CART_QUANTITY",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  CLEAR_CART: "CLEAR_CART",
  APPLY_PROMOTION: "APPLY_PROMOTION",
  
  // Expenses
  ADD_EXPENSE: "ADD_EXPENSE",
  UPDATE_EXPENSE: "UPDATE_EXPENSE",
  DELETE_EXPENSE: "DELETE_EXPENSE",
  
  // Promotions
  ADD_PROMOTION: "ADD_PROMOTION",
  UPDATE_PROMOTION: "UPDATE_PROMOTION",
  DELETE_PROMOTION: "DELETE_PROMOTION",
  
  // Invoices
  ADD_INVOICE: "ADD_INVOICE",
  UPDATE_INVOICE_STATUS: "UPDATE_INVOICE_STATUS",
  UPDATE_TRANSACTION_STATUS: "UPDATE_TRANSACTION_STATUS",
  
  // Loyalty
  ADD_LOYALTY_MEMBER: "ADD_LOYALTY_MEMBER",
  UPDATE_LOYALTY_POINTS: "UPDATE_LOYALTY_POINTS",
  
  // Employees
  ADD_EMPLOYEE: "ADD_EMPLOYEE",
  UPDATE_EMPLOYEE: "UPDATE_EMPLOYEE",
  DELETE_EMPLOYEE: "DELETE_EMPLOYEE",
  UPDATE_USER_PERMISSIONS: "UPDATE_USER_PERMISSIONS",
  
  // Stores
  ADD_STORE: "ADD_STORE",
  UPDATE_STORE: "UPDATE_STORE",
  
  // Settings
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  
  // UI
  SET_DARK_MODE: "SET_DARK_MODE",
  SHOW_TOAST: "SHOW_TOAST",
  HIDE_TOAST: "HIDE_TOAST",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  
  // Load from localStorage
  LOAD_STATE: "LOAD_STATE"
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return { 
        ...state, 
        currentUser: action.payload,
        isAuthenticated: true
      };
    
    case ACTIONS.LOGOUT:
      return { 
        ...initialState,
        darkMode: state.darkMode,
        settings: state.settings
      };
    
    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };
    
    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case ACTIONS.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] };
    
    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload)
      };
    
    case ACTIONS.UPDATE_PRODUCT_STOCK:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id
            ? { ...p, stock: p.stock - action.payload.quantity }
            : p
        )
      };
    
    case ACTIONS.ADD_STOCK:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, stock: p.stock + action.payload.quantity }
            : p
        ),
        stockHistory: [action.payload.historyEntry, ...state.stockHistory]
      };
    
    case ACTIONS.REMOVE_STOCK:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, stock: Math.max(0, p.stock - action.payload.quantity) }
            : p
        ),
        stockHistory: [action.payload.historyEntry, ...state.stockHistory]
      };
    
    case ACTIONS.ADJUST_STOCK:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, stock: action.payload.newStock }
            : p
        ),
        stockHistory: [action.payload.historyEntry, ...state.stockHistory]
      };
    
    case ACTIONS.ADD_CUSTOMER:
      return { ...state, customers: [...state.customers, action.payload] };
    
    case ACTIONS.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case ACTIONS.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload)
      };
    
    case ACTIONS.UPDATE_CUSTOMER_CREDIT:
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id
            ? { ...c, creditBalance: c.creditBalance + action.payload.amount }
            : c
        )
      };
    
    case ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case ACTIONS.ADD_TO_CART:
      const existingItem = state.cart.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    
    case ACTIONS.UPDATE_CART_QUANTITY:
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter((item) => item.productId !== action.payload)
      };
    
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [], appliedPromotion: null };
    
    case ACTIONS.APPLY_PROMOTION:
      return { ...state, appliedPromotion: action.payload };
    
    case ACTIONS.ADD_EXPENSE:
      return { ...state, expenses: [action.payload, ...state.expenses] };
    
    case ACTIONS.UPDATE_EXPENSE:
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    
    case ACTIONS.DELETE_EXPENSE:
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    
    case ACTIONS.ADD_PROMOTION:
      return { ...state, promotions: [action.payload, ...state.promotions] };
    
    case ACTIONS.UPDATE_PROMOTION:
      return { ...state, promotions: state.promotions.map(p => p.id === action.payload.id ? action.payload : p) };
    
    case ACTIONS.DELETE_PROMOTION:
      return { ...state, promotions: state.promotions.filter(p => p.id !== action.payload) };
    
    case ACTIONS.ADD_INVOICE:
      return { ...state, invoices: [action.payload, ...state.invoices] };
    
    case ACTIONS.UPDATE_INVOICE_STATUS:
      return {
        ...state,
        invoices: state.invoices.map(invoice => 
          invoice.id === action.payload.id 
            ? { ...invoice, status: action.payload.status }
            : invoice
        )
      };
    
    case ACTIONS.UPDATE_TRANSACTION_STATUS:
      return {
        ...state,
        transactions: state.transactions.map(transaction => 
          transaction.id === action.payload.id 
            ? { ...transaction, status: action.payload.status }
            : transaction
        )
      };
    
    case ACTIONS.ADD_LOYALTY_MEMBER:
      return { ...state, loyaltyMembers: [action.payload, ...state.loyaltyMembers] };
    
    case ACTIONS.UPDATE_LOYALTY_POINTS:
      return {
        ...state,
        loyaltyMembers: state.loyaltyMembers.map(m => 
          m.id === action.payload.id ? { ...m, points: m.points + action.payload.points } : m
        )
      };
    
    case ACTIONS.ADD_EMPLOYEE:
      return { ...state, employees: [action.payload, ...state.employees] };
    
    case ACTIONS.UPDATE_EMPLOYEE:
      return { ...state, employees: state.employees.map(e => e.id === action.payload.id ? action.payload : e) };
    
    case ACTIONS.DELETE_EMPLOYEE:
      return { ...state, employees: state.employees.filter(e => e.id !== action.payload) };
    
    case ACTIONS.UPDATE_USER_PERMISSIONS:
      return {
        ...state,
        // Update system users if the user exists there
        ...(users.find(u => u.id === action.payload.userId) && {
          // This would need to be handled differently in a real app with a backend
        }),
        // Update employees if the user exists there
        employees: state.employees.map(e => 
          e.id === action.payload.userId 
            ? { ...e, permissions: action.payload.permissions }
            : e
        )
      };
    
    case ACTIONS.ADD_STORE:
      return { ...state, stores: [action.payload, ...state.stores] };
    
    case ACTIONS.UPDATE_STORE:
      return { ...state, stores: state.stores.map(s => s.id === action.payload.id ? action.payload : s) };
    
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
    
    case ACTIONS.LOAD_STATE:
      return { ...state, ...action.payload };
    
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
    const savedSettings = localStorage.getItem("posSettings");
    const savedDarkMode = localStorage.getItem("posDarkMode");
    const savedUser = localStorage.getItem("posUser");
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    }
    
    if (savedDarkMode) {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: savedDarkMode === "true" });
    }
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: ACTIONS.LOGIN, payload: user });
      } catch (e) {
        console.error("Error loading user:", e);
      }
    }
    
    // Listen for online status changes
    const handleOnlineStatusChange = (event) => {
      if (event.detail.isOnline) {
        actions.syncOfflineData();
      }
    };
    
    window.addEventListener('online-status-changed', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online-status-changed', handleOnlineStatusChange);
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("posSettings", JSON.stringify(state.settings));
  }, [state.settings]);

  // Save dark mode to localStorage
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
    login: (email, password) => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        dispatch({ type: ACTIONS.LOGIN, payload: userWithoutPassword });
        actions.showToast({ message: `Welcome back, ${user.name}!`, type: "success" });
        return true;
      }
      actions.showToast({ message: "Invalid email or password", type: "error" });
      return false;
    },
    
    logout: () => {
      dispatch({ type: ACTIONS.LOGOUT });
      actions.showToast({ message: "Logged out successfully", type: "info" });
    },
    
    // Navigation
    setPage: (page) => dispatch({ type: ACTIONS.SET_PAGE, payload: page }),
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
    
    // Permission check
    hasPermission: (permission) => hasPermission(state.currentUser, permission),
    
    // Products
    addProduct: (product) => {
      const newProduct = {
        ...product,
        id: Date.now(),
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        barcode: product.barcode || `${state.settings.barcodePrefix}${Date.now().toString().slice(-8)}`
      };
      dispatch({ type: ACTIONS.ADD_PRODUCT, payload: newProduct });
      actions.showToast({ message: "Product added successfully", type: "success" });
    },
    
    updateProduct: (product) => {
      dispatch({ type: ACTIONS.UPDATE_PRODUCT, payload: product });
      actions.showToast({ message: "Product updated successfully", type: "success" });
    },
    
    deleteProduct: (id) => {
      dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: id });
      actions.showToast({ message: "Product deleted successfully", type: "success" });
    },
    
    // Stock Management
    addStock: (productId, quantity, reason = "Purchase") => {
      const product = state.products.find(p => p.id === productId);
      const historyEntry = {
        id: Date.now(),
        productId,
        productName: product?.name,
        type: "IN",
        quantity,
        reason,
        date: getTodayDate(),
        time: getCurrentTime(),
        user: state.currentUser?.name || "System"
      };
      dispatch({ 
        type: ACTIONS.ADD_STOCK, 
        payload: { productId, quantity, historyEntry }
      });
      actions.showToast({ message: `Added ${quantity} units to stock`, type: "success" });
    },
    
    removeStock: (productId, quantity, reason = "Damage") => {
      const product = state.products.find(p => p.id === productId);
      const historyEntry = {
        id: Date.now(),
        productId,
        productName: product?.name,
        type: "OUT",
        quantity,
        reason,
        date: getTodayDate(),
        time: getCurrentTime(),
        user: state.currentUser?.name || "System"
      };
      dispatch({ 
        type: ACTIONS.REMOVE_STOCK, 
        payload: { productId, quantity, historyEntry }
      });
      actions.showToast({ message: `Removed ${quantity} units from stock`, type: "success" });
    },
    
    adjustStock: (productId, newStock, reason = "Adjustment") => {
      const product = state.products.find(p => p.id === productId);
      const diff = newStock - (product?.stock || 0);
      const historyEntry = {
        id: Date.now(),
        productId,
        productName: product?.name,
        type: diff >= 0 ? "ADJUST_IN" : "ADJUST_OUT",
        quantity: Math.abs(diff),
        previousStock: product?.stock,
        newStock,
        reason,
        date: getTodayDate(),
        time: getCurrentTime(),
        user: state.currentUser?.name || "System"
      };
      dispatch({ 
        type: ACTIONS.ADJUST_STOCK, 
        payload: { productId, newStock, historyEntry }
      });
      actions.showToast({ message: "Stock adjusted successfully", type: "success" });
    },
    
    // Customers
    addCustomer: (customer) => {
      const newCustomer = {
        ...customer,
        id: Date.now(),
        creditBalance: parseFloat(customer.creditBalance) || 0
      };
      dispatch({ type: ACTIONS.ADD_CUSTOMER, payload: newCustomer });
      actions.showToast({ message: "Customer added successfully", type: "success" });
    },
    
    updateCustomer: (customer) => {
      dispatch({ type: ACTIONS.UPDATE_CUSTOMER, payload: customer });
      actions.showToast({ message: "Customer updated successfully", type: "success" });
    },
    
    deleteCustomer: (id) => {
      dispatch({ type: ACTIONS.DELETE_CUSTOMER, payload: id });
      actions.showToast({ message: "Customer deleted successfully", type: "success" });
    },
    
    // Cart
    addToCart: (product, quantity = 1) => {
      if (product.stock < quantity) {
        actions.showToast({ message: "Insufficient stock", type: "error" });
        return false;
      }
      dispatch({
        type: ACTIONS.ADD_TO_CART,
        payload: {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          unit: product.unit,
          barcode: product.barcode
        }
      });
      actions.showToast({ message: "Added to cart", type: "success" });
      return true;
    },
    
    addToCartByBarcode: (barcode) => {
      const product = state.products.find(p => p.barcode === barcode);
      if (!product) {
        actions.showToast({ message: "Product not found", type: "error" });
        return false;
      }
      return actions.addToCart(product, 1);
    },
    
    updateCartQuantity: (productId, quantity) => {
      const product = state.products.find((p) => p.id === productId);
      if (product && product.stock < quantity) {
        actions.showToast({ message: "Insufficient stock", type: "error" });
        return false;
      }
      dispatch({ type: ACTIONS.UPDATE_CART_QUANTITY, payload: { productId, quantity } });
      return true;
    },
    
    removeFromCart: (productId) => {
      dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId });
    },
    
    clearCart: () => {
      dispatch({ type: ACTIONS.CLEAR_CART });
    },
    
    applyPromotion: (promotion) => {
      dispatch({ type: ACTIONS.APPLY_PROMOTION, payload: promotion });
      actions.showToast({ message: "Promotion applied", type: "success" });
    },
    
    // Expenses
    addExpense: (expense) => {
      const newExpense = { ...expense, id: Date.now(), date: getTodayDate() };
      dispatch({ type: ACTIONS.ADD_EXPENSE, payload: newExpense });
      actions.showToast({ message: "Expense added", type: "success" });
    },
    
    updateExpense: (expense) => {
      dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: expense });
      actions.showToast({ message: "Expense updated", type: "success" });
    },
    
    deleteExpense: (id) => {
      dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id });
      actions.showToast({ message: "Expense deleted", type: "success" });
    },
    
    // Promotions
    addPromotion: (promotion) => {
      const newPromotion = { ...promotion, id: Date.now(), isActive: true };
      dispatch({ type: ACTIONS.ADD_PROMOTION, payload: newPromotion });
      actions.showToast({ message: "Promotion created", type: "success" });
    },
    
    updatePromotion: (promotion) => {
      dispatch({ type: ACTIONS.UPDATE_PROMOTION, payload: promotion });
      actions.showToast({ message: "Promotion updated", type: "success" });
    },
    
    deletePromotion: (id) => {
      dispatch({ type: ACTIONS.DELETE_PROMOTION, payload: id });
      actions.showToast({ message: "Promotion deleted", type: "success" });
    },
    
    // Loyalty
    addLoyaltyMember: (member) => {
      const newMember = { ...member, id: Date.now(), points: 0, joinDate: getTodayDate() };
      dispatch({ type: ACTIONS.ADD_LOYALTY_MEMBER, payload: newMember });
      actions.showToast({ message: "Member added", type: "success" });
    },
    
    updateLoyaltyPoints: (memberId, points) => {
      dispatch({ type: ACTIONS.UPDATE_LOYALTY_POINTS, payload: { id: memberId, points } });
    },
    
    // Employees
    addEmployee: (employee) => {
      const newEmployee = { ...employee, id: Date.now(), joinDate: getTodayDate() };
      dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: newEmployee });
      actions.showToast({ message: "Employee added", type: "success" });
    },
    
    updateEmployee: (employee) => {
      dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: employee });
      actions.showToast({ message: "Employee updated", type: "success" });
    },
    
    deleteEmployee: (id) => {
      dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id });
      actions.showToast({ message: "Employee removed", type: "success" });
    },
    
    updateUserPermissions: (userId, permissions) => {
      dispatch({ type: ACTIONS.UPDATE_USER_PERMISSIONS, payload: { userId, permissions } });
      actions.showToast({ message: "User permissions updated", type: "success" });
    },
    
    // Stores
    addStore: (store) => {
      const newStore = { ...store, id: Date.now(), isActive: true };
      dispatch({ type: ACTIONS.ADD_STORE, payload: newStore });
      actions.showToast({ message: "Store added", type: "success" });
    },
    
    updateStore: (store) => {
      dispatch({ type: ACTIONS.UPDATE_STORE, payload: store });
      actions.showToast({ message: "Store updated", type: "success" });
    },
    
    // Transactions
    createTransaction: (transactionData) => {
      const transaction = {
        id: generateInvoiceNumber(),
        date: getTodayDate(),
        time: getCurrentTime(),
        ...transactionData,
        status: "Completed",
        createdBy: state.currentUser?.name || "System",
        syncStatus: navigator.onLine ? "synced" : "pending"
      };
      
      // Add transaction
      dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
      
      // Update product stocks
      transactionData.items.forEach((item) => {
        dispatch({
          type: ACTIONS.UPDATE_PRODUCT_STOCK,
          payload: { id: item.productId, quantity: item.quantity }
        });
      });
      
      // Update customer credit if payment method is Credit
      if (transactionData.paymentMethod === "Credit" && transactionData.customerId) {
        dispatch({
          type: ACTIONS.UPDATE_CUSTOMER_CREDIT,
          payload: { id: transactionData.customerId, amount: transactionData.grandTotal }
        });
      }
      
      // Clear cart
      dispatch({ type: ACTIONS.CLEAR_CART });
      
      actions.showToast({ message: "Transaction completed successfully", type: "success" });
      return transaction;
    },
    
    // Create invoice from transaction
    createInvoice: (transaction) => {
      const invoice = {
        ...transaction,
        invoiceNumber: transaction.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: "Thank you for your business!",
        terms: "Payment due within 30 days"
      };
      
      dispatch({ type: ACTIONS.ADD_INVOICE, payload: invoice });
      return invoice;
    },
    
    // Update invoice status
    updateInvoiceStatus: (id, status) => {
      dispatch({ type: ACTIONS.UPDATE_INVOICE_STATUS, payload: { id, status } });
      actions.showToast({ message: "Invoice status updated", type: "success" });
    },
    
    // Update transaction status
    updateTransactionStatus: (id, status) => {
      dispatch({ type: ACTIONS.UPDATE_TRANSACTION_STATUS, payload: { id, status } });
      actions.showToast({ message: "Transaction status updated", type: "success" });
    },
    
    // Sync offline data when connection is restored
    syncOfflineData: () => {
      const pendingTransactions = state.transactions.filter(t => t.syncStatus === "pending");
      const pendingInvoices = state.invoices.filter(i => i.syncStatus === "pending");
      
      if (pendingTransactions.length > 0 || pendingInvoices.length > 0) {
        // In a real app, this would sync with a backend server
        // For now, we'll just mark them as synced
        pendingTransactions.forEach(transaction => {
          dispatch({ 
            type: ACTIONS.ADD_TRANSACTION, 
            payload: { ...transaction, syncStatus: "synced" } 
          });
        });
        
        pendingInvoices.forEach(invoice => {
          dispatch({ 
            type: ACTIONS.ADD_INVOICE, 
            payload: { ...invoice, syncStatus: "synced" } 
          });
        });
        
        actions.showToast({ 
          message: `Synced ${pendingTransactions.length} transactions and ${pendingInvoices.length} invoices`, 
          type: "success" 
        });
      }
    },
    
    // Settings
    updateSettings: (settings) => {
      dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
      actions.showToast({ message: "Settings saved successfully", type: "success" });
    },
    
    // UI
    toggleDarkMode: () => {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: !state.darkMode });
    },
    
    showToast: (toast) => {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { ...toast, id: Date.now() } });
      setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_TOAST });
      }, 3000);
    },
    
    hideToast: () => {
      dispatch({ type: ACTIONS.HIDE_TOAST });
    },
    
    showModal: (modal) => {
      dispatch({ type: ACTIONS.SHOW_MODAL, payload: modal });
    },
    
    hideModal: () => {
      dispatch({ type: ACTIONS.HIDE_MODAL });
    }
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
