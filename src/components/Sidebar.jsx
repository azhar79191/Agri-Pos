import React, { useState } from "react";
import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText,
  BarChart3, Settings, Menu, X, ChevronLeft, ChevronRight,
  LogOut, Shield, Building2, Layers, Sprout
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";

const menuItems = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard, permission: "dashboard" },
  { id: "pos",       label: "POS / Sales", icon: ShoppingCart,   permission: "pos" },
  { id: "products",  label: "Products",    icon: Package,         permission: "products" },
  { id: "customers", label: "Customers",   icon: Users,           permission: "customers" },
  { id: "invoices",  label: "Invoices",    icon: FileText,        permission: "invoices" },
  { id: "reports",   label: "Reports",     icon: BarChart3,       permission: "reports" },
  { id: "stock",     label: "Stock",       icon: Layers,          permission: "stock" },
  { id: "users",     label: "Users",       icon: Shield,          permission: "users" },
  { id: "shops",     label: "My Shop",     icon: Building2,       permission: "settings" },
  { id: "settings",  label: "Settings",    icon: Settings,        permission: "settings" },
];

/* Icon accent colors per route — gives each item its own personality */
const iconAccents = {
  dashboard: "text-emerald-400",
  pos:       "text-amber-400",
  products:  "text-teal-400",
  customers: "text-sky-400",
  invoices:  "text-violet-400",
  reports:   "text-purple-400",
  stock:     "text-orange-400",
  users:     "text-rose-400",
  shops:     "text-cyan-400",
  settings:  "text-slate-400",
};

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, sidebarCollapsed } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visible = currentUser
    ? menuItems.filter(i => actions.hasPermission(i.permission))
    : [];

  const go = (id) => { navigate(`/${id}`); setIsMobileOpen(false); };

  const logout = () => {
    actions.showToast({
      message: "Are you sure you want to logout?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => { actions.logout(); navigate("/"); },
    });
  };

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;
  const userRole = rawRole ? roles[(rawRole || "").toLowerCase()] : null;
  const initial = currentUser?.name?.[0]?.toUpperCase() || "U";

  const Avatar = ({ size = "w-10 h-10" }) =>
    currentUser?.avatar ? (
      <img
        src={currentUser.avatar} alt={currentUser.name}
        className={`${size} rounded-xl object-cover ring-2 ring-emerald-400/40 shadow-lg`}
        loading="eager" decoding="sync"
      />
    ) : (
      <div className={`${size} rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-900/40`}>
        {initial}
      </div>
    );

  const roleColor =
    userRole?.color === "purple" ? "text-purple-300 bg-purple-500/15 border-purple-400/25" :
    userRole?.color === "blue"   ? "text-sky-300 bg-sky-500/15 border-sky-400/25" :
                                   "text-emerald-300 bg-emerald-500/15 border-emerald-400/25";

  /* ── Logo block ── */
  const LogoBlock = () => (
    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden shadow-lg shadow-emerald-900/50 bg-white">
      {state.settings?.shopLogo ? (
        <img src={state.settings.shopLogo} alt={state.settings.shopName}
          className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
          <Sprout className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "linear-gradient(90deg, #052e1c 0%, #063d26 100%)",
          borderBottom: "1px solid rgba(16,185,129,0.15)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.4)"
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-md">
            {state.settings?.shopLogo ? (
              <img src={state.settings.shopLogo} alt={state.settings.shopName}
                className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight leading-none block">
              {state.settings?.shopName || "AgroCare"}
            </span>
            <span className="text-[10px] text-emerald-400/70 tracking-widest uppercase">POS</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(v => !v)}
          className="p-2 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Overlay ── */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(2,14,8,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={[
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 sidebar-premium noise",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64",
        "w-64"
      ].join(" ")}>

        {/* ── Header / Logo ── */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <LogoBlock />
            <div className={["overflow-hidden transition-all duration-300", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"].join(" ")}>
              <p className="font-bold text-white text-sm whitespace-nowrap tracking-tight leading-none">
                {state.settings?.shopName || "AgroCare POS"}
              </p>
              <p className="text-[10px] text-emerald-400/60 whitespace-nowrap mt-0.5 tracking-widest uppercase">
                Agri Management
              </p>
            </div>
          </div>
          <button
            onClick={actions.toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-emerald-600/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── User card ── */}
        <div className={["px-3 py-3 flex-shrink-0", sidebarCollapsed ? "lg:px-2" : ""].join(" ")}
          style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center">
              <Avatar size="w-9 h-9" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.06) 100%)",
                border: "1px solid rgba(16,185,129,0.15)"
              }}>
              <Avatar size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-none">{currentUser?.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1.5 ${roleColor}`}>
                  {userRole?.label || "User"}
                </span>
              </div>
              {/* Online dot */}
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)] flex-shrink-0 animate-pulse" />
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">

          {/* Section label */}
          {!sidebarCollapsed && (
            <p className="text-[9px] font-bold text-emerald-600/50 uppercase tracking-[0.15em] px-3 pb-2 pt-1">
              Navigation
            </p>
          )}

          {visible.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === `/${item.id}`;
            const accentColor = iconAccents[item.id] || "text-slate-400";

            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                title={sidebarCollapsed ? item.label : ""}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "nav-active nav-active-glow text-white"
                    : "text-emerald-100/40 hover:text-white border border-transparent hover:border-emerald-500/15 hover:bg-emerald-500/8",
                  sidebarCollapsed && "lg:justify-center lg:px-2"
                ].join(" ")}
              >
                {/* Active left bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}

                <Icon
                  className={[
                    "flex-shrink-0 transition-all duration-200",
                    active ? accentColor + " drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "text-emerald-700/70 group-hover:" + accentColor.replace("text-", "")
                  ].join(" ")}
                  style={{ width: "18px", height: "18px" }}
                />

                <span className={[
                  "whitespace-nowrap transition-all duration-300 font-medium",
                  sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100",
                  active ? "text-white" : "text-emerald-100/50 group-hover:text-white"
                ].join(" ")}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {active && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] flex-shrink-0" />
                )}

                {/* Hover shimmer line */}
                {!active && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 mx-2" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }} />

          {/* Logout */}
          <button
            onClick={logout}
            title={sidebarCollapsed ? "Logout" : ""}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
              "text-emerald-100/30 hover:text-red-400 hover:bg-red-500/8 hover:border-red-500/15",
              sidebarCollapsed && "lg:justify-center lg:px-2"
            ].join(" ")}
          >
            <LogOut
              className="w-[18px] h-[18px] flex-shrink-0 text-emerald-700/50 group-hover:text-red-400 transition-colors duration-200"
            />
            <span className={[
              "whitespace-nowrap transition-all duration-300",
              sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
            ].join(" ")}>
              Sign Out
            </span>
          </button>
        </nav>

        {/* ── Footer ── */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
              <p className="text-[10px] text-emerald-700/60 tracking-widest uppercase font-medium">
                v2.0 · {state.settings?.shopName || "AgroCare"}
              </p>
              <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
