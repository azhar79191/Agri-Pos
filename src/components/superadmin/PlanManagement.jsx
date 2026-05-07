import React, { useState } from "react";
import { Crown, Calendar, Check, X, Loader2, Sparkles } from "lucide-react";
import { grantPlan } from "../../api/superAdminApi";

/**
 * Plan Configuration
 */
const PLANS = {
  starter: {
    name: "Starter",
    price: "$29/month",
    color: "blue",
    icon: "🌱",
    features: [
      "Up to 2 users",
      "500 products",
      "1,000 customers",
      "500 invoices/month",
      "Basic POS",
      "Inventory management",
      "Basic reports",
    ],
    limits: {
      users: 2,
      products: 500,
      customers: 1000,
      invoices: 500,
    },
  },
  professional: {
    name: "Professional",
    price: "$99/month",
    color: "purple",
    icon: "🚀",
    popular: true,
    features: [
      "Up to 10 users",
      "5,000 products",
      "10,000 customers",
      "5,000 invoices/month",
      "Advanced POS",
      "AI Crop Advisory",
      "Barcode scanning",
      "Sales representatives",
      "Purchase orders",
      "Bundles & batches",
      "Loyalty programs",
      "Advanced reports",
      "Audit logs",
    ],
    limits: {
      users: 10,
      products: 5000,
      customers: 10000,
      invoices: 5000,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: "$299/month",
    color: "gold",
    icon: "👑",
    features: [
      "Unlimited users",
      "Unlimited products",
      "Unlimited customers",
      "Unlimited invoices",
      "Everything in Professional",
      "Multi-shop management",
      "API access",
      "White-label branding",
      "Priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    limits: {
      users: -1,
      products: -1,
      customers: -1,
      invoices: -1,
    },
  },
};

/**
 * PlanManagement Component
 * Allows super admin to assign/update plans for shops
 */
const PlanManagement = ({ shop, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState(shop?.plan || "starter");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGrantPlan = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await grantPlan(shop._id, {
        plan: selectedPlan,
        duration: parseInt(duration),
      });

      setSuccess(`${PLANS[selectedPlan].name} plan granted successfully for ${duration} days!`);
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to grant plan");
    } finally {
      setLoading(false);
    }
  };

  const getPlanColorClasses = (planKey) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700",
        gradient: "from-blue-500 to-blue-600",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-400",
        button: "bg-purple-600 hover:bg-purple-700",
        gradient: "from-purple-500 to-purple-600",
      },
      gold: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-400",
        button: "bg-amber-600 hover:bg-amber-700",
        gradient: "from-amber-500 to-amber-600",
      },
    };

    return colors[PLANS[planKey].color];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Plan Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign or update plan for {shop?.name}
          </p>
        </div>
      </div>

      {/* Current Plan Info */}
      {shop?.plan && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Current Plan</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {PLANS[shop.plan]?.name || shop.plan}
              </p>
            </div>
            {shop.planExpiryDate && (
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Expires</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(shop.planExpiryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const colors = getPlanColorClasses(key);
          const isSelected = selectedPlan === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${colors.border} ${colors.bg} shadow-lg scale-105`
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    POPULAR
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div className="text-4xl mb-3">{plan.icon}</div>

              {/* Plan Name & Price */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className={`text-2xl font-bold ${colors.text} mb-4`}>
                {plan.price}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {plan.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                    <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-xs text-slate-500 dark:text-slate-500 pl-6">
                    +{plan.features.length - 5} more features
                  </li>
                )}
              </ul>

              {/* Selected Indicator */}
              {isSelected && (
                <div className={`flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r ${colors.gradient} text-white font-semibold text-sm`}>
                  <Check className="w-4 h-4" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Plan Duration (Days)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[30, 90, 180, 365].map((days) => (
            <button
              key={days}
              onClick={() => setDuration(days)}
              className={`py-2 px-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                duration === days
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="3650"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Custom duration (days)"
          />
        </div>
      </div>

      {/* Grant Plan Button */}
      <button
        onClick={handleGrantPlan}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Granting Plan...</span>
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" />
            <span>Grant {PLANS[selectedPlan].name} Plan</span>
          </>
        )}
      </button>

      {/* Plan Comparison */}
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Plan Limits Comparison
        </h3>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="font-medium text-slate-600 dark:text-slate-400">Feature</div>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className="font-medium text-center text-slate-900 dark:text-white">
              {plan.name}
            </div>
          ))}

          {["users", "products", "customers", "invoices"].map((feature) => (
            <React.Fragment key={feature}>
              <div className="text-slate-600 dark:text-slate-400 capitalize">
                {feature}
              </div>
              {Object.entries(PLANS).map(([key, plan]) => (
                <div key={key} className="text-center text-slate-900 dark:text-white">
                  {plan.limits[feature] === -1 ? "Unlimited" : plan.limits[feature].toLocaleString()}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
