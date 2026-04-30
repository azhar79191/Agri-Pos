import React, { useState } from "react";
import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText,
  BarChart3, Settings, Menu, X, ChevronLeft, ChevronRight,
  LogOut, Shield, Building2, Layers, Sprout, ChevronDown,
  Calendar, Zap, PackagePlus, ShoppingBag, ClipboardCheck,
  RotateCcw, Bug, Beaker, Printer, CreditCard, Wallet,
  History, Award, UserCheck, TrendingUp, DollarSign, PieChart
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";

const menuGroups = [
  {
    id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard",
    children: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { id: "dashboard/forecasting", label: "Forecasting", icon: TrendingUp },
    ]
  },
  {
    id: "sales", label: "Sales", icon: ShoppingCart, permission: "pos",
    children: [
      { id: "pos", label: "POS Billing", icon: ShoppingCart },
      { id: "invoices", label: "Invoices", icon: FileText },
      { id: "sales/credit", label: "Credit Sales", icon: CreditCard },
    ]
  },
  {
    id: "inventory", label: "Inventory", icon: Package, permission: "products",
    children: [
      { id: "products", label: "Products", icon: Package },
      { id: "stock", label: "Stock Levels", icon: Layers },
      { id: "inventory/batch-expiry", label: "Batch & Expiry", icon: Calendar },
      { id: "inventory/bundles", label: "Bundles", icon: PackagePlus },
      { id: "inventory/dead-stock", label: "Smart Alerts", icon: Zap },
    ]
  },
  {
    id: "purchases", label: "Purchases", icon: ShoppingBag, permission: "stock",
    children: [
      { id: "purchases/orders", label: "Purchase Orders", icon: ShoppingBag },
      { id: "purchases/grn", label: "Goods Receiving", icon: ClipboardCheck },
      { id: "purchases/returns", label: "Returns", icon: RotateCcw },
      { id: "purchases/suppliers", label: "Suppliers", icon: Building2 },
    ]
  },
  {
    id: "customers-group", label: "Customers", icon: Users, permission: "customers",
    children: [
      { id: "customers", label: "All Customers", icon: Users },
      { id: "customers/dues", label: "Customer Dues", icon: Wallet },
      { id: "customers/history", label: "Purchase History", icon: History },
      { id: "customers/loyalty", label: "Loyalty Program", icon: Award },
    ]
  },
  {
    id: "recommendations", label: "Crop Advisory", icon: Bug, permission: "products",
    children: [
      { id: "recommendations/diagnosis", label: "Pest Diagnosis", icon: Bug },
      { id: "recommendations/dosage", label: "Dosage Guide", icon: Beaker },
      { id: "recommendations/print", label: "Print Slip", icon: Printer },
    ]
  },
  {
    id: "reports-group", label: "Reports", icon: BarChart3, permission: "reports",
    children: [
      { id: "reports", label: "Sales Report", icon: BarChart3 },
      { id: "reports/profit", label: "Profit Analysis", icon: DollarSign },
      { id: "reports/margin", label: "Margin Analysis", icon: PieChart },
      { id: "reports/inventory", label: "Inventory Report", icon: Package },
    ]
  },
  {
    id: "staff", label: "Staff Hub", icon: Shield, permission: "users",
    single: true,
    children: [
      { id: "staff", label: "Staff Hub", icon: Shield },
    ]
  },
  {
    id: "settings-group", label: "Settings", icon: Settings, permission: "settings",
    children: [
      { id: "shops", label: "My Shop", icon: Building2 },
      { id: "settings", label: "App Settings", icon: Settings },
    ]
  },
];

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, sidebarCollapsed } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => {
    const path = location.pathname.replace("/", "");
    const found = menuGroups.find(g => g.children?.some(c => c.id === path || path.startsWith(c.id)));
    return found ? { [found.id]: true } : { dashboard: true };
  });

  const visible = currentUser
    ? menuGroups.filter(g => actions.hasPermission(g.permission))
    : [];

  const go = (id) => { navigate(`/${id}`); setIsMobileOpen(false); };

  const toggleGroup = (groupId) => {
    if (sidebarCollapsed) return;
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isChildActive = (childId) => {
    const path = location.pathname.replace(/^\//, "");
    return path === childId;
  };

  const isGroupActive = (group) => {
    return group.children?.some(c => isChildActive(c.id));
  };

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

  const Avatar = ({ size = "w-9 h-9" }) =>
    currentUser?.avatar ? (
      <img src={currentUser.avatar} alt={currentUser.name}
        className={`${size} rounded-lg object-cover`} loading="eager" decoding="sync" />
    ) : (
      <div className={`${size} rounded-lg flex items-center justify-center text-white font-semibold text-xs`}
        style={{ background: "#3b82f6" }}>{initial}</div>
    );

  const LogoBlock = () => (
    <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-white">
      {state.settings?.shopLogo ? (
        <img src={state.settings.shopLogo} alt={state.settings.shopName}
          className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
          <Sprout className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 bg-white">
            {state.settings?.shopLogo ? (
              <img src={state.settings.shopLogo} alt={state.settings.shopName} className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-white text-sm tracking-tight leading-none block">{state.settings?.shopName || "AgroCare"}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">POS</span>
          </div>
        </div>
        <button onClick={() => setIsMobileOpen(v => !v)} className="p-2 rounded-md text-slate-400 hover:text-white transition-colors">
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 h-screen flex flex-col transition-all duration-200",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-[64px]" : "lg:w-60", "w-60"
      ].join(" ")}
        style={{ background: "#1e293b" }}>

        {/* Header / Logo */}
        <div className="h-14 flex items-center justify-between px-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <LogoBlock />
            <div className={["overflow-hidden transition-all duration-200", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"].join(" ")}>
              <p className="font-semibold text-white text-sm whitespace-nowrap tracking-tight leading-none">{state.settings?.shopName || "AgroCare POS"}</p>
              <p className="text-[10px] whitespace-nowrap mt-0.5 text-slate-500 uppercase tracking-wider">Agri Management</p>
            </div>
          </div>
          <button onClick={actions.toggleSidebar} className="hidden lg:flex p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User card */}
        <div className={["px-3 py-2.5 flex-shrink-0", sidebarCollapsed ? "lg:px-2" : ""].join(" ")} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center"><Avatar size="w-8 h-8" /></div>
          ) : (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <Avatar size="w-8 h-8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate leading-none">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{userRole?.label || "User"}</p>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2.5 pb-1.5 pt-1 text-slate-500">Navigation</p>
          )}

          {visible.map((group) => {
            const GIcon = group.icon;
            const groupActive = isGroupActive(group);
            const isOpen = openGroups[group.id];

            // Single-item group — render as a flat button, no dropdown
            if (group.single) {
              const childId = group.children[0].id;
              const active = isChildActive(childId) || location.pathname.startsWith(`/${childId}`);
              if (sidebarCollapsed) {
                return (
                  <button key={group.id} onClick={() => go(childId)} title={group.label}
                    className="w-full flex items-center justify-center p-2 rounded-md text-sm transition-colors duration-150"
                    style={active ? { background: "rgba(37,99,235,0.15)", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>
                    <GIcon style={{ width: "18px", height: "18px", color: active ? "#60a5fa" : undefined }} />
                  </button>
                );
              }
              return (
                <button key={group.id} onClick={() => go(childId)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  style={active ? { background: "rgba(37,99,235,0.1)", color: "rgba(255,255,255,0.9)" } : { color: "rgba(255,255,255,0.45)" }}>
                  <GIcon className="flex-shrink-0" style={{ width: "16px", height: "16px", color: active ? "#60a5fa" : undefined }} />
                  <span className="flex-1 text-left whitespace-nowrap">{group.label}</span>
                </button>
              );
            }

            if (sidebarCollapsed) {
              return (
                <button key={group.id} onClick={() => go(group.children[0].id)} title={group.label}
                  className="w-full flex items-center justify-center p-2 rounded-md text-sm transition-colors duration-150"
                  style={groupActive ? {
                    background: "rgba(37,99,235,0.15)", color: "white"
                  } : { color: "rgba(255,255,255,0.4)" }}>
                  <GIcon style={{ width: "18px", height: "18px", color: groupActive ? "#60a5fa" : undefined }} />
                </button>
              );
            }

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Group header */}
                <button onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-150 group"
                  style={groupActive ? {
                    background: "rgba(37,99,235,0.1)", color: "rgba(255,255,255,0.9)"
                  } : { color: "rgba(255,255,255,0.45)" }}>
                  <GIcon className="flex-shrink-0" style={{ width: "16px", height: "16px", color: groupActive ? "#60a5fa" : undefined }} />
                  <span className="flex-1 text-left whitespace-nowrap">{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "rgba(255,255,255,0.25)" }} />
                </button>

                {/* Children */}
                <div className={`overflow-hidden transition-all duration-150 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pl-4 space-y-0.5 py-0.5">
                    {group.children.map((child) => {
                      const CIcon = child.icon;
                      const active = isChildActive(child.id);
                      return (
                        <button key={child.id} onClick={() => go(child.id)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 relative"
                          style={active ? {
                            background: "rgba(37,99,235,0.15)", color: "white"
                          } : { color: "rgba(255,255,255,0.35)" }}>
                          {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-r bg-blue-400" />}
                          <CIcon className="flex-shrink-0" style={{ width: "14px", height: "14px", color: active ? "#60a5fa" : undefined }} />
                          <span className="whitespace-nowrap">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="my-2 mx-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

          <button onClick={logout} title={sidebarCollapsed ? "Logout" : ""}
            className={[
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-150 group",
              "text-slate-500 hover:text-red-400 hover:bg-red-500/10",
              sidebarCollapsed && "lg:justify-center lg:px-2"
            ].join(" ")}>
            <LogOut className="w-4 h-4 flex-shrink-0 text-slate-600 group-hover:text-red-400 transition-colors" />
            <span className={["whitespace-nowrap transition-all duration-200", sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"].join(" ")}>Sign Out</span>
          </button>
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-center text-slate-600 uppercase tracking-wider">
              v3.0 · {state.settings?.shopName || "AgroCare"}
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
