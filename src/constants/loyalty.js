import { Crown, Award, Star } from "lucide-react";

export const TIER_THRESHOLDS = {
  Platinum: 50000,
  Gold:     25000,
  Silver:   10000,
  Bronze:   0,
};

export const TIER_CONFIG = {
  Platinum: { gradient: "from-slate-600 to-slate-800",   badge: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",         icon: Crown, next: null,       threshold: 50000 },
  Gold:     { gradient: "from-amber-500 to-yellow-600",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",       icon: Award, next: "Platinum", threshold: 25000 },
  Silver:   { gradient: "from-slate-400 to-slate-500",   badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",          icon: Star,  next: "Gold",     threshold: 10000 },
  Bronze:   { gradient: "from-orange-600 to-amber-700",  badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",   icon: Star,  next: "Silver",   threshold: 0 },
};

/** Returns progress % toward next tier */
export const getTierProgress = (member) => {
  const tc = TIER_CONFIG[member.tier];
  if (!tc?.next) return 100;
  const nextThreshold    = TIER_THRESHOLDS[tc.next];
  const currentThreshold = tc.threshold;
  return Math.min(100, ((member.totalPurchases - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
};
