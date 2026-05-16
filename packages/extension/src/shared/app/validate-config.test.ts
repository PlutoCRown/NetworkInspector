import { describe, expect, test } from "bun:test";
import { EXAMPLE_PROCESSORS } from "../field/processor-examples";
import {
  isProcessorBodyValid,
  validateAppConfigForSave,
} from "./validate-config";

describe("validate-config", () => {
  test("empty processor body is invalid", () => {
    expect(isProcessorBodyValid("")).toBe(false);
    expect(isProcessorBodyValid("   ")).toBe(false);
  });

  test("valid processor body", () => {
    expect(isProcessorBodyValid("(value) => value")).toBe(true);
    expect(isProcessorBodyValid("(value) => value;")).toBe(true);
  });

  test("example processors are valid", () => {
    for (const body of Object.values(EXAMPLE_PROCESSORS)) {
      expect(isProcessorBodyValid(body)).toBe(true);
    }
  });

  test("invalid processor body syntax", () => {
    expect(isProcessorBodyValid("(value) => {")).toBe(false);
  });

  test("save rejects empty processor body", () => {
    const errors = validateAppConfigForSave({
      customProcessors: { time: "" },
      aliasMaps: {},
    });
    expect(errors.some((e) => e.includes("time"))).toBe(true);
  });
});
