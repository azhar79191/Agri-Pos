import React from "react";
import { Package, BarChart3, ShoppingCart, Users, FileText, Shield, Leaf, Bell, Globe } from "lucide-react";

const FEATURES = [
  { icon: Package, title: "Smart Inventory", desc: "Real-time stock tracking, batch expiry alerts, and dead stock detection.", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Profit reports, margin analysis, and AI-powered sales forecasting.", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  { icon: ShoppingCart, title: "Lightning POS", desc: "Fast checkout with barcode scanning, held sales, and instant receipts.", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  { icon: Users, title: "Customer CRM", desc: "Loyalty programs, credit sales, purchase history — all unified.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { icon: FileText, title: "Purchase Orders", desc: "Manage suppliers, create POs, receive goods, and handle returns.", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { icon: Shield, title: "Role-Based Access", desc: "Granular permissions for admins, managers, cashiers with audit logs.", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { icon: Leaf, title: "Crop Advisory", desc: "Built-in pest diagnosis, dosage calculator, and seasonal crop calendar.", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  { icon: Bell, title: "Smart Alerts", desc: "Instant notifications for low stock, expiring batches, and dues.", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-28">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", color: "#60a5fa" }}>
          <Globe className="w-3.5 h-3.5" /> Complete Platform
        </div>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
          Everything Your Shop Needs
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          From inventory to crop advisory, one platform covers every aspect of running a modern agricultural business.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc, color, bg }, idx) => (
          <div key={title} className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-default" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", animation: `fade-up 0.5s ease ${idx * 0.05}s both` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: bg, border: `1px solid ${color}25` }}>
              <Icon className="w-5.5 h-5.5" style={{ color }} />
            </div>
            <p className="font-bold text-white mb-2">{title}</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
