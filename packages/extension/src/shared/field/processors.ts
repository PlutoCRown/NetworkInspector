import { compileProcessor } from "./processor-compile";
import type { AppConfig } from "../types";

export function runProcessors(
  value: unknown,
  ids: string[],
  config: AppConfig,
): unknown {
  let current = value;
  for (const id of ids) {
    current = runProcessor(current, id, config);
  }
  return current;
}

export function runProcessor(value: unknown, id: string, config: AppConfig): unknown {
  const source = config.customProcessors[id];
  if (!source?.trim()) return value;

  const fn = compileProcessor(source);
  if (!fn) return value;
  try {
    return fn(value);
  } catch {
    return value;
  }
}

export function applyAliasMap(value: unknown, mapId: string | null, config: AppConfig): unknown {
  if (!mapId || value == null) return value;
  const group = config.aliasMaps[mapId];
  if (!group) return value;
  const key = String(value);
  return group.mappings[key] ?? value;
}
