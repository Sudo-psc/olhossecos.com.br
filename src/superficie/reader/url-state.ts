import { normalizePageNumber } from "./navigation.ts";

export const pageFromUrl = (url: string, pageCount: number) => {
  const parsed = new URL(url);
  const rawPage = Number(parsed.searchParams.get("page"));
  return normalizePageNumber(
    Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageCount,
  );
};

export const urlForPage = (url: string, page: number) => {
  const parsed = new URL(url);
  parsed.searchParams.set("page", String(page));
  return parsed.href;
};

export const shareUrlForPage = (url: string, page: number) => {
  const parsed = new URL(url);
  parsed.search = "";
  parsed.hash = "";
  parsed.searchParams.set("page", String(page));
  return parsed.href;
};
