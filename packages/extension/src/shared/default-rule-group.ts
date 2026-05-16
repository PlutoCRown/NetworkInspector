import type { RuleGroup } from "./types";

/** 内置示例 + 本地测试站点 */
export const DEFAULT_RULE_GROUP: RuleGroup = {
  version: 1,
  id: "acme-analytics-2026",
  name: "Acme 埋点调试",
  enabled: true,
  sites: [
    "^https://(app|staging)\\.acme\\.io/",
    "^https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?/",
    "^file://",
  ],
  capture: ["/v1/events", "/v1/beacon"],
  rules: [
    {
      id: "events-api",
      url: "/v1/events",
      renderer: "title-popover",
      fields: {
        title: "json:event",
        popover: "json:properties",
      },
      alias: [
        { field: "title", match: "page_view", replace: "页面浏览" },
        { field: "title", match: "button_click", replace: "按钮点击" },
      ],
      highlights: [
        { field: "title", match: "error", tone: "danger" },
        { field: "title", match: "purchase", tone: "success" },
      ],
      filters: [
        { field: "popover", path: "debug", equals: true, action: "drop" },
      ],
    },
    {
      id: "beacon-api",
      url: "/v1/beacon",
      renderer: "title-desc-expand",
      fields: {
        title: "query:action",
        desc: "query:module",
        expend: "json:",
      },
      filters: [{ field: "expend", path: "_internal", action: "strip" }],
    },
  ],
};
