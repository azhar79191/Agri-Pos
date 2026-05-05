import React from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, Settings, Rocket } from "lucide-react";

const STEPS = [
  { icon: Clipboard, num: "01", title: "Register Your Shop", desc: "Create your account and set up your shop profile in under 2 minutes." },
  { icon: Settings, num: "02", title: "Configure & Customize", desc: "Add products, set up categories, brands, and configure your POS preferences." },
  { icon: Rocket, num: "03", title: "Start Selling", desc: "Begin processing sales, tracking inventory, and growing your business instantly." },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-28">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">Up and Running in Minutes</h2>
        <p className="text-base max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Three simple steps to transform your agri business.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />
        {STEPS.map(({ icon: Icon, num, title, desc }, i) => (
          <div key={num} className="relative text-center group" style={{ animation: `fade-up 0.5s ease ${i * 0.15}s both` }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <Icon className="w-7 h-7" style={{ color: "#60a5fa" }} />
            </div>
            <span className="text-xs font-bold mb-2 block" style={{ color: "#3b82f6" }}>{num}</span>
            <p className="text-lg font-bold text-white mb-2">{title}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
