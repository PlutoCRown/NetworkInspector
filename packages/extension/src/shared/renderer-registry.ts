import {
  createBuiltinRegistry,
  type ParsedRenderer,
} from "@network-inspector/presets";
import cardTpl from "@network-inspector/presets/renderers/card.tpl?raw";
import dividerTpl from "@network-inspector/presets/renderers/divider.tpl?raw";

/** 模块加载时预解析所有内置 .tpl（不随用户选择 renderer 再解析） */
export const BUILTIN_RENDERERS: ParsedRenderer[] = createBuiltinRegistry({
  card: cardTpl,
  divider: dividerTpl,
});

const RENDERER_MAP = new Map(BUILTIN_RENDERERS.map((r) => [r.id, r]));

/** 兼容旧配置 */
const LEGACY_ALIASES: Record<string, string> = {
  "title-popover": "card",
  "title-desc-expand": "card",
};

export function resolveRendererId(id: string): string {
  return LEGACY_ALIASES[id] ?? id;
}

export function getBuiltinRenderer(id: string): ParsedRenderer | undefined {
  return RENDERER_MAP.get(resolveRendererId(id));
}

export function getRendererFields(rendererId: string): string[] {
  return getBuiltinRenderer(rendererId)?.fields ?? ["title"];
}

export function defaultFieldsForRenderer(
  rendererId: string,
  aggregate: boolean,
): Record<string, string> {
  const keys = getRendererFields(rendererId);
  if (aggregate) return Object.fromEntries(keys.map((k) => [k, "aggregate:"]));
  return Object.fromEntries(keys.map((k) => [k, "json:"]));
}
