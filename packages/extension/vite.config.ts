import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { readFileSync } from "fs";
import { resolve } from "path";
import manifest from "./manifest.config";

function tplRawPlugin(): Plugin {
  return {
    name: "tpl-raw",
    enforce: "pre",
    load(id) {
      if (id.includes(".tpl") && id.endsWith("?raw")) {
        const file = id.replace(/\?raw$/, "");
        return `export default ${JSON.stringify(readFileSync(file, "utf8"))}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [tplRawPlugin(), react(), crx({ manifest })],
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
