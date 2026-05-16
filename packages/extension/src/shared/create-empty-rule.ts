import { defaultFieldsForRenderer } from "./renderer-registry";
import type { Rule } from "./types";

export function createEmptyRule(url: string, renderer = "card"): Rule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    renderer,
    aggregate: false,
    fields: defaultFieldsForRenderer(renderer, false),
  };
}
