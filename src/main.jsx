import { retireLegacyPWA } from './utils/retireLegacyPWA';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/sdp-design.css";
import "./styles/workspace.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import FeedbackHost from './components/FeedbackHost';
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

// Retire the previous offline worker for returning visitors.
void retireLegacyPWA();

const tree = (
  <UnsavedChangesProvider>
    <AuthProvider>
      <ProductsProvider>
        <CustomersProvider>
          <App />
        </CustomersProvider>
      </ProductsProvider>
    </AuthProvider>
  <FeedbackHost /></UnsavedChangesProvider>
);

const router = createBrowserRouter([{ path: '*', element: tree }]);
createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? <StrictMode><RouterProvider router={router} /></StrictMode> : <RouterProvider router={router} />
);
