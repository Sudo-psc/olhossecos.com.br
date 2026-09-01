import type {
  Bookmark,
  Highlight,
  ReaderNote,
  ReaderPreferences,
  ReadingProgress,
  TextQuoteAnchor,
  ZoomMode,
} from "./types.ts";

interface StoredReaderDataInput {
  progress: unknown;
  preferences: unknown;
  bookmarks: unknown;
  highlights: unknown;
  notes: unknown;
}

interface StoredReaderData {
  progress: ReadingProgress | null;
  preferences: ReaderPreferences | null;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: ReaderNote[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDate = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const isString = (value: unknown, maximum = 500): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= maximum;

const isPage = (value: unknown, pageCount: number): value is number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= pageCount;

const belongsTo = (value: Record<string, unknown>, issueId: string) =>
  value.issueId === issueId;

const isAnchor = (value: unknown): value is TextQuoteAnchor =>
  isRecord(value) &&
  isString(value.exact, 20_000) &&
  typeof value.prefix === "string" &&
  value.prefix.length <= 200 &&
  typeof value.suffix === "string" &&
  value.suffix.length <= 200 &&
  Number.isInteger(value.start) &&
  Number(value.start) >= 0 &&
  Number.isInteger(value.end) &&
  Number(value.end) > Number(value.start);

export function sanitizeStoredReaderData(
  issueId: string,
  pageCount: number,
  input: StoredReaderDataInput,
): StoredReaderData {
  const progress =
    isRecord(input.progress) &&
    belongsTo(input.progress, issueId) &&
    isPage(input.progress.page, pageCount) &&
    typeof input.progress.percent === "number" &&
    Number.isFinite(input.progress.percent) &&
    input.progress.percent >= 0 &&
    input.progress.percent <= 100 &&
    isDate(input.progress.updatedAt)
      ? (input.progress as unknown as ReadingProgress)
      : null;

  const preferences = sanitizePreferences(
    input.preferences,
    issueId,
    pageCount,
  );

  const bookmarks = Array.isArray(input.bookmarks)
    ? input.bookmarks.filter(
        (value): value is Bookmark =>
          isRecord(value) &&
          belongsTo(value, issueId) &&
          isString(value.id) &&
          isPage(value.page, pageCount) &&
          isDate(value.createdAt),
      )
    : [];
  const highlights = Array.isArray(input.highlights)
    ? input.highlights.filter(
        (value): value is Highlight =>
          isRecord(value) &&
          belongsTo(value, issueId) &&
          isString(value.id) &&
          isPage(value.page, pageCount) &&
          isString(value.blockId, 200) &&
          isAnchor(value.anchor) &&
          ["yellow", "green", "blue", "pink"].includes(String(value.color)) &&
          isDate(value.createdAt),
      )
    : [];
  const notes = Array.isArray(input.notes)
    ? input.notes.filter(
        (value): value is ReaderNote =>
          isRecord(value) &&
          belongsTo(value, issueId) &&
          isString(value.id) &&
          isPage(value.page, pageCount) &&
          isString(value.text, 600) &&
          (value.highlightId === undefined || isString(value.highlightId)) &&
          isDate(value.createdAt) &&
          isDate(value.updatedAt),
      )
    : [];

  return { progress, preferences, bookmarks, highlights, notes };
}

function sanitizePreferences(
  value: unknown,
  issueId: string,
  pageCount: number,
): ReaderPreferences | null {
  if (
    !isRecord(value) ||
    !belongsTo(value, issueId) ||
    typeof value.soundEnabled !== "boolean" ||
    typeof value.reducedMotion !== "boolean" ||
    typeof value.toolbarMinimized !== "boolean" ||
    !["fit-page", "fit-width", "custom"].includes(String(value.zoomMode)) ||
    typeof value.zoomPercent !== "number" ||
    ![100, 125, 150, 200].includes(value.zoomPercent)
  ) {
    return null;
  }

  const preferences: ReaderPreferences = {
    issueId,
    soundEnabled: value.soundEnabled,
    reducedMotion: value.reducedMotion,
    toolbarMinimized: value.toolbarMinimized,
    zoomMode: value.zoomMode as ZoomMode,
    zoomPercent: value.zoomPercent as ReaderPreferences["zoomPercent"],
  };
  if (isPage(value.resumeDismissedPage, pageCount)) {
    preferences.resumeDismissedPage = value.resumeDismissedPage;
  }
  return preferences;
}
