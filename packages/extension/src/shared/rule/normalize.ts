import { createEmptyRule } from "./create-empty";
import { getRendererFields, normalizeRendererId } from "../render/registry";
import type { RuleGroup } from "../types";

/** 从 rules 派生 capture，并规范化 renderer */
export function normalizeRuleGroup(group: RuleGroup): RuleGroup {
  let rules = group.rules.length ? [...group.rules] : [createEmptyRule("/api/")];

  rules = rules.map((rule) => {
    const renderer = normalizeRendererId(rule.renderer);
    const allowed = new Set(getRendererFields(renderer));
    const fields = Object.fromEntries(
      Object.entries(rule.fields).filter(([key]) => allowed.has(key)),
    );
    return { ...rule, renderer, fields };
  });

  const capture = rules.map((r) => r.url);
  return { ...group, capture, rules };
}
