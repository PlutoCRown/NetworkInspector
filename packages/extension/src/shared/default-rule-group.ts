import type { RuleGroup } from "./types";

export const DEFAULT_RULE_GROUPS: RuleGroup[] = [
  {
    version: 1,
    id: "acme-analytics-2026",
    name: "A1.art 埋点捕获",
    enabled: true,
    sites: ["a1.art/.*"],
    capture: ["data\\.a1\\.art"],
    rules: [
      {
        id: "rule-a1",
        url: "data\\.a1\\.art",
        renderer: "title-popover",
        aggregate: true,
        fields: {
          title: "action",
          popover: "properties",
        },
        aggregateFrom: "json:",
      },
    ],
  },
  {
    version: 1,
    id: "group-1778944597173",
    name: "DOUYIN",
    enabled: true,
    sites: ["douyin.com/.*"],
    capture: ["mcs.zijieapi.com/list"],
    rules: [
      {
        id: "rule-1778944597173",
        url: "mcs.zijieapi.com/list",
        renderer: "title-popover",
        aggregate: true,
        fields: {
          title: "event",
          popover: "params",
        },
        aggregateFrom: "json:0.events",
      },
    ],
  },
];

/** @deprecated 使用 DEFAULT_RULE_GROUPS */
export const DEFAULT_RULE_GROUP = DEFAULT_RULE_GROUPS[0]!;
