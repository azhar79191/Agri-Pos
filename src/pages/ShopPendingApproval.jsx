import React from "react";
import { Clock, Mail, LogOut, RefreshCw, CheckCircle, Zap, Crown } from "lucide-react";
import { useApp } from "../context/AppContext";

const PLANS = [
  { name: "Starter",      price: "Free",         features: ["2 Users", "100 Products", "Basic POS"] },
  { name: "Professional", price: "Rs. 2,999/mo",  features: ["10 Users", "5,000 Products", "Full POS + Analytics"], popular: true },
  { name: "Enterprise",   price: "Custom",        features: ["Unlimited Users", "Unlimited Products", "Multi-branch"] },
];

const ShopPendingApproval = ({ reason }) => {
  const { actions, state } = useApp();

  const handleLogout = () => {
    actions.showToast({ message: "Logged out", type: "info" });
    actions.logout();
  };

  const isSuspended = reason === "SHOP_SUSPENDED";
  const isPlanExpired = reason === "PLAN_EXPIRED";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Status icon */}
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${
        isSuspended ? "bg-red-500/20 border border-red-500/30" :
        isPlanExpired ? "bg-amber-500/20 border border-amber-500/30" :
        "bg-blue-500/20 border border-blue-500/30"
      }`}>
        {isSuspended
          ? <LogOut className="w-9 h-9 text-red-400" />
          : isPlanExpired
          ? <Clock className="w-9 h-9 text-amber-400" />
          : <Clock className="w-9 h-9 text-blue-400 animate-pulse" />
        }
      </div>

      <h1 className="text-3xl font-black text-white mb-3 text-center">
        {isSuspended ? "Shop Suspended" : isPlanExpired ? "Plan Expired" : "Awaiting Approval"}
      </h1>

      <p className="text-slate-400 text-center max-w-md mb-8 leading-relaxed">
        {isSuspended
          ? "Your shop has been suspended. Please contact support to resolve this issue."
          : isPlanExpired
          ? "Your subscription plan has expired. Please contact the admin to renew your plan."
          : `Your shop "${state.settings?.shopName || "AgriNest"}" has been registered successfully. Our team will review and activate your account shortly.`
        }
      </p>

      {/* Steps — only for pending */}
      {!isSuspended && !isPlanExpired && (
        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            { icon: CheckCircle, label: "Shop registered",       done: true  },
            { icon: Clock,       label: "Admin review",          done: false },
            { icon: Zap,         label: "Plan assigned",         done: false },
            { icon: CheckCircle, label: "Access granted",        done: false },
          ].map(({ icon: Icon, label, done }, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${done ? "border-emerald-500/30 bg-emerald-500/10" : "border-slate-700 bg-slate-900"}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${done ? "text-emerald-400" : "text-slate-600"}`} />
              <span className={`text-sm font-medium ${done ? "text-emerald-300" : "text-slate-500"}`}>{label}</span>
              {done && <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Done</span>}
            </div>
          ))}
        </div>
      )}

      {/* Plans preview */}
      {!isSuspended && (
        <div className="w-full max-w-2xl mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Available Plans</p>
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map(p => (
              <div key={p.name} className={`rounded-xl p-4 border ${p.popular ? "border-blue-500/40 bg-blue-500/10" : "border-slate-700 bg-slate-900"}`}>
                {p.popular && <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full mb-2 inline-block">Popular</span>}
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-xs text-blue-400 font-semibold mb-2">{p.price}</p>
                {p.features.map(f => (
                  <p key={f} className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Mail className="w-4 h-4" />
        <span>Contact: <a href="mailto:support@agrinest.com" className="text-blue-400 hover:underline">support@agrinest.com</a></span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Check Status
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-semibold">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ShopPendingApproval;
