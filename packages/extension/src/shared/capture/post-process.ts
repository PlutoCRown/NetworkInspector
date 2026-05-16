import type { AliasRule, FilterRule, HighlightRule } from "../types";
import { deleteByPath, getByPath } from "../util/path";

export function applyAlias(
  data: Record<string, unknown>,
  rules: AliasRule[] | undefined,
): Record<string, unknown> {
  if (!rules?.length) return data;
  const next = { ...data };
  for (const rule of rules) {
    const val = next[rule.field];
    if (typeof val === "string" && val === rule.match) {
      next[rule.field] = rule.replace;
    }
  }
  return next;
}

export function resolveHighlight(
  data: Record<string, unknown>,
  rules: HighlightRule[] | undefined,
): { field: string; tone: string } | undefined {
  if (!rules?.length) return undefined;
  for (const rule of rules) {
    const val = data[rule.field];
    if (typeof val === "string" && val.includes(rule.match)) {
      return { field: rule.field, tone: rule.tone };
    }
  }
  return undefined;
}

export type FilterResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; dropped: true };

export function applyFilters(
  data: Record<string, unknown>,
  rules: FilterRule[] | undefined,
): FilterResult {
  if (!rules?.length) return { ok: true, data };
  let current = { ...data };

  for (const rule of rules) {
    const fieldVal = current[rule.field];

    if (rule.action === "drop") {
      const at = getByPath(fieldVal, rule.path);
      if (at === rule.equals) {
        return { ok: false, dropped: true };
      }
    }

    if (rule.action === "strip") {
      if (fieldVal != null && typeof fieldVal === "object" && !Array.isArray(fieldVal)) {
        const clone = structuredClone(fieldVal) as Record<string, unknown>;
        deleteByPath(clone, rule.path);
        current = { ...current, [rule.field]: clone };
      }
    }
  }

  return { ok: true, data: current };
}
