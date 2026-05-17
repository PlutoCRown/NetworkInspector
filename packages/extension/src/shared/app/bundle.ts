import { validateRuleGroup } from "../capture/pipeline";
import { normalizeRuleGroup } from "../rule/normalize";
import type { AppConfig, AppState, RuleGroup } from "../types";
import { APP_VERSION } from "./meta";
import { normalizeAppConfig } from "./normalize-config";

export const APP_EXPORT_VERSION = 1 as const;

export interface AppExportBundle {
  version: typeof APP_EXPORT_VERSION;
  exportedAt: number;
  extensionVersion: string;
  ruleGroups: RuleGroup[];
  config: AppConfig;
  activeRuleGroupId: string | null;
}

export interface AppBundleStats {
  ruleGroupCount: number;
  processorCount: number;
  aliasMapCount: number;
}

/** 各数组为空表示不导入该类别；非空则仅导入列出的 ID */
export interface ImportBundleOptions {
  ruleGroupIds: string[];
  processorIds: string[];
  aliasMapKeys: string[];
  overwriteRuleGroups: boolean;
}

export function pickBundleImport(
  bundle: AppExportBundle,
  options: ImportBundleOptions,
): {
  ruleGroups: RuleGroup[];
  customProcessors: AppConfig["customProcessors"];
  aliasMaps: AppConfig["aliasMaps"];
  activeRuleGroupId: string | null;
} {
  const rgIds = new Set(options.ruleGroupIds);
  const procIds = new Set(options.processorIds);
  const aliasKeys = new Set(options.aliasMapKeys);

  const customProcessors: AppConfig["customProcessors"] = {};
  for (const id of options.processorIds) {
    const body = bundle.config.customProcessors[id];
    if (body !== undefined) customProcessors[id] = body;
  }

  const aliasMaps: AppConfig["aliasMaps"] = {};
  for (const key of options.aliasMapKeys) {
    const group = bundle.config.aliasMaps[key];
    if (group) aliasMaps[key] = group;
  }

  const activeRuleGroupId =
    bundle.activeRuleGroupId && rgIds.has(bundle.activeRuleGroupId)
      ? bundle.activeRuleGroupId
      : null;

  return {
    ruleGroups: bundle.ruleGroups.filter((g) => rgIds.has(g.id)),
    customProcessors,
    aliasMaps,
    activeRuleGroupId,
  };
}

export function hasBundleImportSelection(options: ImportBundleOptions): boolean {
  return (
    options.ruleGroupIds.length > 0 ||
    options.processorIds.length > 0 ||
    options.aliasMapKeys.length > 0
  );
}

export type ImportDetectResult =
  | { kind: "bundle"; bundle: AppExportBundle; stats: AppBundleStats }
  | { kind: "rule-group"; group: RuleGroup }
  | { kind: "invalid" };

export function getBundleStats(bundle: AppExportBundle): AppBundleStats {
  return {
    ruleGroupCount: bundle.ruleGroups.length,
    processorCount: Object.keys(bundle.config.customProcessors ?? {}).length,
    aliasMapCount: Object.keys(bundle.config.aliasMaps ?? {}).length,
  };
}

export function buildAppExport(state: AppState): AppExportBundle {
  return {
    version: APP_EXPORT_VERSION,
    exportedAt: Date.now(),
    extensionVersion: APP_VERSION,
    ruleGroups: state.ruleGroups.map((g) => normalizeRuleGroup(structuredClone(g))),
    config: structuredClone(state.config),
    activeRuleGroupId: state.activeRuleGroupId,
  };
}

export function isAppExportBundle(value: unknown): value is AppExportBundle {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (o.version !== APP_EXPORT_VERSION) return false;
  if (!Array.isArray(o.ruleGroups)) return false;
  const config = o.config;
  if (!config || typeof config !== "object") return false;
  const cfg = config as Record<string, unknown>;
  return (
    typeof cfg.aliasMaps === "object" &&
    cfg.aliasMaps !== null &&
    typeof cfg.customProcessors === "object" &&
    cfg.customProcessors !== null
  );
}

export function parseAppExportBundle(value: unknown): AppExportBundle | null {
  if (!isAppExportBundle(value)) return null;
  return {
    version: APP_EXPORT_VERSION,
    exportedAt: typeof value.exportedAt === "number" ? value.exportedAt : Date.now(),
    extensionVersion:
      typeof value.extensionVersion === "string" ? value.extensionVersion : APP_VERSION,
    ruleGroups: value.ruleGroups
      .filter((g) => validateRuleGroup(g))
      .map((g) => normalizeRuleGroup(g)),
    config: normalizeAppConfig({
      aliasMaps: { ...value.config.aliasMaps },
      customProcessors: { ...value.config.customProcessors },
    }),
    activeRuleGroupId:
      typeof value.activeRuleGroupId === "string" ? value.activeRuleGroupId : null,
  };
}

export function detectImportPayload(raw: unknown): ImportDetectResult {
  const bundle = parseAppExportBundle(raw);
  if (bundle) {
    return { kind: "bundle", bundle, stats: getBundleStats(bundle) };
  }
  if (validateRuleGroup(raw)) {
    return { kind: "rule-group", group: normalizeRuleGroup(raw) };
  }
  return { kind: "invalid" };
}

export function parseImportJson(text: string): ImportDetectResult {
  try {
    return detectImportPayload(JSON.parse(text));
  } catch {
    return { kind: "invalid" };
  }
}
