import React from "react";
import { Users } from "lucide-react";
import { STAFF_NAV } from "./staffConfig";

const StaffNav = ({ active, onChange, userCount }) => (
  <aside className="w-full lg:w-64 shrink-0">
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Staff Hub</p>
            <p className="text-xs text-purple-200">{userCount} team member{userCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <nav className="p-2">
        {STAFF_NAV.map(group => (
          <div key={group.group} className="mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-2">
              {group.group}
            </p>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button key={item.id} onClick={() => onChange(item.id)}
                  className={["w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group mb-0.5",
                    isActive
                      ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  ].join(" ")}>
                  <div className={["w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    isActive ? "bg-violet-100 dark:bg-violet-900/40" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700",
                  ].join(" ")}>
                    <Icon className={["w-3.5 h-3.5", isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-500 dark:text-slate-400"].join(" ")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={["text-xs font-semibold truncate", isActive ? "text-violet-700 dark:text-violet-400" : ""].join(" ")}>{item.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.desc}</p>
                  </div>
                  {isActive && <div className="w-1 h-5 rounded-full bg-violet-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  </aside>
);

export default StaffNav;
