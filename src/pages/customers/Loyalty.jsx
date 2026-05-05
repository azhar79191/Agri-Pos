import React from "react";
import { Award, Gift, Crown, Loader2, X, Star } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import FilterBar from "../../components/ui/FilterBar";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getLoyaltyMembers } from "../../api/loyaltyApi";
import { useLoyaltyRedeem } from "../../hooks/useLoyaltyRedeem";
import { TIER_CONFIG, TIER_THRESHOLDS, getTierProgress } from "../../constants/loyalty";

const LIMIT = 12;

const Loyalty = () => {
  const { state }    = useApp();
  const { settings } = state;
  const isAdmin      = state.currentUser?.role === "admin" || state.currentUser?.role === "manager";

  const { data: members, loading, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh } =
    usePaginatedApi(getLoyaltyMembers, { search: "", tier: "" }, LIMIT);

  const { redeemModal, setRedeemModal, redeemPts, setRedeemPts, redeeming, handleRedeem } = useLoyaltyRedeem(refresh);

  const stats = {
    totalPoints: members.reduce((s, m) => s + (m.points || 0), 0),
    platinum:    members.filter((m) => m.tier === "Platinum").length,
    gold:        members.filter((m) => m.tier === "Gold").length,
  };

  const STAT_CARDS = [
    { l: "Total Members", v: total,                              c: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30",   icon: Star },
    { l: "Total Points",  v: stats.totalPoints.toLocaleString(), c: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Gift },
    { l: "Platinum",      v: stats.platinum,                     c: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-700",    icon: Crown },
    { l: "Gold Members",  v: stats.gold,                         c: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Award },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm flex-shrink-0"><Award className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Loyalty Program</h1><p className="text-sm text-slate-500 dark:text-slate-400">Reward customers based on total purchases · 1 point per Rs. 100 spent</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ l, v, c, bg, icon: I }) => (
          <div key={l} className="stat-card-premium"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><I className={`w-5 h-5 ${c}`} /></div><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{l}</p><p className={`text-lg font-bold mt-0.5 ${c}`}>{v}</p></div></div></div>
        ))}
      </div>

      {/* Tier legend */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tier Thresholds</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(TIER_THRESHOLDS).reverse().map(([tier, threshold]) => {
            const tc = TIER_CONFIG[tier];
            return (
              <div key={tier} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tc.gradient} flex items-center justify-center flex-shrink-0`}><tc.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xs font-bold text-slate-900 dark:text-white">{tier}</p><p className="text-xs text-slate-400">{threshold > 0 ? `Rs. ${threshold.toLocaleString()}+` : "All customers"}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      <FilterBar
        filters={[
          { type: "search", key: "search", placeholder: "Search by name or phone..." },
          { type: "select", key: "tier", placeholder: "All Tiers", options: [{ value: "Platinum", label: "👑 Platinum" }, { value: "Gold", label: "🥇 Gold" }, { value: "Silver", label: "🥈 Silver" }, { value: "Bronze", label: "🥉 Bronze" }] },
        ]}
        values={filters} onChange={setFilter} onClear={() => setFilters({ search: "", tier: "" })} total={total}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading members...</span></div>
      ) : members.length === 0 ? (
        <EmptyState icon={Award} title="No loyalty members yet" description="Customers automatically earn points based on their total purchases" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const tc         = TIER_CONFIG[m.tier] || TIER_CONFIG.Bronze;
            const TIcon      = tc.icon;
            const progress   = getTierProgress(m);
            const nextThresh = tc.next ? TIER_THRESHOLDS[tc.next] : null;
            const remaining  = nextThresh ? nextThresh - (m.totalPurchases || 0) : 0;

            return (
              <div key={m._id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden hover:shadow-premium-lg transition-all">
                <div className={`h-1.5 w-full bg-gradient-to-r ${tc.gradient}`} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tc.gradient} flex items-center justify-center flex-shrink-0`}><span className="text-white font-bold text-lg">{m.name?.[0]}</span></div>
                    <div className="flex-1 min-w-0"><p className="font-bold text-slate-900 dark:text-white truncate">{m.name}</p><p className="text-xs text-slate-400">{m.phone}</p></div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tc.badge}`}><TIcon className="w-3 h-3" />{m.tier}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-center"><p className="text-xs text-slate-400 mb-0.5">Points</p><p className="text-lg font-bold text-amber-600 dark:text-amber-400">{(m.points || 0).toLocaleString()}</p></div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-center"><p className="text-xs text-slate-400 mb-0.5">Total Spent</p><p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(m.totalPurchases || 0, settings.currency)}</p></div>
                  </div>
                  {tc.next && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-slate-400">Progress to {tc.next}</p>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(remaining, settings.currency)} more</p>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${tc.gradient} transition-all duration-500`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                  {isAdmin && (m.points || 0) > 0 && (
                    <button onClick={() => { setRedeemModal(m); setRedeemPts(""); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      <Gift className="w-3.5 h-3.5" />Redeem Points
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50"><Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} /></div>}

      {/* Redeem modal */}
      {redeemModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setRedeemModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/50 animate-scale-in p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Redeem Points</h3>
              <button onClick={() => setRedeemModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{redeemModal.name}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Available: <strong>{(redeemModal.points || 0).toLocaleString()} points</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Points to Redeem</label>
              <input type="number" min="1" max={redeemModal.points} value={redeemPts} onChange={(e) => setRedeemPts(e.target.value)} placeholder={`Max ${redeemModal.points}`}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
              {redeemPts && <p className="text-xs text-slate-400 mt-1">Value: {formatCurrency(parseInt(redeemPts) * 0.5, settings.currency)}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRedeemModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleRedeem} disabled={redeeming} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 bg-amber-500 hover:bg-amber-600 transition-colors">
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
