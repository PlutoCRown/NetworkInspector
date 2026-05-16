import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [tailwindcss(), react(), crx({ manifest })],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    rollupOptions: {
      input: {
        editor: resolve(__dirname, "src/editor/index.html"),
      },
    },
  },
});
