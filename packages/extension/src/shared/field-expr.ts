import type { FieldSource } from "./types";

const SOURCES: FieldSource[] = ["query", "json", "form-data", "header"];

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

function parseLegacyFieldRef(trimmed: string): FieldExpr | null {
  if (trimmed.includes("|")) return null;
  const idx = trimmed.indexOf(":");
  if (idx === -1) {
    const expr = emptyFieldExpr();
    expr.path = trimmed;
    return expr;
  }
  const head = trimmed.slice(0, idx);
  const path = trimmed.slice(idx + 1);
  if (head === "aggregate") {
    return { ...emptyFieldExpr("item"), path };
  }
  if (SOURCES.includes(head as FieldSource)) {
    return { ...emptyFieldExpr("request"), source: head as FieldSource, path };
  }
  return null;
}

/** 从旧格式迁移；序列化格式：`json:path|aggregate|processor:time|alias:mapId` */
export function parseFieldExpr(raw: string): FieldExpr {
  const trimmed = raw.trim();
  if (!trimmed) return emptyFieldExpr();

  const legacy = parseLegacyFieldRef(trimmed);
  if (legacy) return legacy;

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
  }

  if (expr.scope === "item" && !expr.path && parts.length === 1 && !parts[0]!.includes(":")) {
    expr.path = parts[0]!;
  }

  return expr;
}

export function serializeFieldExpr(expr: FieldExpr): string {
  const parts: string[] = [];

  if (expr.scope === "item") {
    parts.push(expr.path ? `item:${expr.path}` : "item");
  } else if (expr.source) {
    parts.push(`${expr.source}:${expr.path}`);
  } else if (expr.path) {
    parts.push(expr.path);
  }

  if (expr.aggregate) parts.push("aggregate");
  for (const p of expr.processors) parts.push(`processor:${p}`);
  if (expr.aliasMap) parts.push(`alias:${expr.aliasMap}`);

  return parts.join("|");
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
  const tags: string[] = [];
  if (expr.scope === "item") tags.push("Aggregate");
  else if (expr.source) tags.push(expr.source);
  if (expr.path) tags.push(expr.path);
  for (const p of expr.processors) tags.push(`Processor:${p}`);
  if (expr.aliasMap) tags.push(`Alias:${expr.aliasMap}`);
  if (expr.aggregate && expr.scope === "request") tags.push("Aggregate");
  return tags.join(" ");
}
