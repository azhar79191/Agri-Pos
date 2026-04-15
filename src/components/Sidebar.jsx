import React, { useState } from "react";
import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText,
  BarChart3, Settings, Menu, X, Sprout, ChevronLeft, ChevronRight,
  LogOut, Shield, Building2, Layers
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";

const menuItems = [
  { id: "dashboard", label: "Dashboard",        icon: LayoutDashboard, permission: "dashboard" },
  { id: "pos",       label: "POS / Sales",       icon: ShoppingCart,    permission: "pos" },
  { id: "products",  label: "Products",          icon: Package,         permission: "products" },
  { id: "customers", label: "Customers",         icon: Users,           permission: "customers" },
  { id: "invoices",  label: "Invoices",          icon: FileText,        permission: "invoices" },
  { id: "reports",   label: "Reports",           icon: BarChart3,       permission: "reports" },
  { id: "stock",     label: "Stock",             icon: Layers,          permission: "stock" },
  { id: "users",     label: "Users",             icon: Shield,          permission: "users" },
  { id: "shops",     label: "My Shop",           icon: Building2,       permission: "settings" },
  { id: "settings",  label: "Settings",          icon: Settings,        permission: "settings" },
];

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
    if (window.confirm("Are you sure you want to logout?")) {
      actions.logout(); navigate("/");
    }
  };

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;
  const userRole = rawRole ? roles[(rawRole || "").toLowerCase()] : null;
  const initial = currentUser?.name?.[0]?.toUpperCase() || "U";

  const Avatar = ({ size = "w-10 h-10" }) =>
    currentUser?.avatar ? (
      <img src={currentUser.avatar} alt={currentUser.name} className={`${size} rounded-xl object-cover ring-2 ring-emerald-500/30`} />
    ) : (
      <div className={`${size} rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-500/20`}>
        {initial}
      </div>
    );

  const roleColor =
    userRole?.color === "purple" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
    userRole?.color === "blue"   ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                                   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-glow-sm">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">AgroCare</span>
        </div>
        <button onClick={() => setIsMobileOpen(v => !v)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 sidebar-premium noise",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64",
        "w-64"
      ].join(" ")}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-glow-sm flex-shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className={["overflow-hidden transition-all duration-300", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"].join(" ")}>
              <p className="font-bold text-white text-sm whitespace-nowrap tracking-tight">AgroCare POS</p>
              <p className="text-[10px] text-emerald-400/70 whitespace-nowrap">Pesticide Management</p>
            </div>
          </div>
          <button onClick={actions.toggleSidebar} className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User */}
        <div className={["px-3 py-3 border-b border-white/5 flex-shrink-0", sidebarCollapsed ? "lg:px-2" : ""].join(" ")}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center">
              <Avatar size="w-9 h-9" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/3 border border-white/5">
              <Avatar size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border mt-0.5 ${roleColor}`}>
                  {userRole?.label || "User"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === `/${item.id}`;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                title={sidebarCollapsed ? item.label : ""}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "nav-active text-emerald-300"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
                  sidebarCollapsed && "lg:justify-center lg:px-2"
                ].join(" ")}
              >
                <Icon className={["w-4.5 h-4.5 flex-shrink-0 transition-colors", active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"].join(" ")} style={{ width: "18px", height: "18px" }} />
                <span className={["whitespace-nowrap transition-all duration-300", sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"].join(" ")}>
                  {item.label}
                </span>
                {active && !sidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-sm" />
                )}
              </button>
            );
          })}

          <div className="my-3 border-t border-white/5" />

          <button
            onClick={logout}
            title={sidebarCollapsed ? "Logout" : ""}
            className={["w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group", sidebarCollapsed && "lg:justify-center lg:px-2"].join(" ")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:text-red-400 transition-colors" />
            <span className={["whitespace-nowrap transition-all duration-300", sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"].join(" ")}>
              Sign Out
            </span>
          </button>
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
            <p className="text-[10px] text-slate-600 text-center tracking-widest uppercase">v2.0 · AgroCare</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
