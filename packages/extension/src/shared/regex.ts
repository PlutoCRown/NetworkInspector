export function compileRegex(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

export function matchesAny(text: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    const re = compileRegex(pattern);
    if (re?.test(text)) return true;
  }
  return false;
}

/** 在 patterns 中取匹配长度最长的项；并列取第一个 */
export function longestMatchingPattern(
  text: string,
  patterns: string[],
): string | null {
  let best: string | null = null;
  let bestLen = -1;

  for (const pattern of patterns) {
    const re = compileRegex(pattern);
    if (!re) continue;
    const m = text.match(re);
    if (m && m[0].length > bestLen) {
      bestLen = m[0].length;
      best = pattern;
    }
  }

  return best;
}
