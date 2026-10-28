import { Sprout, CheckCircle } from "lucide-react";
import { PLATFORM_BRAND } from "../../constants/platformBrand";

export const BrandingPanel = ({ steps, currentStep, mode = "register" }) => (
  <div className="hidden lg:flex lg:w-[40%] xl:w-[42%] bg-slate-950 relative overflow-hidden">
    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
      <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
        <Sprout className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-4xl font-semibold mb-3">{PLATFORM_BRAND.name}</h1>
      <p className="text-base text-slate-300 mb-8">
        {mode === "register" ? "Register your shop and get started in minutes" : "Manage your agri business"}
      </p>
      {steps && (
        <div className="space-y-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = currentStep > s.id;
            const active = currentStep === s.id;
            return (
              <div key={s.id} aria-current={active ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${active ? "border-white/20 bg-white/10" : "border-transparent"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-700" : active ? "bg-white/10" : "bg-white/5"}`}>
                  {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
                </div>
                <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-400"}`}>
                  Step {i + 1}: {s.label}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
