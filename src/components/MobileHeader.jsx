import React, { useState } from "react";
import { ChevronLeft, Sun, Moon, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PAGE_TITLES, BREADCRUMBS } from "../constants/navigation";
import ShopLogo from "./ui/ShopLogo";
import NotificationCenter from "./NotificationCenter";

/**
 * Mobile-only top header.
 * - Root pages (dashboard, pos, products, customers): shows shop logo + name + actions
 * - Sub-pages (any page with a breadcrumb): shows back button + page title + actions
 */
const MobileHeader = () => {
  const { state, actions } = useApp();
  const { darkMode, settings } = state;
  const navigate  = useNavigate();
  const location  = useLocation();

  const page       = location.pathname.replace(/^\//, "") || "dashboard";
  const title      = PAGE_TITLES[page] || "Dashboard";
  const breadcrumb = BREADCRUMBS[page] || null;

  // Root-level pages — no back button
  const ROOT_PAGES = new Set(["dashboard", "pos", "products", "customers", ""]);
  const isRoot = ROOT_PAGES.has(page);

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/60"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {isRoot ? (
          /* Shop logo + name on root pages */
          <>
            <ShopLogo logo={settings?.shopLogo} name={settings?.shopName} size="w-7 h-7" />
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {settings?.shopName || "AgriNest"}
            </span>
          </>
        ) : (
          /* Back button + page title on sub-pages */
          <>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-90 transition-transform flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              {breadcrumb && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mb-0.5">
                  {breadcrumb[0]}
                </p>
              )}
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                {title}
              </h1>
            </div>
          </>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Dark mode */}
        <button
          onClick={actions.toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
};

export default MobileHeader;
