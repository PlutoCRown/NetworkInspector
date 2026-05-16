import { describe, expect, test } from "bun:test";
import { processCapture } from "./pipeline";
import type { CaptureRecord, RuleGroup } from "./types";

const TEST_GROUP: RuleGroup = {
  version: 1,
  id: "test",
  name: "test",
  enabled: true,
  sites: ["^https://app\\.acme\\.io/"],
  capture: ["/v1/events", "/v1/beacon"],
  rules: [
    {
      id: "events-api",
      url: "/v1/events",
      renderer: "title-popover",
      fields: { title: "json:event", popover: "json:properties" },
      alias: [{ field: "title", match: "page_view", replace: "页面浏览" }],
      filters: [{ field: "popover", path: "debug", equals: true, action: "drop" }],
    },
    {
      id: "beacon-api",
      url: "/v1/beacon",
      renderer: "title-popover",
      fields: {
        title: "query:action",
        desc: "query:module",
        expend: "json:",
      },
      filters: [{ field: "expend", path: "_internal", action: "strip" }],
    },
  ],
};

function single(
  result: ReturnType<typeof processCapture>,
): Extract<ReturnType<typeof processCapture>, { data: unknown }> | null {
  if (!result) return null;
  return Array.isArray(result) ? result[0] ?? null : result;
}

describe("processCapture", () => {
  test("drops event when popover.debug is true", () => {
    const result = processCapture(TEST_GROUP, {
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
    const result = single(
      processCapture(TEST_GROUP, {
      url: "https://app.acme.io/v1/events",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({
        event: "page_view",
        properties: { ok: 1 },
      }),
    }),
    );
    expect(result?.data.title).toBe("页面浏览");
  });

  test("aggregate: reads item path; json: reads full request", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/batch"],
      rules: [
        {
          id: "batch",
          url: "/v1/batch",
          renderer: "card",
          aggregate: true,
          aggregateFrom: "json:items",
          fields: {
            title: "aggregate:name",
            popover: "json:meta.source",
          },
        },
      ],
    };
    const results = processCapture(group, {
      url: "https://app.acme.io/v1/batch",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({
        meta: { source: "web" },
        items: [{ name: "a" }, { name: "b" }],
      }),
    });
    expect(Array.isArray(results)).toBe(true);
    const list = results as CaptureRecord[];
    expect(list).toHaveLength(2);
    expect(list[0]?.data.title).toBe("a");
    expect(list[0]?.data.popover).toBe("web");
    expect(list[1]?.data.title).toBe("b");
  });

  test("legacy bare path still works in aggregate mode", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/batch"],
      rules: [
        {
          id: "batch",
          url: "/v1/batch",
          renderer: "card",
          aggregate: true,
          aggregateFrom: "json:",
          fields: { title: "event" },
        },
      ],
    };
    const results = processCapture(group, {
      url: "https://app.acme.io/v1/batch",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify([{ event: "x" }, { event: "y" }]),
    });
    const list = results as CaptureRecord[];
    expect(list[0]?.data.title).toBe("x");
    expect(list[1]?.data.title).toBe("y");
  });

  test("strips _internal from beacon expend", () => {
    const result = single(
      processCapture(TEST_GROUP, {
      url: "https://app.acme.io/v1/beacon?action=click&module=home",
      method: "POST",
      tabUrl: "https://app.acme.io/",
      responseBody: JSON.stringify({ _internal: true, data: { ok: 1 } }),
    }),
    );
    expect(result?.data.expend).toEqual({ data: { ok: 1 } });
  });
});
