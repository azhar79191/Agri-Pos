import React, { useEffect } from "react";
import { Shield, Check, X, Loader2, Zap } from "lucide-react";
import { useUsers } from "../../../hooks/useUsers";
import { useApp } from "../../../context/AppContext";
import { ROLE_CFG, ALL_PERMISSIONS, PERM_KEYS, BASIC_PERMS } from "./staffConfig";

const ROLE_PRESETS = {
  admin:   PERM_KEYS,
  manager: PERM_KEYS.filter(k => !k.startsWith("users:") && !k.startsWith("settings:")),
  cashier: BASIC_PERMS,
};

const GROUPS = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

const PermsPanel = () => {
  const { actions } = useApp();
  const { users, loading, fetchUsers, editPermissions, grantAll, revokeAll } = useUsers();

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  const handleToggle = async (uid, key) => {
    const u = users.find(x => x._id === uid); if (!u) return;
    const cur = u.permissions || [];
    try { await editPermissions(uid, cur.includes(key) ? cur.filter(p => p !== key) : [...cur, key]); }
    catch { actions.showToast({ message: "Failed to update permission", type: "error" }); }
  };

  const applyPreset = async (uid, role) => {
    try {
      if (role === 'admin') {
        await grantAll(uid);
      } else {
        await editPermissions(uid, ROLE_PRESETS[role] || BASIC_PERMS);
      }
      actions.showToast({ message: `${role} preset applied`, type: "success" });
    }
    catch { actions.showToast({ message: "Failed to apply preset", type: "error" }); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <p className="text-sm text-slate-400">Loading permissions...</p>
    </div>
  );

  if (users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 opacity-40" />
      </div>
      <p className="text-sm font-medium">No users to manage</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800">
        <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
        <p className="text-xs text-violet-700 dark:text-violet-300">
          Click any permission pill to toggle it instantly. Use the role preset buttons to apply a standard permission set in one click.
        </p>
      </div>

      {users.map(user => {
        const rc = ROLE_CFG[user.role] || ROLE_CFG.cashier;
        const perms = user.permissions || [];
        const pct = Math.round((perms.length / PERM_KEYS.length) * 100);

        return (
          <div key={user._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* User header with gradient */}
            <div className={`bg-gradient-to-r ${rc.grad} px-5 py-4`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-base">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/70">{rc.label}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-xs text-white/70">{perms.length}/{PERM_KEYS.length} perms ({pct}%)</span>
                    </div>
                  </div>
                </div>

                {/* Preset buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  {["admin", "manager", "cashier"].map(role => (
                    <button key={role} onClick={() => applyPreset(user._id, role)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all">
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white/60 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Permission groups */}
            <div className="p-5 space-y-5">
              {GROUPS.map(group => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{group}</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] text-slate-400">
                      {ALL_PERMISSIONS.filter(p => p.group === group && perms.includes(p.key)).length}/{ALL_PERMISSIONS.filter(p => p.group === group).length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => {
                      const has = perms.includes(perm.key);
                      return (
                        <button key={perm.key} onClick={() => handleToggle(user._id, perm.key)}
                          className={["inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 hover:scale-105 active:scale-95",
                            has
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-emerald-900/20"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:text-violet-700 dark:hover:text-violet-400",
                          ].join(" ")}>
                          <div className={["w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all", has ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"].join(" ")}>
                            {has
                              ? <Check className="w-2 h-2 text-white" />
                              : <X className="w-2 h-2 text-slate-500 dark:text-slate-400" />}
                          </div>
                          {perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermsPanel;
