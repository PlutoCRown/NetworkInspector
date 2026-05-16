import { describe, expect, test } from "bun:test";
import { processCapture } from "./pipeline";
import { DEFAULT_APP_CONFIG } from "../types";
import type { CaptureRecord, RuleGroup } from "../types";

const CFG = DEFAULT_APP_CONFIG;

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
      renderer: "card",
      fields: {
        title: "[source:json]event",
        expand: "[source:json]properties",
      },
      alias: [{ field: "title", match: "page_view", replace: "页面浏览" }],
      filters: [{ field: "expand", path: "debug", equals: true, action: "drop" }],
    },
    {
      id: "beacon-api",
      url: "/v1/beacon",
      renderer: "card",
      fields: {
        title: "[source:query]action",
        desc: "[source:query]module",
        expand: "[source:json]",
      },
      filters: [{ field: "expand", path: "_internal", action: "strip" }],
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
  test("drops event when expand.debug is true", () => {
    const result = processCapture(
      TEST_GROUP,
      {
        url: "https://app.acme.io/v1/events",
        method: "POST",
        tabUrl: "https://app.acme.io/",
        responseBody: JSON.stringify({
          event: "page_view",
          properties: { debug: true },
        }),
      },
      CFG,
    );
    expect(result).toBeNull();
  });

  test("aliases page_view title via rule.alias", () => {
    const result = single(
      processCapture(
        TEST_GROUP,
        {
          url: "https://app.acme.io/v1/events",
          method: "POST",
          tabUrl: "https://app.acme.io/",
          responseBody: JSON.stringify({
            event: "page_view",
            properties: { ok: 1 },
          }),
        },
        CFG,
      ),
    );
    expect(result?.data.title).toBe("页面浏览");
  });

  test("treats non-array split source as single capture", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/single"],
      rules: [
        {
          id: "single",
          url: "/v1/single",
          renderer: "card",
          splits: { item: "[source:json]event" },
          fields: { title: "[aggregate:item]action" },
        },
      ],
    };
    const result = single(
      processCapture(
        group,
        {
          url: "https://app.acme.io/v1/single",
          method: "POST",
          tabUrl: "https://app.acme.io/",
          responseBody: JSON.stringify({
            event: { action: "click", module: "home" },
          }),
        },
        CFG,
      ),
    );
    expect(result?.data.title).toBe("click");
  });

  test("aggregate item path and request-level json field", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/batch"],
      rules: [
        {
          id: "batch",
          url: "/v1/batch",
          renderer: "card",
          splits: { item: "[source:json]items" },
          fields: {
            title: "[aggregate:item]name",
            desc: "[source:json]meta.source",
          },
        },
      ],
    };
    const results = processCapture(
      group,
      {
        url: "https://app.acme.io/v1/batch",
        method: "POST",
        tabUrl: "https://app.acme.io/",
        responseBody: JSON.stringify({
          meta: { source: "web" },
          items: [{ name: "a" }, { name: "b" }],
        }),
      },
      CFG,
    );
    const list = results as CaptureRecord[];
    expect(list).toHaveLength(2);
    expect(list[0]?.data.title).toBe("a");
    expect(list[0]?.data.desc).toBe("web");
  });

  test("processor time formats unix timestamp", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/batch"],
      rules: [
        {
          id: "batch",
          url: "/v1/batch",
          renderer: "card",
          splits: { item: "[source:json]" },
          fields: {
            title: "[aggregate:item]event",
            desc: "[aggregate:item]time[processor:time]",
          },
        },
      ],
    };
    const results = processCapture(
      group,
      {
        url: "https://app.acme.io/v1/batch",
        method: "POST",
        tabUrl: "https://app.acme.io/",
        responseBody: JSON.stringify([{ event: "x", time: 1715929200 }]),
      },
      CFG,
    );
    const list = results as CaptureRecord[];
    expect(String(list[0]?.data.desc)).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test("alias map in field expression", () => {
    const group: RuleGroup = {
      ...TEST_GROUP,
      capture: ["/v1/batch"],
      rules: [
        {
          id: "batch",
          url: "/v1/batch",
          renderer: "card",
          splits: { item: "[source:json]" },
          fields: { title: "[aggregate:item]event[alias:ev]" },
        },
      ],
    };
    const results = processCapture(
      group,
      {
        url: "https://app.acme.io/v1/batch",
        method: "POST",
        tabUrl: "https://app.acme.io/",
        responseBody: JSON.stringify([{ event: "page_view" }]),
      },
      {
        ...CFG,
        aliasMaps: { ev: { name: "事件", mappings: { page_view: "页面浏览" } } },
      },
    );
    const list = results as CaptureRecord[];
    expect(list[0]?.data.title).toBe("页面浏览");
  });

  test("strips _internal from beacon expand", () => {
    const result = single(
      processCapture(
        TEST_GROUP,
        {
          url: "https://app.acme.io/v1/beacon?action=click&module=home",
          method: "POST",
          tabUrl: "https://app.acme.io/",
          responseBody: JSON.stringify({ _internal: true, data: { ok: 1 } }),
        },
        CFG,
      ),
    );
    expect(result?.data.expand).toEqual({ data: { ok: 1 } });
  });
});
