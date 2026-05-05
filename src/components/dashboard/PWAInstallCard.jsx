import React, { useState } from "react";
import { Download, Smartphone, Share, CheckCircle2, X, Zap, WifiOff } from "lucide-react";
import usePWAInstall from "../../hooks/usePWAInstall";

/**
 * PWA install card for the Dashboard.
 *
 * Mobile  — always visible until the app is actually installed (permanent, no dismiss)
 * Desktop — dismissible, hidden after user clicks ✕
 */
const PWAInstallCard = () => {
  const { canInstall, isInstalled, isIOS, dismissed, install, dismiss } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Never show once installed
  if (isInstalled) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const ok = await install();
    setInstalling(false);
    if (ok) setJustInstalled(true);
  };

  // Success state
  if (justInstalled) {
    return (
      <div className="card-base p-4 flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">AgriNest installed!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Launch it from your home screen anytime.</p>
        </div>
      </div>
    );
  }

  // Desktop: hide if dismissed. Mobile: always show (dismissed is ignored on mobile).
  // We render the card but use CSS to hide the desktop version when dismissed.
  return (
    <>
      {/* ─── MOBILE card — always visible, no dismiss ─── */}
      <div className={`lg:hidden card-base overflow-hidden border border-emerald-100 dark:border-emerald-900/40`}>
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <div className="p-4">
          {/* Compact horizontal strip */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Install AgriNest</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Faster · Offline · No app store</p>
            </div>
            {canInstall && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-60 text-white text-xs font-bold transition-all flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                {installing ? "…" : "Install"}
              </button>
            )}
          </div>

          {/* iOS steps */}
          {isIOS && (
            <div className="mt-3 bg-blue-50 dark:bg-blue-900/15 rounded-xl p-3 border border-blue-100 dark:border-blue-800/40">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Install on iPhone / iPad:
              </p>
              <ol className="space-y-1.5">
                {[
                  <><Share className="inline w-3 h-3 text-blue-500 mx-0.5" /> Tap <strong>Share</strong> in Safari</>,
                  <>Tap <strong>"Add to Home Screen"</strong></>,
                  <>Tap <strong>"Add"</strong> to confirm</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Non-iOS, no native prompt */}
          {!canInstall && !isIOS && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Open in Chrome and tap <strong className="text-slate-600 dark:text-slate-300">⊕ Install</strong> in the address bar.
            </p>
          )}
        </div>
      </div>

      {/* ─── DESKTOP card — dismissible ─── */}
      {!dismissed && (
        <div className="hidden lg:block card-base overflow-hidden border border-emerald-100 dark:border-emerald-900/40">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install AgriNest App</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
                    Get faster access, offline support, and a native app experience — no app store needed.
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: Zap,      label: "Faster access" },
                { icon: WifiOff,  label: "Works offline" },
                { icon: Download, label: "No app store" },
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

            <div className="mt-4">
              {canInstall ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {installing ? "Installing…" : "Install Now"}
                </button>
              ) : isIOS ? (
                <div className="bg-blue-50 dark:bg-blue-900/15 rounded-xl p-3.5 border border-blue-100 dark:border-blue-800/40">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Install on iPhone / iPad:</p>
                  <ol className="space-y-1.5">
                    {[
                      <><Share className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" /> Tap <strong>Share</strong> in Safari</>,
                      <>Tap <strong>"Add to Home Screen"</strong></>,
                      <>Tap <strong>"Add"</strong> to confirm</>,
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                        <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Install from your browser:</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Click the <strong className="text-slate-700 dark:text-slate-300">⊕ install icon</strong> in the address bar, or open the browser menu and select{" "}
                    <strong className="text-slate-700 dark:text-slate-300">"Install AgriNest"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallCard;
