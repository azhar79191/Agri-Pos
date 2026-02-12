import React, { useState } from "react";
import {
  Bell,
  Search,
  User,
  Sun,
  Moon,
  Store,
  LogOut,
  ChevronDown,
  Shield,
  Sparkles
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";
import NotificationCenter from "./NotificationCenter";

const Header = () => {
  const { state, actions } = useApp();
  const { settings, darkMode, cart, currentUser } = state;
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get current page title
  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      products: "Products",
      customers: "Customers",
      pos: "Point of Sale",
      reports: "Reports",
      settings: "Settings"
    };
    return titles[state.currentPage] || "Dashboard";
  };

  // Get cart item count
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle logout
  const handleLogout = () => {
    setShowUserMenu(false);
    actions.showToast({ 
      message: "Are you sure you want to logout?", 
      type: "warning",
      position: "center",
      isConfirm: true,
      onConfirm: () => actions.logout()
    });
  };

  const userRole = currentUser?.role ? roles[currentUser.role] : null;

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-enhanced border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm header-bg">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search - decorative */}
        <div className="hidden md:flex items-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl px-4 py-2.5 shadow-inner">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 w-32 lg:w-48 placeholder:text-gray-400"
            readOnly
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={actions.toggleDarkMode}
          className="p-2.5 rounded-2xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Cart (only show on POS page) */}
        {state.currentPage === "pos" && cartItemCount > 0 && (
          <button
            onClick={() => actions.setPage("pos")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105"
          >
            <Store className="w-4 h-4" />
            <span className="font-semibold text-sm">{cartItemCount}</span>
          </button>
        )}

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-2xl p-1.5 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="relative">
              <img 
                src={currentUser?.avatar} 
                alt={currentUser?.name}
                className="w-9 h-9 rounded-full bg-gray-100 ring-2 ring-emerald-500/20"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userRole?.label}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={currentUser?.avatar} 
                        alt={currentUser?.name}
                        className="w-14 h-14 rounded-2xl bg-gray-100 ring-4 ring-emerald-500/20 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mt-1.5 font-medium ${
                        userRole?.color === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        userRole?.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {userRole?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      actions.setPage("settings");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-300 group"
                  >
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;