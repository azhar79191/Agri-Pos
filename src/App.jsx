import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/ui/Toast";
import ConfirmToast from "./components/ui/ConfirmToast";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import POS from "./pages/POS";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import StockManagement from "./pages/StockManagement";
import UserManagement from "./pages/UserManagement";
import InvoiceManagement from "./pages/InvoiceManagement";
import StatusManagement from "./pages/StatusManagement";

// Main App Content
const AppContent = () => {
  const { state, actions } = useApp();
  const { currentPage, toast, isAuthenticated, currentUser } = state;

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Render current page based on permissions
  const renderPage = () => {
    // Check if user has permission for the page
    const pagePermissions = {
      dashboard: "dashboard",
      products: "products",
      customers: "customers",
      pos: "pos",
      invoices: "invoices",
      status: "invoices",
      reports: "reports",
      settings: "settings",
      stock: "stock_management",
      users: "user_management"
    };

    const requiredPermission = pagePermissions[currentPage];
    if (requiredPermission && !actions.hasPermission(requiredPermission)) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            You don't have permission to access this page. Please contact your administrator.
          </p>
          <button 
            onClick={() => actions.setPage("dashboard")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "customers":
        return <Customers />;
      case "pos":
        return <POS />;
      case "invoices":
        return <InvoiceManagement />;
      case "status":
        return <StatusManagement />;
      case "reports":
        return <Reports />;
      case "stock":
        return <StockManagement />;
      case "users":
        return <UserManagement />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && !toast.isConfirm && (
        <Toast
          message={toast.message}
          type={toast.type}
          position={toast.position || "bottom-right"}
          onClose={actions.hideToast}
        />
      )}

      {/* Confirmation Toast */}
      {toast && toast.isConfirm && (
        <ConfirmToast
          message={toast.message}
          type={toast.type}
          onConfirm={() => {
            toast.onConfirm?.();
            actions.hideToast();
          }}
          onCancel={actions.hideToast}
        />
      )}
    </div>
  );
};

// App Wrapper with Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
