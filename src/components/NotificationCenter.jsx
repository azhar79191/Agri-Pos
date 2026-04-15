import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, Package, Calendar, DollarSign, ShoppingCart, AlertTriangle, Users, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useSocket, fetchNotificationsFromAPI } from "../hooks/useSocket";
import DepositCashModal from "./DepositCashModal";

const SEVERITY_STYLES = {
  critical: { bg: "from-red-500 to-rose-600",    dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  high:     { bg: "from-orange-500 to-red-500",  dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  warning:  { bg: "from-amber-500 to-orange-500",dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  info:     { bg: "from-blue-500 to-indigo-500", dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  success:  { bg: "from-emerald-500 to-teal-500",dot: "bg-emerald-500",badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const TYPE_ICON = {
  out_of_stock:   Package,
  low_stock:      Package,
  expired:        Calendar,
  expiring_soon:  Calendar,
  credit_due:     DollarSign,
  new_sale:       ShoppingCart,
  credit_deposited: DollarSign,
  stock_alert:    AlertTriangle,
  default:        Bell,
};

const mapAPINotification = (n, idx) => ({
  id: n._id || `api-${n.type}-${idx}-${Date.now()}`,
  type: n.type || "info",
  severity: n.severity || "info",
  title: n.title || "Notification",
  message: n.message || "",
  source: "api",
  createdAt: n.createdAt || new Date().toISOString(),
  productId: n.productId,
  customerId: n.customerId,
});

const NotificationCenter = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [fetching, setFetching] = useState(false);
  const hasFetched = useRef(false);

  // Fetch from backend API
  const loadNotifications = useCallback(async () => {
    setFetching(true);
    try {
      const data = await fetchNotificationsFromAPI();
      setNotifications(data.map(mapAPINotification));
    } catch {
      // silently fail — socket will still work
    } finally {
      setFetching(false);
    }
  }, []);

  // Fetch on mount (once)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => {
      // Avoid duplicates by id
      if (prev.find(n => n.id === notif.id)) return prev;
      return [notif, ...prev].slice(0, 50);
    });
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Socket real-time events
  useSocket({
    onNotifications: useCallback((data) => {
      const list = Array.isArray(data) ? data : [data];
      list.forEach((n, i) => addNotification(mapAPINotification(n, i)));
    }, [addNotification]),

    onNewSale: useCallback((sale) => {
      actions.showToast({
        message: `New sale: Invoice #${sale.invoiceNumber} — Rs. ${sale.total}`,
        type: "success",
      });
      addNotification({
        id: `sale-${sale.invoiceNumber || Date.now()}`,
        type: "new_sale",
        severity: "success",
        title: "New Sale Completed",
        message: `Invoice #${sale.invoiceNumber} · ${sale.customerName || "Walk-in"} · Rs. ${sale.total}`,
        source: "socket",
        createdAt: new Date().toISOString(),
        action: () => { navigate("/invoices"); setShowPanel(false); },
      });
    }, [addNotification, actions, navigate]),

    onCreditDeposited: useCallback((data) => {
      actions.showToast({
        message: `Rs. ${data.amount} deposited by ${data.customerName}`,
        type: "success",
      });
      addNotification({
        id: `credit-dep-${Date.now()}`,
        type: "credit_deposited",
        severity: "success",
        title: "Credit Deposited",
        message: `${data.customerName} paid Rs. ${data.amount} · Remaining: Rs. ${data.remainingCredit}`,
        source: "socket",
        createdAt: new Date().toISOString(),
        action: () => { navigate("/customers"); setShowPanel(false); },
      });
    }, [addNotification, actions, navigate]),

    onStockAlert: useCallback((data) => {
      actions.showToast({
        message: data.message,
        type: data.severity === "critical" ? "error" : "warning",
      });
      addNotification({
        id: `stock-${data.productId || Date.now()}`,
        type: data.type || "stock_alert",
        severity: data.severity || "warning",
        title: data.title || "Stock Alert",
        message: data.message,
        source: "socket",
        createdAt: new Date().toISOString(),
        action: () => { navigate("/products"); setShowPanel(false); },
      });
    }, [addNotification, actions, navigate]),
  });

  const criticalCount = notifications.filter(n => n.severity === "critical" || n.severity === "high").length;
  const unreadCount = notifications.length;

  const getStyle = (n) => SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
  const getIcon = (n) => TYPE_ICON[n.type] || TYPE_ICON.default;

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Deposit Cash */}
        <button
          onClick={() => setShowDeposit(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800"
        >
          <DollarSign className="w-3.5 h-3.5" />Deposit
        </button>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowPanel(p => !p)}
            className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative"
          >
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${criticalCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
            )}
          </button>

          {showPanel && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
              <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[32rem]">

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${criticalCount > 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={loadNotifications} disabled={fetching} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Refresh">
                      <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${fetching ? "animate-spin" : ""}`} />
                    </button>
                    {unreadCount > 0 && (
                      <button onClick={() => setNotifications([])} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary badges */}
                {unreadCount > 0 && (
                  <div className="px-4 py-2 flex gap-2 flex-wrap border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    {Object.entries(
                      notifications.reduce((acc, n) => { acc[n.severity] = (acc[n.severity] || 0) + 1; return acc; }, {})
                    ).map(([sev, count]) => (
                      <span key={sev} className={`text-xs px-2 py-0.5 rounded-full font-medium ${(SEVERITY_STYLES[sev] || SEVERITY_STYLES.info).badge}`}>
                        {count} {sev}
                      </span>
                    ))}
                  </div>
                )}

                {/* List */}
                <div className="overflow-y-auto flex-1">
                  {fetching && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">All clear!</p>
                      <p className="text-xs mt-1">No alerts at the moment</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = getIcon(n);
                      const style = getStyle(n);
                      return (
                        <div
                          key={n.id}
                          className="px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                          onClick={() => { n.action?.(); }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${style.bg} flex-shrink-0 mt-0.5`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">{n.title}</p>
                                <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(n.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0 transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DepositCashModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
    </>
  );
};

export default NotificationCenter;
