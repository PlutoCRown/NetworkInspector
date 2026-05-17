import { describe, expect, test } from "bun:test";
import { decodeWebRequestBody, formDataToJsonObject } from "./request-body";

describe("formDataToJsonObject", () => {
  test("flattens multi-value fields", () => {
    expect(formDataToJsonObject({ action: ["click"], tags: ["a", "b"] })).toEqual({
      action: "click",
      tags: "a,b",
    });
  });
});

describe("decodeWebRequestBody", () => {
  test("decodes raw JSON bytes", () => {
    const text = '{"event":"click"}';
    const body = decodeWebRequestBody({
      raw: [{ bytes: new TextEncoder().encode(text) }],
    });
    expect(body).toBe(text);
  });

  test("converts formData to JSON object string", () => {
    const body = decodeWebRequestBody({
      formData: { action: ["click"], module: ["home"] },
    });
    expect(JSON.parse(body!)).toEqual({ action: "click", module: "home" });
  });

  test("converts urlencoded raw body to JSON", () => {
    const body = decodeWebRequestBody({
      raw: [{ bytes: new TextEncoder().encode("action=click&module=home") }],
    });
    expect(JSON.parse(body!)).toEqual({ action: "click", module: "home" });
  });
});
