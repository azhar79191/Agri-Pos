import React, { useState } from "react";
import { ChevronDown, LogOut, Menu, X, Download, Share } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roles } from "../data/users";
import { MENU_GROUPS } from "../constants/menuGroups";
import ShopLogo from "./ui/ShopLogo";
import usePWAInstall from "../hooks/usePWAInstall";

/** Icon background colors per group — matches the reference design */
const GROUP_ICON_COLORS = {
  dashboard:        { bg: "bg-blue-100",   icon: "text-blue-600" },
  sales:            { bg: "bg-emerald-100",icon: "text-emerald-600" },
  inventory:        { bg: "bg-orange-100", icon: "text-orange-600" },
  purchases:        { bg: "bg-violet-100", icon: "text-violet-600" },
  "customers-group":{ bg: "bg-cyan-100",   icon: "text-cyan-600" },
  recommendations:  { bg: "bg-green-100",  icon: "text-green-600" },
  "reports-group":  { bg: "bg-purple-100", icon: "text-purple-600" },
  staff:            { bg: "bg-indigo-100", icon: "text-indigo-600" },
  "settings-group": { bg: "bg-slate-100",  icon: "text-slate-600" },
};

/** Category section labels shown above groups */
const GROUP_SECTION_LABELS = {
  sales:            "OPERATIONS",
  purchases:        "SUPPLY CHAIN",
  "customers-group":"CUSTOMERS",
  recommendations:  "ADVISORY",
  "reports-group":  "REPORTS",
  staff:            "ADMINISTRATION",
};

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, settings } = state;
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups]     = useState(() => {
    const path  = location.pathname.replace("/", "");
    const found = MENU_GROUPS.find((g) => g.children?.some((c) => c.id === path || path.startsWith(c.id)));
    return found ? { [found.id]: true } : { dashboard: true };
  });

  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [showMobileInstallTip, setShowMobileInstallTip] = useState(false);
  const showInstallBtn = !isInstalled;

  const visible = currentUser ? MENU_GROUPS.filter((g) => actions.hasPermission(g.permission)) : [];

  const go = (id) => { navigate(`/${id}`); setIsMobileOpen(false); };

  const toggleGroup = (groupId) => setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const isChildActive = (childId) => location.pathname.replace(/^\//, "") === childId;
  const isGroupActive = (group)   => group.children?.some((c) => isChildActive(c.id));

  const handleLogout = () => {
    actions.showToast({
      message: "Are you sure you want to logout?",
      type: "warning", position: "center", isConfirm: true,
      onConfirm: () => { actions.logout(); navigate("/"); },
    });
  };

  const rawRole = typeof currentUser?.role === "object" ? currentUser.role?.name : currentUser?.role;
  const userRole = rawRole ? roles[(rawRole || "").toLowerCase()] : null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60">

      {/* Logo / Brand */}
      <div className="h-14 flex items-center gap-3 px-4 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
        <ShopLogo logo={settings?.shopLogo} name={settings?.shopName} size="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm truncate leading-none">
            {settings?.shopName || "AgriNest POS"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Agri Management</p>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 mt-5 px-2">
        {visible.map((group, idx) => {
          const GIcon      = group.icon;
          const groupActive = isGroupActive(group);
          const isOpen     = openGroups[group.id];
          const colors     = GROUP_ICON_COLORS[group.id] || { bg: "bg-slate-100", icon: "text-slate-600" };
          const sectionLabel = GROUP_SECTION_LABELS[group.id];

          return (
            <div key={group.id}>
              {/* Section label */}
              {sectionLabel && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1.5">
                  {sectionLabel}
                </p>
              )}

              {/* Single-item group — flat nav item */}
              {group.single ? (() => {
                const childId = group.children[0].id;
                const active  = isChildActive(childId) || location.pathname.startsWith(`/${childId}`);
                return (
                  <button
                    key={group.id}
                    onClick={() => go(childId)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                      active
                        ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-violet-600" />}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-violet-100 dark:bg-violet-900/40" : colors.bg + " dark:bg-slate-800"}`}>
                      <GIcon className={`w-4 h-4 ${active ? "text-violet-600 dark:text-violet-400" : colors.icon}`} />
                    </span>
                    <span className="flex-1 text-left">{group.label}</span>
                  </button>
                );
              })() : (
                /* Group with children */
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                      groupActive
                        ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {groupActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-violet-600" />}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${groupActive ? "bg-violet-100 dark:bg-violet-900/40" : colors.bg + " dark:bg-slate-800"}`}>
                      <GIcon className={`w-4 h-4 ${groupActive ? "text-violet-600 dark:text-violet-400" : colors.icon}`} />
                    </span>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 flex-shrink-0 ${isOpen ? "rotate-180" : ""} ${groupActive ? "text-violet-500" : "text-slate-400"}`} />
                  </button>

                  {/* Children */}
                  <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="ml-5 pl-4 border-l border-slate-100 dark:border-slate-800 space-y-0.5 py-0.5">
                      {group.children.map((child) => {
                        const CIcon  = child.icon;
                        const active = isChildActive(child.id);
                        return (
                          <button
                            key={child.id}
                            onClick={() => go(child.id)}
                            className={[
                              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                              active
                                ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white",
                            ].join(" ")}
                          >
                            <CIcon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}`} />
                            <span className="whitespace-nowrap">{child.label}</span>
                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Divider + Logout */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 group"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 flex items-center justify-center flex-shrink-0 transition-colors">
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
            </span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-2.5 flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-center text-slate-400 uppercase tracking-wider">
          v3.0 · {settings?.shopName || "AgriNest"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <ShopLogo logo={settings?.shopLogo} name={settings?.shopName} size="w-7 h-7" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">{settings?.shopName || "AgriNest"}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* PWA install button — shown before the hamburger menu */}
          {showInstallBtn && (
            <button
              onClick={() => canInstall ? install() : setShowMobileInstallTip(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold transition-colors"
              title="Install AgriNest App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
          <button onClick={() => setIsMobileOpen((v) => !v)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside className={[
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>
        <SidebarContent />
      </aside>

      {/* Mobile install tip modal — for iOS / non-Chrome */}
      {showMobileInstallTip && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileInstallTip(false)}
        >
          <div
            className="w-full bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Install AgriNest</p>
                <p className="text-xs text-slate-400">Add to your home screen</p>
              </div>
            </div>

            {isIOS ? (
              <ol className="space-y-3">
                {[
                  <><Share className="inline w-4 h-4 text-blue-500 mx-0.5 -mt-0.5" /> Tap the <strong>Share</strong> button at the bottom of Safari</>,
                  <>Scroll and tap <strong>"Add to Home Screen"</strong></>,
                  <>Tap <strong>"Add"</strong> to confirm</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tap the browser menu <strong>(⋮)</strong> and select <strong>"Add to Home Screen"</strong> or <strong>"Install AgriNest"</strong>.
              </p>
            )}

            <button
              onClick={() => setShowMobileInstallTip(false)}
              className="mt-5 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
