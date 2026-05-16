import type { FieldSource } from "./types";

export const REQUEST_FIELD_SOURCES: { id: FieldSource; label: string }[] = [
  { id: "query", label: "query" },
  { id: "json", label: "json" },
  { id: "form-data", label: "form-data" },
  { id: "header", label: "header" },
];

export const AGGREGATE_ITEM_SOURCE: { id: FieldSource; label: string } = {
  id: "aggregate",
  label: "aggregate",
};

const ALL_SOURCE_IDS = new Set<FieldSource>([
  ...REQUEST_FIELD_SOURCES.map((s) => s.id),
  AGGREGATE_ITEM_SOURCE.id,
]);

export function getFieldSources(opts?: { allowAggregate?: boolean }) {
  if (opts?.allowAggregate) {
    return [AGGREGATE_ITEM_SOURCE, ...REQUEST_FIELD_SOURCES];
  }
  return REQUEST_FIELD_SOURCES;
}

export function isKnownFieldSource(source: string): source is FieldSource {
  return ALL_SOURCE_IDS.has(source as FieldSource);
}

export function parseFieldRef(ref: string): { source: FieldSource | null; path: string } {
  const idx = ref.indexOf(":");
  if (idx === -1) return { source: null, path: ref };
  const source = ref.slice(0, idx);
  const path = ref.slice(idx + 1);
  if (!isKnownFieldSource(source)) {
    return { source: null, path: ref };
  }
  return { source, path };
}

export function formatFieldRef(source: FieldSource | null, path: string): string {
  if (!source) return path;
  return `${source}:${path}`;
}

export function filterSourceSuggestions(
  input: string,
  opts?: { allowAggregate?: boolean },
): ReturnType<typeof getFieldSources> {
  const sources = getFieldSources(opts);
  const q = input.toLowerCase().trim();
  if (!q) return sources;
  return sources.filter((s) => s.id.startsWith(q) || s.label.startsWith(q));
}
