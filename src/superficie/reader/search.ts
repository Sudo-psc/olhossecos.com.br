import type { SearchIndexEntry, SearchResult } from "./types.ts";

export const validateSearchIndex = (
  value: unknown,
  pageCount: number,
): SearchIndexEntry[] | null => {
  if (!Array.isArray(value) || value.length > pageCount) return null;
  const valid = value.every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      Number.isInteger(Reflect.get(entry, "page")) &&
      Number(Reflect.get(entry, "page")) >= 1 &&
      Number(Reflect.get(entry, "page")) <= pageCount &&
      typeof Reflect.get(entry, "text") === "string" &&
      String(Reflect.get(entry, "text")).length <= 50_000,
  );
  return valid ? (value as SearchIndexEntry[]) : null;
};

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");

const createSnippet = (text: string, index: number, termLength: number) => {
  const start = Math.max(0, index - 42);
  const end = Math.min(text.length, index + termLength + 64);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${
    end < text.length ? "…" : ""
  }`;
};

export const searchIssue = (
  index: SearchIndexEntry[],
  rawTerm: string,
): SearchResult[] => {
  const term = rawTerm.trim();
  if (term.length < 2) return [];
  const normalizedTerm = normalizeSearchText(term);

  return index.flatMap((entry) => {
    const normalizedText = normalizeSearchText(entry.text);
    const matchIndex = normalizedText.indexOf(normalizedTerm);
    if (matchIndex < 0) return [];
    return [
      {
        page: entry.page,
        term,
        snippet: createSnippet(entry.text, matchIndex, term.length),
      },
    ];
  });
};
