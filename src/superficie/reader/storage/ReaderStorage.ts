import type {
  Bookmark,
  Highlight,
  ReaderNote,
  ReaderPreferences,
  ReadingProgress,
} from "../types.ts";

export interface ReaderStorage {
  getProgress(issueId: string): Promise<ReadingProgress | null>;
  saveProgress(progress: ReadingProgress): Promise<void>;
  getPreferences(issueId: string): Promise<ReaderPreferences | null>;
  savePreferences(preferences: ReaderPreferences): Promise<void>;
  listBookmarks(issueId: string): Promise<Bookmark[]>;
  saveBookmark(bookmark: Bookmark): Promise<void>;
  deleteBookmark(id: string): Promise<void>;
  listHighlights(issueId: string): Promise<Highlight[]>;
  saveHighlight(highlight: Highlight): Promise<void>;
  deleteHighlight(id: string): Promise<void>;
  listNotes(issueId: string): Promise<ReaderNote[]>;
  saveNote(note: ReaderNote): Promise<void>;
  deleteNote(id: string): Promise<void>;
}
