import { useState, useEffect, useCallback } from "react";

const DISMISSED_KEY = "agrinest_pwa_dismissed";

const usePWAInstall = () => {
  const [prompt, setPrompt]         = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setInstalled] = useState(
    window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Show banner immediately — no 30s delay
      if (!localStorage.getItem(DISMISSED_KEY)) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShowBanner(false);
    setPrompt(null);
    return outcome === "accepted";
  }, [prompt]);

  const dismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  const resetDismiss = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    if (prompt) setShowBanner(true);
  }, [prompt]);

  return {
    prompt,                          // the raw event — null if not available
    canInstall: !!prompt && !isInstalled,
    isInstalled,
    showBanner: showBanner && !!prompt && !isInstalled,
    install,
    dismiss,
    resetDismiss,
  };
};

export default usePWAInstall;
