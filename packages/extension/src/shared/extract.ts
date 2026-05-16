import type { FieldSource } from "./types";
import { getByPath } from "./path";

export function parseFieldRef(ref: string): { source: FieldSource; path: string } | null {
  const idx = ref.indexOf(":");
  if (idx === -1) return null;
  const source = ref.slice(0, idx) as FieldSource;
  const path = ref.slice(idx + 1);
  if (!["query", "json", "form-data", "header"].includes(source)) return null;
  return { source, path };
}

function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function parseFormBody(body: string | null | undefined): Record<string, string> {
  if (!body) return {};
  try {
    const params = new URLSearchParams(body);
    const out: Record<string, string> = {};
    params.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  } catch {
    return {};
  }
}

export interface ExtractInput {
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string | null;
  responseBody?: string | null;
}

export function extractField(
  input: ExtractInput,
  ref: string,
): unknown {
  const parsed = parseFieldRef(ref);
  if (!parsed) return null;

  const { source, path } = parsed;
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
      const json =
        parseJsonBody(input.responseBody) ?? parseJsonBody(input.requestBody);
      if (json == null) return null;
      return path ? getByPath(json, path) : json;
    }
    case "form-data": {
      const form = parseFormBody(input.requestBody);
      return path ? form[path] ?? null : form;
    }
    default:
      return null;
  }
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
