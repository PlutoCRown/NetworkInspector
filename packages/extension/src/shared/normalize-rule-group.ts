import { createEmptyRule } from "./create-empty-rule";
import { normalizeRendererId } from "./renderer-registry";
import type { RuleGroup } from "./types";

/** 从 rules 派生 capture，并规范化 renderer */
export function normalizeRuleGroup(group: RuleGroup): RuleGroup {
  let rules = group.rules.length ? [...group.rules] : [createEmptyRule("/api/")];

  rules = rules.map((rule) => ({
    ...rule,
    renderer: normalizeRendererId(rule.renderer),
  }));

  const capture = rules.map((r) => r.url);
  return { ...group, capture, rules };
}
