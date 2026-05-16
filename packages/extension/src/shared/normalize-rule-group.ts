import { createEmptyRule } from "./create-empty-rule";
import { resolveRendererId } from "./renderer-registry";
import type { RuleGroup } from "./types";

/** 保证 capture 与 rules 一一对应，并同步 url */
export function normalizeRuleGroup(group: RuleGroup): RuleGroup {
  const capture = [...group.capture];
  let rules = [...group.rules];

  while (rules.length < capture.length) {
    const url = capture[rules.length] ?? "/api/";
    rules.push(createEmptyRule(url));
  }
  while (capture.length < rules.length) {
    capture.push(rules[capture.length]?.url ?? "/api/");
  }

  rules = rules.map((rule, i) => ({
    ...rule,
    url: capture[i] ?? rule.url,
    renderer: resolveRendererId(rule.renderer),
    aggregate: rule.aggregate ?? false,
  }));

  return { ...group, capture, rules };
}
