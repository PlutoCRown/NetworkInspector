import type { FieldSource } from "./types";

const SOURCES: FieldSource[] = ["query", "json", "response", "form-data", "header"];

export type FieldScope = "request" | "item";

export interface FieldExpr {
  scope: FieldScope;
  source: FieldSource | null;
  path: string;
  /** 字段引用拆分项，如 [aggregate:item] */
  splitRef: string | null;
  processors: string[];
  aliasMap: string | null;
}

export interface FieldExprTagOption {
  id: string;
  label: string;
  kind: "source" | "aggregate" | "processor" | "alias";
}

const TAG_RE = /\[([^\]]+)\]/g;

export const DEFAULT_SPLIT_NAME = "item";

function bracketTag(kind: string, value?: string): string {
  return value !== undefined && value !== "" ? `[${kind}:${value}]` : `[${kind}]`;
}

export function emptyFieldExpr(scope: FieldScope = "request"): FieldExpr {
  return {
    scope,
    source: null,
    path: "",
    splitRef: null,
    processors: [],
    aliasMap: null,
  };
}

function applyTag(expr: FieldExpr, kind: string, value: string) {
  switch (kind) {
    case "source":
      if (SOURCES.includes(value as FieldSource)) {
        expr.source = value as FieldSource;
        expr.scope = "request";
      }
      break;
    case "scope":
      if (value === "item") expr.splitRef = DEFAULT_SPLIT_NAME;
      break;
    case "aggregate":
      if (value) expr.splitRef = value;
      break;
    case "processor":
      if (value) expr.processors.push(value);
      break;
    case "alias":
      if (value) expr.aliasMap = value;
      break;
    default:
      break;
  }
}

/** 存储格式：[source:json]action[processor:time][alias:mapkey] 或 [aggregate:item]path */
export function parseFieldExpr(raw: string): FieldExpr {
  const trimmed = raw.trim();
  if (!trimmed) return emptyFieldExpr();
  if (!trimmed.includes("[")) {
    const expr = emptyFieldExpr();
    expr.path = trimmed;
    return expr;
  }

  const expr = emptyFieldExpr();
  const pathParts: string[] = [];
  let lastIndex = 0;

  for (const m of trimmed.matchAll(TAG_RE)) {
    const before = trimmed.slice(lastIndex, m.index);
    if (before) pathParts.push(before);
    lastIndex = m.index! + m[0].length;

    const inner = m[1]!;
    const ci = inner.indexOf(":");
    const kind = ci === -1 ? inner : inner.slice(0, ci);
    const val = ci === -1 ? "" : inner.slice(ci + 1);
    applyTag(expr, kind, val);
  }

  const tail = trimmed.slice(lastIndex);
  if (tail) pathParts.push(tail);
  expr.path = pathParts.join("");
  if (expr.splitRef) expr.scope = "item";
  return expr;
}

export function serializeFieldExpr(expr: FieldExpr): string {
  if (
    !expr.source &&
    !expr.splitRef &&
    expr.processors.length === 0 &&
    !expr.aliasMap
  ) {
    return expr.path;
  }

  let out = "";
  if (expr.splitRef) {
    out += bracketTag("aggregate", expr.splitRef);
  } else if (expr.source) {
    out += bracketTag("source", expr.source);
  }
  out += expr.path;
  for (const p of expr.processors) out += bracketTag("processor", p);
  if (expr.aliasMap) out += bracketTag("alias", expr.aliasMap);
  return out;
}

export function ruleHasSplits(rule: { splits?: Record<string, string> }): boolean {
  return Boolean(rule.splits && Object.keys(rule.splits).length > 0);
}

export function getSplitNames(rule: { splits?: Record<string, string> }): string[] {
  return Object.keys(rule.splits ?? {});
}

export const SOURCE_TAG_OPTIONS: FieldExprTagOption[] = SOURCES.map((id) => ({
  id,
  label: id,
  kind: "source",
}));
