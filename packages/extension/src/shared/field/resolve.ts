import { extractFromSource } from "./extract";
import type { ExtractInput } from "./extract";
import { parseFieldExpr, type FieldExpr } from "./expr";
import { getByPath } from "../util/path";
import { applyAliasMap, runProcessors } from "./processors";
import type { AppConfig } from "../types";

export type SplitContext = Record<string, unknown>;

export function resolveFieldExpr(
  raw: string,
  input: ExtractInput,
  splitContext: SplitContext | null,
  config: AppConfig,
): unknown {
  const expr = parseFieldExpr(raw);
  const rawValue = readRawValue(expr, input, splitContext);
  const processed = runProcessors(rawValue, expr.processors, config);
  return applyAliasMap(processed, expr.aliasMap, config);
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
