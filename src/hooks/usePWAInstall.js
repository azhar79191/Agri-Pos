import { useState, useEffect, useCallback } from "react";

const INSTALLED_KEY = "agrinest_pwa_installed";

/** True when running as an installed PWA (standalone mode) */
const checkStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

/** True on iOS Safari — no beforeinstallprompt support */
const checkIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const usePWAInstall = () => {
  const [prompt, setPrompt] = useState(null);

  // isInstalled: only true when ACTUALLY running as standalone PWA
  // Never read from localStorage — that caused false positives
  const [isInstalled, setInstalled] = useState(checkStandalone);

  useEffect(() => {
    // Already installed — nothing to listen for
    if (checkStandalone()) {
      setInstalled(true);
      return;
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      localStorage.setItem(INSTALLED_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  /** Trigger the native install dialog. Returns true if accepted. */
  const install = useCallback(async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      localStorage.setItem(INSTALLED_KEY, "1");
    }
    setPrompt(null);
    return outcome === "accepted";
  }, [prompt]);

  return {
    /** The raw BeforeInstallPromptEvent — null until browser fires it */
    prompt,
    /** True when native one-tap install is available (Chrome/Edge/Android) */
    canInstall: !!prompt && !isInstalled,
    /** True only when actually running as installed standalone PWA */
    isInstalled,
    /** True on iOS Safari — must use manual Add to Home Screen */
    isIOS: checkIOS(),
  };
};

export default usePWAInstall;
