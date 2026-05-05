import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ArrowRight, Menu, X } from "lucide-react";
import HeroSection from "./landing/HeroSection";
import StatsSection from "./landing/StatsSection";
import FeaturesSection from "./landing/FeaturesSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import PricingSection from "./landing/PricingSection";
import CTASection from "./landing/CTASection";
import FooterSection from "./landing/FooterSection";

const NAV_LINKS = [
  { label: "Features", href: "features" },
  { label: "How It Works", href: "how-it-works" },
  { label: "Pricing", href: "pricing" },
  { label: "Testimonials", href: "testimonials" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "#060b18", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(6,11,24,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none">AgriNest POS</p>
              <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "#60a5fa" }}>Agri Management</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-sm font-medium transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer" }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden px-6 pb-4 space-y-1" style={{ background: "rgba(6,11,24,0.95)", backdropFilter: "blur(20px)" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setMobileOpen(false); navigate("/login"); }}
              className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium"
              style={{ color: "#60a5fa", background: "none", border: "none", cursor: "pointer" }}
            >
              Sign In →
            </button>
          </div>
        )}
      </nav>

      {/* ── Page Sections ── */}
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
