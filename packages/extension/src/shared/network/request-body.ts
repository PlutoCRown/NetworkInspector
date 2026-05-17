/** Chrome webRequest formData：同名字段可能是 string[] */
export function formDataToJsonObject(
  formData: Record<string, string | string[]>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      out[key] = value.length === 1 ? value[0]! : value.join(",");
    } else {
      out[key] = value;
    }
  }
  return out;
}

function urlEncodedToJsonObject(text: string): Record<string, string> | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith("{") || trimmed.startsWith("[")) return null;
  try {
    const params = new URLSearchParams(trimmed);
    const out: Record<string, string> = {};
    params.forEach((v, k) => {
      out[k] = v;
    });
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** 将 webRequest.onBeforeRequest 的 requestBody 规范为 JSON 文本（或原文） */
export function decodeWebRequestBody(
  body: chrome.webRequest.WebRequestBody | null | undefined,
): string | null {
  if (!body) return null;

  if (body.formData) {
    return JSON.stringify(formDataToJsonObject(body.formData));
  }

  const raw = body.raw;
  if (!raw?.length) return null;

  const parts: string[] = [];
  for (const chunk of raw) {
    if (chunk.bytes) {
      parts.push(new TextDecoder().decode(chunk.bytes));
    } else if (chunk.file) {
      parts.push(`[file:${chunk.file}]`);
    }
  }
  const text = parts.join("");
  if (!text) return null;

  const asForm = urlEncodedToJsonObject(text);
  if (asForm) return JSON.stringify(asForm);

  return text;
}

export function headersToRecord(
  headers: chrome.webRequest.HttpHeader[] | undefined,
): Record<string, string> | undefined {
  if (!headers?.length) return undefined;
  const out: Record<string, string> = {};
  for (const h of headers) {
    if (h.name && h.value != null) out[h.name] = h.value;
  }
  return out;
}
