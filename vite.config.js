import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts (heaviest library)
          'vendor-charts': ['recharts'],
          // Framer motion
          'vendor-motion': ['framer-motion'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // PDF/Excel utilities
          'vendor-pdf': ['jspdf'],
          'vendor-excel': ['exceljs'],
        },
      },
    },
  },
})
