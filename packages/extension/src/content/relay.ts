import type { Message } from "../shared/messages";

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data as Message & { source?: string };
  if (data?.source !== "network-inspector-content") return;
  if (data.type === "RAW_REQUEST") {
    chrome.runtime.sendMessage(data).catch(() => {});
  }
});
