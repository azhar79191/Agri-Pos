import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, Package, Calendar, DollarSign, ShoppingCart, AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useSocket, fetchNotificationsFromAPI } from "../hooks/useSocket";
import DepositCashModal from "./DepositCashModal";

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-100 dark:bg-red-900/20",     dot: "bg-red-500",    iconColor: "text-red-600 dark:text-red-400" },
  high:     { bg: "bg-orange-100 dark:bg-orange-900/20", dot: "bg-orange-500", iconColor: "text-orange-600 dark:text-orange-400" },
  warning:  { bg: "bg-amber-100 dark:bg-amber-900/20",  dot: "bg-amber-500",  iconColor: "text-amber-600 dark:text-amber-400" },
  info:     { bg: "bg-blue-100 dark:bg-blue-900/20",    dot: "bg-blue-500",   iconColor: "text-blue-600 dark:text-blue-400" },
  success:  { bg: "bg-emerald-100 dark:bg-emerald-900/20", dot: "bg-emerald-500", iconColor: "text-emerald-600 dark:text-emerald-400" },
};

const TYPE_ICON = {
  out_of_stock: Package, low_stock: Package,
  expired: Calendar, expiring_soon: Calendar,
  credit_due: DollarSign, new_sale: ShoppingCart,
  credit_deposited: DollarSign, stock_alert: AlertTriangle,
  default: Bell,
};

const mapNotif = (n, idx) => ({
  id: n._id || `api-${n.type}-${idx}-${Date.now()}`,
  type: n.type || "info", severity: n.severity || "info",
  title: n.title || "Notification", message: n.message || "",
  source: "api", createdAt: n.createdAt || new Date().toISOString(),
  productId: n.productId, customerId: n.customerId,
});

const formatTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationCenter = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [fetching, setFetching] = useState(false);
  const hasFetched = useRef(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!showPanel) return;
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPanel]);

  const loadNotifications = useCallback(async () => {
    setFetching(true);
    try {
      const data = await fetchNotificationsFromAPI();
      setNotifications(data.map(mapNotif));
    } catch { /* silently fail */ }
    finally { setFetching(false); }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => prev.find(n => n.id === notif.id) ? prev : [notif, ...prev].slice(0, 50));
  }, []);

  const dismiss = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);

  useSocket({
    onNotifications: useCallback((data) => {
      (Array.isArray(data) ? data : [data]).forEach((n, i) => addNotification(mapNotif(n, i)));
    }, [addNotification]),
    onNewSale: useCallback((sale) => {
      actions.showToast({ message: `New sale: Invoice #${sale.invoiceNumber} — Rs. ${sale.total}`, type: "success" });
      addNotification({ id: `sale-${sale.invoiceNumber || Date.now()}`, type: "new_sale", severity: "success", title: "New Sale Completed", message: `Invoice #${sale.invoiceNumber} · ${sale.customerName || "Walk-in"} · Rs. ${sale.total}`, source: "socket", createdAt: new Date().toISOString(), action: () => { navigate("/invoices"); setShowPanel(false); } });
    }, [addNotification, actions, navigate]),
    onCreditDeposited: useCallback((data) => {
      actions.showToast({ message: `Rs. ${data.amount} deposited by ${data.customerName}`, type: "success" });
      addNotification({ id: `credit-dep-${Date.now()}`, type: "credit_deposited", severity: "success", title: "Credit Deposited", message: `${data.customerName} paid Rs. ${data.amount}`, source: "socket", createdAt: new Date().toISOString(), action: () => { navigate("/customers"); setShowPanel(false); } });
    }, [addNotification, actions, navigate]),
    onStockAlert: useCallback((data) => {
      actions.showToast({ message: data.message, type: data.severity === "critical" ? "error" : "warning" });
      addNotification({ id: `stock-${data.productId || Date.now()}`, type: data.type || "stock_alert", severity: data.severity || "warning", title: data.title || "Stock Alert", message: data.message, source: "socket", createdAt: new Date().toISOString(), action: () => { navigate("/products"); setShowPanel(false); } });
    }, [addNotification, actions, navigate]),
  });

  const criticalCount = notifications.filter(n => n.severity === "critical" || n.severity === "high").length;

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDeposit(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/15 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/25 transition-colors border border-blue-200/80 dark:border-blue-800/50"
        >
          <DollarSign className="w-3.5 h-3.5" />Deposit
        </button>

        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowPanel(p => !p)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
          >
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {notifications.length > 0 && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 ${criticalCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
            )}
          </button>

          {showPanel && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-premium-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[32rem] animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${criticalCount > 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadNotifications} disabled={fetching} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${fetching ? "animate-spin" : ""}`} />
                  </button>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {fetching && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">All clear!</p>
                    <p className="text-xs mt-1">No alerts at the moment</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = TYPE_ICON[n.type] || TYPE_ICON.default;
                    const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                    return (
                      <div key={n.id} className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors" onClick={() => n.action?.()}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${style.bg} flex-shrink-0 mt-0.5`}>
                            <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{n.title}</p>
                              <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(n.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex-shrink-0 transition-colors">
                            <X className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <DepositCashModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
    </>
  );
};

export default NotificationCenter;
