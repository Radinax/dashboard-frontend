/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must come before the React plugin — generates the typed route tree.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Proxy the API in dev so the browser talks to one origin → the httpOnly
    // refresh cookie (SameSite) flows without CORS/credentials friction.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    // Absolute base so Node's fetch resolves URLs and MSW can intercept them.
    env: { VITE_API_URL: "http://localhost/api" },
  },
});
