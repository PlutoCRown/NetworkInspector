import { parseFieldExpr } from "./expr";
import type { AppConfig, RuleGroup } from "../types";

export interface FieldRefIds {
  processors: string[];
  aliases: string[];
}

export interface ImportDependencyWarning {
  missingProcessors: string[];
  missingAliases: string[];
}

function collectFromFieldRaw(raw: string, processors: Set<string>, aliases: Set<string>) {
  const expr = parseFieldExpr(raw);
  for (const id of expr.processors) {
    processors.add(id);
  }
  if (expr.aliasMap) aliases.add(expr.aliasMap);
}

export function collectFieldRefIdsFromRuleGroup(group: RuleGroup): FieldRefIds {
  const processors = new Set<string>();
  const aliases = new Set<string>();

  for (const rule of group.rules) {
    for (const ref of Object.values(rule.splits ?? {})) {
      if (ref) collectFromFieldRaw(ref, processors, aliases);
    }
    for (const ref of Object.values(rule.fields)) {
      if (ref) collectFromFieldRaw(ref, processors, aliases);
    }
  }

  return {
    processors: [...processors],
    aliases: [...aliases],
  };
}

export function collectFieldRefIdsFromRuleGroups(groups: RuleGroup[]): FieldRefIds {
  const processors = new Set<string>();
  const aliases = new Set<string>();
  for (const g of groups) {
    const ids = collectFieldRefIdsFromRuleGroup(g);
    ids.processors.forEach((p) => processors.add(p));
    ids.aliases.forEach((a) => aliases.add(a));
  }
  return { processors: [...processors], aliases: [...aliases] };
}

/** 导入后实际可用的 Processor / Alias ID（含本次勾选的项） */
export function configAvailableAfterImport(
  current: AppConfig,
  incoming: AppConfig | null,
  options: { processorIds: string[]; aliasMapKeys: string[] },
): AppConfig {
  const customProcessors = { ...current.customProcessors };
  const aliasMaps = { ...current.aliasMaps };
  if (incoming) {
    for (const id of options.processorIds) {
      const body = incoming.customProcessors[id];
      if (body !== undefined) customProcessors[id] = body;
    }
    for (const key of options.aliasMapKeys) {
      const group = incoming.aliasMaps[key];
      if (group) aliasMaps[key] = group;
    }
  }
  return { customProcessors, aliasMaps };
}

export function getMissingFieldRefs(
  groups: RuleGroup[],
  available: AppConfig,
): ImportDependencyWarning {
  const refs = collectFieldRefIdsFromRuleGroups(groups);
  const missingProcessors = refs.processors.filter((id) => !(id in available.customProcessors));
  const missingAliases = refs.aliases.filter((id) => !(id in available.aliasMaps));
  return { missingProcessors, missingAliases };
}

export function hasImportWarnings(w: ImportDependencyWarning): boolean {
  return w.missingProcessors.length > 0 || w.missingAliases.length > 0;
}

export function formatImportWarnings(w: ImportDependencyWarning): string {
  const lines: string[] = [];
  if (w.missingProcessors.length > 0) {
    lines.push(`Processor：${w.missingProcessors.join("、")}`);
  }
  if (w.missingAliases.length > 0) {
    lines.push(`Alias：${w.missingAliases.join("、")}`);
  }
  return lines.join("\n");
}
