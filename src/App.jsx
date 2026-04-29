import React, { Suspense, lazy, Component } from "react";
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
const AuditLogs         = lazy(() => import("./pages/staff/AuditLogs"));

// New modules — Phase 3: Intelligence
const PestDiagnosis     = lazy(() => import("./pages/recommendations/PestDiagnosis"));
const DosageSuggestions = lazy(() => import("./pages/recommendations/DosageSuggestions"));
const RecommendationPrint = lazy(() => import("./pages/recommendations/RecommendationPrint"));
const PurchaseHistory   = lazy(() => import("./pages/customers/PurchaseHistory"));
const Loyalty           = lazy(() => import("./pages/customers/Loyalty"));
const ProfitReports     = lazy(() => import("./pages/reports/ProfitReports"));
const MarginReports     = lazy(() => import("./pages/reports/MarginReports"));
const InventoryReports  = lazy(() => import("./pages/reports/InventoryReports"));

// New modules — Phase 4: Advanced
const SalesReps         = lazy(() => import("./pages/staff/SalesReps"));
const Analytics         = lazy(() => import("./pages/dashboard/Analytics"));
const Forecasting       = lazy(() => import("./pages/dashboard/Forecasting"));

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071209] flex">
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
                  <Route path="/users" element={<UserManagement />} />
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
                  <Route path="/recommendations/print" element={<RecommendationPrint />} />

                  {/* Reports */}
                  <Route path="/reports/profit" element={<ProfitReports />} />
                  <Route path="/reports/margin" element={<MarginReports />} />
                  <Route path="/reports/inventory" element={<InventoryReports />} />

                  {/* Staff */}
                  <Route path="/staff/sales-reps" element={<SalesReps />} />
                  <Route path="/staff/audit-logs" element={<AuditLogs />} />

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
