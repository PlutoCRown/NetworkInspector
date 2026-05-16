import { RENDERER_DEFINITIONS, type RendererDefinition } from "@network-inspector/presets";

export { RENDERER_DEFINITIONS, type RendererDefinition };

const RENDERER_MAP = new Map(RENDERER_DEFINITIONS.map((r) => [r.id, r]));

/** 兼容旧配置 */
const LEGACY_ALIASES: Record<string, string> = {
  "title-popover": "card",
  "title-desc-expand": "card",
};

export function resolveRendererId(id: string): string {
  return LEGACY_ALIASES[id] ?? id;
}

export function getRendererDefinition(id: string): RendererDefinition | undefined {
  return RENDERER_MAP.get(resolveRendererId(id));
}

export function getRendererFields(rendererId: string): string[] {
  return getRendererDefinition(rendererId)?.fields ?? ["title"];
}

export function defaultFieldsForRenderer(
  rendererId: string,
  aggregate: boolean,
): Record<string, string> {
  const keys = getRendererFields(rendererId);
  if (aggregate) return Object.fromEntries(keys.map((k) => [k, `item:${k}`]));
  return Object.fromEntries(keys.map((k) => [k, `json:${k}`]));
}
