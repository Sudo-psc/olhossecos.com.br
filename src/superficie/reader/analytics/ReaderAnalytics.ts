export type ReaderEvent =
  | "reader_open"
  | "page_view"
  | "page_turn"
  | "search"
  | "bookmark_add"
  | "highlight_create"
  | "note_create"
  | "fullscreen_enter"
  | "share";

export interface ReaderAnalytics {
  track(event: ReaderEvent, payload?: Record<string, unknown>): void;
}
