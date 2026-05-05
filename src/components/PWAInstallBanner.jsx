import React from "react";
import { Smartphone, X, Download } from "lucide-react";
import usePWAInstall from "../hooks/usePWAInstall";

const PWAInstallBanner = () => {
  const { showBanner, install, dismiss } = usePWAInstall();
  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
      style={{ animation: "scale-in 0.2s ease both" }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 shadow-2xl border border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Install AgriNest</p>
          <p className="text-xs text-slate-400 mt-0.5">Add to home screen for faster access</p>
        </div>
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Install
        </button>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
