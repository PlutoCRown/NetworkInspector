import type { AliasMapConfig, RuleGroup } from "../types";
import defaultRuleGroups from "./default-rule-groups.json";

export const DEFAULT_RULE_GROUPS = defaultRuleGroups as RuleGroup[];

/** 首次安装时的示例别名组（Processor 见 processor-examples） */
export const DEFAULT_ALIAS_MAPS: AliasMapConfig = {
  "alias-mp8wdf0c": {
    name: "A1 埋点名字映射",
    mappings: {},
  },
};
