import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/login": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/logout": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/me": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/signup": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
  };
});
