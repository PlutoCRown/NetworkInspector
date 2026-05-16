import { describe, expect, test } from "bun:test";
import { coerceSplitItems } from "./resolve";

describe("coerceSplitItems", () => {
  test("passes through non-empty arrays", () => {
    expect(coerceSplitItems([1, 2])).toEqual([1, 2]);
  });

  test("empty array yields null", () => {
    expect(coerceSplitItems([])).toBeNull();
  });

  test("wraps object as single item", () => {
    const obj = { a: 1 };
    expect(coerceSplitItems(obj)).toEqual([obj]);
  });

  test("null yields null", () => {
    expect(coerceSplitItems(null)).toBeNull();
  });
});
