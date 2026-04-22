import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/ui/Toast";
import ConfirmToast from "./components/ui/ConfirmToast";

// Eager — tiny, needed immediately
import Login from "./pages/Login";
import RegisterShop from "./pages/RegisterShop";

// Lazy — code-split heavy pages
const Dashboard        = lazy(() => import("./pages/Dashboard"));
const Products         = lazy(() => import("./pages/Products"));
const Customers        = lazy(() => import("./pages/Customers"));
const POS              = lazy(() => import("./pages/POS"));
const Reports          = lazy(() => import("./pages/Reports"));
const Settings         = lazy(() => import("./pages/Settings"));
const StockManagement  = lazy(() => import("./pages/StockManagement"));
const UserManagement   = lazy(() => import("./pages/UserManagement"));
const InvoiceManagement= lazy(() => import("./pages/InvoiceManagement"));
const StatusManagement = lazy(() => import("./pages/StatusManagement"));
const ProfileSettings  = lazy(() => import("./pages/ProfileSettings"));
const ShopManagement   = lazy(() => import("./pages/ShopManagement"));
const SetupWizard      = lazy(() => import("./pages/SetupWizard"));
const CustomerStatement= lazy(() => import("./pages/CustomerStatement"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
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

  if (!isAuthenticated) {
    if (path === "/register") return <RegisterShop />;
    return <Login />;
  }

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
