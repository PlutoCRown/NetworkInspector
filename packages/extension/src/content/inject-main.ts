import type { Message } from "../shared/app/messages";
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

async function bodyToText(data: BodyInit | null | undefined): Promise<string | null> {
  if (data == null) return null;
  if (typeof data === "string") return data;
  if (data instanceof Blob) return data.text();
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (ArrayBuffer.isView(data)) return new TextDecoder().decode(data);
  if (data instanceof URLSearchParams) return data.toString();
  if (data instanceof FormData) {
    const out: Record<string, string> = {};
    data.forEach((v, k) => {
      out[k] = typeof v === "string" ? v : "[binary]";
    });
    return JSON.stringify(out);
  }
  try {
    return String(data);
  } catch {
    return null;
  }
}

async function readRequestBody(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  req: Request,
): Promise<string | null> {
  try {
    if (init?.body != null) return await bodyToText(init.body);
    return await req.clone().text();
  } catch {
    return null;
  }
}

function patchFetch(): void {
  const original = window.fetch;
  window.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const req =
      input instanceof Request ? input : new Request(input, init);
    const url = req.url;
    const method = req.method;
    const requestHeaders = headersToRecord(req.headers);
    const requestBody = await readRequestBody(input, init, req);

    const response = await original.call(window, input, init);

    try {
      const responseBody = await response.clone().text();
      sendPayload({
        url,
        method,
        tabUrl: window.location.href,
        requestHeaders,
        requestBody,
        responseBody,
      });
    } catch {
      sendPayload({
        url,
        method,
        tabUrl: window.location.href,
        requestHeaders,
        requestBody,
        responseBody: null,
      });
    }

    return response;
  };
}

/** responseType 非 text 时读 responseText 会抛 InvalidStateError */
function readXHRResponseBody(xhr: XMLHttpRequest): string | null | Promise<string | null> {
  const type = xhr.responseType;

  if (type === "" || type === "text") {
    try {
      return xhr.responseText || null;
    } catch {
      return null;
    }
  }

  if (type === "json") {
    try {
      const value = xhr.response;
      if (value == null) return null;
      return typeof value === "string" ? value : JSON.stringify(value);
    } catch {
      return null;
    }
  }

  if (type === "arraybuffer") {
    try {
      const buf = xhr.response as ArrayBuffer | null;
      if (!buf) return null;
      return new TextDecoder().decode(buf);
    } catch {
      return null;
    }
  }

  if (type === "blob") {
    const blob = xhr.response as Blob | null;
    if (!blob) return null;
    return blob.text().catch(() => null);
  }

  if (type === "document") {
    try {
      const doc = xhr.response as Document | null;
      return doc?.documentElement?.outerHTML ?? null;
    } catch {
      return null;
    }
  }

  return null;
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
        void Promise.resolve(readXHRResponseBody(xhr))
          .then((responseBody) => bodyToText(body ?? null).then((requestBody) => ({ requestBody, responseBody })))
          .then(({ requestBody, responseBody }) => {
            sendPayload({
              url: fullUrl,
              method: xhr.__niMethod ?? "GET",
              tabUrl: window.location.href,
              requestBody,
              responseBody,
            });
          })
          .catch(() => {
            /* ignore */
          });
      } catch {
        /* ignore */
      }
    });

    return send.call(this, body);
  };
}

/** Segment / analytics.js 常用 sendBeacon 上报，须单独 hook */
function patchSendBeacon(): void {
  const original = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function (
    url: string | URL,
    data?: BodyInit | null,
  ): boolean {
    try {
      const fullUrl = new URL(url, window.location.href).href;
      void bodyToText(data).then((requestBody) => {
        sendPayload({
          url: fullUrl,
          method: "POST",
          tabUrl: window.location.href,
          requestBody,
          responseBody: null,
        });
      });
    } catch {
      /* ignore */
    }
    return original(url, data);
  };
}

if (!(window as unknown as Record<string, boolean>)[NI_FLAG]) {
  (window as unknown as Record<string, boolean>)[NI_FLAG] = true;
  patchFetch();
  patchXHR();
  patchSendBeacon();
}
