/**
 * Taxonomia first-party do analytics. Cliente e servidor leem a mesma lista
 * para o coletor não encaminhar lixo do dataLayer (gtm.js, gtag.js) e o
 * endpoint não responder 422 em toda página.
 */

export const canonicalAnalyticsEvents = new Set([
  "app_click",
  "article_click",
  "article_read_depth",
  "article_view",
  "author_click",
  "book_click",
  "book_view",
  "bookmark_add",
  "citation_copy",
  "fullscreen_enter",
  "highlight_create",
  "magazine_download",
  "magazine_entry",
  "magazine_home_view",
  "magazine_issue_click",
  "magazine_issue_view",
  "newsletter_click",
  "newsletter_profile_complete",
  "newsletter_signup",
  "note_create",
  "outbound_click",
  "page_turn",
  "page_view",
  "partner_click",
  "partner_lead_submit",
  "partner_media_kit_click",
  "partner_page_view",
  "patient_path_click",
  "professional_area_entry",
  "purchase_click",
  "radar_click",
  "radar_doi_click",
  "radar_report_click",
  "radar_source_click",
  "reader_open",
  "search",
  "share",
  "sponsored_content_view",
  "tool_open",
]);

export const analyticsEventAliases = new Map([
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

export const resolveAnalyticsEventName = (event: string): string | null => {
  const trimmed = event.trim();
  if (!trimmed) return null;
  const resolved = analyticsEventAliases.get(trimmed) ?? trimmed;
  return canonicalAnalyticsEvents.has(resolved) ? resolved : null;
};
