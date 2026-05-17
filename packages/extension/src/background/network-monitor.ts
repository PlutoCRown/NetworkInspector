import { loadState } from "../shared/app/storage";
import {
  decodeWebRequestBody,
  headersToRecord,
} from "../shared/network/request-body";
import type { RawRequestPayload } from "../shared/types";

const URL_FILTER: chrome.webRequest.RequestFilter = { urls: ["<all_urls>"] };
const PENDING_TTL_MS = 5 * 60 * 1000;

interface PendingRequest {
  url: string;
  method: string;
  tabId: number;
  initiator?: string;
  requestBody: string | null;
  requestHeaders?: Record<string, string>;
  startedAt: number;
}

const pending = new Map<string, PendingRequest>();

let monitorEnabled = false;

async function refreshMonitorGate(): Promise<void> {
  const state = await loadState();
  monitorEnabled =
    state.captureEnabled && state.ruleGroups.some((g) => g.enabled);
}

function pruneStalePending(): void {
  const now = Date.now();
  for (const [id, entry] of pending) {
    if (now - entry.startedAt > PENDING_TTL_MS) pending.delete(id);
  }
}

async function resolveTabUrl(
  tabId: number,
  initiator?: string,
): Promise<string> {
  if (tabId >= 0) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url) return tab.url;
    } catch {
      /* tab gone */
    }
  }
  return initiator ?? "";
}

async function flushRequest(
  requestId: string,
  onPayload: (payload: RawRequestPayload) => Promise<void>,
): Promise<void> {
  const entry = pending.get(requestId);
  pending.delete(requestId);
  if (!entry || !monitorEnabled) return;

  const tabUrl = await resolveTabUrl(entry.tabId, entry.initiator);
  await onPayload({
    url: entry.url,
    method: entry.method,
    tabUrl,
    requestHeaders: entry.requestHeaders,
    requestBody: entry.requestBody,
  });
}

/**
 * 使用 chrome.webRequest 在扩展侧观察网络请求（MV3 非阻塞模式）。
 * 埋点类数据多在请求体；form / urlencoded 在解码时已规范为 JSON 文本。
 */
export function initNetworkMonitor(
  onPayload: (payload: RawRequestPayload) => Promise<void>,
): void {
  void refreshMonitorGate();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (
      changes.captureEnabled ||
      changes.ruleGroups ||
      changes.activeRuleGroupId
    ) {
      void refreshMonitorGate();
    }
  });

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (!monitorEnabled) return;
      pruneStalePending();
      pending.set(details.requestId, {
        url: details.url,
        method: details.method,
        tabId: details.tabId,
        initiator: details.initiator,
        requestBody: decodeWebRequestBody(details.requestBody ?? undefined),
        startedAt: Date.now(),
      });
    },
    URL_FILTER,
    ["requestBody"],
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      if (!monitorEnabled) return;
      const entry = pending.get(details.requestId);
      if (!entry) return;
      entry.requestHeaders = headersToRecord(details.requestHeaders);
    },
    URL_FILTER,
    ["requestHeaders", "extraHeaders"],
  );

  const finish = (requestId: string) => {
    void flushRequest(requestId, onPayload);
  };

  chrome.webRequest.onCompleted.addListener(
    (details) => finish(details.requestId),
    URL_FILTER,
  );

  chrome.webRequest.onErrorOccurred.addListener(
    (details) => finish(details.requestId),
    URL_FILTER,
  );
}

export async function syncNetworkMonitorGate(): Promise<void> {
  await refreshMonitorGate();
}
