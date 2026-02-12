import React, { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, Package, Calendar, TrendingDown } from "lucide-react";
import { useApp } from "../context/AppContext";

const NotificationCenter = () => {
  const { state, actions } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const checkNotifications = () => {
      const newNotifications = [];
      const today = new Date();
      
      // Low stock alerts
      state.products.forEach(product => {
        if (product.stock <= state.settings.lowStockThreshold) {
          newNotifications.push({
            id: `low-stock-${product.id}`,
            type: "warning",
            title: "Low Stock Alert",
            message: `${product.name} has only ${product.stock} ${product.unit}(s) left`,
            icon: Package,
            timestamp: new Date(),
            action: () => actions.setPage("products")
          });
        }
      });

      // Expiring products (within 30 days)
      state.products.forEach(product => {
        const expiryDate = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          newNotifications.push({
            id: `expiry-${product.id}`,
            type: "error",
            title: "Product Expiring Soon",
            message: `${product.name} expires in ${daysUntilExpiry} days`,
            icon: Calendar,
            timestamp: new Date(),
            action: () => actions.setPage("products")
          });
        }
      });

      setNotifications(newNotifications);
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.products, state.settings.lowStockThreshold]);

  const getNotificationColor = (type) => {
    switch (type) {
      case "error": return "from-red-500 to-rose-600";
      case "warning": return "from-amber-500 to-orange-600";
      case "info": return "from-blue-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2.5 rounded-2xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 relative shadow-sm hover:shadow-md"
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications ({notifications.length})
              </h3>
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={notification.action}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
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
  );
};

export default NotificationCenter;