import { describe, expect, test } from "bun:test";
import { hasAggregateSource, parseFieldExpr, serializeFieldExpr } from "./field-expr";

describe("field-expr", () => {
  test("parses aggregate source with tag", () => {
    const expr = parseFieldExpr("json:data|aggregate");
    expect(expr.source).toBe("json");
    expect(expr.path).toBe("data");
    expect(expr.aggregate).toBe(true);
    expect(hasAggregateSource("json:data|aggregate")).toBe(true);
  });

  test("parses item field with processor and alias", () => {
    const expr = parseFieldExpr("item:time|processor:time|alias:埋点名");
    expect(expr.scope).toBe("item");
    expect(expr.path).toBe("time");
    expect(expr.processors).toEqual(["time"]);
    expect(expr.aliasMap).toBe("埋点名");
  });

  test("legacy aggregate:path migrates to item", () => {
    expect(parseFieldExpr("aggregate:action").scope).toBe("item");
    expect(parseFieldExpr("aggregate:action").path).toBe("action");
  });

  test("round-trip serialize", () => {
    const raw = serializeFieldExpr({
      scope: "item",
      source: null,
      path: "event",
      aggregate: false,
      processors: ["date"],
      aliasMap: "map1",
    });
    expect(raw).toBe("item:event|processor:date|alias:map1");
  });
});
