import {
  RENDERER_DEFINITIONS,
  type RendererDefinition,
} from "./renderers";
import type { RendererId } from "../types/rule";

export { RENDERER_DEFINITIONS, type RendererDefinition };

const RENDERER_MAP = new Map<RendererId, RendererDefinition>(
  RENDERER_DEFINITIONS.map((r) => [r.id, r]),
);

export function normalizeRendererId(id: string): RendererId {
  return RENDERER_MAP.has(id as RendererId) ? (id as RendererId) : "card";
}

export function getRendererDefinition(id: string): RendererDefinition | undefined {
  return RENDERER_MAP.get(normalizeRendererId(id));
}

export function getRendererFields(rendererId: string): string[] {
  return getRendererDefinition(rendererId)?.fields ?? ["title"];
}

export function defaultFieldsForRenderer(
  rendererId: string,
  aggregate: boolean,
  splitName = "item",
): Record<string, string> {
  const keys = getRendererFields(rendererId);
  if (aggregate) {
    return Object.fromEntries(keys.map((k) => [k, `[aggregate:${splitName}]${k}`]));
  }
  return Object.fromEntries(keys.map((k) => [k, `[source:json]${k}`]));
}
