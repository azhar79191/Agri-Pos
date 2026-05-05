import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronRight, X, Rocket, Package, ShoppingCart, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CHECKLIST_KEY = "agrinest_onboarding";

const STEPS = [
  {
    id: "shop",
    icon: Settings,
    title: "Configure your shop",
    desc: "Set your shop name, currency, and tax rate",
    path: "/settings",
    color: "blue",
  },
  {
    id: "product",
    icon: Package,
    title: "Add your first product",
    desc: "Build your inventory by adding products",
    path: "/products",
    color: "emerald",
  },
  {
    id: "customer",
    icon: Users,
    title: "Add a customer",
    desc: "Register your first customer for credit sales",
    path: "/customers",
    color: "cyan",
  },
  {
    id: "sale",
    icon: ShoppingCart,
    title: "Make your first sale",
    desc: "Open POS and complete a transaction",
    path: "/pos",
    color: "violet",
  },
];

const COLOR_MAP = {
  blue:    { ring: "ring-blue-200 dark:ring-blue-800",    icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",    btn: "bg-blue-600 hover:bg-blue-700" },
  emerald: { ring: "ring-emerald-200 dark:ring-emerald-800", icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700" },
  cyan:    { ring: "ring-cyan-200 dark:ring-cyan-800",    icon: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",    btn: "bg-cyan-600 hover:bg-cyan-700" },
  violet:  { ring: "ring-violet-200 dark:ring-violet-800", icon: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400", btn: "bg-violet-600 hover:bg-violet-700" },
};

const loadDone  = () => { try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "[]"); } catch { return []; } };
const saveDone  = (d) => localStorage.setItem(CHECKLIST_KEY, JSON.stringify(d));
const isDismissed = () => localStorage.getItem(CHECKLIST_KEY + "_dismissed") === "1";
const setDismissed = () => localStorage.setItem(CHECKLIST_KEY + "_dismissed", "1");

const OnboardingChecklist = ({ dashboardData }) => {
  const navigate              = useNavigate();
  const [done, setDone]       = useState(loadDone);
  const [visible, setVisible] = useState(!isDismissed());

  // Auto-mark steps based on real dashboard data
  useEffect(() => {
    if (!dashboardData) return;
    const auto = [];
    if (dashboardData.products?.total > 0)   auto.push("product");
    if (dashboardData.customers?.total > 0)  auto.push("customer");
    if (dashboardData.todaySales?.total > 0 || dashboardData.recentInvoices?.length > 0) auto.push("sale");
    const merged = [...new Set([...loadDone(), ...auto])];
    setDone(merged);
    saveDone(merged);
  }, [dashboardData]);

  const markDone = (id) => {
    const next = [...new Set([...done, id])];
    setDone(next);
    saveDone(next);
  };

  const dismiss = () => { setVisible(false); setDismissed(); };

  const completedCount = STEPS.filter((s) => done.includes(s.id)).length;
  const allDone        = completedCount === STEPS.length;
  const progress       = Math.round((completedCount / STEPS.length) * 100);

  if (!visible) return null;

  return (
    <div className="card-base overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {allDone ? "🎉 You're all set!" : "Get Started with AgriNest"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {allDone ? "Your shop is fully configured and ready" : `${completedCount} of ${STEPS.length} steps completed`}
            </p>
          </div>
        </div>
        <button onClick={dismiss} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STEPS.map((step) => {
          const isDone   = done.includes(step.id);
          const Icon     = step.icon;
          const colors   = COLOR_MAP[step.color];
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isDone
                  ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                  : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 ring-1 ${colors.ring} hover:shadow-sm`
              }`}
            >
              {/* Check / icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-100 dark:bg-emerald-900/30" : colors.icon}`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <Icon className="w-4 h-4" />
                }
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isDone ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
              </div>

              {/* Action */}
              {!isDone && (
                <button
                  onClick={() => { markDone(step.id); navigate(step.path); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white flex-shrink-0 transition-colors ${colors.btn}`}
                >
                  Go <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
