import { describe, expect, test } from "bun:test";
import { hasAggregateSource, parseFieldExpr, serializeFieldExpr } from "./field-expr";

describe("field-expr", () => {
  test("parses bracket source path processor alias", () => {
    const expr = parseFieldExpr("[source:json]action[processor:time][alias:ev]");
    expect(expr.source).toBe("json");
    expect(expr.path).toBe("action");
    expect(expr.processors).toEqual(["time"]);
    expect(expr.aliasMap).toBe("ev");
    expect(serializeFieldExpr(expr)).toBe(
      "[source:json]action[processor:time][alias:ev]",
    );
  });

  test("parses aggregate source", () => {
    const raw = "[source:json]data[aggregate]";
    const expr = parseFieldExpr(raw);
    expect(expr.source).toBe("json");
    expect(expr.path).toBe("data");
    expect(expr.aggregate).toBe(true);
    expect(hasAggregateSource(raw)).toBe(true);
  });

  test("parses item scope with processor", () => {
    const expr = parseFieldExpr("[scope:item]time[processor:date]");
    expect(expr.scope).toBe("item");
    expect(expr.path).toBe("time");
    expect(serializeFieldExpr(expr)).toBe("[scope:item]time[processor:date]");
  });

  test("bare string is literal fixed text", () => {
    const expr = parseFieldExpr("页面浏览");
    expect(expr.source).toBeNull();
    expect(expr.path).toBe("页面浏览");
    expect(serializeFieldExpr(expr)).toBe("页面浏览");
  });
});
