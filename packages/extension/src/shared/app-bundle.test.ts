import { describe, expect, test } from "bun:test";
import { buildAppExport, detectImportPayload, parseImportJson } from "./app-bundle";
import { DEFAULT_APP_CONFIG } from "./types";

describe("app-bundle", () => {
  test("detects full export bundle", () => {
    const bundle = buildAppExport({
      ruleGroups: [
        {
          version: 1,
          id: "g1",
          name: "Test",
          enabled: true,
          sites: [],
          capture: [],
          rules: [],
        },
      ],
      activeRuleGroupId: "g1",
      captureEnabled: true,
      captures: [],
      config: {
        ...DEFAULT_APP_CONFIG,
        customProcessors: { fn1: "(v) => v" },
        aliasMaps: { ev: { name: "事件", mappings: { a: "b" } } },
      },
    });
    const detected = detectImportPayload(bundle);
    expect(detected.kind).toBe("bundle");
    if (detected.kind === "bundle") {
      expect(detected.stats.ruleGroupCount).toBe(1);
      expect(detected.stats.processorCount).toBe(1);
      expect(detected.stats.aliasMapCount).toBe(1);
    }
  });

  test("detects single rule group", () => {
    const detected = parseImportJson(
      JSON.stringify({
        version: 1,
        id: "g1",
        name: "A",
        enabled: true,
        sites: ["^https://"],
        capture: ["/api"],
        rules: [{ id: "r1", url: "/api", renderer: "card", fields: { title: "x" } }],
      }),
    );
    expect(detected.kind).toBe("rule-group");
  });
});
