import { extractFromSource } from "./extract";
import type { ExtractInput } from "./extract";
import { parseFieldExpr, type FieldExpr } from "./field-expr";
import { getByPath } from "./path";
import { applyAliasMap, runProcessors } from "./processors";
import type { AppConfig } from "./types";

export function resolveFieldExpr(
  raw: string,
  input: ExtractInput,
  item: unknown | null,
  config: AppConfig,
): unknown {
  const expr = parseFieldExpr(raw);
  const rawValue = readRawValue(expr, input, item);
  const processed = runProcessors(rawValue, expr.processors, config);
  return applyAliasMap(processed, expr.aliasMap, config);
}

function readRawValue(
  expr: FieldExpr,
  input: ExtractInput,
  item: unknown | null,
): unknown {
  if (expr.scope === "item") {
    if (!expr.path) return item;
    return getByPath(item, expr.path);
  }

  if (expr.source) {
    return extractFromSource(input, expr.source, expr.path);
  }

  // 无来源标签：path 为固定文本
  if (expr.path) return expr.path;

  return null;
}

export function resolveAggregateArray(
  aggregateFrom: string,
  input: ExtractInput,
): unknown[] | null {
  const expr = parseFieldExpr(aggregateFrom);
  const value = readRawValue(
    { ...expr, scope: "request", aggregate: false },
    input,
    null,
  );
  return Array.isArray(value) ? value : null;
}
