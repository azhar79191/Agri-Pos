import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { CustomersProvider } from './context/CustomersContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ProductsProvider>
        <CustomersProvider>
          <App />
        </CustomersProvider>
      </ProductsProvider>
    </AuthProvider>
  </BrowserRouter>,
)
