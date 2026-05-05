import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ChevronRight, Lock, CheckCircle2, Zap } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: "rgba(37,99,235,0.08)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: "rgba(14,165,233,0.06)", animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: "rgba(139,92,246,0.05)", animationDelay: "2s" }} />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div style={{ animation: "fade-up 0.6s ease both" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "#60a5fa" }}>
            <Zap className="w-3.5 h-3.5" /> Enterprise Agricultural POS Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight" style={{ color: "white" }}>
            The Smarter Way to{" "}
            <span style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Run Agri
            </span>{" "}
            Business
          </h1>
          <p className="text-lg mb-8 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            Complete point-of-sale, inventory management, crop advisory, and analytics — purpose-built for modern agricultural businesses.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10">
            {["Real-time Inventory", "Smart Analytics", "Crop Advisory", "Multi-branch"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#3b82f6" }} /> {f}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate("/register")} className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:scale-[1.03]" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}>
              Start Free Trial <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate("/login")} className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:scale-[1.03]" style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", backdropFilter: "blur(10px)" }}>
              Sign In <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hidden lg:block" style={{ animation: "fade-up 0.8s ease 0.2s both" }}>
          <div className="relative rounded-3xl p-1 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(139,92,246,0.2), rgba(6,182,212,0.2))" }}>
            <div className="rounded-[22px] p-6 overflow-hidden" style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
                    <Sprout className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Dashboard</p>
                    <p className="text-sm font-bold text-white">AgriNest POS</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Today's Sales", value: "Rs. 45,200", change: "+12%", color: "#22c55e" },
                  { label: "Products", value: "1,248", change: "+3 new", color: "#3b82f6" },
                  { label: "Customers", value: "342", change: "+8", color: "#8b5cf6" },
                  { label: "Low Stock", value: "7 items", change: "Alert", color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.change}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Weekly Revenue</p>
                <div className="flex items-end gap-2 h-20">
                  {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                    <div key={i} className="flex-1 rounded-md transition-all" style={{ height: `${h}%`, background: i === 5 ? "linear-gradient(180deg, #3b82f6, #1d4ed8)" : "rgba(59,130,246,0.15)", borderRadius: "4px" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
