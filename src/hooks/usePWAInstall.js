import { useState, useEffect, useCallback } from "react";

const DISMISSED_KEY = "agrinest_pwa_dismissed";
const INSTALLED_KEY = "agrinest_pwa_installed";

/** Detect iOS (iPhone/iPad/iPod) — these don't support beforeinstallprompt */
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** Detect if already running as installed PWA */
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const usePWAInstall = () => {
  const [prompt, setPrompt]         = useState(null);
  const [isInstalled, setInstalled] = useState(
    () => isStandalone() || !!localStorage.getItem(INSTALLED_KEY)
  );
  const [dismissed, setDismissed]   = useState(
    () => !!localStorage.getItem(DISMISSED_KEY)
  );
  const [showBanner, setShowBanner] = useState(false);

  const ios = isIOS();

  useEffect(() => {
    // Already running as installed PWA — nothing to do
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    // Listen for the native install prompt (Chrome / Edge / Android)
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      if (!localStorage.getItem(DISMISSED_KEY)) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setPrompt(null);
      localStorage.setItem(INSTALLED_KEY, "1");
    });

    // For iOS or browsers that never fire beforeinstallprompt,
    // show the banner after a short delay if not dismissed
    if (!localStorage.getItem(DISMISSED_KEY)) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []); // eslint-disable-line

  /** Trigger native install prompt (Chrome/Edge) or no-op on iOS */
  const install = useCallback(async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      localStorage.setItem(INSTALLED_KEY, "1");
    }
    setShowBanner(false);
    setPrompt(null);
    return outcome === "accepted";
  }, [prompt]);

  const dismiss = useCallback(() => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  const resetDismiss = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    setDismissed(false);
    setShowBanner(true);
  }, []);

  return {
    prompt,                                   // raw BeforeInstallPromptEvent | null
    canInstall: !!prompt && !isInstalled,     // native prompt available
    isInstalled,
    isIOS: ios,
    dismissed,
    // showBanner: true whenever we should show install UI (native OR iOS/fallback)
    showBanner: showBanner && !isInstalled,
    install,
    dismiss,
    resetDismiss,
  };
};

export default usePWAInstall;
