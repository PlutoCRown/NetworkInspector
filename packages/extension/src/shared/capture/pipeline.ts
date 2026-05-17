import { ruleHasSplits } from "../field/expr";
import {
  resolveFieldExprDetailed,
  resolveSplitArray,
  type SplitContext,
} from "../field/resolve";
import type { ExtractInput } from "../field/extract";
import { getRendererFields } from "../render/registry";
import { normalizeRuleGroup } from "../rule/normalize";
import { matchesAny } from "../util/regex";
import {
  buildCaptureErrorRecord,
  hasMeaningfulFieldValue,
} from "./capture-error";
import { attachCaptureWarning } from "./capture-warning";
import { applyAlias, applyFilters, resolveHighlight } from "./post-process";
import type { AppConfig, CaptureRecord, RawRequestPayload, Rule, RuleGroup } from "../types";

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

function extractFieldsWithConfig(
  fields: Record<string, string>,
  input: ExtractInput,
  splitContext: SplitContext | null,
  config: AppConfig,
): { data: Record<string, unknown>; issues: string[] } {
  const data: Record<string, unknown> = {};
  const issues: string[] = [];
  for (const [key, ref] of Object.entries(fields)) {
    const { value, issues: fieldIssues } = resolveFieldExprDetailed(
      ref,
      input,
      splitContext,
      config,
    );
    data[key] = value;
    for (const msg of fieldIssues) {
      issues.push(`字段「${key}」(${ref})：${msg}`);
    }
  }
  return { data, issues };
}

function primaryFieldKey(rendererId: string): string {
  const keys = getRendererFields(rendererId);
  return keys[0] ?? "title";
}

function isEmptyCapture(
  data: Record<string, unknown>,
  rendererId: string,
): boolean {
  const keys = getRendererFields(rendererId);
  return !keys.some((k) => hasMeaningfulFieldValue(data[k]));
}

function buildSuccessRecord(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  data: Record<string, unknown>,
  rawData: Record<string, unknown>,
): CaptureRecord | null {
  let processed = applyAlias(data, rule.alias);
  const highlight = resolveHighlight(processed, rule.highlights);
  const filtered = applyFilters(processed, rule.filters);
  if (!filtered.ok) {
    return buildCaptureErrorRecord(group, rule, payload, "捕获被过滤规则丢弃", [
      filtered.reason,
      "可在规则中调整 filters，或检查请求数据是否符合过滤条件。",
    ]);
  }
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

function buildReadFailureRecord(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  data: Record<string, unknown>,
  issues: string[],
  reason: string,
): CaptureRecord {
  const primary = primaryFieldKey(rule.renderer);
  const primaryVal = data[primary];
  const summary =
    issues.length > 0
      ? issues[0]!
      : !hasMeaningfulFieldValue(primaryVal)
        ? `字段「${primary}」读取为空`
        : reason;

  const detailLines = [
    reason,
    ...issues,
    "",
    "已解析字段值：",
    ...Object.entries(data).map(
      ([k, v]) => `  ${k}: ${v == null ? "（空）" : JSON.stringify(v)}`,
    ),
  ];

  return buildCaptureErrorRecord(group, rule, payload, summary, detailLines);
}

function processSplitCaptures(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  input: ExtractInput,
  config: AppConfig,
): CaptureRecord | CaptureRecord[] {
  const splits = rule.splits!;
  const splitEntries = Object.entries(splits);

  for (const [name, expr] of splitEntries) {
    const arr = resolveSplitArray(expr, input);
    if (!arr?.length) {
      return buildCaptureErrorRecord(group, rule, payload, `拆分「${name}」无有效数据`, [
        `拆分表达式：${expr}`,
        "来源需解析为非空数组；若为对象/标量，请确认路径是否正确。",
        "若无需批量拆分，可关闭 splits，改用 [source:json] 直接写字段路径。",
      ]);
    }
  }

  const arrays: Record<string, unknown[]> = {};
  for (const [name, expr] of splitEntries) {
    arrays[name] = resolveSplitArray(expr, input)!;
  }

  const primaryName = splitEntries[0]![0];
  const primaryArr = arrays[primaryName]!;
  const records: CaptureRecord[] = [];

  for (let i = 0; i < primaryArr.length; i++) {
    const splitContext: SplitContext = {};
    for (const [name, arr] of Object.entries(arrays)) {
      splitContext[name] = arr[i] ?? arr[0];
    }
    const { data, issues } = extractFieldsWithConfig(
      rule.fields,
      input,
      splitContext,
      config,
    );
    const record = buildSuccessRecord(group, rule, payload, data, data);
    if (record) {
      if (record.error) records.push(record);
      else if (isEmptyCapture(data, rule.renderer)) {
        records.push(
          buildReadFailureRecord(
            group,
            rule,
            payload,
            data,
            issues,
            `拆分项 #${i + 1} 字段均为空`,
          ),
        );
      } else if (issues.length > 0 && !hasMeaningfulFieldValue(data[primaryFieldKey(rule.renderer)])) {
        records.push(
          buildReadFailureRecord(
            group,
            rule,
            payload,
            data,
            issues,
            `拆分项 #${i + 1} 读取异常`,
          ),
        );
      } else {
        records.push(
          issues.length > 0
            ? attachCaptureWarning(
              record,
              issues.map((m) => `拆分项 #${i + 1}：${m}`),
            )
            : record,
        );
      }
    }
  }

  if (records.length === 0) {
    return buildCaptureErrorRecord(group, rule, payload, "批量拆分后无有效捕获", [
      `共 ${primaryArr.length} 条拆分结果，均未通过过滤或字段为空。`,
    ]);
  }

  return records;
}

function processRuleCapture(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  config: AppConfig,
): CaptureRecord | CaptureRecord[] {
  const input: ExtractInput = {
    url: payload.url,
    requestHeaders: payload.requestHeaders,
    requestBody: payload.requestBody,
    responseBody: payload.responseBody,
  };

  if (ruleHasSplits(rule)) {
    return processSplitCaptures(group, rule, payload, input, config);
  }

  const { data, issues } = extractFieldsWithConfig(rule.fields, input, null, config);
  const record = buildSuccessRecord(group, rule, payload, data, data);
  if (record?.error) return record;

  if (isEmptyCapture(data, rule.renderer)) {
    return buildReadFailureRecord(
      group,
      rule,
      payload,
      data,
      issues,
      "所有展示字段均为空",
    );
  }

  if (issues.length > 0 && !hasMeaningfulFieldValue(data[primaryFieldKey(rule.renderer)])) {
    return buildReadFailureRecord(group, rule, payload, data, issues, "字段读取失败");
  }

  if (record) {
    return issues.length > 0 ? attachCaptureWarning(record, issues) : record;
  }

  return buildCaptureErrorRecord(group, rule, payload, "无法生成捕获", [
    "未知原因导致 buildSuccessRecord 返回空。",
    ...issues,
  ]);
}

export function processCapture(
  group: RuleGroup,
  payload: RawRequestPayload,
  config: AppConfig,
): CaptureRecord | CaptureRecord[] | null {
  const normalized = normalizeRuleGroup(group);
  if (!normalized.enabled) return null;
  if (!matchesAny(payload.tabUrl, normalized.sites)) return null;
  if (!matchesAny(payload.url, normalized.capture)) return null;

  const idx = findRuleIndex(normalized, payload.url);
  if (idx < 0) return null;
  const rule = normalized.rules[idx];
  if (!rule) return null;

  return processRuleCapture(normalized, rule, payload, config);
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
