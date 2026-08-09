import type { TextQuoteAnchor } from "./types.ts";

export const resolveHighlightAnchor = (
  text: string,
  anchor: TextQuoteAnchor,
) => {
  if (text.slice(anchor.start, anchor.end) === anchor.exact) {
    return { start: anchor.start, end: anchor.end };
  }

  const candidates: number[] = [];
  let cursor = text.indexOf(anchor.exact);
  while (cursor >= 0) {
    candidates.push(cursor);
    cursor = text.indexOf(anchor.exact, cursor + 1);
  }
  if (candidates.length === 0) return null;

  const ranked = candidates
    .map((start) => {
      const prefixStart = Math.max(0, start - anchor.prefix.length);
      const prefix = text.slice(prefixStart, start);
      const suffix = text.slice(
        start + anchor.exact.length,
        start + anchor.exact.length + anchor.suffix.length,
      );
      return {
        start,
        score:
          Number(prefix.endsWith(anchor.prefix)) +
          Number(suffix.startsWith(anchor.suffix)),
      };
    })
    .sort(
      (left, right) => right.score - left.score || left.start - right.start,
    );

  const start = ranked[0]?.start;
  return start === undefined
    ? null
    : { start, end: start + anchor.exact.length };
};
