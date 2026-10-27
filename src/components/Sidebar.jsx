import React, { useState } from "react";
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

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, settings } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = React.useRef(null);

  const [openGroups, setOpenGroups] = useState(() => {
    const path = location.pathname.replace("/","");
    const found = MENU_GROUPS.find(g => g.children?.some(c => c.id===path || path.startsWith(c.id)));
    return found ? {[found.id]:true} : {dashboard:true};
  });

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
  
  const toggle = id => setOpenGroups(p => ({...p,[id]:!p[id]}));
  const isActive = id => location.pathname.replace(/^\//,"") === id;
  const isGroupActive = g => g.children?.some(c => isActive(c.id));

  const handleLogout = () => actions.showToast({
    message:"Are you sure you want to logout?",type:"warning",position:"center",isConfirm:true,
    onConfirm:() => { 
      actions.logout(navigate);
    },
  });

  const Nav = () => (
    <div className="app-sidebar__surface flex flex-col h-full">
      <div className="app-sidebar__brand h-16 flex items-center gap-3 px-4 flex-shrink-0">
        <ShopLogo logo={settings?.brandLogo || settings?.shopLogo} name={settings?.brandName || settings?.shopName} size="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight">{settings?.brandName || settings?.shopName || "AgriNest"}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{settings?.brandTagline || "Shop workspace"}</p>
        </div>
      </div>
      <nav className="app-sidebar__nav flex-1 overflow-y-auto px-3 py-3" ref={navRef} aria-label="Main navigation">
        {visible.map(group => {
          const G = group.icon;
          const ga = isGroupActive(group);
          const open = openGroups[group.id];
          const sl = SECTION_LABELS[group.id];
          return (
            <div key={group.id}>
              {sl && <p className="app-sidebar__section-label px-3 pt-5 pb-2">{sl}</p>}
              {group.single ? (() => {
                const cid = group.children[0].id;
                const a = isActive(cid) || location.pathname.startsWith(`/${cid}`);
                return (
                  <button key={group.id} onClick={() => go(cid)}
                    className={`app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${a ? "is-active" : ""}`}>
                    <G className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                  </button>
                );
              })() : (
                <div className="space-y-0.5">
                  <button onClick={() => toggle(group.id)}
                    className={`app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${ga ? "is-active" : ""}`}
                    aria-expanded={Boolean(open)}>
                    <G className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${open?"max-h-96 opacity-100":"max-h-0 opacity-0"}`}>
                    <div className="app-sidebar__subnav ml-5 pl-3 space-y-0.5 py-1">
                      {group.children.filter(child => child.id !== "staff/roles" || currentUser?.role === "admin").map(child => {
                        const CI = child.icon;
                        const a = isActive(child.id);
                        return (
                          <button key={child.id} onClick={() => go(child.id)}
                            className={`app-nav-subitem w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium ${a ? "is-active" : ""}`}
                            aria-current={a ? "page" : undefined}>
                            <CI className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{child.label}</span>
                            {a && <span className="app-nav-subitem__marker ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" />}
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
        <div className="app-sidebar__logout mt-4 pt-3">
          <button onClick={handleLogout}
            className="app-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium">
            <LogOut className="app-nav-item__icon w-[18px] h-[18px] flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>
      <div className="app-sidebar__footer px-4 py-3 flex-shrink-0">
        <p className="text-[11px] truncate">{settings?.shopName || "AgriNest shop"}</p>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:flex-shrink-0 h-screen sticky top-0">
      <Nav />
    </aside>
  );
};

export default Sidebar;