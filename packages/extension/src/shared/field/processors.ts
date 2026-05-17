import { compileProcessor } from "./processor-compile";
import type { AppConfig } from "../types";

export interface ProcessorRunResult {
  value: unknown;
  issue?: string;
}

export function runProcessor(
  value: unknown,
  id: string,
  config: AppConfig,
): unknown {
  return runProcessorDetailed(value, id, config).value;
}

export function runProcessorDetailed(
  value: unknown,
  id: string,
  config: AppConfig,
): ProcessorRunResult {
  const source = config.customProcessors[id];
  if (!source?.trim()) {
    return { value, issue: `Processor「${id}」未配置` };
  }

  const fn = compileProcessor(source);
  if (!fn) {
    return { value, issue: `Processor「${id}」编译失败` };
  }

  try {
    return { value: fn(value) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { value, issue: `Processor「${id}」运行错误：${msg}` };
  }
}

export function runProcessors(
  value: unknown,
  ids: string[],
  config: AppConfig,
): unknown {
  return runProcessorsDetailed(value, ids, config).value;
}

export function runProcessorsDetailed(
  value: unknown,
  ids: string[],
  config: AppConfig,
): { value: unknown; issues: string[] } {
  const issues: string[] = [];
  let current = value;
  for (const id of ids) {
    const result = runProcessorDetailed(current, id, config);
    current = result.value;
    if (result.issue) issues.push(result.issue);
  }
  return { value: current, issues };
}

export function applyAliasMap(value: unknown, mapId: string | null, config: AppConfig): unknown {
  if (!mapId || value == null) return value;
  const group = config.aliasMaps[mapId];
  if (!group) return value;
  const key = String(value);
  return group.mappings[key] ?? value;
}
