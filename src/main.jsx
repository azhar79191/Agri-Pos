import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/sdp-design.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import { CustomersProvider } from "./context/CustomersContext.jsx";

// Report web vitals to analytics in production only
if (import.meta.env.PROD) {
  const reportWebVitals = (metric) => {
    if (window.gtag) {
      window.gtag("event", metric.name, {
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_category: "Web Vitals",
        event_label: metric.id,
        non_interaction: true,
      });
    }
  };
  import("web-vitals")
    .then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
    })
    .catch(() => {});
}

window.addEventListener("error", (e) => console.error("[Global Error]", e.error));
window.addEventListener("unhandledrejection", (e) => console.error("[Unhandled Promise]", e.reason));

// Register Service Worker for PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[SW] Registered:", reg.scope))
      .catch((err) => console.warn("[SW] Registration failed:", err));
  });
}

const tree = (
  <BrowserRouter>
    <AuthProvider>
      <ProductsProvider>
        <CustomersProvider>
          <App />
        </CustomersProvider>
      </ProductsProvider>
    </AuthProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? <StrictMode>{tree}</StrictMode> : tree
);
