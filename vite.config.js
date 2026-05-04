import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx'],
    },
  },

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    esbuildOptions: {
      drop: ['console', 'debugger'],
      logOverride: {
        'css-syntax-error': 'silent',
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Charts — Dashboard & Reports only
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-vendor')) {
            return 'vendor-charts';
          }
          // Framer Motion — POS & CartPanel only
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          // Icons — tree-shaken, small
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          // PDF — lazy-loaded, only on export
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/jspdf-autotable')) {
            return 'vendor-pdf';
          }
          // Excel — lazy-loaded, only on export
          if (id.includes('node_modules/exceljs') ||
              id.includes('node_modules/archiver') ||
              id.includes('node_modules/jszip')) {
            return 'vendor-excel';
          }
          // Socket.io — NotificationCenter only
          if (id.includes('node_modules/socket.io-client') ||
              id.includes('node_modules/engine.io-client') ||
              id.includes('node_modules/@socket.io')) {
            return 'vendor-socket';
          }
          // Axios
          if (id.includes('node_modules/axios')) return 'vendor-axios';
          // Zustand
          if (id.includes('node_modules/zustand')) return 'vendor-state';
          // Barcode scanner
          if (id.includes('node_modules/@zxing')) return 'vendor-barcode';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        compact: true,
      },
    },
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'axios', 'zustand', 'lucide-react',
    ],
    exclude: ['jspdf', 'exceljs'],
  },
})
