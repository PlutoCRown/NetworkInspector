import type { RendererId } from "./types";

export interface RendererDefinition {
  id: RendererId;
  label: string;
  fields: string[];
}

export const RENDERER_DEFINITIONS: RendererDefinition[] = [
  {
    id: "card",
    label: "卡片（标题 / 描述 / 展开 / 悬停）",
    fields: ["title", "desc", "expand", "popover"],
  },
  {
    id: "divider",
    label: "分割线（仅 title）",
    fields: ["title"],
  },
];
