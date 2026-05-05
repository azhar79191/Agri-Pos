import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter", price: "Free", period: "forever", desc: "Perfect for single-shop owners getting started.",
    features: ["1 User", "Basic POS", "Up to 100 Products", "Sales Reports", "Email Support"],
    cta: "Get Started Free", popular: false,
  },
  {
    name: "Professional", price: "Rs. 2,999", period: "/month", desc: "For growing shops needing advanced features.",
    features: ["5 Users", "Full POS + Barcode", "Unlimited Products", "Advanced Analytics", "Crop Advisory", "Inventory Alerts", "Priority Support"],
    cta: "Start Free Trial", popular: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "pricing", desc: "Multi-branch operations with dedicated support.",
    features: ["Unlimited Users", "Multi-branch Support", "API Access", "Custom Reports", "Dedicated Manager", "SLA Guarantee", "On-site Training"],
    cta: "Contact Sales", popular: false,
  },
];

export default function PricingSection() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-28">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-base max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Choose the plan that fits your business. No hidden fees.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {PLANS.map(({ name, price, period, desc, features, cta, popular }) => (
          <div key={name} className="rounded-2xl p-7 relative transition-all duration-300 hover:-translate-y-2" style={{
            background: popular ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(139,92,246,0.08))" : "rgba(255,255,255,0.03)",
            border: popular ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
          }}>
            {popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white" }}>
                Most Popular
              </div>
            )}
            <p className="text-lg font-bold text-white mb-1">{name}</p>
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-white">{price}</span>
              <span className="text-sm ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>{period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#3b82f6" }} /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/register")} className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]" style={{
              background: popular ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(255,255,255,0.06)",
              color: "white", border: popular ? "none" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              boxShadow: popular ? "0 4px 20px rgba(37,99,235,0.3)" : "none",
            }}>
              {cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
