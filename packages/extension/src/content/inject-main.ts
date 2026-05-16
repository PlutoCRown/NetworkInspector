import type { Message } from "../shared/messages";
import type { RawRequestPayload } from "../shared/types";

const NI_FLAG = "__NI_PATCHED__";
const NI_RELAY_DEAD = "network-inspector-relay-dead";

let relayAlive = true;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (
    event.data?.source === "network-inspector-relay" &&
    event.data?.type === NI_RELAY_DEAD
  ) {
    relayAlive = false;
  }
});

function sendPayload(payload: RawRequestPayload): void {
  if (!relayAlive) return;
  const msg: Message = {
    type: "RAW_REQUEST",
    payload: {
      ...payload,
      tabUrl: window.location.href,
    },
  };
  window.postMessage({ source: "network-inspector-content", ...msg }, "*");
}

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

function patchFetch(): void {
  const original = window.fetch;
  window.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const req =
      input instanceof Request ? input : new Request(input, init);
    const response = await original.call(window, input, init);

    try {
      const clone = response.clone();
      const body = await clone.text();
      sendPayload({
        url: req.url,
        method: req.method,
        tabUrl: window.location.href,
        requestHeaders: headersToRecord(req.headers),
        requestBody:
          init?.body != null ? String(init.body) : await req.clone().text().catch(() => null),
        responseBody: body,
      });
    } catch {
      sendPayload({
        url: req.url,
        method: req.method,
        tabUrl: window.location.href,
        requestHeaders: headersToRecord(req.headers),
        requestBody: null,
        responseBody: null,
      });
    }

    return response;
  };
}

function patchXHR(): void {
  const XHR = XMLHttpRequest;
  const open = XHR.prototype.open;
  const send = XHR.prototype.send;

  XHR.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    (this as XMLHttpRequest & { __niMethod?: string; __niUrl?: string }).__niMethod =
      method;
    (this as XMLHttpRequest & { __niUrl?: string }).__niUrl = String(url);
    return open.apply(this, [method, url, ...rest] as Parameters<typeof open>);
  };

  XHR.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const xhr = this as XMLHttpRequest & {
      __niMethod?: string;
      __niUrl?: string;
    };

    this.addEventListener("load", () => {
      try {
        const fullUrl = new URL(xhr.__niUrl ?? "", window.location.href).href;
        sendPayload({
          url: fullUrl,
          method: xhr.__niMethod ?? "GET",
          tabUrl: window.location.href,
          requestBody: body != null ? String(body) : null,
          responseBody: xhr.responseText ?? null,
        });
      } catch {
        /* ignore */
      }
    });

    return send.call(this, body);
  };
}

// Bridge: MAIN world → isolated relay
if (!(window as unknown as Record<string, boolean>)[NI_FLAG]) {
  (window as unknown as Record<string, boolean>)[NI_FLAG] = true;
  patchFetch();
  patchXHR();
}

// Relay script in isolated world listens via separate file - use chrome.runtime from extension world
// Content script runs in MAIN per manifest - we need a small isolated relay
