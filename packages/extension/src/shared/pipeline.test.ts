import { describe, expect, test } from "bun:test";
import { processCapture } from "./pipeline";
import { DEFAULT_RULE_GROUP } from "./default-rule-group";

describe("processCapture", () => {
  test("drops event when popover.debug is true", () => {
    const result = processCapture(DEFAULT_RULE_GROUP, {
      url: "https://app.acme.io/v1/events",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({
        event: "page_view",
        properties: { debug: true },
      }),
    });
    expect(result).toBeNull();
  });

  test("aliases page_view title", () => {
    const result = processCapture(DEFAULT_RULE_GROUP, {
      url: "https://app.acme.io/v1/events",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({
        event: "page_view",
        properties: { ok: 1 },
      }),
    });
    expect(result?.data.title).toBe("页面浏览");
  });

  test("strips _internal from beacon expend", () => {
    const result = processCapture(DEFAULT_RULE_GROUP, {
      url: "https://app.acme.io/v1/beacon?action=click&module=home",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({ _internal: true, data: { ok: 1 } }),
    });
    expect(result?.data.expend).toEqual({ data: { ok: 1 } });
  });
});
