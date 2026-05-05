import React, { Suspense, lazy, Component, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/ui/Toast";
import ConfirmToast from "./components/ui/ConfirmToast";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import OfflineBanner from "./components/OfflineBanner";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ShopPendingApproval from "./pages/ShopPendingApproval";
import DemoPOS from "./pages/DemoPOS";
import { getRoleName } from "./utils/roleUtils";
import API from "./api/axios";

// Eager — tiny, needed immediately
import Login from "./pages/Login";
import RegisterShop from "./pages/RegisterShop";
import Landing from "./pages/Landing";

// Lazy — code-split heavy pages
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Products          = lazy(() => import("./pages/Products"));
const Customers         = lazy(() => import("./pages/Customers"));
const POS               = lazy(() => import("./pages/POS"));
const Reports           = lazy(() => import("./pages/Reports"));
const Settings          = lazy(() => import("./pages/Settings"));
const StockManagement   = lazy(() => import("./pages/StockManagement"));
const UserManagement    = lazy(() => import("./pages/UserManagement"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const StatusManagement  = lazy(() => import("./pages/StatusManagement"));
const ProfileSettings   = lazy(() => import("./pages/ProfileSettings"));
const ShopManagement    = lazy(() => import("./pages/ShopManagement"));
const SetupWizard       = lazy(() => import("./pages/SetupWizard"));
const CustomerStatement = lazy(() => import("./pages/CustomerStatement"));

// New modules — Phase 2: Core Business
const BatchExpiry       = lazy(() => import("./pages/inventory/BatchExpiry"));
const DeadStockAlerts   = lazy(() => import("./pages/inventory/DeadStockAlerts"));
const Bundles           = lazy(() => import("./pages/inventory/Bundles"));
const PurchaseOrders    = lazy(() => import("./pages/purchases/PurchaseOrders"));
const GoodsReceiving    = lazy(() => import("./pages/purchases/GoodsReceiving"));
const PurchaseReturns   = lazy(() => import("./pages/purchases/PurchaseReturns"));
const Suppliers         = lazy(() => import("./pages/purchases/Suppliers"));
const CreditSales       = lazy(() => import("./pages/sales/CreditSales"));
const CustomerDues      = lazy(() => import("./pages/customers/CustomerDues"));

// Staff Hub — unified
const StaffHub          = lazy(() => import("./pages/staff/StaffHub"));

// New modules — Phase 3: Intelligence
const PestDiagnosis     = lazy(() => import("./pages/recommendations/EnhancedPestDiagnosis"));
const DosageSuggestions = lazy(() => import("./pages/recommendations/AdvancedDosageCalculator"));
const CropCalendar      = lazy(() => import("./pages/recommendations/CropCalendar"));
const RecommendationPrint = lazy(() => import("./pages/recommendations/RecommendationPrint"));
const PurchaseHistory   = lazy(() => import("./pages/customers/PurchaseHistory"));
const Loyalty           = lazy(() => import("./pages/customers/Loyalty"));
const ProfitReports     = lazy(() => import("./pages/reports/ProfitReports"));
const MarginReports     = lazy(() => import("./pages/reports/MarginReports"));
const InventoryReports  = lazy(() => import("./pages/reports/InventoryReports"));
const InvoiceAgingReport = lazy(() => import("./pages/reports/InvoiceAgingReport"));

// New modules — Phase 4: Advanced
const Analytics         = lazy(() => import("./pages/dashboard/Analytics"));
const Forecasting       = lazy(() => import("./pages/dashboard/Forecasting"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--pos-primary) transparent transparent transparent" }} />
  </div>
);

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-lg">Something went wrong</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This page encountered an error. Try refreshing.</p>
        </div>
        <button
          onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          className="px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "var(--pos-primary)" }}
        >
          Reload Page
        </button>
      </div>
    );
  }
}

const AppLayout = () => {
  const { state, actions } = useApp();
  const { toast } = state;
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto page-enter">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  {/* Existing routes — preserved as-is */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/invoices" element={<InvoiceManagement />} />
                  <Route path="/status" element={<StatusManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/stock" element={<StockManagement />} />
                  <Route path="/users" element={<StaffHub />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/shops" element={<ShopManagement />} />
                  <Route path="/customers/:id/statement" element={<CustomerStatement />} />

                  {/* Dashboard subpages */}
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/forecasting" element={<Forecasting />} />

                  {/* Inventory */}
                  <Route path="/inventory/batch-expiry" element={<BatchExpiry />} />
                  <Route path="/inventory/bundles" element={<Bundles />} />
                  <Route path="/inventory/dead-stock" element={<DeadStockAlerts />} />

                  {/* Purchases */}
                  <Route path="/purchases/orders" element={<PurchaseOrders />} />
                  <Route path="/purchases/grn" element={<GoodsReceiving />} />
                  <Route path="/purchases/returns" element={<PurchaseReturns />} />
                  <Route path="/purchases/suppliers" element={<Suppliers />} />

                  {/* Sales */}
                  <Route path="/sales/credit" element={<CreditSales />} />

                  {/* Customers */}
                  <Route path="/customers/dues" element={<CustomerDues />} />
                  <Route path="/customers/history" element={<PurchaseHistory />} />
                  <Route path="/customers/loyalty" element={<Loyalty />} />

                  {/* Recommendations */}
                  <Route path="/recommendations/diagnosis" element={<PestDiagnosis />} />
                  <Route path="/recommendations/dosage" element={<DosageSuggestions />} />
                  <Route path="/recommendations/calendar" element={<CropCalendar />} />
                  <Route path="/recommendations/print" element={<RecommendationPrint />} />

                  {/* Reports */}
                  <Route path="/reports/profit" element={<ProfitReports />} />
                  <Route path="/reports/margin" element={<MarginReports />} />
                  <Route path="/reports/inventory" element={<InventoryReports />} />
                  <Route path="/reports/aging" element={<InvoiceAgingReport />} />

                  {/* Demo */}
                  <Route path="/demo" element={<DemoPOS />} />

                  {/* Staff Hub — all staff routes */}
                  <Route path="/staff" element={<StaffHub />} />
                  <Route path="/staff/sales-reps" element={<StaffHub />} />
                  <Route path="/staff/audit-logs" element={<StaffHub />} />
                  <Route path="/staff/users" element={<StaffHub />} />
                  <Route path="/staff/reps" element={<StaffHub />} />
                  <Route path="/staff/audit" element={<StaffHub />} />
                  <Route path="/staff/overview" element={<StaffHub />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
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
      <OfflineBanner />
      <PWAInstallBanner />
    </div>
  );
};

const AppContent = () => {
  const { state } = useApp();
  const { isAuthenticated, currentUser } = state;
  const [shopStatus, setShopStatus] = useState(null); // null | 'ok' | error code

  const role = getRoleName(currentUser);

  // Check shop approval status on mount and when user changes
  useEffect(() => {
    if (!isAuthenticated || role === 'superadmin') { setShopStatus('ok'); return; }
    if (!currentUser?.shop) { setShopStatus('ok'); return; }

    if (currentUser.shop.planStatus === 'suspended') {
      setShopStatus('SHOP_SUSPENDED');
      return;
    }
    if (currentUser.shop.isApproved === false) {
      setShopStatus('SHOP_PENDING_APPROVAL');
      return;
    }
    if (currentUser.shop.planStatus === 'expired') {
      setShopStatus('PLAN_EXPIRED');
      return;
    }

    // Probe any protected endpoint to check shop status
    API.get('/products?limit=1')
      .then(() => setShopStatus('ok'))
      .catch(err => {
        const code = err.response?.data?.code;
        if (code === 'SHOP_PENDING_APPROVAL' || code === 'SHOP_SUSPENDED' || code === 'PLAN_EXPIRED') {
          setShopStatus(code);
        } else {
          setShopStatus('ok'); // network error or other — don't block
        }
      });
  }, [isAuthenticated, currentUser?._id]); // eslint-disable-line

  // Demo mode — public route, no auth needed
  if (window.location.pathname === '/demo') return <DemoPOS />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterShop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/demo" element={<DemoPOS />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Superadmin — dedicated dashboard, no shop sidebar
  if (role === 'superadmin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<SuperAdminDashboard />} />
        </Routes>
      </Suspense>
    );
  }

  // Shop not yet approved / suspended / expired
  if (shopStatus && shopStatus !== 'ok') {
    return <ShopPendingApproval reason={shopStatus} />;
  }

  const needsSetup = role === 'admin' && !currentUser?.shop;
  if (needsSetup) return <RegisterShop />;

  // Still checking shop status — show loader
  if (shopStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-t-transparent border-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

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
