export type {
  AliasRule,
  FieldSource,
  FilterRule,
  HighlightRule,
  RendererId,
  Rule,
  RuleGroup,
} from "./types/rule";

import type { RuleGroup } from "./types/rule";
import { EXAMPLE_PROCESSORS } from "./field/processor-examples";

/** 匹配成功但提取/过滤失败时的展示信息 */
export interface CaptureErrorInfo {
  /** 侧栏折叠时展示的一行摘要 */
  summary: string;
  /** 展开后的完整说明 */
  detail: string;
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
  error?: CaptureErrorInfo;
}

export interface RawRequestPayload {
  url: string;
  method: string;
  tabUrl: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string | null;
  responseBody?: string | null;
}

/** 单组 Alias：mapkey 为字段表达式 [alias:mapkey] 的引用 id */
export interface AliasMapGroup {
  /** 展示用组名 */
  name: string;
  mappings: Record<string, string>;
}

/** mapkey → Alias 组 */
export type AliasMapConfig = Record<string, AliasMapGroup>;

/** 自定义 Processor：id → JS 函数体 `(value) => ...` */
export type CustomProcessorConfig = Record<string, string>;

export interface AppConfig {
  aliasMaps: AliasMapConfig;
  customProcessors: CustomProcessorConfig;
}

/** 首次安装时的全局配置：仅内置 Processor，不含规则组 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  aliasMaps: {},
  customProcessors: { ...EXAMPLE_PROCESSORS },
};

export interface AppState {
  ruleGroups: RuleGroup[];
  activeRuleGroupId: string | null;
  captureEnabled: boolean;
  captures: CaptureRecord[];
  config: AppConfig;
}

export const STORAGE_KEYS = {
  ruleGroups: "ni_rule_groups",
  activeRuleGroupId: "ni_active_rule_group_id",
  captureEnabled: "ni_capture_enabled",
  captures: "ni_captures",
  config: "ni_app_config",
} as const;

export const MAX_CAPTURES = 200;
