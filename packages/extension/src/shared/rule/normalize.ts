import { createEmptyRule } from "./create-empty";
import { getRendererFields, normalizeRendererId } from "../render/registry";
import type { Rule, RuleGroup } from "../types";

/** 已移除的 source 标签统一迁到 json（请求体） */
function migrateFieldRef(ref: string): string {
  return ref
    .replace(/\[source:response\]/gi, "[source:json]")
    .replace(/\[source:form-data\]/gi, "[source:json]");
}

function migrateRule(rule: Rule): Rule {
  const fields = Object.fromEntries(
    Object.entries(rule.fields).map(([k, v]) => [k, migrateFieldRef(v)]),
  );
  const splits = rule.splits
    ? Object.fromEntries(
      Object.entries(rule.splits).map(([k, v]) => [k, migrateFieldRef(v)]),
    )
    : rule.splits;
  return { ...rule, fields, splits };
}

/** 从 rules 派生 capture，并规范化 renderer */
export function normalizeRuleGroup(group: RuleGroup): RuleGroup {
  let rules = group.rules.length ? [...group.rules] : [createEmptyRule("/api/")];

  rules = rules.map((rule) => {
    const migrated = migrateRule(rule);
    const renderer = normalizeRendererId(migrated.renderer);
    const allowed = new Set(getRendererFields(renderer));
    const fields = Object.fromEntries(
      Object.entries(migrated.fields).filter(([key]) => allowed.has(key)),
    );
    return { ...migrated, renderer, fields };
  });

  const capture = rules.map((r) => r.url);
  return { ...group, capture, rules };
}
