import type { FieldSource } from "./types";

export const FIELD_SOURCES: { id: FieldSource; label: string }[] = [
  { id: "query", label: "query" },
  { id: "json", label: "json" },
  { id: "form-data", label: "form-data" },
  { id: "header", label: "header" },
];

export function parseFieldRef(ref: string): { source: FieldSource | null; path: string } {
  const idx = ref.indexOf(":");
  if (idx === -1) return { source: null, path: ref };
  const source = ref.slice(0, idx) as FieldSource;
  const path = ref.slice(idx + 1);
  if (!FIELD_SOURCES.some((s) => s.id === source)) {
    return { source: null, path: ref };
  }
  return { source, path };
}

export function formatFieldRef(source: FieldSource | null, path: string): string {
  if (!source) return path;
  return `${source}:${path}`;
}

export function filterSourceSuggestions(input: string): typeof FIELD_SOURCES {
  const q = input.toLowerCase().trim();
  if (!q) return FIELD_SOURCES;
  return FIELD_SOURCES.filter(
    (s) => s.id.startsWith(q) || s.label.startsWith(q),
  );
}
