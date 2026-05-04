import { Sprout, CheckCircle } from "lucide-react";

export const BrandingPanel = ({ steps, currentStep, mode = "register" }) => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
    </div>
    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
      <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-6">
        <Sprout className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-5xl font-bold mb-4">AgriNest POS</h1>
      <p className="text-xl text-emerald-100 mb-8">
        {mode === "register" ? "Register your shop and get started in minutes" : "Manage your agri business"}
      </p>
      {steps && (
        <div className="space-y-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = currentStep > s.id;
            const active = currentStep === s.id;
            return (
              <div key={s.id} className={`flex items-center gap-4 rounded-lg p-4 transition-all ${active ? "bg-white/20" : done ? "bg-white/10" : "bg-white/5"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-400" : active ? "bg-white/30" : "bg-white/10"}`}>
                  {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
                </div>
                <p className={`font-semibold ${active ? "text-white" : "text-emerald-200"}`}>
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
