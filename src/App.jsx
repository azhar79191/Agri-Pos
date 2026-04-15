import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/ui/Toast";
import ConfirmToast from "./components/ui/ConfirmToast";

// Pages
import Login from "./pages/Login";
import RegisterShop from "./pages/RegisterShop";
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
import ProfileSettings from "./pages/ProfileSettings";
import ShopManagement from "./pages/ShopManagement";
import SetupWizard from "./pages/SetupWizard";
import CustomerStatement from "./pages/CustomerStatement";

const AppLayout = () => {
  const { state, actions } = useApp();
  const { toast } = state;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto page-enter">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/invoices" element={<InvoiceManagement />} />
              <Route path="/status" element={<StatusManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/stock" element={<StockManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/shops" element={<ShopManagement />} />
              <Route path="/customers/:id/statement" element={<CustomerStatement />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {toast && !toast.isConfirm && (
        <Toast message={toast.message} type={toast.type} position={toast.position || "bottom-right"} onClose={actions.hideToast} />
      )}
      {toast && toast.isConfirm && (
        <ConfirmToast
          message={toast.message} type={toast.type}
          onConfirm={() => { toast.onConfirm?.(); actions.hideToast(); }}
          onCancel={actions.hideToast}
        />
      )}
    </div>
  );
};

const AppContent = () => {
  const { state } = useApp();
  const { isAuthenticated, currentUser } = state;

  const path = window.location.pathname;

  // Not logged in — only allow /register (public shop registration)
  if (!isAuthenticated) {
    if (path === "/register") return <RegisterShop />;
    return <Login />;
  }

  // Logged-in admin with no shop → let them register one
  // Also allow /register explicitly so they can reach it from Login page link
  const needsSetup = currentUser?.role === "admin" && !currentUser?.shop;
  if (needsSetup || path === "/register") return <RegisterShop />;

  return <AppLayout />;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
