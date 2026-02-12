import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Sprout,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Lock
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentPage, darkMode, currentUser, sidebarCollapsed } = state;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Define menu items with permissions
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
    { id: "pos", label: "POS / Sales", icon: ShoppingCart, permission: "pos" },
    { id: "products", label: "Products", icon: Package, permission: "products" },
    { id: "customers", label: "Customers", icon: Users, permission: "customers" },
    { id: "invoices", label: "Invoices", icon: FileText, permission: "invoices" },
    { id: "reports", label: "Reports", icon: BarChart3, permission: "reports" },
    { id: "stock", label: "Stock Management", icon: Package, permission: "stock_management" },
    { id: "users", label: "User Management", icon: Shield, permission: "user_management" },
    { id: "settings", label: "Settings", icon: Settings, permission: "settings" }
  ];

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => 
    actions.hasPermission(item.permission)
  );

  const handleNavigation = (pageId) => {
    actions.setPage(pageId);
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      actions.logout();
    }
  };

  const userRole = currentUser?.role ? roles[currentUser.role] : null;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            AgroCare
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 h-screen sidebar-bg",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72",
          "w-72"
        ].join(" ")}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex-shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span
              className={[
                "font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap transition-opacity",
                sidebarCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"
              ].join(" ")}
            >
              Pesticides
            </span>
          </div>
          <button
            onClick={actions.toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? "lg:px-2" : ""}`}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center">
              <img 
                src={currentUser?.avatar} 
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full bg-gray-100"
                title={`${currentUser?.name} (${userRole?.label})`}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img 
                src={currentUser?.avatar} 
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {currentUser?.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    userRole?.color === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                    userRole?.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}>
                    {userRole?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-10rem)]">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                  sidebarCollapsed && "lg:justify-center"
                ].join(" ")}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon className={[
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : ""
                ].join(" ")} />
                <span
                  className={[
                    "whitespace-nowrap transition-opacity",
                    sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
                  ].join(" ")}
                >
                  {item.label}
                </span>
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={[
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200",
              sidebarCollapsed && "lg:justify-center"
            ].join(" ")}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={[
                "whitespace-nowrap transition-opacity",
                sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"
              ].join(" ")}
            >
              Logout
            </span>
          </button>
        </nav>

        {/* Version */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
          <p className="text-xs text-gray-400 text-center">
            AgroCare POS v2.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
