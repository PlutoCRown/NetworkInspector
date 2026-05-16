import {
  hasAggregateSource,
  migrateFieldExprString,
  parseFieldExpr,
  serializeFieldExpr,
} from "./field-expr";
import { createEmptyRule } from "./create-empty-rule";
import { resolveRendererId } from "./renderer-registry";
import type { Rule, RuleGroup } from "./types";

function migrateAggregateFrom(rule: Rule): Rule {
  let aggregateFrom = rule.aggregateFrom ?? "";
  if (rule.aggregate && aggregateFrom && !hasAggregateSource(aggregateFrom)) {
    const expr = parseFieldExpr(aggregateFrom);
    expr.aggregate = true;
    aggregateFrom = serializeFieldExpr(expr);
  }
  const aggregate = rule.aggregate ?? hasAggregateSource(aggregateFrom);
  return { ...rule, aggregateFrom: aggregate ? aggregateFrom : undefined, aggregate };
}

function migrateFieldRefs(rule: Rule): Rule {
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(rule.fields)) {
    let next = v;
    if (v.startsWith("aggregate:")) {
      next = serializeFieldExpr({
        ...parseFieldExpr(`item:${v.slice("aggregate:".length)}`),
        scope: "item",
      });
    } else {
      next = migrateFieldExprString(v);
    }
    fields[k] = next;
  }
  let aggregateFrom = rule.aggregateFrom;
  if (aggregateFrom) {
    aggregateFrom = migrateFieldExprString(aggregateFrom);
  }
  return { ...rule, fields, aggregateFrom };
}

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

  rules = rules.map((rule, i) => {
    const migrated = migrateFieldRefs(migrateAggregateFrom(rule));
    return {
      ...migrated,
      url: capture[i] ?? migrated.url,
      renderer: resolveRendererId(migrated.renderer),
    };
  });

  return { ...group, capture, rules };
}
