import { sanitizeAnalyticsProperty } from "./analytics-safety.ts";

const safePropertyNames = new Set([
  "article_path",
  "article_slug",
  "audience_role",
  "book",
  "content_title",
  "color",
  "depth",
  "destination_host",
  "label",
  "link_text",
  "link_url",
  "placement",
  "issue_id",
  "page_number",
  "progress_percent",
  "query_length",
  "result_count",
  "source",
  "store",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
]);

const eventAliases = new Map([
  ["click_book", "book_click"],
  ["click_purchase", "purchase_click"],
  ["click_superficie", "magazine_entry"],
  ["home_view", "page_view"],
  ["issue_click", "magazine_issue_click"],
  ["media_kit_click", "partner_media_kit_click"],
  ["professional_path_click", "professional_area_entry"],
  ["superficie_click", "magazine_entry"],
  ["superficie_home_view", "magazine_home_view"],
  ["superficie_issue_click", "magazine_issue_click"],
  ["view_book", "book_view"],
]);

export const getInitialAnalyticsEvent = (pathname: string) => {
  if (/^\/livros\/[^/]+$/u.test(pathname)) return "book_view";
  if (/^\/superficie\/artigos\/[^/]+$/u.test(pathname)) return "article_view";
  if (/^\/superficie\/edicao-[^/]+$/u.test(pathname)) {
    return "magazine_issue_view";
  }
  if (pathname === "/ferramentas/deq-5" || pathname === "/ferramentas/diario") {
    return "tool_open";
  }
  return "page_view";
};

export const getSafeAnalyticsDetail = (
  detail: Record<string, unknown>,
  pathname: string,
) => {
  if (typeof detail.event !== "string" || !detail.event.trim()) return null;

  const safe: Record<string, string | number> = {
    event:
      eventAliases.get(detail.event.trim()) ?? detail.event.trim().slice(0, 80),
    page_path: pathname,
  };
  for (const property of safePropertyNames) {
    const value = sanitizeAnalyticsProperty(property, detail[property]);
    if (value !== null) safe[property] = value;
  }
  return safe;
};

export const getAnalyticsFingerprint = (
  detail: Record<string, string | number>,
) => {
  const event = String(detail.event ?? "");
  const pagePath = String(detail.page_path ?? "");
  if (event === "page_view" && detail.issue_id && detail.page_number) {
    return `${event}:${pagePath}:${String(detail.issue_id)}:${String(detail.page_number)}`;
  }
  if (event === "page_view" || event.endsWith("_view")) {
    return `${event}:${pagePath}`;
  }

  return JSON.stringify(
    Object.entries(detail).sort(([first], [second]) =>
      first.localeCompare(second),
    ),
  );
};
