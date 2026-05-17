import { parseFieldExpr } from "./expr";
import type { FieldSource } from "../types";
import { getByPath } from "../util/path";

function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export interface ExtractInput {
  url: string;
  requestHeaders?: Record<string, string>;
  /** 请求体文本；form / urlencoded 已在采集层规范为 JSON 字符串 */
  requestBody?: string | null;
}

function parseExtractRef(ref: string): { source: FieldSource; path: string } | null {
  const expr = parseFieldExpr(ref);
  if (expr.splitRef || !expr.source) return null;
  return { source: expr.source, path: expr.path };
}

export function extractFromSource(
  input: ExtractInput,
  source: FieldSource,
  path: string,
): unknown {
  const url = new URL(input.url, input.url.startsWith("http") ? undefined : "https://placeholder.local");

  switch (source) {
    case "query":
      return path ? url.searchParams.get(path) : null;
    case "header": {
      const headers = input.requestHeaders ?? {};
      const key = Object.keys(headers).find(
        (k) => k.toLowerCase() === path.toLowerCase(),
      );
      return key ? headers[key] : null;
    }
    case "json": {
      const json = parseJsonBody(input.requestBody);
      if (json == null) return null;
      return path ? getByPath(json, path) : json;
    }
    default:
      return null;
  }
}

export function extractField(input: ExtractInput, ref: string): unknown {
  const parsed = parseExtractRef(ref);
  if (!parsed) return null;
  return extractFromSource(input, parsed.source, parsed.path);
}

export function extractFields(
  input: ExtractInput,
  fields: Record<string, string>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, ref] of Object.entries(fields)) {
    data[key] = extractField(input, ref);
  }
  return data;
}
