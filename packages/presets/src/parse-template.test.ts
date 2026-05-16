import { describe, expect, test } from "bun:test";
import { extractTemplateMeta, interpolateText, resolveBuiltin } from "./parse-template";

const CARD_SNIPPET = `
<style>.x{}</style>
<article x-card>
  <div x-title>{{title}}</div>
  <div x-title highlight>{{title}}</div>
  <div x-if="desc">{{desc}}</div>
  <div x-expand>{{expend}}</div>
</article>
<div x-popover>{{popover}}</div>
`;

describe("extractTemplateMeta", () => {
  test("extracts data fields excluding builtins", () => {
    const meta = extractTemplateMeta(
      `<div>{{title}}</div><span>{{__TIME__}}</span><span>{{popover}}</span>`,
    );
    expect(meta.fields).toEqual(["popover", "title"]);
  });

  test("detects slots from card template shape", () => {
    const meta = extractTemplateMeta(CARD_SNIPPET);
    expect(meta.slots.card).toBe(true);
    expect(meta.slots.expand).toBe(true);
    expect(meta.slots.popover).toBe(true);
    expect(meta.fields).toContain("title");
    expect(meta.fields).toContain("expend");
  });
});

describe("resolveBuiltin", () => {
  test("__TIME__ formats as HH:mm:ss", () => {
    const ts = new Date("2026-05-16T15:04:05").getTime();
    expect(
      resolveBuiltin("__TIME__", {
        timestamp: ts,
        requestUrl: "u",
        ruleId: "r",
        ruleGroupId: "g",
      }),
    ).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe("interpolateText", () => {
  test("replaces field and builtin", () => {
    const out = interpolateText(
      "{{title}} @ {{__TIME__}}",
      { title: "click" },
      {
        timestamp: new Date("2026-05-16T12:00:00").getTime(),
        requestUrl: "https://x",
        ruleId: "r1",
        ruleGroupId: "g1",
      },
    );
    expect(out).toContain("click");
    expect(out).toContain("12:00:00");
  });
});
