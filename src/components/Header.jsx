import React, { useState, useEffect, useRef } from "react";
import { Bell, Sun, Moon, LogOut, ChevronDown, Shield, User, Store, Download, Share, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";
import { PAGE_TITLES, BREADCRUMBS } from "../constants/navigation";
import UserAvatar from "./ui/UserAvatar";
import NotificationCenter from "./NotificationCenter";
import GlobalSearch from "./GlobalSearch";
import usePWAInstall from "../hooks/usePWAInstall";

/** Maps role color key → Tailwind badge classes */
const getRoleColorClass = (color) => {
  if (color === "purple") return "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
  return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
};

const Header = () => {
  const { state, actions } = useApp();
  const { darkMode, cart, currentUser } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { canInstall, isInstalled, isIOS, dismissed, install, dismiss } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Show install button in header if: native prompt available OR not installed and not dismissed
  const showInstallBtn = !isInstalled && !dismissed;

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const page = location.pathname.replace(/^\//, "") || "dashboard";
  const title = PAGE_TITLES[page] || "Dashboard";
  const breadcrumb = BREADCRUMBS[page] || null;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;
  const userRole = rawRole ? roles[(rawRole || "").toLowerCase()] : null;
  const roleColorClass = getRoleColorClass(userRole?.color);

  const handleLogout = () => {
    setShowMenu(false);
    actions.showToast({
      message: "Are you sure you want to logout?",
      type: "warning",
      position: "center",
      isConfirm: true,
      onConfirm: () => actions.logout(),
    });
  };

  return (
    <>
    <header className="h-14 flex items-center justify-between px-4 lg:px-5 sticky top-0 z-10 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-700/50">

      {/* Left — title + breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          {breadcrumb && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
              <span>{breadcrumb[0]}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">{breadcrumb[1]}</span>
            </div>
          )}
          <h1 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight leading-none">
            {title}
          </h1>
          {!breadcrumb && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Center — Global Search */}
      <div className="flex-1 flex justify-center px-6">
        <GlobalSearch />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">

        {/* PWA install icon — visible when app is not yet installed */}
        {showInstallBtn && (
          <button
            onClick={() => canInstall ? install() : setShowInstallModal(true)}
            className="p-2 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-150"
            title="Install AgriNest App"
          >
            <Download className="w-[18px] h-[18px]" />
          </button>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={actions.toggleDarkMode}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode
            ? <Sun className="w-[18px] h-[18px] text-amber-400" />
            : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <NotificationCenter />

        {/* Cart badge — only visible on POS page */}
        {page === "pos" && cartCount > 0 && (
          <button
            onClick={() => actions.setPage("pos")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-150"
          >
            <Store style={{ width: "14px", height: "14px" }} />
            <span>{cartCount}</span>
          </button>
        )}

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5" />

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 group"
          >
            <div className="relative">
              <UserAvatar user={currentUser} size="w-7 h-7" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-[1.5px] border-white dark:border-slate-900" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{userRole?.label}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-scale-in">
              {/* Profile header */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar user={currentUser} size="w-10 h-10" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${roleColorClass}`}>
                      <Shield style={{ width: "9px", height: "9px" }} />
                      {userRole?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5">
                <button
                  onClick={() => { navigate("/profile"); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Profile Settings</span>
                </button>

                {/* PWA Install button — shown when not installed */}
                {showInstallBtn && (
                  <button
                    onClick={() => { canInstall ? install() : setShowInstallModal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <span className="font-medium">Install App</span>
                    <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">PWA</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Install instructions modal — for iOS / non-Chrome browsers */}
    {showInstallModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowInstallModal(false)}
      >
        <div
          className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Download className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Install AgriNest</p>
                <p className="text-xs text-slate-400">Add to your device</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallModal(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {isIOS ? (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Follow these steps in Safari:
                </p>
                <ol className="space-y-3">
                  {[
                    <>Tap the <Share className="inline w-4 h-4 text-blue-500 mx-0.5 -mt-0.5" /> <strong>Share</strong> button at the bottom of Safari</>,
                    <>Scroll down and tap <strong>"Add to Home Screen"</strong></>,
                    <>Tap <strong>"Add"</strong> in the top-right corner</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Install from your browser:
                </p>
                <ol className="space-y-3">
                  {[
                    <>Look for the <strong>⊕ install icon</strong> in the browser address bar</>,
                    <>Or open the browser menu (⋮) and select <strong>"Install AgriNest"</strong></>,
                    <>Click <strong>"Install"</strong> to confirm</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={() => { dismiss(); setShowInstallModal(false); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Don't show again
            </button>
            <button
              onClick={() => setShowInstallModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
