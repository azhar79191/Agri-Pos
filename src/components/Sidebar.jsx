import React, { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MENU_GROUPS } from "../constants/menuGroups";
import ShopLogo from "./ui/ShopLogo";

const ICON_COLORS = {
  dashboard:{"bg":"bg-blue-100","icon":"text-blue-600"},
  sales:{"bg":"bg-emerald-100","icon":"text-emerald-600"},
  inventory:{"bg":"bg-orange-100","icon":"text-orange-600"},
  purchases:{"bg":"bg-violet-100","icon":"text-violet-600"},
  "customers-group":{"bg":"bg-cyan-100","icon":"text-cyan-600"},
  recommendations:{"bg":"bg-green-100","icon":"text-green-600"},
  "reports-group":{"bg":"bg-purple-100","icon":"text-purple-600"},
  staff:{"bg":"bg-indigo-100","icon":"text-indigo-600"},
  "settings-group":{"bg":"bg-slate-100","icon":"text-slate-600"},
};

const SECTION_LABELS = {
  sales:"OPERATIONS",purchases:"SUPPLY CHAIN",
  "customers-group":"CUSTOMERS",recommendations:"ADVISORY",
  "reports-group":"REPORTS",staff:"ADMINISTRATION",
};

const Sidebar = () => {
  const { state, actions } = useApp();
  const { currentUser, settings } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() => {
    const path = location.pathname.replace("/","");
    const found = MENU_GROUPS.find(g => g.children?.some(c => c.id===path || path.startsWith(c.id)));
    return found ? {[found.id]:true} : {dashboard:true};
  });

  const visible = currentUser ? MENU_GROUPS.filter(g => actions.hasPermission(g.permission)) : [];
  const go = id => navigate(`/${id}`);
  const toggle = id => setOpenGroups(p => ({...p,[id]:!p[id]}));
  const isActive = id => location.pathname.replace(/^\//,"") === id;
  const isGroupActive = g => g.children?.some(c => isActive(c.id));

  const handleLogout = () => actions.showToast({
    message:"Are you sure you want to logout?",type:"warning",position:"center",isConfirm:true,
    onConfirm:() => { actions.logout(); navigate("/"); },
  });

  const Nav = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60">
      <div className="h-14 flex items-center gap-3 px-4 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
        <ShopLogo logo={settings?.shopLogo} name={settings?.shopName} size="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm truncate leading-none">{settings?.shopName || "AgriNest POS"}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Agri Management</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 mt-5 px-2">
        {visible.map(group => {
          const G = group.icon;
          const ga = isGroupActive(group);
          const open = openGroups[group.id];
          const c = ICON_COLORS[group.id] || {bg:"bg-slate-100",icon:"text-slate-600"};
          const sl = SECTION_LABELS[group.id];
          return (
            <div key={group.id}>
              {sl && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1.5">{sl}</p>}
              {group.single ? (() => {
                const cid = group.children[0].id;
                const a = isActive(cid) || location.pathname.startsWith(`/${cid}`);
                return (
                  <button key={group.id} onClick={() => go(cid)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${a?"bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400":"text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                    {a && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-violet-600" />}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a?"bg-violet-100 dark:bg-violet-900/40":c.bg+" dark:bg-slate-800"}`}>
                      <G className={`w-4 h-4 ${a?"text-violet-600 dark:text-violet-400":c.icon}`} />
                    </span>
                    <span className="flex-1 text-left">{group.label}</span>
                  </button>
                );
              })() : (
                <div className="space-y-0.5">
                  <button onClick={() => toggle(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${ga?"bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400":"text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                    {ga && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-violet-600" />}
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ga?"bg-violet-100 dark:bg-violet-900/40":c.bg+" dark:bg-slate-800"}`}>
                      <G className={`w-4 h-4 ${ga?"text-violet-600 dark:text-violet-400":c.icon}`} />
                    </span>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${open?"rotate-180":""} ${ga?"text-violet-500":"text-slate-400"}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${open?"max-h-96 opacity-100":"max-h-0 opacity-0"}`}>
                    <div className="ml-5 pl-4 border-l border-slate-100 dark:border-slate-800 space-y-0.5 py-0.5">
                      {group.children.map(child => {
                        const CI = child.icon;
                        const a = isActive(child.id);
                        return (
                          <button key={child.id} onClick={() => go(child.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${a?"bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400":"text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                            <CI className={`w-3.5 h-3.5 flex-shrink-0 ${a?"text-violet-600 dark:text-violet-400":"text-slate-400"}`} />
                            <span className="whitespace-nowrap">{child.label}</span>
                            {a && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
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
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all group">
            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 flex items-center justify-center flex-shrink-0 transition-colors">
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
            </span>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="px-4 py-2.5 flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-center text-slate-400 uppercase tracking-wider">v3.0 · {settings?.shopName || "AgriNest"}</p>
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