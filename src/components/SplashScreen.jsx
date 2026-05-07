import React, { useEffect, useState } from "react";
import { Sprout, Sparkles, TrendingUp, Shield } from "lucide-react";

/**
 * SplashScreen - Premium animated splash screen with three-color vertical design
 * Shows on app load with smooth animations
 */
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 500);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Three-Color Vertical Background Panels - Stacked Top to Bottom */}
      <div className="absolute inset-0 flex flex-col">
        {/* Panel 1 - Blue (Top - 1/3 height, full width) */}
        <div
          className="w-full h-1/3 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden"
          style={{
            animation: "slideInDown 0.8s ease-out",
          }}
        >
          {/* Animated circles */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* Panel 2 - Purple (Middle - 1/3 height, full width) */}
        <div
          className="w-full h-1/3 bg-gradient-to-br from-purple-600 to-purple-700 relative overflow-hidden"
          style={{
            animation: "slideInLeft 0.8s ease-out 0.2s both",
          }}
        >
          {/* Animated circles */}
          <div className="absolute top-1/3 right-1/3 w-36 h-36 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.3s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-44 h-44 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.8s" }} />
        </div>

        {/* Panel 3 - Cyan (Bottom - 1/3 height, full width) */}
        <div
          className="w-full h-1/3 bg-gradient-to-br from-cyan-600 to-cyan-700 relative overflow-hidden"
          style={{
            animation: "slideInUp 0.8s ease-out 0.4s both",
          }}
        >
          {/* Animated circles */}
          <div className="absolute top-1/2 left-1/2 w-38 h-38 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.6s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-42 h-42 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div
          className="mb-8"
          style={{
            animation: "scaleIn 0.6s ease-out 0.8s both",
          }}
        >
          {/* Premium Logo */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-white/30 rounded-3xl blur-3xl animate-pulse" />
            
            {/* Logo background */}
            <div className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl" />
              
              {/* Icon */}
              <div className="relative">
                <Sprout className="w-16 h-16 text-transparent bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 bg-clip-text" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
              </div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            <div className="absolute top-1/2 -right-4 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>

        {/* Brand Name */}
        <div
          className="text-center mb-2"
          style={{
            animation: "fadeInUp 0.6s ease-out 1s both",
          }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            AgriNest
            <span className="text-transparent bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text"> POS</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Premium Pesticide Management</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
        </div>

        {/* Tagline */}
        <p
          className="text-white/80 text-lg mb-8 text-center max-w-md px-4"
          style={{
            animation: "fadeInUp 0.6s ease-out 1.2s both",
          }}
        >
          Empowering Agricultural Businesses with Smart Technology
        </p>

        {/* Feature Pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-8 px-4"
          style={{
            animation: "fadeInUp 0.6s ease-out 1.4s both",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Secure & Reliable</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">AI-Powered</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="w-64 md:w-80"
          style={{
            animation: "fadeInUp 0.6s ease-out 1.6s both",
          }}
        >
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-yellow-200 to-white rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-white/70 text-xs font-medium">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Version */}
        <p
          className="text-white/50 text-xs mt-8"
          style={{
            animation: "fadeIn 0.6s ease-out 1.8s both",
          }}
        >
          Version 2.0.0 • © 2026 AgriNest
        </p>
      </div>

      {/* Inline Animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
