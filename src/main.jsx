import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { CustomersProvider } from './context/CustomersContext.jsx';

if (import.meta.env.PROD) {
  const reportWebVitals = (metric) => {
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  };

  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }).catch(() => {});
}

window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Promise]', e.reason);
});

const root = createRoot(document.getElementById('root'));

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
