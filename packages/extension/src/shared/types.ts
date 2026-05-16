export type {
  AliasRule,
  FieldSource,
  FilterRule,
  HighlightRule,
  RendererId,
  Rule,
  RuleGroup,
} from "@network-inspector/presets";

import type { RuleGroup } from "@network-inspector/presets";

export interface CaptureRecord {
  id: string;
  ruleGroupId: string;
  ruleId: string;
  requestUrl: string;
  timestamp: number;
  renderer: string;
  data: Record<string, unknown>;
  rawData: Record<string, unknown>;
  highlight?: { field: string; tone: string };
}

export interface RawRequestPayload {
  url: string;
  method: string;
  tabUrl: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string | null;
  responseBody?: string | null;
}

export interface AppState {
  ruleGroups: RuleGroup[];
  activeRuleGroupId: string | null;
  captureEnabled: boolean;
  captures: CaptureRecord[];
}

export const STORAGE_KEYS = {
  ruleGroups: "ni_rule_groups",
  activeRuleGroupId: "ni_active_rule_group_id",
  captureEnabled: "ni_capture_enabled",
  captures: "ni_captures",
} as const;

export const MAX_CAPTURES = 200;
