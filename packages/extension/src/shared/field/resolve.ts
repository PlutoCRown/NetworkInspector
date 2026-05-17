import { extractFromSource } from "./extract";
import type { ExtractInput } from "./extract";
import { parseFieldExpr, type FieldExpr } from "./expr";
import { getByPath } from "../util/path";
import { applyAliasMap, runProcessorsDetailed } from "./processors";
import type { AppConfig } from "../types";

export type SplitContext = Record<string, unknown>;

export interface FieldResolveResult {
  value: unknown;
  issues: string[];
}

export function resolveFieldExpr(
  raw: string,
  input: ExtractInput,
  splitContext: SplitContext | null,
  config: AppConfig,
): unknown {
  return resolveFieldExprDetailed(raw, input, splitContext, config).value;
}

export function resolveFieldExprDetailed(
  raw: string,
  input: ExtractInput,
  splitContext: SplitContext | null,
  config: AppConfig,
): FieldResolveResult {
  const expr = parseFieldExpr(raw);
  const issues: string[] = [];

  if (expr.aliasMap && !(expr.aliasMap in config.aliasMaps)) {
    issues.push(`Alias 组「${expr.aliasMap}」不存在`);
  }

  const rawValue = readRawValue(expr, input, splitContext);
  const { value: processed, issues: procIssues } = runProcessorsDetailed(
    rawValue,
    expr.processors,
    config,
  );
  issues.push(...procIssues);

  return { value: applyAliasMap(processed, expr.aliasMap, config), issues };
}

function readRawValue(
  expr: FieldExpr,
  input: ExtractInput,
  splitContext: SplitContext | null,
): unknown {
  if (expr.splitRef) {
    const item = splitContext?.[expr.splitRef];
    if (item == null) return null;
    if (!expr.path) return item;
    return getByPath(item, expr.path);
  }

  if (expr.source) {
    return extractFromSource(input, expr.source, expr.path);
  }

  if (expr.path) return expr.path;

  return null;
}

/** 拆分源为数组时逐项展开；否则将整段值当作单条消息 */
export function coerceSplitItems(value: unknown): unknown[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length > 0 ? value : null;
  return [value];
}

export function resolveSplitArray(
  splitExpr: string,
  input: ExtractInput,
): unknown[] | null {
  const expr = parseFieldExpr(splitExpr);
  const value = readRawValue({ ...expr, splitRef: null }, input, null);
  return coerceSplitItems(value);
}
