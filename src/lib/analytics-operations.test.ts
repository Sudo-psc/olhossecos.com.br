import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { getAnalyticsSummary } from "./analytics-operations.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-report-"));

after(() => {
  rmSync(testDirectory, { recursive: true, force: true });
});

test("resume apenas o período solicitado por evento e página", () => {
  const databasePath = join(testDirectory, "analytics.sqlite");
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE analytics_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      page_path TEXT NOT NULL,
      properties_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO analytics_events VALUES
      ('1', 'page_view', '/', '{}', '2026-08-08T09:00:00.000Z'),
      ('2', 'page_view', '/', '{}', '2026-08-08T10:00:00.000Z'),
      ('3', 'newsletter_signup', '/newsletter', '{}', '2026-08-08T11:00:00.000Z'),
      ('4', 'page_view', '/antiga', '{}', '2026-06-01T10:00:00.000Z');
  `);
  database.close();

  const summary = getAnalyticsSummary({
    databasePath,
    days: 30,
    now: new Date("2026-08-08T12:00:00.000Z"),
  });

  assert.equal(summary.total, 3);
  assert.deepEqual(summary.events, [
    { event: "page_view", total: 2 },
    { event: "newsletter_signup", total: 1 },
  ]);
  assert.deepEqual(summary.pages, [
    { path: "/", total: 2 },
    { path: "/newsletter", total: 1 },
  ]);
});
