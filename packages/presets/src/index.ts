import type { RuleGroup } from "./types";
import a1Art from "../rule-groups/a1-art.json";
import douyin from "../rule-groups/douyin.json";

export type { RuleGroup, Rule, RendererId } from "./types";
export { RENDERER_DEFINITIONS, type RendererDefinition } from "./renderers";

export const DEFAULT_RULE_GROUPS: RuleGroup[] = [a1Art, douyin] as RuleGroup[];
