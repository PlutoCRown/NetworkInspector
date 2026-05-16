import { describe, expect, test } from "bun:test";
import { parseFieldExpr, ruleHasSplits, serializeFieldExpr } from "./field-expr";

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

  test("parses aggregate split ref", () => {
    const expr = parseFieldExpr("[aggregate:item]action");
    expect(expr.splitRef).toBe("item");
    expect(expr.path).toBe("action");
    expect(serializeFieldExpr(expr)).toBe("[aggregate:item]action");
  });

  test("parses split source expression", () => {
    const expr = parseFieldExpr("[source:json]0.events");
    expect(expr.source).toBe("json");
    expect(expr.path).toBe("0.events");
  });

  test("bare string is literal fixed text", () => {
    const expr = parseFieldExpr("页面浏览");
    expect(expr.source).toBeNull();
    expect(expr.path).toBe("页面浏览");
    expect(serializeFieldExpr(expr)).toBe("页面浏览");
  });

  test("ruleHasSplits", () => {
    expect(ruleHasSplits({ splits: { item: "[source:json]x" } })).toBe(true);
    expect(ruleHasSplits({})).toBe(false);
  });
});
