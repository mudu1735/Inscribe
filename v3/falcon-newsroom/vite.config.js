import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' https://apis.google.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' ws: wss: https://apis.google.com https://accounts.google.com https://www.googleapis.com",
  "frame-src https://accounts.google.com https://docs.google.com https://drive.google.com https://*.google.com",
  "form-action 'self' https://accounts.google.com",
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": contentSecurityPolicy,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    headers: securityHeaders,
    proxy: {
      "/api": "http://127.0.0.1:5003",
    },
  },
  preview: {
    headers: securityHeaders,
    proxy: {
      "/api": "http://127.0.0.1:5003",
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          (
            warning.message.includes("use client") ||
            warning.message.includes("framer-motion") ||
            warning.message.includes("lucide-react") ||
            warning.message.includes("animated-dropdown")
          )
        ) {
          return;
        }
        if (warning.message.includes("Can't resolve original location of error")) {
          return;
        }
        warn(warning);
      },
    },
  },
});
