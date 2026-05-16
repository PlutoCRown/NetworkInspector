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

function parseBracketFormat(trimmed: string): FieldExpr {
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

function parsePipeFormat(trimmed: string): FieldExpr {
  const parts = trimmed.split("|").map((p) => p.trim()).filter(Boolean);
  const expr = emptyFieldExpr();

  for (const part of parts) {
    if (part === "aggregate") {
      expr.aggregate = true;
      continue;
    }
    if (part.startsWith("processor:")) {
      expr.processors.push(part.slice("processor:".length));
      continue;
    }
    if (part.startsWith("alias:")) {
      expr.aliasMap = part.slice("alias:".length);
      continue;
    }
    if (part === "item") {
      expr.scope = "item";
      continue;
    }

    const colon = part.indexOf(":");
    if (colon === -1) {
      if (!expr.path) expr.path = part;
      continue;
    }

    const head = part.slice(0, colon);
    const rest = part.slice(colon + 1);

    if (head === "aggregate" || head === "item") {
      expr.scope = "item";
      expr.path = rest;
      continue;
    }

    if (SOURCES.includes(head as FieldSource)) {
      expr.source = head as FieldSource;
      expr.path = rest;
      expr.scope = "request";
      continue;
    }

    if (!expr.path) expr.path = part;
  }

  return expr;
}

function parseLegacyColonFormat(trimmed: string): FieldExpr | null {
  if (trimmed.includes("|") || trimmed.includes("[")) return null;
  const idx = trimmed.indexOf(":");
  if (idx === -1) {
    const expr = emptyFieldExpr();
    expr.path = trimmed;
    return expr;
  }
  const head = trimmed.slice(0, idx);
  const path = trimmed.slice(idx + 1);
  if (head === "aggregate" || head === "item") {
    return { ...emptyFieldExpr("item"), path };
  }
  if (SOURCES.includes(head as FieldSource)) {
    return { ...emptyFieldExpr("request"), source: head as FieldSource, path };
  }
  return { ...emptyFieldExpr(), path: trimmed };
}

/**
 * 存储格式：[source:json]action[processor:time][alias:mapkey]
 * 兼容旧 pipe / source:path 写法，序列化一律输出方括号格式。
 */
export function parseFieldExpr(raw: string): FieldExpr {
  const trimmed = raw.trim();
  if (!trimmed) return emptyFieldExpr();

  if (trimmed.includes("[")) return parseBracketFormat(trimmed);
  if (trimmed.includes("|")) return parsePipeFormat(trimmed);

  const legacy = parseLegacyColonFormat(trimmed);
  if (legacy) return legacy;

  return emptyFieldExpr();
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

/** 将旧格式字段迁移为方括号存储 */
export function migrateFieldExprString(raw: string | undefined): string {
  if (!raw?.trim()) return raw ?? "";
  if (raw.includes("[")) return raw;
  return serializeFieldExpr(parseFieldExpr(raw));
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

export function formatFieldExprLabel(expr: FieldExpr): string {
  return serializeFieldExpr(expr);
}
