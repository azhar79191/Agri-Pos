import React, { useEffect, useState } from "react";
import { Users, UserCheck, Shield, TrendingUp, Award, Loader2, BarChart3, Crown, Medal } from "lucide-react";
import { useUsers } from "../../../hooks/useUsers";
import { getSalesReps } from "../../../api/salesRepsApi";
import { formatCurrency } from "../../../utils/helpers";
import { useApp } from "../../../context/AppContext";
import { ROLE_CFG } from "./staffConfig";

const KpiCard = ({ icon: Icon, label, value, sub, gradient, iconBg, iconText }) => (
  <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 overflow-hidden border border-white/20`}>
    {/* Decorative circle */}
    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
    <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/5" />
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className={`w-5 h-5 ${iconText}`} />
      </div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      <p className="text-xs font-semibold text-white/80 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-white/60 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const MEDAL_CFG = [
  { icon: Crown,  bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-800" },
  { icon: Medal,  bg: "bg-slate-100 dark:bg-slate-800",     text: "text-slate-500 dark:text-slate-400",  border: "border-slate-200 dark:border-slate-700" },
  { icon: Medal,  bg: "bg-orange-100 dark:bg-orange-900/20",text: "text-orange-600 dark:text-orange-400",border: "border-orange-200 dark:border-orange-800" },
];

const OverviewPanel = () => {
  const { state } = useApp();
  const { settings } = state;
  const { users, loading: uLoading, fetchUsers } = useUsers();
  const [reps, setReps]     = useState([]);
  const [rLoading, setRLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    getSalesReps({ limit: 10 })
      .then(r => { const d = r.data.data; setReps(d.reps ?? d.items ?? d.data ?? []); })
      .catch(() => {})
      .finally(() => setRLoading(false));
  }, []); // eslint-disable-line

  const byRole    = { admin: 0, manager: 0, cashier: 0 };
  users.forEach(u => { if (byRole[u.role] !== undefined) byRole[u.role]++; });
  const active    = users.filter(u => u.isActive !== false).length;
  const topRep    = [...reps].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))[0];
  const sortedReps = [...reps].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
  const maxSales  = sortedReps[0]?.totalSales || 1;

  if (uLoading || rLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <p className="text-sm text-slate-400">Loading overview...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Users}      label="Total Staff"    value={users.length}  sub="All roles"        gradient="from-violet-600 to-purple-700"  iconBg="bg-white/20" iconText="text-white" />
        <KpiCard icon={UserCheck}  label="Active Now"     value={active}        sub="Currently active" gradient="from-emerald-500 to-teal-600"    iconBg="bg-white/20" iconText="text-white" />
        <KpiCard icon={Shield}     label="Sales Reps"     value={reps.length}   sub="Field team"       gradient="from-blue-500 to-indigo-600"     iconBg="bg-white/20" iconText="text-white" />
        <KpiCard icon={TrendingUp} label="Top Rep"        value={topRep ? formatCurrency(topRep.totalSales || 0, settings.currency) : "—"} sub={topRep?.name || "No reps"} gradient="from-amber-500 to-orange-600" iconBg="bg-white/20" iconText="text-white" />
      </div>

      {/* Role breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Breakdown by Role</h3>
          <span className="ml-auto text-xs text-slate-400">{users.length} total</span>
        </div>
        <div className="p-5 space-y-5">
          {Object.entries(byRole).map(([role, count]) => {
            const rc = ROLE_CFG[role];
            const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
            return (
              <div key={role} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.grad} flex items-center justify-center shrink-0 shadow-sm`}>
                  <span className="text-white font-bold text-xs">{rc.label[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{rc.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{pct}%</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${rc.cls}`}>{count}</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${rc.grad} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rep leaderboard */}
      {sortedReps.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Rep Leaderboard</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedReps.slice(0, 5).map((rep, i) => {
              const mc = MEDAL_CFG[i] || MEDAL_CFG[2];
              const MIcon = mc.icon;
              const pct = Math.round(((rep.totalSales || 0) / maxSales) * 100);
              return (
                <div key={rep._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${mc.bg} ${mc.border}`}>
                    <MIcon className={`w-4 h-4 ${mc.text}`} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">{rep.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{rep.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(rep.totalSales || 0, settings.currency)}</p>
                    <p className="text-[10px] text-slate-400">{rep.commission}% rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All team members */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Team Members</h3>
          <span className="ml-auto text-xs text-slate-400">{users.length} members</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map(u => {
            const rc = ROLE_CFG[u.role] || ROLE_CFG.cashier;
            const isActive = u.isActive !== false;
            return (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.grad} flex items-center justify-center shrink-0 shadow-sm`}>
                  <span className="text-white font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ${rc.cls}`}>{rc.label}</span>
                <span className={`relative flex h-2 w-2 shrink-0`}>
                  {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? "bg-emerald-500" : "bg-red-400"}`} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
