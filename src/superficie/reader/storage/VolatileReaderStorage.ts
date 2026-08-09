import type {
  Bookmark,
  Highlight,
  ReaderNote,
  ReaderPreferences,
  ReadingProgress,
} from "../types.ts";
import type { ReaderStorage } from "./ReaderStorage.ts";

export class VolatileReaderStorage implements ReaderStorage {
  private readonly progress = new Map<string, ReadingProgress>();
  private readonly preferences = new Map<string, ReaderPreferences>();
  private readonly bookmarks = new Map<string, Bookmark>();
  private readonly highlights = new Map<string, Highlight>();
  private readonly notes = new Map<string, ReaderNote>();

  async getProgress(issueId: string): Promise<ReadingProgress | null> {
    return this.progress.get(issueId) ?? null;
  }
  async saveProgress(progress: ReadingProgress): Promise<void> {
    this.progress.set(progress.issueId, progress);
  }
  async getPreferences(issueId: string): Promise<ReaderPreferences | null> {
    return this.preferences.get(issueId) ?? null;
  }
  async savePreferences(preferences: ReaderPreferences): Promise<void> {
    this.preferences.set(preferences.issueId, preferences);
  }
  async listBookmarks(issueId: string): Promise<Bookmark[]> {
    return valuesForIssue(this.bookmarks, issueId);
  }
  async saveBookmark(bookmark: Bookmark): Promise<void> {
    this.bookmarks.set(bookmark.id, bookmark);
  }
  async deleteBookmark(id: string): Promise<void> {
    this.bookmarks.delete(id);
  }
  async listHighlights(issueId: string): Promise<Highlight[]> {
    return valuesForIssue(this.highlights, issueId);
  }
  async saveHighlight(highlight: Highlight): Promise<void> {
    this.highlights.set(highlight.id, highlight);
  }
  async deleteHighlight(id: string): Promise<void> {
    this.highlights.delete(id);
  }
  async listNotes(issueId: string): Promise<ReaderNote[]> {
    return valuesForIssue(this.notes, issueId);
  }
  async saveNote(note: ReaderNote): Promise<void> {
    this.notes.set(note.id, note);
  }
  async deleteNote(id: string): Promise<void> {
    this.notes.delete(id);
  }
}

function valuesForIssue<T extends { issueId: string }>(
  values: Map<string, T>,
  issueId: string,
): T[] {
  return [...values.values()].filter((value) => value.issueId === issueId);
}
