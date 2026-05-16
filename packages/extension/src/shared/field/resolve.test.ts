import { describe, expect, test } from "bun:test";
import { resolveFieldExpr } from "./resolve";
import { DEFAULT_APP_CONFIG } from "../types";

describe("field-resolve", () => {
  test("literal text without source", () => {
    const value = resolveFieldExpr(
      "固定标题",
      {
        url: "https://example.com/api",
        responseBody: JSON.stringify({ title: "from api" }),
      },
      null,
      DEFAULT_APP_CONFIG,
    );
    expect(value).toBe("固定标题");
  });

  test("response reads response body only", () => {
    const value = resolveFieldExpr(
      "[source:response]event",
      {
        url: "https://example.com/api",
        requestBody: JSON.stringify({ event: "req" }),
        responseBody: JSON.stringify({ event: "res" }),
      },
      null,
      DEFAULT_APP_CONFIG,
    );
    expect(value).toBe("res");
  });
});
