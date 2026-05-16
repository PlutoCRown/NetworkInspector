import type { AliasMapConfig, AliasMapGroup, AppConfig } from "../types";

function isAliasMapGroup(value: unknown): value is AliasMapGroup {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as AliasMapGroup).name === "string" &&
    typeof (value as AliasMapGroup).mappings === "object"
  );
}

export function normalizeAliasMaps(raw: AliasMapConfig): AliasMapConfig {
  const out: AliasMapConfig = {};
  for (const [mapkey, val] of Object.entries(raw)) {
    if (isAliasMapGroup(val)) {
      out[mapkey] = { name: val.name, mappings: { ...val.mappings } };
    }
  }
  return out;
}

export function normalizeAppConfig(config: AppConfig): AppConfig {
  return {
    customProcessors: { ...config.customProcessors },
    aliasMaps: normalizeAliasMaps(config.aliasMaps),
  };
}
