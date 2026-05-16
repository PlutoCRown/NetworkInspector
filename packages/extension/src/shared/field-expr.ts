import type { FieldSource } from "./types";

const SOURCES: FieldSource[] = ["query", "json", "response", "form-data", "header"];

export type FieldScope = "request" | "item";

export interface FieldExpr {
  scope: FieldScope;
  source: FieldSource | null;
  path: string;
  aggregate: boolean;
  processors: string[];
  aliasMap: string | null;
}

export interface FieldExprTagOption {
  id: string;
  label: string;
  kind: "source" | "aggregate" | "processor" | "alias";
}

const TAG_RE = /\[([^\]]+)\]/g;

function bracketTag(kind: string, value?: string): string {
  return value !== undefined && value !== "" ? `[${kind}:${value}]` : `[${kind}]`;
}

export function emptyFieldExpr(scope: FieldScope = "request"): FieldExpr {
  return {
    scope,
    source: null,
    path: "",
    aggregate: false,
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
      if (value === "item") expr.scope = "item";
      break;
    case "aggregate":
      expr.aggregate = true;
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

/** 存储格式：[source:json]action[processor:time][alias:mapkey] */
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
  return expr;
}

export function serializeFieldExpr(expr: FieldExpr): string {
  if (
    !expr.source &&
    expr.scope !== "item" &&
    !expr.aggregate &&
    expr.processors.length === 0 &&
    !expr.aliasMap
  ) {
    return expr.path;
  }

  let out = "";
  if (expr.scope === "item") {
    out += bracketTag("scope", "item");
  } else if (expr.source) {
    out += bracketTag("source", expr.source);
  }
  out += expr.path;
  if (expr.aggregate) out += bracketTag("aggregate");
  for (const p of expr.processors) out += bracketTag("processor", p);
  if (expr.aliasMap) out += bracketTag("alias", expr.aliasMap);
  return out;
}

export function isAggregateSourceExpr(expr: FieldExpr): boolean {
  return expr.aggregate && expr.scope === "request" && Boolean(expr.source);
}

export function hasAggregateSource(raw: string | undefined): boolean {
  if (!raw?.trim()) return false;
  return isAggregateSourceExpr(parseFieldExpr(raw));
}

export const SOURCE_TAG_OPTIONS: FieldExprTagOption[] = SOURCES.map((id) => ({
  id,
  label: id,
  kind: "source",
}));
