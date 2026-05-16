import { DEFAULT_RULE_GROUPS } from "@network-inspector/presets";
import { normalizeRuleGroup } from "./normalize-rule-group";
import {
  DEFAULT_APP_CONFIG,
  type AppConfig,
  type AppState,
  type CaptureRecord,
  type RuleGroup,
} from "./types";
import { STORAGE_KEYS, MAX_CAPTURES } from "./types";

export async function loadState(): Promise<AppState> {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.ruleGroups,
    STORAGE_KEYS.activeRuleGroupId,
    STORAGE_KEYS.captureEnabled,
    STORAGE_KEYS.captures,
    STORAGE_KEYS.config,
  ]);

  let ruleGroups = (result[STORAGE_KEYS.ruleGroups] as RuleGroup[] | undefined) ?? [];
  if (ruleGroups.length === 0) {
    ruleGroups = DEFAULT_RULE_GROUPS;
  }

  const activeRuleGroupId =
    (result[STORAGE_KEYS.activeRuleGroupId] as string | null) ??
    ruleGroups[0]?.id ??
    null;

  const captures = (result[STORAGE_KEYS.captures] as CaptureRecord[] | undefined) ?? [];

  const captureEnabled =
    (result[STORAGE_KEYS.captureEnabled] as boolean | undefined) ?? true;

  const config = {
    ...DEFAULT_APP_CONFIG,
    ...((result[STORAGE_KEYS.config] as AppConfig | undefined) ?? {}),
  };

  return {
    ruleGroups: ruleGroups.map((g) => normalizeRuleGroup(g)),
    activeRuleGroupId,
    captureEnabled,
    captures,
    config,
  };
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.config]: config });
}

export async function saveCaptureEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.captureEnabled]: enabled });
}

export async function saveRuleGroups(ruleGroups: RuleGroup[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ruleGroups]: ruleGroups });
}

export async function saveActiveRuleGroupId(id: string | null): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.activeRuleGroupId]: id });
}

export async function saveCaptures(captures: CaptureRecord[]): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.captures]: captures.slice(0, MAX_CAPTURES),
  });
}

export async function appendCapture(record: CaptureRecord): Promise<CaptureRecord[]> {
  const state = await loadState();
  const captures = [record, ...state.captures].slice(0, MAX_CAPTURES);
  await saveCaptures(captures);
  return captures;
}

export async function clearCaptures(): Promise<void> {
  await saveCaptures([]);
}
