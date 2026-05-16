import type { Message } from "../shared/messages";
import {
  isExtensionContextValid,
  safeRuntimeSendMessage,
} from "../shared/extension-context";

const NI_RELAY_DEAD = "network-inspector-relay-dead";

let relayDead = false;

function markRelayDead(): void {
  if (relayDead) return;
  relayDead = true;
  window.postMessage({ source: "network-inspector-relay", type: NI_RELAY_DEAD }, "*");
}

if (!isExtensionContextValid()) {
  markRelayDead();
}

window.addEventListener("message", (event) => {
  if (relayDead || event.source !== window) return;
  const data = event.data as Message & { source?: string };
  if (data?.source !== "network-inspector-content") return;
  if (data.type !== "RAW_REQUEST") return;

  safeRuntimeSendMessage(data, markRelayDead);
});
