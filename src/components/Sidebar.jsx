import { companyName } from "../utils/company";
import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MENU_GROUPS } from "../constants/menuGroups";
import ShopLogo from "./ui/ShopLogo";

const SECTION_LABELS = {
  sales:"Shop operations",purchases:"Supply",
  "customers-group":"Farmer relationships",recommendations:"Crop support",
  "reports-group":"Insights",staff:"Team", "settings-group":"Shop setup",
};

const matchRoute = pathname => MENU_GROUPS.flatMap(group => group.children.map(child => ({ group, child })))
  .filter(({ child }) => pathname === `/${child.id}` || pathname.startsWith(`/${child.id}/`))
  .sort((a, b) => b.child.id.length - a.child.id.length)[0];
const routeGroup = pathname => { const match = matchRoute(pathname); return match && !match.group.single ? match.group.id : undefined; };

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, settings } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = React.useRef(null);

  const [openGroup, setOpenGroup] = useState(() => routeGroup(location.pathname));
  useEffect(() => { setOpenGroup(routeGroup(location.pathname)); }, [location.pathname]);

  const visible = currentUser ? MENU_GROUPS.filter(g => actions.hasPermission(g.permission)) : [];

  const go = id => {
    // Store current scroll position before navigation
    const currentScroll = navRef.current?.scrollTop || 0;
    navigate(`/${id}`);
    // Restore scroll position after navigation
    requestAnimationFrame(() => {
      if (navRef.current) {
        navRef.current.scrollTop = currentScroll;
      }
    });
  };

  const toggle = id => setOpenGroup(previous => previous === id ? null : id);
  const isActive = id => matchRoute(location.pathname)?.child.id === id;
  const isGroupActive = g => routeGroup(location.pathname) === g.id;

  const handleLogout = () => actions.showToast({
    message:"Are you sure you want to logout?",type:"warning",position:"center",isConfirm:true,
    onConfirm:() => {
      actions.logout(navigate);
    },
  });

  const nav = (
    <div className="app-sidebar__surface flex flex-col h-full">
      <div role="group" aria-label="Company identity" className="app-sidebar__brand h-16 flex items-center gap-3 px-4 flex-shrink-0">
        <ShopLogo logo={settings?.brandLogo || settings?.shopLogo} name={settings?.brandName || settings?.shopName} size="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight">{companyName(settings)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{settings?.brandTagline || "Shop workspace"}</p>
        </div>
      </div>
      <nav className="app-sidebar__nav flex-1 overflow-y-auto px-3 py-3" ref={navRef} aria-label="Main navigation">
        {visible.map(group => {
          const G = group.icon;
          const ga = isGroupActive(group);
          const open = openGroup === group.id;
          const sl = SECTION_LABELS[group.id];
          return (
            <div key={group.id}>
              {sl && <p className="app-sidebar__section-label px-3 pt-5 pb-2">{sl}</p>}
              {group.single ? (() => {
                const cid = group.children[0].id;
                const a = isActive(cid) || location.pathname.startsWith(`/${cid}`);
                return (
                  <button key={group.id} aria-current={a ? "page" : undefined} onClick={() => { setOpenGroup(null); go(cid); }}
                    className={`app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${a ? "is-active" : ""}`}>
                    <G aria-hidden="true" strokeWidth={1.75} className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                  </button>
                );
              })() : (
                <div className="space-y-0.5">
                  <button onClick={() => toggle(group.id)}
                    className={`app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${ga ? "is-active" : ""}`}
                    aria-expanded={Boolean(open)} aria-controls={`nav-group-${group.id}`}>
                    <G aria-hidden="true" strokeWidth={1.75} className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div id={`nav-group-${group.id}`} inert={!open} aria-hidden={!open} className={`app-nav-collapse ${open ? "is-open" : ""}`}>
                    <div className="min-h-0 overflow-hidden">
                    <div className="app-sidebar__subnav ml-5 pl-3 space-y-0.5 py-1">
                      {group.children.filter(child => child.id !== "staff/roles" || currentUser?.role === "admin").map(child => {
                        const CI = child.icon;
                        const a = isActive(child.id);
                        return (
                          <button key={child.id} onClick={() => go(child.id)}
                            className={`app-nav-subitem w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium ${a ? "is-active" : ""}`}
                            aria-current={a ? "page" : undefined}>
                            <CI aria-hidden="true" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{child.label}</span>
                            {a && <span className="app-nav-subitem__marker ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="app-sidebar__logout mt-4 pt-3">
          <button onClick={handleLogout}
            className="app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium">
            <LogOut className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>
      <div className="app-sidebar__footer px-4 py-3 flex-shrink-0">
        <p className="text-[11px] truncate">{companyName(settings)}</p>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:flex-shrink-0 h-screen sticky top-0">
      {nav}
    </aside>
  );
};

export default Sidebar;
