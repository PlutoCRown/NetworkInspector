/** 内置变量：双下划线包裹，不参与 fields 提取 */
export const BUILTIN_VARS = {
  __TIME__: "当前捕获时间 HH:mm:ss",
  __DATE__: "当前捕获日期 YYYY-MM-DD",
  __TIMESTAMP__: "捕获时间戳（毫秒）",
  __REQUEST_URL__: "请求 URL",
  __RULE_ID__: "规则 ID",
  __RULE_GROUP_ID__: "规则组 ID",
} as const;

export type BuiltinVarName = keyof typeof BUILTIN_VARS;

const BUILTIN_SET = new Set<string>(Object.keys(BUILTIN_VARS));
const INTERP_RE = /\{\{([^}]+)\}\}/g;

export interface TemplateSlots {
  card: boolean;
  title: boolean;
  titleHighlight: boolean;
  desc: boolean;
  expand: boolean;
  popover: boolean;
  divider: boolean;
}

export interface TemplateMeta {
  fields: string[];
  slots: TemplateSlots;
  styles: string;
  /** 去掉 <style> 后的 HTML 片段 */
  markup: string;
}

export interface RendererSource {
  id: string;
  label: string;
  source: string;
}

export interface ParsedRenderer extends RendererSource, TemplateMeta {}

function isBuiltin(name: string): boolean {
  return BUILTIN_SET.has(name.trim());
}

/** 从模板源码提取字段名、槽位、样式（不依赖 DOM，可在 Node/Bun 中运行） */
export function extractTemplateMeta(source: string): TemplateMeta {
  const fields = new Set<string>();
  for (const m of source.matchAll(INTERP_RE)) {
    const name = m[1]!.trim();
    if (!isBuiltin(name)) fields.add(name);
  }

  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch?.[1]?.trim() ?? "";
  const markup = source.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();

  const slots: TemplateSlots = {
    card: /\bx-card\b/.test(source),
    title: /\bx-title\b/.test(source) && !/\bx-title\b[^>]*\bhighlight\b/.test(source)
      ? true
      : /\bx-title\b/.test(source),
    titleHighlight:
      /\bx-title\b[^>]*\bhighlight\b/.test(source) ||
      /\bhighlight\b[^>]*\bx-title\b/.test(source),
    desc: /\bx-if\s*=\s*["']desc["']/.test(source) || /\{\{desc\}\}/.test(source),
    expand: /\bx-expand\b/.test(source),
    popover: /\bx-popover\b/.test(source),
    divider: /\bx-divider\b/.test(source),
  };

  return {
    fields: [...fields].sort(),
    slots,
    styles,
    markup,
  };
}

export function parseRenderer(source: RendererSource): ParsedRenderer {
  const meta = extractTemplateMeta(source.source);
  return { ...source, ...meta };
}

export function buildRendererRegistry(sources: RendererSource[]): ParsedRenderer[] {
  return sources.map(parseRenderer);
}

export function resolveBuiltin(
  name: BuiltinVarName | string,
  ctx: {
    timestamp: number;
    requestUrl: string;
    ruleId: string;
    ruleGroupId: string;
  },
): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date(ctx.timestamp);
  switch (name) {
    case "__TIME__":
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    case "__DATE__":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    case "__TIMESTAMP__":
      return String(ctx.timestamp);
    case "__REQUEST_URL__":
      return ctx.requestUrl;
    case "__RULE_ID__":
      return ctx.ruleId;
    case "__RULE_GROUP_ID__":
      return ctx.ruleGroupId;
    default:
      return "";
  }
}

export function interpolateText(
  template: string,
  data: Record<string, unknown>,
  ctx: Parameters<typeof resolveBuiltin>[1],
): string {
  return template.replace(INTERP_RE, (_, raw: string) => {
    const key = raw.trim();
    if (isBuiltin(key)) return resolveBuiltin(key, ctx);
    const v = data[key];
    if (v == null) return "";
    if (typeof v === "string") return v;
    return JSON.stringify(v, null, 2);
  });
}

export function fieldHasContent(data: Record<string, unknown>, key: string): boolean {
  const v = data[key];
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0 && v !== "—";
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}
