/** 与 runProcessor 相同的编译方式，供校验与执行共用 */
export function compileProcessor(
  source: string,
): ((value: unknown) => unknown) | null {
  const trimmed = source.trim();
  if (!trimmed) return null;
  try {
    return new Function(
      "value",
      `const __fn = ${trimmed};\nreturn __fn(value);`,
    ) as (value: unknown) => unknown;
  } catch {
    return null;
  }
}

export function isProcessorBodyValid(body: string): boolean {
  return compileProcessor(body) !== null;
}
