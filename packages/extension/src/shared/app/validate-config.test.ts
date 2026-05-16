import { describe, expect, test } from "bun:test";
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
