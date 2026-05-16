import { countVisibleCaptures } from "./visible";
import type { AppState } from "../types";

function badgeText(count: number): string {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

export function syncActionBadge(state: AppState): void {
  const count = countVisibleCaptures(state);
  const text = badgeText(count);
  chrome.action.setBadgeText({ text });
  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
  }
}
