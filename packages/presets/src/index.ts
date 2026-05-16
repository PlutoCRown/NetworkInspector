import type { RuleGroup } from "./types";
import a1Art from "../rule-groups/a1-art.json";
import douyin from "../rule-groups/douyin.json";
import {
  buildRendererRegistry,
  type ParsedRenderer,
  type RendererSource,
} from "./parse-template";

export {
  BUILTIN_VARS,
  buildRendererRegistry,
  extractTemplateMeta,
  fieldHasContent,
  interpolateText,
  parseRenderer,
  resolveBuiltin,
  type BuiltinVarName,
  type ParsedRenderer,
  type RendererSource,
  type TemplateMeta,
  type TemplateSlots,
} from "./parse-template";

export type { RuleGroup };

export const DEFAULT_RULE_GROUPS: RuleGroup[] = [a1Art, douyin] as RuleGroup[];

/** 内置 Renderer 源码（.tpl）；在扩展侧 import ?raw 后传入 createBuiltinRegistry */
export const BUILTIN_RENDERER_SOURCES: RendererSource[] = [
  { id: "card", label: "卡片（标题 / 描述 / 展开 / 悬停）", source: "" },
  { id: "divider", label: "分割线（仅 title）", source: "" },
];

export function createBuiltinRegistry(
  templates: Record<string, string>,
): ParsedRenderer[] {
  return buildRendererRegistry(
    BUILTIN_RENDERER_SOURCES.map((r) => ({
      ...r,
      source: templates[r.id] ?? r.source,
    })),
  );
}

export function getRendererFields(registry: ParsedRenderer[], rendererId: string): string[] {
  return registry.find((r) => r.id === rendererId)?.fields ?? ["title"];
}
