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

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, sidebarCollapsed, themeColor = "#10b981" } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const tc = themeColor;
  const tcAlpha = (a) => `${tc}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

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
        className={`${size} rounded-xl object-cover shadow-lg`}
        loading="eager" decoding="sync"
      />
    ) : (
      <div
        className={`${size} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}
        style={{ background: `linear-gradient(135deg, ${tc}, ${tcAlpha(0.7)})` }}
      >
        {initial}
      </div>
    );

  const roleColor =
    userRole?.color === "purple" ? "text-purple-300 bg-purple-500/15 border-purple-400/25" :
    userRole?.color === "blue"   ? "text-sky-300 bg-sky-500/15 border-sky-400/25" :
                                   "text-emerald-300 bg-emerald-500/15 border-emerald-400/25";

  const LogoBlock = () => (
    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden shadow-lg bg-white">
      {state.settings?.shopLogo ? (
        <img src={state.settings.shopLogo} alt={state.settings.shopName}
          className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${tc}, ${tcAlpha(0.7)})` }}>
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
          borderBottom: `1px solid ${tcAlpha(0.2)}`,
          boxShadow: "0 2px 20px rgba(0,0,0,0.4)"
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-md">
            {state.settings?.shopLogo ? (
              <img src={state.settings.shopLogo} alt={state.settings.shopName}
                className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${tc}, ${tcAlpha(0.7)})` }}>
                <Sprout className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight leading-none block">
              {state.settings?.shopName || "AgroCare"}
            </span>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: tcAlpha(0.7) }}>POS</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(v => !v)}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ color: tcAlpha(0.7) }}
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
          style={{ borderBottom: `1px solid ${tcAlpha(0.12)}` }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <LogoBlock />
            <div className={["overflow-hidden transition-all duration-300", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"].join(" ")}>
              <p className="font-bold text-white text-sm whitespace-nowrap tracking-tight leading-none">
                {state.settings?.shopName || "AgroCare POS"}
              </p>
              <p className="text-[10px] whitespace-nowrap mt-0.5 tracking-widest uppercase" style={{ color: tcAlpha(0.5) }}>
                Agri Management
              </p>
            </div>
          </div>
          <button
            onClick={actions.toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: tcAlpha(0.5) }}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── User card ── */}
        <div className={["px-3 py-3 flex-shrink-0", sidebarCollapsed ? "lg:px-2" : ""].join(" ")}
          style={{ borderBottom: `1px solid ${tcAlpha(0.08)}` }}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center">
              <Avatar size="w-9 h-9" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${tcAlpha(0.12)} 0%, ${tcAlpha(0.06)} 100%)`,
                border: `1px solid ${tcAlpha(0.18)}`
              }}>
              <Avatar size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-none">{currentUser?.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1.5 ${roleColor}`}>
                  {userRole?.label || "User"}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: tc, boxShadow: `0 0 6px ${tc}cc` }} />
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {!sidebarCollapsed && (
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 pb-2 pt-1"
              style={{ color: tcAlpha(0.4) }}>
              Navigation
            </p>
          )}

          {visible.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === `/${item.id}`;

            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                title={sidebarCollapsed ? item.label : ""}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative border",
                  sidebarCollapsed && "lg:justify-center lg:px-2"
                ].join(" ")}
                style={active ? {
                  background: `linear-gradient(135deg, ${tcAlpha(0.22)}, ${tcAlpha(0.12)})`,
                  border: `1px solid ${tcAlpha(0.35)}`,
                  boxShadow: `0 2px 16px ${tcAlpha(0.15)}`,
                  color: "white"
                } : {
                  border: "1px solid transparent",
                  color: "rgba(255,255,255,0.35)"
                }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: tc, boxShadow: `0 0 8px ${tc}cc` }} />
                )}

                <Icon
                  className="flex-shrink-0 transition-all duration-200"
                  style={{ width: "18px", height: "18px", color: active ? tc : undefined }}
                />

                <span className={[
                  "whitespace-nowrap transition-all duration-300 font-medium",
                  sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100",
                ].join(" ")}>
                  {item.label}
                </span>

                {active && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: tc, boxShadow: `0 0 6px ${tc}` }} />
                )}
              </button>
            );
          })}

          <div className="my-3 mx-2" style={{ borderTop: `1px solid ${tcAlpha(0.08)}` }} />

          <button
            onClick={logout}
            title={sidebarCollapsed ? "Logout" : ""}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
              "text-emerald-100/30 hover:text-red-400 hover:bg-red-500/8 hover:border-red-500/15",
              sidebarCollapsed && "lg:justify-center lg:px-2"
            ].join(" ")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-emerald-700/50 group-hover:text-red-400 transition-colors duration-200" />
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
            style={{ borderTop: `1px solid ${tcAlpha(0.08)}` }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: tcAlpha(0.4) }} />
              <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: tcAlpha(0.5) }}>
                v2.0 · {state.settings?.shopName || "AgroCare"}
              </p>
              <div className="w-1 h-1 rounded-full" style={{ background: tcAlpha(0.4) }} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
