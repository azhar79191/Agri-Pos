import React, { useState } from "react";
import { Download, Smartphone, Share, CheckCircle2, Zap, WifiOff, Star } from "lucide-react";
import usePWAInstall from "../../hooks/usePWAInstall";

/**
 * PWA Install Card — Dashboard
 *
 * Always visible until the app is genuinely installed (running in standalone mode).
 * No dismiss. No localStorage gating. Shows the right UI per platform:
 *   • Chrome/Edge/Android  → one-tap "Install Now" button
 *   • iOS Safari           → step-by-step Add to Home Screen guide
 *   • Other browsers       → address-bar install hint
 */
const PWAInstallCard = () => {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  // Only hide when genuinely running as installed PWA
  if (isInstalled) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const ok = await install();
    setInstalling(false);
    if (ok) setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">App installed!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Launch AgriNest from your home screen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900 shadow-sm">

      {/* Accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <div className="p-4 sm:p-5">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200 dark:shadow-emerald-900/40">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install AgriNest App</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Free · No app store · Works offline
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { icon: Zap,      label: "Instant launch" },
            { icon: WifiOff,  label: "Works offline"  },
            { icon: Star,     label: "Home screen"    },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>

        {/* Action area — adapts per platform */}
        {canInstall ? (
          /* ── Chrome / Edge / Android: one-tap install ── */
          <button
            onClick={handleInstall}
            disabled={installing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            <Download className="w-4 h-4" />
            {installing ? "Installing…" : "Install Now — It's Free"}
          </button>

        ) : isIOS ? (
          /* ── iOS Safari: manual steps ── */
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wide">
              Install on iPhone / iPad
            </p>
            <ol className="space-y-2.5">
              {[
                { icon: Share, text: <>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 mx-0.5 -mt-0.5" /> at the bottom of Safari</> },
                { icon: null,  text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> },
                { icon: null,  text: <>Tap <strong>"Add"</strong> in the top-right corner</> },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-blue-800 dark:text-blue-200 leading-snug">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>

        ) : (
          /* ── Other browsers: address-bar hint ── */
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Install from your browser
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                <strong>Chrome / Edge:</strong> tap the <strong>⊕</strong> icon in the address bar or open the menu <strong>(⋮)</strong> → <strong>"Install AgriNest"</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                <strong>Samsung Internet:</strong> tap menu → <strong>"Add page to"</strong> → <strong>"Home screen"</strong>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PWAInstallCard;
