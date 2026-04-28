import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { CustomersProvider } from './context/CustomersContext.jsx'

// Performance monitoring
if (import.meta.env.PROD) {
  // Report Web Vitals in production
  const reportWebVitals = (metric) => {
    // Send to analytics endpoint if configured
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  };

  // Lazy load web-vitals only in production
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }).catch(() => {});
}

// Global error handler
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error);
  // Send to error tracking service if configured
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Promise]', e.reason);
});

const root = createRoot(document.getElementById('root'));

// Only use StrictMode in development (causes double-renders)
const AppWrapper = import.meta.env.DEV ? (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CustomersProvider>
            <App />
          </CustomersProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
) : (
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

root.render(AppWrapper);
