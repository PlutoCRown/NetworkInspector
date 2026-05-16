import type { Rule } from "./types";

export function createEmptyRule(url: string): Rule {
  return {
    id: `rule-${Date.now()}`,
    url,
    renderer: "card",
    fields: { title: "[source:json]event" },
  };
}
