import { useState, useEffect } from "react";

const DISMISSED_KEY = "agrinest_pwa_dismissed";

const usePWAInstall = () => {
  const [prompt, setPrompt]       = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled]  = useState(false);

  useEffect(() => {
    // Already dismissed or installed
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) { setInstalled(true); return; }

    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // Show banner after 30 seconds
    const timer = setTimeout(() => setShowBanner(true), 30000);
    return () => { window.removeEventListener("beforeinstallprompt", handler); clearTimeout(timer); };
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShowBanner(false);
    setPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return { showBanner: showBanner && !!prompt && !installed, install, dismiss };
};

export default usePWAInstall;
