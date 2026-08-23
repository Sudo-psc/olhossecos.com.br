import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbReaderStorage } from "./IndexedDbReaderStorage.ts";

const databases: string[] = [];

function createStorage() {
  const databaseName = `superficie-test-${crypto.randomUUID()}`;
  databases.push(databaseName);
  const indexedDB = new IDBFactory();
  return {
    indexedDB,
    storage: new IndexedDbReaderStorage({ databaseName, indexedDB }),
  };
}

afterEach(async () => {
  databases.length = 0;
});

test("persists progress and preferences for the issue", async () => {
  const { storage } = createStorage();
  const progress = {
    issueId: "superficie-poc",
    page: 7,
    percent: 87.5,
    updatedAt: "2026-08-08T12:00:00.000Z",
  };
  const preferences = {
    issueId: "superficie-poc",
    soundEnabled: true,
    reducedMotion: false,
    toolbarMinimized: true,
    zoomMode: "custom" as const,
    zoomPercent: 150 as const,
  };

  await storage.saveProgress(progress);
  await storage.savePreferences(preferences);

  assert.deepEqual(await storage.getProgress(progress.issueId), progress);
  assert.deepEqual(await storage.getPreferences(progress.issueId), preferences);
});

test("persists, lists and removes bookmarks without duplicating records", async () => {
  const { storage } = createStorage();
  const bookmark = {
    id: "superficie-poc:4",
    issueId: "superficie-poc",
    page: 4,
    createdAt: "2026-08-08T12:00:00.000Z",
  };

  await storage.saveBookmark(bookmark);
  await storage.saveBookmark(bookmark);
  assert.deepEqual(await storage.listBookmarks(bookmark.issueId), [bookmark]);

  await storage.deleteBookmark(bookmark.id);
  assert.deepEqual(await storage.listBookmarks(bookmark.issueId), []);
});

test("persists highlights and notes without exposing them outside the issue", async () => {
  const { storage } = createStorage();
  const highlight = {
    id: "highlight-1",
    issueId: "superficie-poc",
    page: 4,
    blockId: "page-4-paragraph-1",
    anchor: {
      exact: "camada de texto",
      prefix: "imagem e uma ",
      suffix: " selecionável",
      start: 38,
      end: 53,
    },
    color: "yellow" as const,
    createdAt: "2026-08-08T12:00:00.000Z",
  };
  const note = {
    id: "note-1",
    issueId: "superficie-poc",
    page: 4,
    highlightId: highlight.id,
    text: "Revisar esta passagem.",
    createdAt: "2026-08-08T12:01:00.000Z",
    updatedAt: "2026-08-08T12:01:00.000Z",
  };

  await storage.saveHighlight(highlight);
  await storage.saveNote(note);

  assert.deepEqual(await storage.listHighlights(highlight.issueId), [
    highlight,
  ]);
  assert.deepEqual(await storage.listNotes(note.issueId), [note]);
  assert.deepEqual(await storage.listHighlights("outra-edicao"), []);

  await storage.deleteHighlight(highlight.id);
  await storage.deleteNote(note.id);
  assert.deepEqual(await storage.listHighlights(highlight.issueId), []);
  assert.deepEqual(await storage.listNotes(note.issueId), []);
});
