import type { RuleGroup } from "./types";
import exampleBundle from "../example.json";

export type {
  AliasRule,
  FieldSource,
  FilterRule,
  HighlightRule,
  RendererId,
  Rule,
  RuleGroup,
} from "./types";

export { RENDERER_DEFINITIONS, type RendererDefinition } from "./renderers";

export const DEFAULT_RULE_GROUPS: RuleGroup[] = exampleBundle.ruleGroups as RuleGroup[];
