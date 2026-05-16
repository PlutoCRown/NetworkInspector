export type FieldSource = "query" | "json" | "response" | "form-data" | "header";

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
  /** 与 capture[] 同索引对应 */
  url: string;
  renderer: RendererId;
  /** 拆分名 → 数组来源表达式，如 { item: "[source:json]events" } */
  splits?: Record<string, string>;
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
