import type { AppConfig } from "./types";

export const BUILTIN_PROCESSORS: { id: string; label: string; description: string }[] = [
  { id: "time", label: "time", description: "HH:mm:ss（支持秒/毫秒时间戳）" },
  { id: "datetime", label: "datetime", description: "本地日期时间" },
  { id: "date", label: "date", description: "YYYY-MM-DD" },
];

function toDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const n = Number(value);
    if (!Number.isNaN(n)) return toDate(n);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function builtinTime(value: unknown): string {
  const d = toDate(value);
  if (!d) return String(value ?? "");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function builtinDatetime(value: unknown): string {
  const d = toDate(value);
  if (!d) return String(value ?? "");
  return d.toLocaleString();
}

function builtinDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return String(value ?? "");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const BUILTIN_FNS: Record<string, (value: unknown) => unknown> = {
  time: builtinTime,
  datetime: builtinDatetime,
  date: builtinDate,
};

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
  const builtin = BUILTIN_FNS[id];
  if (builtin) return builtin(value);

  const custom = config.customProcessors[id];
  if (!custom?.trim()) return value;

  try {
    const fn = new Function("value", `return (${custom})(value);`) as (v: unknown) => unknown;
    return fn(value);
  } catch {
    return value;
  }
}

export function applyAliasMap(value: unknown, mapId: string | null, config: AppConfig): unknown {
  if (!mapId || value == null) return value;
  const map = config.aliasMaps[mapId];
  if (!map) return value;
  const key = String(value);
  return map[key] ?? value;
}
