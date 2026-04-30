import React, { useState } from "react";
import { Plus, ShoppingCart, FileText, Zap, Package, Users, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

const QuickActions = () => {
  const { state, actions } = useApp();
  const [showActions, setShowActions] = useState(false);

  const quickActions = [
    { id: "add-product", label: "Add Product", icon: Package, color: "bg-blue-600 hover:bg-blue-700", action: () => { actions.setPage("products"); actions.showModal({ type: "addProduct" }); }, permission: "products" },
    { id: "new-sale", label: "New Sale", icon: ShoppingCart, color: "bg-emerald-600 hover:bg-emerald-700", action: () => actions.setPage("pos"), permission: "pos" },
    { id: "add-customer", label: "Add Customer", icon: Users, color: "bg-purple-600 hover:bg-purple-700", action: () => { actions.setPage("customers"); actions.showModal({ type: "addCustomer" }); }, permission: "customers" },
    { id: "view-reports", label: "Reports", icon: TrendingUp, color: "bg-amber-600 hover:bg-amber-700", action: () => actions.setPage("reports"), permission: "reports" },
  ];

  const availableActions = quickActions.filter(action => actions.hasPermission(action.permission));

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showActions && (
        <div className="absolute bottom-14 right-0 space-y-2 animate-fade-up">
          {availableActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                <span className="bg-white dark:bg-slate-800 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-premium-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {action.label}
                </span>
                <button
                  onClick={() => { action.action(); setShowActions(false); }}
                  className={`w-10 h-10 rounded-lg ${action.color} text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowActions(!showActions)}
        className={`w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${showActions ? "rotate-45" : ""}`}
      >
        {showActions ? <Plus className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default QuickActions;