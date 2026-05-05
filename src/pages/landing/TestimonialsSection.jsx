import React from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  { name: "Ahmed Raza", role: "Owner, Green Fields Agri Store", text: "AgriNest POS transformed how we manage our pesticide inventory. The batch expiry alerts alone saved us thousands.", rating: 5 },
  { name: "Fatima Khan", role: "Manager, Kisan Agro Center", text: "The crop advisory module is a game changer. Our customers trust us more because we give accurate dosage recommendations.", rating: 5 },
  { name: "Muhammad Ali", role: "Owner, Ali Brothers Agri Shop", text: "Setup was quick and the POS is incredibly fast. The analytics dashboard gives me a clear picture every morning.", rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">Trusted by Shop Owners</h2>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>Real feedback from real agri businesses across Pakistan.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div key={name} className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-1 mb-5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#f59e0b" }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }}>{name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
