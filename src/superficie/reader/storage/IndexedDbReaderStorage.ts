import type {
  Bookmark,
  Highlight,
  ReaderNote,
  ReaderPreferences,
  ReadingProgress,
} from "../types.ts";
import type { ReaderStorage } from "./ReaderStorage.ts";

const DATABASE_VERSION = 1;
const ISSUE_INDEX = "issueId";

const stores = {
  bookmarks: "bookmarks",
  highlights: "highlights",
  notes: "notes",
  preferences: "preferences",
  progress: "progress",
} as const;

interface IndexedDbReaderStorageOptions {
  databaseName?: string;
  indexedDB?: IDBFactory;
}

export class IndexedDbReaderStorage implements ReaderStorage {
  private readonly databaseName: string;
  private readonly indexedDB: IDBFactory;
  private databasePromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbReaderStorageOptions = {}) {
    this.databaseName = options.databaseName ?? "superficie-reader";
    this.indexedDB = options.indexedDB ?? globalThis.indexedDB;

    if (!this.indexedDB) {
      throw new Error("IndexedDB não está disponível neste navegador.");
    }
  }

  getProgress(issueId: string): Promise<ReadingProgress | null> {
    return this.getByKey<ReadingProgress>(stores.progress, issueId);
  }

  saveProgress(progress: ReadingProgress): Promise<void> {
    return this.put(stores.progress, progress);
  }

  getPreferences(issueId: string): Promise<ReaderPreferences | null> {
    return this.getByKey<ReaderPreferences>(stores.preferences, issueId);
  }

  savePreferences(preferences: ReaderPreferences): Promise<void> {
    return this.put(stores.preferences, preferences);
  }

  listBookmarks(issueId: string): Promise<Bookmark[]> {
    return this.listByIssue<Bookmark>(stores.bookmarks, issueId);
  }

  saveBookmark(bookmark: Bookmark): Promise<void> {
    return this.put(stores.bookmarks, bookmark);
  }

  deleteBookmark(id: string): Promise<void> {
    return this.delete(stores.bookmarks, id);
  }

  listHighlights(issueId: string): Promise<Highlight[]> {
    return this.listByIssue<Highlight>(stores.highlights, issueId);
  }

  saveHighlight(highlight: Highlight): Promise<void> {
    return this.put(stores.highlights, highlight);
  }

  deleteHighlight(id: string): Promise<void> {
    return this.delete(stores.highlights, id);
  }

  listNotes(issueId: string): Promise<ReaderNote[]> {
    return this.listByIssue<ReaderNote>(stores.notes, issueId);
  }

  saveNote(note: ReaderNote): Promise<void> {
    return this.put(stores.notes, note);
  }

  deleteNote(id: string): Promise<void> {
    return this.delete(stores.notes, id);
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDB.open(this.databaseName, DATABASE_VERSION);

      request.addEventListener("upgradeneeded", () => {
        const database = request.result;
        this.createIssueStore(database, stores.bookmarks);
        this.createIssueStore(database, stores.highlights);
        this.createIssueStore(database, stores.notes);

        if (!database.objectStoreNames.contains(stores.progress)) {
          database.createObjectStore(stores.progress, { keyPath: "issueId" });
        }
        if (!database.objectStoreNames.contains(stores.preferences)) {
          database.createObjectStore(stores.preferences, {
            keyPath: "issueId",
          });
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => {
        this.databasePromise = null;
        reject(request.error ?? new Error("Falha ao abrir o banco do reader."));
      });
      request.addEventListener("blocked", () => {
        this.databasePromise = null;
        reject(
          new Error("Atualização do banco do reader bloqueada por outra aba."),
        );
      });
    });

    return this.databasePromise;
  }

  private createIssueStore(database: IDBDatabase, storeName: string): void {
    if (database.objectStoreNames.contains(storeName)) return;
    const store = database.createObjectStore(storeName, { keyPath: "id" });
    store.createIndex(ISSUE_INDEX, ISSUE_INDEX, { unique: false });
  }

  private async getByKey<T>(
    storeName: string,
    key: IDBValidKey,
  ): Promise<T | null> {
    const database = await this.openDatabase();
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);
    const result = await requestResult<T | undefined>(request);
    await transactionDone(transaction);
    return result ?? null;
  }

  private async listByIssue<T>(
    storeName: string,
    issueId: string,
  ): Promise<T[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction
      .objectStore(storeName)
      .index(ISSUE_INDEX)
      .getAll(issueId);
    const result = await requestResult<T[]>(request);
    await transactionDone(transaction);
    return result;
  }

  private async put(storeName: string, value: unknown): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(value);
    await transactionDone(transaction);
  }

  private async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(key);
    await transactionDone(transaction);
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Falha em uma operação do reader."));
    });
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new Error("Operação do reader cancelada."));
    });
    transaction.addEventListener("error", () => {
      reject(
        transaction.error ?? new Error("Falha ao salvar dados do reader."),
      );
    });
  });
}
