import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  MoreHorizontal, X, ChevronRight, Settings, FileText,
  ShoppingBag, Bug, Shield, Building2, Layers, CreditCard,
  Wallet, Award, DollarSign, PieChart, Clock, Calendar,
  PackagePlus, Zap, ClipboardCheck, RotateCcw, Beaker,
  Printer, History, TrendingUp, LogOut, User, Download,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import UserAvatar from "./ui/UserAvatar";
import ShopLogo from "./ui/ShopLogo";
import usePWAInstall from "../hooks/usePWAInstall";

/* ─── Bottom tab definitions (max 5 including More) ─── */
const BOTTOM_TABS = [
  { id: "dashboard", label: "Home",     icon: LayoutDashboard, path: "/dashboard",  permission: "dashboard" },
  { id: "pos",       label: "POS",      icon: ShoppingCart,    path: "/pos",        permission: "pos"       },
  { id: "products",  label: "Products", icon: Package,         path: "/products",   permission: "products"  },
  { id: "customers", label: "Customers",icon: Users,           path: "/customers",  permission: "customers" },
  { id: "more",      label: "More",     icon: MoreHorizontal,  path: null,          permission: null        },
];

/* ─── All sections shown in the "More" sheet ─── */
const MORE_SECTIONS = [
  {
    label: "Sales",
    color: "emerald",
    items: [
      { id: "invoices",     label: "Invoices",      icon: FileText,    path: "/invoices",     permission: "pos"       },
      { id: "sales/credit", label: "Credit Sales",  icon: CreditCard,  path: "/sales/credit", permission: "pos"       },
    ],
  },
  {
    label: "Inventory",
    color: "orange",
    items: [
      { id: "stock",                  label: "Stock Levels",   icon: Layers,        path: "/stock",                  permission: "products" },
      { id: "inventory/batch-expiry", label: "Batch & Expiry", icon: Calendar,      path: "/inventory/batch-expiry", permission: "products" },
      { id: "inventory/bundles",      label: "Bundles",        icon: PackagePlus,   path: "/inventory/bundles",      permission: "products" },
      { id: "inventory/dead-stock",   label: "Smart Alerts",   icon: Zap,           path: "/inventory/dead-stock",   permission: "products" },
    ],
  },
  {
    label: "Purchases",
    color: "violet",
    items: [
      { id: "purchases/orders",    label: "Purchase Orders",  icon: ShoppingBag,    path: "/purchases/orders",    permission: "stock" },
      { id: "purchases/grn",       label: "Goods Receiving",  icon: ClipboardCheck, path: "/purchases/grn",       permission: "stock" },
      { id: "purchases/returns",   label: "Returns",          icon: RotateCcw,      path: "/purchases/returns",   permission: "stock" },
      { id: "purchases/suppliers", label: "Suppliers",        icon: Building2,      path: "/purchases/suppliers", permission: "stock" },
    ],
  },
  {
    label: "Customers",
    color: "cyan",
    items: [
      { id: "customers/dues",    label: "Customer Dues",    icon: Wallet,  path: "/customers/dues",    permission: "customers" },
      { id: "customers/history", label: "Purchase History", icon: History, path: "/customers/history", permission: "customers" },
      { id: "customers/loyalty", label: "Loyalty Program",  icon: Award,   path: "/customers/loyalty", permission: "customers" },
    ],
  },
  {
    label: "Crop Advisory",
    color: "green",
    items: [
      { id: "recommendations/diagnosis", label: "AI Pest Diagnosis",  icon: Bug,      path: "/recommendations/diagnosis", permission: "products" },
      { id: "recommendations/dosage",    label: "Dosage Calculator",  icon: Beaker,   path: "/recommendations/dosage",    permission: "products" },
      { id: "recommendations/calendar",  label: "Crop Calendar",      icon: Calendar, path: "/recommendations/calendar",  permission: "products" },
      { id: "recommendations/print",     label: "Print Advisory",     icon: Printer,  path: "/recommendations/print",     permission: "products" },
    ],
  },
  {
    label: "Reports",
    color: "purple",
    items: [
      { id: "reports",           label: "Sales Report",     icon: BarChart3,  path: "/reports",           permission: "reports" },
      { id: "reports/profit",    label: "Profit Analysis",  icon: DollarSign, path: "/reports/profit",    permission: "reports" },
      { id: "reports/margin",    label: "Margin Analysis",  icon: PieChart,   path: "/reports/margin",    permission: "reports" },
      { id: "reports/inventory", label: "Inventory Report", icon: Package,    path: "/reports/inventory", permission: "reports" },
      { id: "reports/aging",     label: "Invoice Aging",    icon: Clock,      path: "/reports/aging",     permission: "reports" },
    ],
  },
  {
    label: "Administration",
    color: "indigo",
    items: [
      { id: "staff",    label: "Staff Hub",    icon: Shield,   path: "/staff",    permission: "users"    },
      { id: "shops",    label: "My Shop",      icon: Building2,path: "/shops",    permission: "settings" },
      { id: "settings", label: "App Settings", icon: Settings, path: "/settings", permission: "settings" },
    ],
  },
];

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  orange:  { bg: "bg-orange-100 dark:bg-orange-900/30",   icon: "text-orange-600 dark:text-orange-400",   dot: "bg-orange-500"  },
  violet:  { bg: "bg-violet-100 dark:bg-violet-900/30",   icon: "text-violet-600 dark:text-violet-400",   dot: "bg-violet-500"  },
  cyan:    { bg: "bg-cyan-100 dark:bg-cyan-900/30",       icon: "text-cyan-600 dark:text-cyan-400",       dot: "bg-cyan-500"    },
  green:   { bg: "bg-green-100 dark:bg-green-900/30",     icon: "text-green-600 dark:text-green-400",     dot: "bg-green-500"   },
  purple:  { bg: "bg-purple-100 dark:bg-purple-900/30",   icon: "text-purple-600 dark:text-purple-400",   dot: "bg-purple-500"  },
  indigo:  { bg: "bg-indigo-100 dark:bg-indigo-900/30",   icon: "text-indigo-600 dark:text-indigo-400",   dot: "bg-indigo-500"  },
};

const MobileNav = () => {
  const { state, actions } = useApp();
  const { currentUser, settings, cart } = state;
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showMore, setShowMore] = useState(false);
  const sheetRef  = useRef(null);
  const { canInstall, isInstalled, install } = usePWAInstall();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const currentPath = location.pathname;

  // Close sheet on route change
  useEffect(() => { setShowMore(false); }, [location.pathname]);

  // Close sheet on outside tap
  useEffect(() => {
    if (!showMore) return;
    const handler = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showMore]);

  const go = (path) => { navigate(path); setShowMore(false); };

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/dashboard") return currentPath === "/dashboard" || currentPath === "/";
    return currentPath.startsWith(path);
  };

  // Is "More" active — any non-bottom-tab route
  const bottomPaths = BOTTOM_TABS.filter(t => t.path).map(t => t.path);
  const isMoreActive = !bottomPaths.some(p => isActive(p));

  const hasPermission = (perm) => !perm || actions.hasPermission(perm);

  const handleLogout = () => {
    setShowMore(false);
    actions.showToast({
      message: "Are you sure you want to logout?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => { actions.logout(); navigate("/"); },
    });
  };

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;

  return (
    <>
      {/* ── Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-700/60"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch h-[58px]">
          {BOTTOM_TABS.map((tab) => {
            if (tab.path && !hasPermission(tab.permission)) return null;
            const Icon   = tab.icon;
            const active = tab.id === "more" ? isMoreActive : isActive(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => tab.id === "more" ? setShowMore(v => !v) : go(tab.path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-150 active:scale-95"
              >
                {/* Active indicator pill */}
                {active && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                )}

                {/* Icon wrapper */}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 ${
                  active
                    ? "bg-violet-100 dark:bg-violet-900/40"
                    : "bg-transparent"
                }`}>
                  <Icon className={`w-[19px] h-[19px] transition-colors duration-150 ${
                    active
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`} />

                  {/* Cart badge on POS tab */}
                  {tab.id === "pos" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-semibold leading-none transition-colors duration-150 ${
                  active
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── More Sheet Backdrop ── */}
      {showMore && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
          style={{ animation: "fade-in 0.15s ease both" }}
        />
      )}

      {/* ── More Sheet ── */}
      <div
        ref={sheetRef}
        className={`lg:hidden fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          showMore ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: "82vh",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 70px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* User profile strip */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-shrink-0">
            <UserAvatar user={currentUser} size="w-10 h-10" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* PWA install */}
            {!isInstalled && (
              <button
                onClick={() => { canInstall ? install() : null; setShowMore(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold"
              >
                <Download className="w-3 h-3" /> Install
              </button>
            )}
            <button
              onClick={() => { go("/profile"); }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(82vh - 130px)" }}>
          <div className="px-4 py-3 space-y-5">
            {MORE_SECTIONS.map((section) => {
              const visibleItems = section.items.filter(item => hasPermission(item.permission));
              if (!visibleItems.length) return null;
              const colors = COLOR_MAP[section.color] || COLOR_MAP.indigo;

              return (
                <div key={section.label}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {section.label}
                    </p>
                  </div>

                  {/* Items grid — 2 columns */}
                  <div className="grid grid-cols-2 gap-2">
                    {visibleItems.map((item) => {
                      const Icon   = item.icon;
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.id}
                          onClick={() => go(item.path)}
                          className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left transition-all duration-150 active:scale-95 ${
                            active
                              ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40"
                              : "bg-slate-50 dark:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            active ? "bg-violet-100 dark:bg-violet-900/40" : colors.bg
                          }`}>
                            <Icon className={`w-4 h-4 ${active ? "text-violet-600 dark:text-violet-400" : colors.icon}`} />
                          </div>
                          <span className={`text-xs font-semibold leading-tight ${
                            active ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {item.label}
                          </span>
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Sign out */}
            <div className="pt-1 pb-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 transition-all active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
