import { SOURCE_TAG_OPTIONS } from "@/shared/field/expr";
import type { AppConfig, FieldSource } from "@/shared/types";
export type FieldRefInputMode = "split-source" | "field";

export interface AutocompleteItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
}

export interface AutocompleteContext {
  mode: FieldRefInputMode;
  query: string;
  hasSource: boolean;
  hasSplitRef: boolean;
  splitNames: string[];
  processorIds: string[];
  hasAlias: boolean;
  config: AppConfig;
}

function matches(query: string, ...parts: string[]): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return parts.some((p) => p.toLowerCase().includes(q));
}

/** 根据 `/` 后的查询串生成补全项 */
export function buildAutocompleteItems(ctx: AutocompleteContext): AutocompleteItem[] {
  const { query, mode, hasSource, hasSplitRef, splitNames, processorIds, hasAlias, config } =
    ctx;
  const items: AutocompleteItem[] = [];

  if (!hasSource && !hasSplitRef) {
    for (const s of SOURCE_TAG_OPTIONS) {
      if (matches(query, s.id, s.label, `source:${s.id}`)) {
        items.push({
          id: `source:${s.id}`,
          label: `source:${s.id}`,
          hint: "数据来源",
          group: "来源",
        });
      }
    }
  }

  if (mode === "field" && splitNames.length > 0 && !hasSplitRef) {
    for (const name of splitNames) {
      if (matches(query, name, `aggregate:${name}`, "aggregate", "item")) {
        items.push({
          id: `aggregate:${name}`,
          label: `aggregate:${name}`,
          hint: "数组项字段",
          group: "拆分",
        });
      }
    }
  }

  if (hasSource || hasSplitRef) {
    for (const id of Object.keys(config.customProcessors)) {
      if (processorIds.includes(id)) continue;
      if (matches(query, id, `processor:${id}`, "processor")) {
        items.push({
          id: `processor:${id}`,
          label: `processor:${id}`,
          hint: "自定义",
          group: "Processor",
        });
      }
    }
  }

  if ((hasSource || hasSplitRef) && !hasAlias) {
    for (const [mapkey, group] of Object.entries(config.aliasMaps)) {
      if (matches(query, mapkey, group.name, `alias:${mapkey}`, "alias")) {
        items.push({
          id: `alias:${mapkey}`,
          label: `alias:${mapkey}`,
          hint: group.name || undefined,
          group: "Alias",
        });
      }
    }
  }

  return items;
}

export function parseSlashSegment(path: string): { base: string; query: string } | null {
  const slash = path.lastIndexOf("/");
  if (slash === -1) return null;
  return { base: path.slice(0, slash), query: path.slice(slash + 1) };
}

export function applyAutocompleteId(
  id: string,
): { kind: "source"; source: FieldSource } | { kind: "aggregate"; name: string } | { kind: "processor"; processorId: string } | { kind: "alias"; mapkey: string } | null {
  const ci = id.indexOf(":");
  if (ci === -1) return null;
  const kind = id.slice(0, ci);
  const val = id.slice(ci + 1);
  switch (kind) {
    case "source":
      return { kind: "source", source: val as FieldSource };
    case "aggregate":
      return { kind: "aggregate", name: val };
    case "processor":
      return { kind: "processor", processorId: val };
    case "alias":
      return { kind: "alias", mapkey: val };
    default:
      return null;
  }
}
