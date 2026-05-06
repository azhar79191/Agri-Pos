import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh — changes show instantly without full reload
      fastRefresh: true,
    }),
  ],

  server: {
    host: true,
    port: 5173,
    // Hot Module Replacement — instant updates on save
    hmr: true,
    watch: {
      usePolling: false,
    },
    warmup: {
      clientFiles: ["./src/main.jsx", "./src/App.jsx"],
    },
  },

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    target: "es2020",
    minify: "esbuild",
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    esbuildOptions: {
      drop: ["console", "debugger"],
      logOverride: { "css-syntax-error": "silent" },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/") || id.includes("node_modules/scheduler/")) return "vendor-react";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-vendor")) return "vendor-charts";
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
          if (id.includes("node_modules/jspdf") || id.includes("node_modules/jspdf-autotable")) return "vendor-pdf";
          if (id.includes("node_modules/exceljs") || id.includes("node_modules/archiver") || id.includes("node_modules/jszip")) return "vendor-excel";
          if (id.includes("node_modules/socket.io-client") || id.includes("node_modules/engine.io-client") || id.includes("node_modules/@socket.io")) return "vendor-socket";
          if (id.includes("node_modules/axios")) return "vendor-axios";
          if (id.includes("node_modules/zustand")) return "vendor-state";
          if (id.includes("node_modules/@zxing")) return "vendor-barcode";
        },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        compact: true,
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios", "zustand", "lucide-react"],
    exclude: ["jspdf", "exceljs"],
  },
})