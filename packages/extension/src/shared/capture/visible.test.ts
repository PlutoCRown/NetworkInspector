import { describe, expect, test } from "bun:test";
import { countVisibleCaptures, getVisibleCaptures } from "./visible";
import type { AppState, CaptureRecord } from "../types";

function capture(id: string, ruleGroupId: string): CaptureRecord {
  return {
    id,
    ruleGroupId,
    ruleId: "r1",
    requestUrl: "https://example.com",
    timestamp: 1,
    renderer: "card",
    data: {},
    rawData: {},
  };
}

const baseState: AppState = {
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
      enabled: false,
      sites: [],
      capture: [],
      rules: [],
    },
  ],
  activeRuleGroupId: "g1",
  captureEnabled: true,
  captures: [capture("c1", "g1"), capture("c2", "g2"), capture("c3", "g1")],
  config: { aliasMaps: {}, customProcessors: {} },
};

describe("visible-captures", () => {
  test("counts only enabled rule groups", () => {
    expect(countVisibleCaptures(baseState)).toBe(2);
    expect(getVisibleCaptures(baseState).map((c) => c.id)).toEqual(["c1", "c3"]);
  });
});
