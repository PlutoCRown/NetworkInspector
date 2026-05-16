import type { Rule, RuleGroup } from "./types";

function emptyRuleForUrl(url: string): Rule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    renderer: "title-popover",
    fields: {
      title: "json:",
      desc: "json:",
      expend: "json:",
      popover: "json:",
    },
    aggregate: false,
  };
}

/** 保证 capture 与 rules 一一对应，并同步 url */
export function normalizeRuleGroup(group: RuleGroup): RuleGroup {
  const capture = [...group.capture];
  let rules = [...group.rules];

  while (rules.length < capture.length) {
    const url = capture[rules.length] ?? "/api/";
    rules.push(emptyRuleForUrl(url));
  }
  while (capture.length < rules.length) {
    capture.push(rules[capture.length]?.url ?? "/api/");
  }

  rules = rules.map((rule, i) => ({
    ...rule,
    url: capture[i] ?? rule.url,
    aggregate: rule.aggregate ?? false,
  }));

  return { ...group, capture, rules };
}
