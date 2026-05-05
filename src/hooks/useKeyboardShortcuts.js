import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

/**
 * All keyboard shortcuts used across the app.
 * Exported so the Settings panel can display them.
 */
export const SHORTCUTS = [
  // Navigation
  { group: "Navigation",  keys: ["G", "D"],       label: "Go to Dashboard",       action: "navigate", path: "/dashboard" },
  { group: "Navigation",  keys: ["G", "P"],        label: "Go to POS",             action: "navigate", path: "/pos" },
  { group: "Navigation",  keys: ["G", "I"],        label: "Go to Products",        action: "navigate", path: "/products" },
  { group: "Navigation",  keys: ["G", "C"],        label: "Go to Customers",       action: "navigate", path: "/customers" },
  { group: "Navigation",  keys: ["G", "R"],        label: "Go to Reports",         action: "navigate", path: "/reports" },
  { group: "Navigation",  keys: ["G", "S"],        label: "Go to Stock",           action: "navigate", path: "/stock" },
  { group: "Navigation",  keys: ["G", "O"],        label: "Go to Purchase Orders", action: "navigate", path: "/purchases/orders" },
  { group: "Navigation",  keys: ["G", "T"],        label: "Go to Settings",        action: "navigate", path: "/settings" },

  // Search
  { group: "Search",      keys: ["Ctrl", "K"],     label: "Open Quick Search",     action: "search" },

  // POS
  { group: "POS",         keys: ["F2"],            label: "Focus Barcode Input",   action: "barcode" },
  { group: "POS",         keys: ["F4"],            label: "Hold Current Sale",     action: "hold" },
  { group: "POS",         keys: ["F5"],            label: "Recall Held Sale",      action: "recall" },
  { group: "POS",         keys: ["F8"],            label: "Checkout / Pay",        action: "checkout" },

  // UI
  { group: "Interface",   keys: ["Ctrl", "\\"],    label: "Toggle Dark Mode",      action: "darkmode" },
  { group: "Interface",   keys: ["Escape"],        label: "Close Modal / Search",  action: "escape" },
  { group: "Interface",   keys: ["?"],             label: "Show Keyboard Shortcuts",action: "shortcuts" },
];

// Sequence tracker for two-key combos like G → D
let seqBuffer = "";
let seqTimer  = null;

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { actions } = useApp();

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable;

      // ── Ctrl/Cmd combos — always active ──
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "k") return; // handled by GlobalSearch
        if (e.key === "\\") { e.preventDefault(); actions.toggleDarkMode(); return; }
      }

      // Block single-key shortcuts while typing
      if (isTyping) return;

      // ── Function keys ──
      if (e.key === "F2") return; // handled by POS
      if (e.key === "Escape") return; // handled locally by modals

      // ── "?" to open shortcuts panel ──
      if (e.key === "?") {
        e.preventDefault();
        navigate("/settings");
        // small delay so settings page mounts before switching panel
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("agrinest:open-shortcuts"));
        }, 150);
        return;
      }

      // ── Two-key sequence: G → X ──
      const key = e.key.toUpperCase();

      if (seqBuffer === "G") {
        clearTimeout(seqTimer);
        seqBuffer = "";
        e.preventDefault();
        switch (key) {
          case "D": navigate("/dashboard");         break;
          case "P": navigate("/pos");               break;
          case "I": navigate("/products");          break;
          case "C": navigate("/customers");         break;
          case "R": navigate("/reports");           break;
          case "S": navigate("/stock");             break;
          case "O": navigate("/purchases/orders");  break;
          case "T": navigate("/settings");          break;
          default: break;
        }
        return;
      }

      if (key === "G") {
        seqBuffer = "G";
        seqTimer  = setTimeout(() => { seqBuffer = ""; }, 1000);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(seqTimer);
    };
  }, [navigate, actions]);
};

export default useKeyboardShortcuts;
