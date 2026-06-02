import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5003",
    },
  },
  preview: {
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
