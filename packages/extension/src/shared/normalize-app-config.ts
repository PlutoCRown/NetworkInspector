import type { AliasMapConfig, AliasMapGroup, AppConfig } from "./types";

function isAliasMapGroup(value: unknown): value is AliasMapGroup {
  return (
    !!value &&
    typeof value === "object" &&
    "mappings" in value &&
    typeof (value as AliasMapGroup).mappings === "object"
  );
}

/** 兼容旧版 aliasMaps：值为平铺 Record 时迁移为 { name, mappings } */
export function normalizeAliasMaps(raw: unknown): AliasMapConfig {
  if (!raw || typeof raw !== "object") return {};
  const out: AliasMapConfig = {};
  for (const [mapkey, val] of Object.entries(raw as Record<string, unknown>)) {
    if (isAliasMapGroup(val)) {
      out[mapkey] = {
        name: typeof val.name === "string" && val.name.trim() ? val.name : mapkey,
        mappings: { ...val.mappings },
      };
    } else if (val && typeof val === "object") {
      out[mapkey] = { name: mapkey, mappings: { ...(val as Record<string, string>) } };
    }
  }
  return out;
}

export function normalizeAppConfig(config: AppConfig): AppConfig {
  return {
    ...config,
    aliasMaps: normalizeAliasMaps(config.aliasMaps),
  };
}
