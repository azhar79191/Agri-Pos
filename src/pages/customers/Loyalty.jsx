import React, { useState, useEffect } from "react";
import { Star, Gift, Award, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { getCustomers } from "../../api/customersApi";
import EmptyState from "../../components/ui/EmptyState";

const getTier = (spent) => {
  if (spent >= 50000) return "Platinum";
  if (spent >= 25000) return "Gold";
  if (spent >= 10000) return "Silver";
  return "Bronze";
};

const tierConfig = {
  Platinum: "from-slate-700 to-slate-900",
  Gold: "from-amber-500 to-yellow-600",
  Silver: "from-slate-400 to-slate-500",
  Bronze: "from-orange-600 to-amber-700",
};

const Loyalty = () => {
  const { state } = useApp();
  const { settings } = state;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers({ limit: 200 })
      .then(res => {
        const all = res.data.data?.customers || [];
        // Use walletBalance as loyalty points (1 point per Rs. spent)
        const enriched = all.map(c => ({
          ...c,
          points: Math.floor((c.walletBalance || 0) * 10),
          totalSpent: c.walletBalance || 0,
          tier: getTier(c.walletBalance || 0),
        })).filter(c => c.points > 0 || c.totalSpent > 0);
        setMembers(enriched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const platinumCount = members.filter(m => m.tier === "Platinum").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-glow-sm"><Award className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Loyalty Program</h1><p className="text-sm text-slate-500 dark:text-slate-400">Reward your loyal customers</p></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Total Members", v: members.length, c: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Star },
              { l: "Total Points Issued", v: totalPoints.toLocaleString(), c: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Gift },
              { l: "Points Value", v: formatCurrency(totalPoints * 0.5, settings.currency), c: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: Award },
              { l: "Platinum Members", v: platinumCount, c: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: Star },
            ].map(({ l, v, c, bg, icon: I }) => (
              <div key={l} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><I className={`w-5 h-5 ${c}`} /></div><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p><p className={`text-lg font-bold mt-0.5 ${c}`}>{v}</p></div></div></div>
            ))}
          </div>

          {members.length === 0 ? (
            <EmptyState icon={Award} title="No loyalty members yet" description="Customers with wallet balance will appear here" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.sort((a, b) => b.points - a.points).map(m => (
                <div key={m._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden hover:shadow-premium-lg transition-all">
                  <div className={`h-1 w-full bg-gradient-to-r ${tierConfig[m.tier]}`} />
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierConfig[m.tier]} flex items-center justify-center`}><span className="text-white font-bold text-lg">{m.name?.[0]}</span></div>
                    <div className="flex-1"><p className="font-bold text-slate-900 dark:text-white">{m.name}</p><p className="text-xs text-slate-400 mt-0.5">{m.tier} · {m.phone}</p></div>
                    <div className="text-right"><p className="text-lg font-bold text-amber-600 dark:text-amber-400">{m.points.toLocaleString()}</p><p className="text-xs text-slate-400">points</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Loyalty;
