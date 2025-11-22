import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    nodePolyfills({
      // Enable polyfills for Buffer and other Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
    // Bundle analyzer for production builds
    process.env.ANALYZE === 'true' ? visualizer({
      filename: 'dist/public/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }) : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['wouter'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          query: ['@tanstack/react-query'],
          ton: ['@ton/core', '@ton/ton'],
          tonconnect: ['@tonconnect/ui-react'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          icons: ['lucide-react', 'react-icons'],
          charts: ['recharts'],
        },
      },
    },
    // Set bundle size limits
    chunkSizeWarningLimit: 400, // Warn when chunks exceed 400KB
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
