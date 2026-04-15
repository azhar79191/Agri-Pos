import React, { useState } from "react";
import { Bell, Sun, Moon, LogOut, ChevronDown, Shield, User, Store } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";
import NotificationCenter from "./NotificationCenter";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  products:  "Products",
  customers: "Customers",
  pos:       "Point of Sale",
  invoices:  "Invoices",
  reports:   "Reports",
  stock:     "Stock Management",
  users:     "User Management",
  settings:  "Settings",
  profile:   "Profile",
  shops:     "My Shop",
  status:    "Status",
};

const Header = () => {
  const { state, actions } = useApp();
  const { darkMode, cart, currentUser } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const page = location.pathname.replace("/", "") || "dashboard";
  const title = PAGE_TITLES[page] || "Dashboard";
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;
  const userRole = rawRole ? roles[(rawRole || "").toLowerCase()] : null;
  const initial = currentUser?.name?.[0]?.toUpperCase() || "U";

  const Avatar = ({ size = "w-9 h-9" }) =>
    currentUser?.avatar ? (
      <img src={currentUser.avatar} alt={currentUser.name} className={`${size} rounded-xl object-cover`} />
    ) : (
      <div className={`${size} rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm`}>
        {initial}
      </div>
    );

  const roleColor =
    userRole?.color === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
    userRole?.color === "blue"   ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

  const handleLogout = () => {
    setShowMenu(false);
    actions.showToast({
      message: "Are you sure you want to logout?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => actions.logout()
    });
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Dark mode */}
        <button
          onClick={actions.toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode
            ? <Sun className="w-4.5 h-4.5 text-amber-400" style={{ width: "18px", height: "18px" }} />
            : <Moon className="w-4.5 h-4.5" style={{ width: "18px", height: "18px" }} />}
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Cart badge */}
        {page === "pos" && cartCount > 0 && (
          <button
            onClick={() => actions.setPage("pos")}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow transition-all duration-200 hover:scale-105"
          >
            <Store style={{ width: "15px", height: "15px" }} />
            <span>{cartCount}</span>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-white/8 mx-1" />

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="relative">
              <Avatar size="w-8 h-8" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{userRole?.label}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-premium-lg border border-slate-200/80 dark:border-white/8 z-50 overflow-hidden animate-scale-in">
                {/* Profile header */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 border-b border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar size="w-12 h-12" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${roleColor}`}>
                        <Shield style={{ width: "10px", height: "10px" }} />
                        {userRole?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => { navigate("/profile"); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
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
