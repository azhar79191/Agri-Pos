import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const PlanContext = createContext();

/**
 * Plan Features Configuration
 * Defines what features are available in each plan
 */
const PLAN_FEATURES = {
  starter: {
    name: "Starter",
    maxUsers: 2,
    maxProducts: 500,
    maxCustomers: 1000,
    maxInvoicesPerMonth: 500,
    features: {
      pos: true,
      inventory: true,
      customers: true,
      basicReports: true,
      invoices: true,
      // Limited features
      advancedReports: false,
      aiAdvisory: false,
      multiShop: false,
      loyaltyProgram: false,
      barcodeScanning: false,
      salesReps: false,
      purchaseOrders: false,
      bundles: false,
      batches: false,
      auditLogs: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
    },
  },
  professional: {
    name: "Professional",
    maxUsers: 10,
    maxProducts: 5000,
    maxCustomers: 10000,
    maxInvoicesPerMonth: 5000,
    features: {
      pos: true,
      inventory: true,
      customers: true,
      basicReports: true,
      invoices: true,
      advancedReports: true,
      aiAdvisory: true,
      barcodeScanning: true,
      salesReps: true,
      purchaseOrders: true,
      bundles: true,
      batches: true,
      loyaltyProgram: true,
      auditLogs: true,
      // Limited features
      multiShop: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
    },
  },
  enterprise: {
    name: "Enterprise",
    maxUsers: -1, // Unlimited
    maxProducts: -1, // Unlimited
    maxCustomers: -1, // Unlimited
    maxInvoicesPerMonth: -1, // Unlimited
    features: {
      pos: true,
      inventory: true,
      customers: true,
      basicReports: true,
      invoices: true,
      advancedReports: true,
      aiAdvisory: true,
      multiShop: true,
      loyaltyProgram: true,
      barcodeScanning: true,
      salesReps: true,
      purchaseOrders: true,
      bundles: true,
      batches: true,
      auditLogs: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
    },
  },
};

/**
 * PlanProvider - Manages plan-based access control
 */
export function PlanProvider({ children }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planExpired, setPlanExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    if (user?.shop) {
      const shopPlan = user.shop.plan || "starter";
      const planExpiryDate = user.shop.planExpiryDate;

      setCurrentPlan(shopPlan);

      // Check if plan is expired
      if (planExpiryDate) {
        const expiryDate = new Date(planExpiryDate);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setDaysRemaining(diffDays);
        setPlanExpired(diffDays <= 0);
      } else {
        setDaysRemaining(null);
        setPlanExpired(false);
      }
    }
  }, [user]);

  /**
   * Check if a feature is available in the current plan
   */
  const hasFeature = (featureName) => {
    if (!currentPlan) return false;
    if (planExpired) return false;

    const planConfig = PLAN_FEATURES[currentPlan];
    if (!planConfig) return false;

    return planConfig.features[featureName] === true;
  };

  /**
   * Check if user can add more items (users, products, etc.)
   */
  const canAddMore = (type, currentCount) => {
    if (!currentPlan) return false;
    if (planExpired) return false;

    const planConfig = PLAN_FEATURES[currentPlan];
    if (!planConfig) return false;

    const maxKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const maxAllowed = planConfig[maxKey];

    // -1 means unlimited
    if (maxAllowed === -1) return true;

    return currentCount < maxAllowed;
  };

  /**
   * Get plan limits
   */
  const getPlanLimits = () => {
    if (!currentPlan) return null;
    return PLAN_FEATURES[currentPlan];
  };

  /**
   * Get plan name
   */
  const getPlanName = () => {
    if (!currentPlan) return "No Plan";
    return PLAN_FEATURES[currentPlan]?.name || currentPlan;
  };

  /**
   * Check if plan is expiring soon (within 7 days)
   */
  const isExpiringSoon = () => {
    return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
  };

  /**
   * Get plan status
   */
  const getPlanStatus = () => {
    if (planExpired) return "expired";
    if (isExpiringSoon()) return "expiring";
    return "active";
  };

  /**
   * Get plan badge color
   */
  const getPlanBadgeColor = () => {
    if (!currentPlan) return "gray";
    
    switch (currentPlan) {
      case "starter":
        return "blue";
      case "professional":
        return "purple";
      case "enterprise":
        return "gold";
      default:
        return "gray";
    }
  };

  const value = {
    currentPlan,
    planExpired,
    daysRemaining,
    hasFeature,
    canAddMore,
    getPlanLimits,
    getPlanName,
    isExpiringSoon,
    getPlanStatus,
    getPlanBadgeColor,
    PLAN_FEATURES,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

/**
 * usePlan hook - Access plan context
 */
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return context;
};

/**
 * FeatureGate component - Conditionally render based on plan feature
 */
export const FeatureGate = ({ feature, fallback = null, children }) => {
  const { hasFeature } = usePlan();

  if (!hasFeature(feature)) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * PlanBadge component - Display current plan badge
 */
export const PlanBadge = ({ className = "" }) => {
  const { getPlanName, getPlanBadgeColor, getPlanStatus } = usePlan();

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  };

  const statusIcons = {
    active: "✓",
    expiring: "⚠",
    expired: "✕",
  };

  const color = getPlanBadgeColor();
  const status = getPlanStatus();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClasses[color]} ${className}`}
    >
      <span>{statusIcons[status]}</span>
      <span>{getPlanName()}</span>
    </span>
  );
};

/**
 * PlanUpgradePrompt component - Show upgrade prompt for locked features
 */
export const PlanUpgradePrompt = ({ feature, featureName }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {featureName} - Premium Feature
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4 max-w-md">
        Upgrade your plan to unlock {featureName.toLowerCase()} and other powerful features.
      </p>
      <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200">
        Upgrade Plan
      </button>
    </div>
  );
};
