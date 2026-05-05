import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ArrowRight, TrendingUp } from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="max-w-7xl mx-auto px-6 py-28">
      <div className="rounded-3xl p-14 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#3b82f6" }} />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 8px 32px rgba(37,99,235,0.3)" }}>
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">Ready to Grow Your Business?</h2>
          <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            Join hundreds of agri shop owners who trust AgriNest POS to run their business every day.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate("/register")} className="group flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:scale-[1.03]" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}>
              Get Started Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate("/login")} className="flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:scale-[1.03]" style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer" }}>
              Sign In <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
