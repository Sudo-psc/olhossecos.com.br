import type { ReaderAnalytics, ReaderEvent } from "./ReaderAnalytics.ts";

type DispatchAnalytics = (detail: Record<string, unknown>) => void;

export class SiteReaderAnalytics implements ReaderAnalytics {
  private readonly dispatch: DispatchAnalytics;

  constructor(
    dispatch: DispatchAnalytics = (detail) => {
      window.dispatchEvent(new CustomEvent("olhossecos:analytics", { detail }));
    },
  ) {
    this.dispatch = dispatch;
  }

  track(event: ReaderEvent, payload: Record<string, unknown> = {}): void {
    const {
      note_text: _note,
      selected_text: _selection,
      search_term: _term,
      ...safePayload
    } = payload;
    this.dispatch({ event, ...safePayload });
  }
}
