export type FieldSource = "query" | "json" | "form-data" | "header";

export type RendererId = "title-popover" | "title-desc-expand" | "custom";

export interface AliasRule {
  field: string;
  match: string;
  replace: string;
}

export interface HighlightRule {
  field: string;
  match: string;
  tone: string;
}

export interface FilterRule {
  field: string;
  path: string;
  equals?: unknown;
  action: "drop" | "strip";
}

export interface Rule {
  id: string;
  url: string;
  renderer: RendererId | string;
  fields: Record<string, string>;
  alias?: AliasRule[];
  highlights?: HighlightRule[];
  filters?: FilterRule[];
  decode?: string;
  template?: string;
}

export interface RuleGroup {
  version: number;
  id: string;
  name: string;
  enabled: boolean;
  sites: string[];
  capture: string[];
  rules: Rule[];
  template?: string;
  decode?: string;
}

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
  captures: CaptureRecord[];
}

export const STORAGE_KEYS = {
  ruleGroups: "ni_rule_groups",
  activeRuleGroupId: "ni_active_rule_group_id",
  captures: "ni_captures",
} as const;

export const MAX_CAPTURES = 200;
