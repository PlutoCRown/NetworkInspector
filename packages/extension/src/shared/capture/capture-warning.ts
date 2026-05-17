import type { CaptureRecord, CaptureWarningInfo } from "../types";

export type { CaptureWarningInfo };

export function isCaptureWarning(record: CaptureRecord): boolean {
  return Boolean(record.warning) && !record.error;
}

function warningSummary(issues: string[]): string {
  if (issues.length === 0) return "部分字段提取异常";
  if (issues.length === 1) {
    const line = issues[0]!;
    return line.length > 72 ? `${line.slice(0, 72)}…` : line;
  }
  return `${issues.length} 个字段提取异常`;
}

/** 在已成功构建的捕获记录上附加警告（不改变 data） */
export function attachCaptureWarning(
  record: CaptureRecord,
  issues: string[],
  preamble?: string,
): CaptureRecord {
  if (issues.length === 0 || record.error) return record;

  const detailLines = preamble
    ? [preamble, "", ...issues]
    : ["以下字段在提取时出现问题，卡片内容可能不完整：", "", ...issues];

  const warning: CaptureWarningInfo = {
    summary: warningSummary(issues),
    detail: detailLines.join("\n"),
  };

  return { ...record, warning };
}
