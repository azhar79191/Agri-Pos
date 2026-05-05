import React, { useState } from "react";
import { Smartphone, X, Download, Share } from "lucide-react";
import usePWAInstall from "../hooks/usePWAInstall";

/**
 * Floating bottom banner — appears automatically when the native
 * beforeinstallprompt fires (Chrome/Edge/Android).
 * On iOS it shows a one-time tip with Share instructions.
 * Dismissed per-session only (no localStorage — user can always re-open via header).
 */
const PWAInstallBanner = () => {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Hide if installed or dismissed this session
  if (isInstalled || dismissed) return null;
  // Only show banner when native prompt is available OR on iOS
  if (!canInstall && !isIOS) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
      style={{ animation: "scale-in 0.25s ease both" }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 shadow-2xl border border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Install AgriNest</p>
          {isIOS ? (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tap <Share className="inline w-3 h-3 text-blue-400 mx-0.5" />
              <span className="text-blue-400 font-medium">Share</span> → <span className="text-white font-medium">"Add to Home Screen"</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">Add to home screen for faster access</p>
          )}
        </div>

        {canInstall && (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {installing ? "…" : "Install"}
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
