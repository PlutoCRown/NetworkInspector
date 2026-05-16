import type { Message } from "../shared/messages";
import { processCapture, validateRuleGroup } from "../shared/pipeline";
import {
  appendCapture,
  clearCaptures,
  loadState,
  saveActiveRuleGroupId,
  saveRuleGroups,
} from "../shared/storage";
import type { AppState, RuleGroup } from "../shared/types";

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

async function broadcastState(state: AppState): Promise<void> {
  const msg: Message = { type: "STATE_UPDATED", state };
  chrome.runtime.sendMessage(msg).catch(() => {});
}

async function getState(): Promise<AppState> {
  return loadState();
}

async function getActiveGroup(): Promise<RuleGroup | null> {
  const state = await getState();
  if (!state.activeRuleGroupId) return null;
  return state.ruleGroups.find((g) => g.id === state.activeRuleGroupId) ?? null;
}

async function handleRawRequest(
  payload: import("../shared/types").RawRequestPayload,
): Promise<void> {
  const group = await getActiveGroup();
  if (!group) return;

  const capture = processCapture(group, payload);
  if (!capture) return;

  const captures = await appendCapture(capture);
  const msg: Message = {
    type: "CAPTURE_ADDED",
    capture,
    captures,
  };
  chrome.runtime.sendMessage(msg).catch(() => {});
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
      case "TOGGLE_ENABLED": {
        const state = await getState();
        const group = state.ruleGroups.find((g) => g.id === state.activeRuleGroupId);
        if (group) {
          group.enabled = !group.enabled;
          await saveRuleGroups(state.ruleGroups);
          await broadcastState(await getState());
        }
        sendResponse({ ok: true });
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
      case "OPEN_SIDE_PANEL": {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
        sendResponse({ ok: true });
        break;
      }
      case "OPEN_EDITOR": {
        await chrome.windows.create({
          url: chrome.runtime.getURL("src/editor/index.html"),
          type: "popup",
          width: 960,
          height: 720,
        });
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
