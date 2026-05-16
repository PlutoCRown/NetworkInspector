import { describe, expect, test } from "bun:test";
import {
  hasAggregateSource,
  migrateFieldExprString,
  parseFieldExpr,
  serializeFieldExpr,
} from "./field-expr";

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
    const expr = parseFieldExpr("[source:json]data[aggregate]");
    expect(expr.source).toBe("json");
    expect(expr.path).toBe("data");
    expect(expr.aggregate).toBe(true);
    expect(hasAggregateSource("[source:json]data[aggregate]")).toBe(true);
  });

  test("parses item scope with tags", () => {
    const expr = parseFieldExpr("[scope:item]time[processor:date]");
    expect(expr.scope).toBe("item");
    expect(expr.path).toBe("time");
    expect(expr.processors).toEqual(["date"]);
    expect(serializeFieldExpr(expr)).toBe("[scope:item]time[processor:date]");
  });

  test("migrates legacy pipe format to brackets", () => {
    expect(migrateFieldExprString("json:event|processor:time|alias:ev")).toBe(
      "[source:json]event[processor:time][alias:ev]",
    );
  });

  test("legacy aggregate:path migrates via parse", () => {
    const expr = parseFieldExpr("aggregate:action");
    expect(expr.scope).toBe("item");
    expect(expr.path).toBe("action");
    expect(serializeFieldExpr(expr)).toBe("[scope:item]action");
  });

  test("bare string is literal fixed text", () => {
    const expr = parseFieldExpr("页面浏览");
    expect(expr.source).toBeNull();
    expect(expr.path).toBe("页面浏览");
    expect(serializeFieldExpr(expr)).toBe("页面浏览");
  });
});
