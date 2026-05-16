export type FieldSource = "query" | "json" | "form-data" | "header";

export type RendererId = "title-popover" | "custom";

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
  /** 与 capture[] 同索引对应；保存时与 capture[i] 同步 */
  url: string;
  renderer: RendererId | string;
  /** 聚合请求：从 aggregateFrom 指向的数组逐条展开捕获 */
  aggregate?: boolean;
  /** 必须解析为 JSON 数组，如 json:events */
  aggregateFrom?: string;
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
  /** 编辑器上次选中的规则组 */
  activeRuleGroupId: string | null;
  /** 总开关：关闭后不再产生新捕获 */
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
