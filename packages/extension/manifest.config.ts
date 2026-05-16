import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "NetworkInspector",
  version: "0.1.0",
  description: "按规则组捕获网络请求并结构化展示埋点数据",
  permissions: ["storage", "sidePanel", "tabs", "scripting"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_title: "NetworkInspector",
  },
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/inject-main.ts"],
      run_at: "document_start",
      world: "MAIN",
    },
    {
      matches: ["<all_urls>"],
      js: ["src/content/relay.ts"],
      run_at: "document_start",
    },
  ],
});
