import type { DisplayMode } from "./types.ts";

export const normalizePageNumber = (page: number, pageCount: number) => {
  const safeCount = Math.max(1, Math.trunc(pageCount));
  const safePage = Number.isFinite(page) ? Math.trunc(page) : 1;
  return Math.min(safeCount, Math.max(1, safePage));
};

export const getVisiblePageNumbers = (
  page: number,
  pageCount: number,
  mode: DisplayMode,
) => {
  const current = normalizePageNumber(page, pageCount);
  if (mode === "single" || current === 1 || current === pageCount) {
    return [current];
  }

  const spreadStart = current % 2 === 0 ? current : current - 1;
  return [spreadStart, Math.min(pageCount, spreadStart + 1)].filter(
    (value, index, pages) => pages.indexOf(value) === index,
  );
};

export const calculateReadingProgress = (page: number, pageCount: number) =>
  Number(
    (
      (normalizePageNumber(page, pageCount) / Math.max(1, pageCount)) *
      100
    ).toFixed(2),
  );
