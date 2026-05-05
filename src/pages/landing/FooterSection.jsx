import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";

const LINKS = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Company: ["About Us", "Careers", "Blog", "Contact"],
  Support: ["Documentation", "Help Center", "API Reference", "Status"],
};

export default function FooterSection() {
  const navigate = useNavigate();
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-none">AgriNest POS</p>
                <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "#60a5fa" }}>Agri Management</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Complete point-of-sale and business management platform built for modern agricultural shops.
            </p>
          </div>
          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-white mb-4">{title}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <button className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} AgriNest POS · Built for Agri Businesses</p>
          <button onClick={() => navigate("/login")} className="text-xs font-medium transition-colors hover:text-white" style={{ color: "#60a5fa", background: "none", border: "none", cursor: "pointer" }}>
            Sign In →
          </button>
        </div>
      </div>
    </footer>
  );
}
