export interface RendererDefinition {
  id: string;
  label: string;
  fields: string[];
}

export const RENDERER_DEFINITIONS: RendererDefinition[] = [
  {
    id: "card",
    label: "卡片（标题 / 描述 / 展开 / 悬停）",
    fields: ["title", "desc", "expend", "popover"],
  },
  {
    id: "divider",
    label: "分割线（仅 title）",
    fields: ["title"],
  },
];
