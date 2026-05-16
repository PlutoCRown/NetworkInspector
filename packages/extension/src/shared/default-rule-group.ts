import type { RuleGroup } from "./types";

/** 内置示例 + 本地测试站点 */
export const DEFAULT_RULE_GROUP: RuleGroup = {
  "capture": [
    "data.a1.art"
  ],
  "enabled": true,
  "id": "acme-analytics-2026",
  "name": "A1.art 埋点捕获",
  "rules": [
    {
      "fields": {
        "popover": "json:",
        "title": ""
      },
      "id": "rule-1778939700088",
      "renderer": "title-popover",
      "url": "data.a1.art"
    }
  ],
  "sites": [
    "a1.art"
  ],
  "version": 1
}