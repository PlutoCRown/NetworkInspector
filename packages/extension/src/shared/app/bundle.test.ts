import { describe, expect, test } from "bun:test";
import {
  buildAppExport,
  detectImportPayload,
  parseImportJson,
  pickBundleImport,
} from "./bundle";
import { DEFAULT_APP_CONFIG } from "../types";

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

  test("pickBundleImport selects partial ids", () => {
    const bundle = buildAppExport({
      ruleGroups: [
        {
          version: 1,
          id: "g1",
          name: "A",
          enabled: true,
          sites: [],
          capture: [],
          rules: [],
        },
        {
          version: 1,
          id: "g2",
          name: "B",
          enabled: true,
          sites: [],
          capture: [],
          rules: [],
        },
      ],
      activeRuleGroupId: "g2",
      captureEnabled: true,
      captures: [],
      config: {
        ...DEFAULT_APP_CONFIG,
        customProcessors: { p1: "(v) => v", p2: "(v) => v" },
        aliasMaps: {
          a1: { name: "A1", mappings: {} },
          a2: { name: "A2", mappings: {} },
        },
      },
    });
    const picked = pickBundleImport(bundle, {
      ruleGroupIds: ["g1"],
      processorIds: ["p2"],
      aliasMapKeys: [],
      overwriteRuleGroups: true,
    });
    expect(picked.ruleGroups.map((g) => g.id)).toEqual(["g1"]);
    expect(Object.keys(picked.customProcessors)).toEqual(["p2"]);
    expect(picked.activeRuleGroupId).toBeNull();
  });
});
