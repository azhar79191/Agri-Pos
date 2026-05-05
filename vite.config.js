import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enable in dev so beforeinstallprompt fires during local testing
      devOptions: {
        enabled: true,
        type: 'module',
      },
      // Use generateSW — most reliable for triggering beforeinstallprompt
      strategies: 'generateSW',
      // Point to the existing manifest
      manifestFilename: 'site.webmanifest',
      // Don't auto-inject a <link rel="manifest"> — index.html already has it
      injectRegister: 'auto',
      manifest: {
        name: 'AgriNest - Agriculture Dealers Platform',
        short_name: 'AgriNest',
        description: 'Leading platform for agriculture dealers, suppliers, and distributors.',
        start_url: '/',
        display: 'standalone',
        background_color: '#071209',
        theme_color: '#10b981',
        orientation: 'any',
        scope: '/',
        lang: 'en-PK',
        categories: ['business', 'productivity', 'shopping'],
        icons: [
          { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache the app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Network-first for navigation (SPA)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Don't cache API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/agri-pos-api\.vercel\.app\//,
            handler: 'NetworkOnly',
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],

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
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-vendor')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/jspdf-autotable')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/exceljs') ||
              id.includes('node_modules/archiver') ||
              id.includes('node_modules/jszip')) {
            return 'vendor-excel';
          }
          if (id.includes('node_modules/socket.io-client') ||
              id.includes('node_modules/engine.io-client') ||
              id.includes('node_modules/@socket.io')) {
            return 'vendor-socket';
          }
          if (id.includes('node_modules/axios')) return 'vendor-axios';
          if (id.includes('node_modules/zustand')) return 'vendor-state';
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
