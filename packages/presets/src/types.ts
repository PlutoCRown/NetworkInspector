export type FieldSource =
  | "query"
  | "json"
  | "response"
  | "form-data"
  | "header"
  | "aggregate";

export type RendererId = "card" | "divider";

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
  aggregate?: boolean;
  /** 必须解析为 JSON 数组，如 json:events */
  aggregateFrom?: string;
  fields: Record<string, string>;
  alias?: AliasRule[];
  highlights?: HighlightRule[];
  filters?: FilterRule[];
}

export interface RuleGroup {
  version: number;
  id: string;
  name: string;
  enabled: boolean;
  sites: string[];
  capture: string[];
  rules: Rule[];
}
