import React, { useState } from "react";
import { Plus, ShoppingCart, FileText, Zap, Package, Users, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

const QuickActions = () => {
  const { state, actions } = useApp();
  const [showActions, setShowActions] = useState(false);

  const quickActions = [
    {
      id: "add-product",
      label: "Add Product",
      icon: Package,
      color: "from-emerald-500 to-teal-600",
      action: () => {
        actions.setPage("products");
        actions.showModal({ type: "addProduct" });
      },
      permission: "products"
    },
    {
      id: "new-sale",
      label: "New Sale",
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-600",
      action: () => actions.setPage("pos"),
      permission: "pos"
    },
    {
      id: "add-customer",
      label: "Add Customer",
      icon: Users,
      color: "from-purple-500 to-violet-600",
      action: () => {
        actions.setPage("customers");
        actions.showModal({ type: "addCustomer" });
      },
      permission: "customers"
    },
    {
      id: "view-reports",
      label: "Reports",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      action: () => actions.setPage("reports"),
      permission: "reports"
    }
  ];

  const availableActions = quickActions.filter(action => 
    actions.hasPermission(action.permission)
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions Menu */}
      {showActions && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2">
          {availableActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in slide-in-from-right-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="bg-white dark:bg-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.action();
                    setShowActions(false);
                  }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setShowActions(!showActions)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          showActions ? "rotate-45" : ""
        }`}
      >
        {showActions ? <Plus className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default QuickActions;