import type { AppState, CaptureRecord } from "../types";

/** 与侧边栏一致：仅统计已启用规则组下的捕获条目（每条对应一个 CaptureRenderer） */
export function getVisibleCaptures(state: AppState): CaptureRecord[] {
  const enabledIds = new Set(
    state.ruleGroups.filter((g) => g.enabled).map((g) => g.id),
  );
  return state.captures
    .filter((c) => enabledIds.has(c.ruleGroupId))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function countVisibleCaptures(state: AppState): number {
  return getVisibleCaptures(state).length;
}
