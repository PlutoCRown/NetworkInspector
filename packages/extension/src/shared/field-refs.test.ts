import { describe, expect, test } from "bun:test";
import {
  collectFieldRefIdsFromRuleGroup,
  configAvailableAfterImport,
  getMissingFieldRefs,
} from "./field-refs";
import type { AppConfig, RuleGroup } from "./types";

const GROUP: RuleGroup = {
  version: 1,
  id: "g1",
  name: "T",
  enabled: true,
  sites: [],
  capture: ["/api"],
  rules: [
    {
      id: "r1",
      url: "/api",
      renderer: "card",
      fields: {
        title: "[scope:item]event[processor:customFn][alias:ev]",
      },
    },
  ],
};

describe("field-refs", () => {
  test("collects custom processor and alias ids", () => {
    const ids = collectFieldRefIdsFromRuleGroup(GROUP);
    expect(ids.processors).toEqual(["customFn"]);
    expect(ids.aliases).toEqual(["ev"]);
  });

  test("warns when refs missing after partial import", () => {
    const current: AppConfig = { aliasMaps: {}, customProcessors: {} };
    const incoming: AppConfig = {
      aliasMaps: { ev: { name: "E", mappings: {} } },
      customProcessors: { customFn: "(v) => v" },
    };
    const available = configAvailableAfterImport(current, incoming, {
      processors: false,
      aliasMaps: false,
    });
    const missing = getMissingFieldRefs([GROUP], available);
    expect(missing.missingProcessors).toContain("customFn");
    expect(missing.missingAliases).toContain("ev");
  });
});
