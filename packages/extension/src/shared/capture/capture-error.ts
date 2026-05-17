import type { CaptureErrorInfo, CaptureRecord, RawRequestPayload } from "../types";
import type { Rule, RuleGroup } from "../types/rule";

export type { CaptureErrorInfo };

export function isCaptureError(record: CaptureRecord): boolean {
  return Boolean(record.error);
}

function newCaptureId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCaptureErrorDetail(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  lines: string[],
): string {
  const body =
    payload.requestBody != null
      ? payload.requestBody.length > 2000
        ? `${payload.requestBody.slice(0, 2000)}…`
        : payload.requestBody
      : "（无）";

  return [
    `规则组：${group.name} (${group.id})`,
    `规则：${rule.id} · renderer=${rule.renderer}`,
    `请求：${payload.method} ${payload.url}`,
    `页面：${payload.tabUrl}`,
    "",
    ...lines,
    "",
    "请求体摘要：",
    body,
  ].join("\n");
}

export function buildCaptureErrorRecord(
  group: RuleGroup,
  rule: Rule,
  payload: RawRequestPayload,
  summary: string,
  detailLines: string[],
): CaptureRecord {
  return {
    id: newCaptureId(),
    ruleGroupId: group.id,
    ruleId: rule.id,
    requestUrl: payload.url,
    timestamp: Date.now(),
    renderer: "error",
    data: {},
    rawData: {},
    error: {
      summary,
      detail: formatCaptureErrorDetail(group, rule, payload, detailLines),
    },
  };
}

export function hasMeaningfulFieldValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" && Number.isNaN(value)) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}
