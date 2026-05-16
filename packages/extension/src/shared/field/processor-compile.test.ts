import { describe, expect, test } from "bun:test";
import { EXAMPLE_PROCESSORS } from "./processor-examples";
import { compileProcessor } from "./processor-compile";

describe("compileProcessor", () => {
  test("runs arrow with trailing semicolon", () => {
    const fn = compileProcessor("(value) => value;");
    expect(fn?.("x")).toBe("x");
  });

  test("runs multiline block body", () => {
    const fn = compileProcessor(`(value) => {
      return String(value).toUpperCase();
    }`);
    expect(fn?.("hi")).toBe("HI");
  });

  test("JSONParser example parses string JSON", () => {
    const fn = compileProcessor(EXAMPLE_PROCESSORS.JSONParser);
    expect(fn?.('{"a":1}')).toEqual({ a: 1 });
    expect(fn?.({ b: 2 })).toEqual({ b: 2 });
    expect(fn?.("not json")).toBe("not json");
  });
});
