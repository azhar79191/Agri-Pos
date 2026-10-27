import { companyName } from "../utils/company";
import React from "react";
import { ChevronLeft, Bell } from "lucide-react";
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
  const { state } = useApp();
  const { settings } = state;
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
      className="app-mobile-header lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 backdrop-blur-xl border-b"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {isRoot ? (
          /* Shop logo + name on root pages */
          <>
            <ShopLogo logo={settings?.brandLogo || settings?.shopLogo} name={settings?.brandName || settings?.shopName} size="w-7 h-7" />
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {companyName(settings)}
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
            <ShopLogo logo={settings?.brandLogo || settings?.shopLogo} name={settings?.brandName || settings?.shopName} size="w-7 h-7" />
            <div className="min-w-0">
              <p className="truncate text-[10px] text-slate-500">{settings?.brandName || settings?.shopName}</p>
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


        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
};

export default MobileHeader;
