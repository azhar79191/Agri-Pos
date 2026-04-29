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
    id: "staff", label: "Staff", icon: Shield, permission: "users",
    children: [
      { id: "users", label: "User Management", icon: Shield },
      { id: "staff/sales-reps", label: "Sales Reps", icon: UserCheck },
      { id: "staff/audit-logs", label: "Audit Logs", icon: FileText },
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
  const { currentUser, sidebarCollapsed, themeColor = "#10b981" } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => {
    const path = location.pathname.replace("/", "");
    const found = menuGroups.find(g => g.children?.some(c => c.id === path || path.startsWith(c.id)));
    return found ? { [found.id]: true } : { dashboard: true };
  });

  const tc = themeColor;
  const tcAlpha = (a) => `${tc}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

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

  const Avatar = ({ size = "w-10 h-10" }) =>
    currentUser?.avatar ? (
      <img src={currentUser.avatar} alt={currentUser.name}
        className={`${size} rounded-xl object-cover shadow-lg`} loading="eager" decoding="sync" />
    ) : (
      <div className={`${size} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}
        style={{ background: `linear-gradient(135deg, ${tc}, ${tcAlpha(0.7)})` }}>{initial}</div>
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
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "linear-gradient(90deg, #052e1c 0%, #063d26 100%)", borderBottom: `1px solid ${tcAlpha(0.2)}`, boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-md">
            {state.settings?.shopLogo ? (
              <img src={state.settings.shopLogo} alt={state.settings.shopName} className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tc}, ${tcAlpha(0.7)})` }}>
                <Sprout className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight leading-none block">{state.settings?.shopName || "AgroCare"}</span>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: tcAlpha(0.7) }}>POS</span>
          </div>
        </div>
        <button onClick={() => setIsMobileOpen(v => !v)} className="p-2 rounded-lg transition-all" style={{ color: tcAlpha(0.7) }}>
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" style={{ background: "rgba(2,14,8,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 sidebar-premium noise",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64", "w-64"
      ].join(" ")}>

        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0" style={{ borderBottom: `1px solid ${tcAlpha(0.12)}` }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <LogoBlock />
            <div className={["overflow-hidden transition-all duration-300", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"].join(" ")}>
              <p className="font-bold text-white text-sm whitespace-nowrap tracking-tight leading-none">{state.settings?.shopName || "AgroCare POS"}</p>
              <p className="text-[10px] whitespace-nowrap mt-0.5 tracking-widest uppercase" style={{ color: tcAlpha(0.5) }}>Agri Management</p>
            </div>
          </div>
          <button onClick={actions.toggleSidebar} className="hidden lg:flex p-1.5 rounded-lg transition-all duration-200 flex-shrink-0" style={{ color: tcAlpha(0.5) }}>
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User card */}
        <div className={["px-3 py-3 flex-shrink-0", sidebarCollapsed ? "lg:px-2" : ""].join(" ")} style={{ borderBottom: `1px solid ${tcAlpha(0.08)}` }}>
          {sidebarCollapsed ? (
            <div className="hidden lg:flex justify-center"><Avatar size="w-9 h-9" /></div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${tcAlpha(0.12)} 0%, ${tcAlpha(0.06)} 100%)`, border: `1px solid ${tcAlpha(0.18)}` }}>
              <Avatar size="w-9 h-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-none">{currentUser?.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1.5 ${roleColor}`}>{userRole?.label || "User"}</span>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: tc, boxShadow: `0 0 6px ${tc}cc` }} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {!sidebarCollapsed && (
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 pb-2 pt-1" style={{ color: tcAlpha(0.4) }}>Navigation</p>
          )}

          {visible.map((group) => {
            const GIcon = group.icon;
            const groupActive = isGroupActive(group);
            const isOpen = openGroups[group.id];

            if (sidebarCollapsed) {
              // Collapsed: show only parent icon, click goes to first child
              return (
                <button key={group.id} onClick={() => go(group.children[0].id)} title={group.label}
                  className="w-full flex items-center justify-center px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border"
                  style={groupActive ? {
                    background: `linear-gradient(135deg, ${tcAlpha(0.22)}, ${tcAlpha(0.12)})`,
                    border: `1px solid ${tcAlpha(0.35)}`, boxShadow: `0 2px 16px ${tcAlpha(0.15)}`, color: "white"
                  } : { border: "1px solid transparent", color: "rgba(255,255,255,0.35)" }}>
                  <GIcon style={{ width: "18px", height: "18px", color: groupActive ? tc : undefined }} />
                </button>
              );
            }

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Group header */}
                <button onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group border"
                  style={groupActive ? {
                    background: `linear-gradient(135deg, ${tcAlpha(0.12)}, ${tcAlpha(0.06)})`,
                    border: `1px solid ${tcAlpha(0.2)}`, color: "rgba(255,255,255,0.9)"
                  } : { border: "1px solid transparent", color: "rgba(255,255,255,0.4)" }}>
                  <GIcon className="flex-shrink-0" style={{ width: "17px", height: "17px", color: groupActive ? tc : undefined }} />
                  <span className="flex-1 text-left whitespace-nowrap font-medium">{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: tcAlpha(0.4) }} />
                </button>

                {/* Children */}
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pl-4 space-y-0.5 py-0.5">
                    {group.children.map((child) => {
                      const CIcon = child.icon;
                      const active = isChildActive(child.id);
                      return (
                        <button key={child.id} onClick={() => go(child.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border relative"
                          style={active ? {
                            background: `linear-gradient(135deg, ${tcAlpha(0.22)}, ${tcAlpha(0.14)})`,
                            border: `1px solid ${tcAlpha(0.3)}`,
                            boxShadow: `0 1px 8px ${tcAlpha(0.12)}`, color: "white"
                          } : { border: "1px solid transparent", color: "rgba(255,255,255,0.35)" }}>
                          {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full" style={{ background: tc }} />}
                          <CIcon className="flex-shrink-0" style={{ width: "14px", height: "14px", color: active ? tc : undefined }} />
                          <span className="whitespace-nowrap">{child.label}</span>
                          {active && <span className="ml-auto w-1 h-1 rounded-full flex-shrink-0" style={{ background: tc, boxShadow: `0 0 4px ${tc}` }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="my-3 mx-2" style={{ borderTop: `1px solid ${tcAlpha(0.08)}` }} />

          <button onClick={logout} title={sidebarCollapsed ? "Logout" : ""}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
              "text-emerald-100/30 hover:text-red-400 hover:bg-red-500/8 hover:border-red-500/15",
              sidebarCollapsed && "lg:justify-center lg:px-2"
            ].join(" ")}>
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-emerald-700/50 group-hover:text-red-400 transition-colors duration-200" />
            <span className={["whitespace-nowrap transition-all duration-300", sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"].join(" ")}>Sign Out</span>
          </button>
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${tcAlpha(0.08)}` }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: tcAlpha(0.4) }} />
              <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: tcAlpha(0.5) }}>
                v3.0 · {state.settings?.shopName || "AgroCare"}
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
