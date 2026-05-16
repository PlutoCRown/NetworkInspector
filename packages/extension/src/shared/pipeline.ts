import { extractFields } from "./extract";
import { longestMatchingPattern, matchesAny } from "./regex";
import { applyAlias, applyFilters, resolveHighlight } from "./post-process";
import type { CaptureRecord, RawRequestPayload, Rule, RuleGroup } from "./types";

function findRule(group: RuleGroup, requestUrl: string): Rule | null {
  const matchedPatterns = group.rules
    .map((r) => r.url)
    .filter((pattern) => {
      try {
        return new RegExp(pattern).test(requestUrl);
      } catch {
        return false;
      }
    });

  const best = longestMatchingPattern(
    requestUrl,
    matchedPatterns.length ? matchedPatterns : [],
  );
  if (!best) return null;
  return group.rules.find((r) => r.url === best) ?? null;
}

export function processCapture(
  group: RuleGroup,
  payload: RawRequestPayload,
): CaptureRecord | null {
  if (!group.enabled) return null;
  if (!matchesAny(payload.tabUrl, group.sites)) return null;
  if (!matchesAny(payload.url, group.capture)) return null;

  const rule = findRule(group, payload.url);
  if (!rule) return null;

  const rawData = extractFields(
    {
      url: payload.url,
      requestHeaders: payload.requestHeaders,
      requestBody: payload.requestBody,
      responseBody: payload.responseBody,
    },
    rule.fields,
  );

  let data = applyAlias(rawData, rule.alias);
  const highlight = resolveHighlight(data, rule.highlights);
  const filtered = applyFilters(data, rule.filters);
  if (!filtered.ok) return null;
  data = filtered.data;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ruleGroupId: group.id,
    ruleId: rule.id,
    requestUrl: payload.url,
    timestamp: Date.now(),
    renderer: rule.renderer,
    data,
    rawData,
    highlight,
  };
}

export function validateRuleGroup(input: unknown): input is RuleGroup {
  if (!input || typeof input !== "object") return false;
  const g = input as RuleGroup;
  return (
    g.version === 1 &&
    typeof g.id === "string" &&
    typeof g.name === "string" &&
    typeof g.enabled === "boolean" &&
    Array.isArray(g.sites) &&
    Array.isArray(g.capture) &&
    Array.isArray(g.rules)
  );
}
