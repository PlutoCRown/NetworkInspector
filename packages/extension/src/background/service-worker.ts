import type { Message } from "../shared/messages";
import { syncActionBadge } from "../shared/action-badge";
import { processCapture, validateRuleGroup } from "../shared/pipeline";
import {
  appendCapture,
  clearCaptures,
  loadState,
  saveActiveRuleGroupId,
  saveAppConfig,
  saveCaptureEnabled,
  saveRuleGroups,
} from "../shared/storage";
import { safeRuntimeSendMessage } from "../shared/extension-context";
import type { AppState } from "../shared/types";

// 点击图标展开 popup，不直接打开侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => { });

function broadcastState(state: AppState): void {
  syncActionBadge(state);
  safeRuntimeSendMessage({ type: "STATE_UPDATED", state } satisfies Message);
}

async function getState(): Promise<AppState> {
  return loadState();
}

async function handleRawRequest(
  payload: import("../shared/types").RawRequestPayload,
): Promise<void> {
  const state = await getState();
  if (!state.captureEnabled) return;
  const enabledGroups = state.ruleGroups.filter((g) => g.enabled);
  if (enabledGroups.length === 0) return;

  let captures = state.captures;
  for (const group of enabledGroups) {
    const result = processCapture(group, payload, state.config);
    if (!result) continue;
    const list = Array.isArray(result) ? result : [result];
    for (const capture of list) {
      captures = await appendCapture(capture);
      safeRuntimeSendMessage({
        type: "CAPTURE_ADDED",
        capture,
        captures,
      } satisfies Message);
    }
  }
  if (captures !== state.captures) {
    syncActionBadge({ ...state, captures });
  }
}

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case "RAW_REQUEST": {
        if (sender.tab?.url) {
          message.payload.tabUrl = message.payload.tabUrl || sender.tab.url;
        }
        await handleRawRequest(message.payload);
        sendResponse({ ok: true });
        break;
      }
      case "GET_STATE": {
        sendResponse(await getState());
        break;
      }
      case "TOGGLE_RULE_GROUP": {
        const state = await getState();
        const group = state.ruleGroups.find((g) => g.id === message.id);
        if (group) {
          group.enabled = !group.enabled;
          await saveRuleGroups(state.ruleGroups);
          await broadcastState(await getState());
        }
        sendResponse({ ok: true });
        break;
      }
      case "TOGGLE_CAPTURE_ENABLED": {
        const state = await getState();
        await saveCaptureEnabled(!state.captureEnabled);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "RELOAD_STATE": {
        sendResponse(await getState());
        break;
      }
      case "SET_ACTIVE_GROUP": {
        await saveActiveRuleGroupId(message.id);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "IMPORT_RULE_GROUP": {
        if (!validateRuleGroup(message.group)) {
          sendResponse({ ok: false, error: "Invalid rule group" });
          break;
        }
        const state = await getState();
        const idx = state.ruleGroups.findIndex((g) => g.id === message.group.id);
        if (idx >= 0 && !message.overwrite) {
          sendResponse({ ok: false, conflict: true });
          break;
        }
        if (idx >= 0) state.ruleGroups[idx] = message.group;
        else state.ruleGroups.push(message.group);
        await saveRuleGroups(state.ruleGroups);
        await saveActiveRuleGroupId(message.group.id);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "SAVE_RULE_GROUP": {
        if (!validateRuleGroup(message.group)) {
          sendResponse({ ok: false, error: "Invalid rule group" });
          break;
        }
        const state = await getState();
        const idx = state.ruleGroups.findIndex((g) => g.id === message.group.id);
        if (idx >= 0) state.ruleGroups[idx] = message.group;
        else state.ruleGroups.push(message.group);
        await saveRuleGroups(state.ruleGroups);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "DELETE_RULE_GROUP": {
        const state = await getState();
        state.ruleGroups = state.ruleGroups.filter((g) => g.id !== message.id);
        if (state.activeRuleGroupId === message.id) {
          await saveActiveRuleGroupId(state.ruleGroups[0]?.id ?? null);
        }
        await saveRuleGroups(state.ruleGroups);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "CLEAR_CAPTURES": {
        await clearCaptures();
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "SAVE_APP_CONFIG": {
        await saveAppConfig(message.config);
        await broadcastState(await getState());
        sendResponse({ ok: true });
        break;
      }
      case "OPEN_EDITOR": {
        const base = chrome.runtime.getURL("src/editor/index.html");
        const url = message.ruleGroupId
          ? `${base}?id=${encodeURIComponent(message.ruleGroupId)}`
          : base;
        await chrome.tabs.create({ url });
        sendResponse({ ok: true });
        break;
      }
      default:
        break;
    }
  })();

  return true;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    getState().then(broadcastState);
  }
});

void getState().then(syncActionBadge);
