import { extractField, extractFields } from "./extract";
import { getByPath } from "./path";
import { matchesAny } from "./regex";
import { normalizeRuleGroup } from "./normalize-rule-group";
import { applyAlias, applyFilters, resolveHighlight } from "./post-process";
import type { CaptureRecord, RawRequestPayload, Rule, RuleGroup } from "./types";

function findRuleIndex(group: RuleGroup, requestUrl: string): number {
  const patterns = group.capture;
  const matched: number[] = [];
  for (let i = 0; i < patterns.length; i++) {
    try {
      if (new RegExp(patterns[i]!).test(requestUrl)) matched.push(i);
    } catch {
      /* invalid regex */
    }
  }
  if (matched.length === 0) return -1;
  if (matched.length === 1) return matched[0]!;

  let bestIdx = matched[0]!;
  let bestLen = -1;
  for (const i of matched) {
    const pattern = patterns[i]!;
    const m = requestUrl.match(new RegExp(pattern));
    if (m && m[0].length > bestLen) {
      bestLen = m[0].length;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function extractFieldsFromObject(
  obj: unknown,
  fields: Record<string, string>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(fields)) {
    data[key] = path ? getByPath(obj, path) : obj;
  }
  return data;
}

function buildRecord(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  data: Record<string, unknown>,
  rawData: Record<string, unknown>,
): CaptureRecord | null {
  let processed = applyAlias(data, rule.alias);
  const highlight = resolveHighlight(processed, rule.highlights);
  const filtered = applyFilters(processed, rule.filters);
  if (!filtered.ok) return null;
  processed = filtered.data;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ruleGroupId: group.id,
    ruleId: rule.id,
    requestUrl: payload.url,
    timestamp: Date.now(),
    renderer: rule.renderer,
    data: processed,
    rawData,
    highlight,
  };
}

function processRuleCapture(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
): CaptureRecord | CaptureRecord[] | null {
  const input = {
    url: payload.url,
    requestHeaders: payload.requestHeaders,
    requestBody: payload.requestBody,
    responseBody: payload.responseBody,
  };

  if (rule.aggregate && rule.aggregateFrom) {
    const arr = extractField(input, rule.aggregateFrom);
    if (!Array.isArray(arr)) return null;

    const records: CaptureRecord[] = [];
    for (const item of arr) {
      const rawData = extractFieldsFromObject(item, rule.fields);
      const record = buildRecord(group, rule, payload, rawData, rawData);
      if (record) records.push(record);
    }
    return records.length ? records : null;
  }

  const rawData = extractFields(input, rule.fields);
  const single = buildRecord(group, rule, payload, rawData, rawData);
  return single;
}

export function processCapture(
  group: RuleGroup,
  payload: RawRequestPayload,
): CaptureRecord | CaptureRecord[] | null {
  const normalized = normalizeRuleGroup(group);
  if (!normalized.enabled) return null;
  if (!matchesAny(payload.tabUrl, normalized.sites)) return null;
  if (!matchesAny(payload.url, normalized.capture)) return null;

  const idx = findRuleIndex(normalized, payload.url);
  if (idx < 0) return null;
  const rule = normalized.rules[idx];
  if (!rule) return null;

  return processRuleCapture(normalized, rule, payload);
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
