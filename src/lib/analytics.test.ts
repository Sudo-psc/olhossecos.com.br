import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  closeAnalyticsDatabases,
  handleAnalyticsRequest,
} from "./analytics.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-analytics-"));
const databasePath = join(testDirectory, "analytics.sqlite");
const allowedOrigin = "https://olhossecos.com.br";

const request = (body: Record<string, unknown>, origin = allowedOrigin) =>
  new Request(`${allowedOrigin}/api/analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  closeAnalyticsDatabases();
  rmSync(databasePath, { force: true });
  rmSync(`${databasePath}-shm`, { force: true });
  rmSync(`${databasePath}-wal`, { force: true });
});

after(() => {
  closeAnalyticsDatabases();
  rmSync(testDirectory, { recursive: true, force: true });
});

test("persiste somente evento e propriedades editoriais permitidas", async () => {
  const response = await handleAnalyticsRequest(
    request({
      event: "newsletter_signup",
      page_path: "/newsletter?utm_source=teste",
      source: "newsletter",
      utm_source: "campanha-editorial",
      email: "nao-deve-ser-armazenado@example.com",
      arbitrary_secret: "nao-deve-ser-armazenado",
    }),
    {
      allowedOrigin,
      databasePath,
      rateLimit: false,
      now: () => new Date("2026-08-08T17:00:00.000Z"),
    },
  );

  assert.equal(response.status, 202);

  closeAnalyticsDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT event_name, page_path, properties_json, created_at
       FROM analytics_events`,
    )
    .get() as Record<string, string>;
  database.close();

  assert.equal(row.event_name, "newsletter_signup");
  assert.equal(row.page_path, "/newsletter");
  assert.equal(row.created_at, "2026-08-08T17:00:00.000Z");
  assert.deepEqual(JSON.parse(row.properties_json), {
    source: "newsletter",
    utm_source: "campanha-editorial",
  });
  assert.doesNotMatch(row.properties_json, /example\.com|arbitrary_secret/u);
});

test("redige PII semântica mesmo quando a chave da propriedade é permitida", async () => {
  const response = await handleAnalyticsRequest(
    request({
      event: "newsletter_signup",
      page_path: "/newsletter",
      source: "newsletter",
      utm_source: "ana.silva@example.com",
      utm_campaign: "+55 (31) 99999-1234",
    }),
    {
      allowedOrigin,
      databasePath,
      rateLimit: false,
    },
  );

  assert.equal(response.status, 202);

  closeAnalyticsDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare("SELECT properties_json FROM analytics_events")
    .get() as { properties_json: string };
  database.close();

  assert.deepEqual(JSON.parse(row.properties_json), {
    source: "newsletter",
  });
});

test("normaliza eventos legados para a taxonomia canônica", async () => {
  const response = await handleAnalyticsRequest(
    request({
      event: "click_purchase",
      page_path: "/livros/o-custo-invisivel-do-olho-seco",
      book: "o-custo-invisivel-do-olho-seco",
      store: "apple-books",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  closeAnalyticsDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare("SELECT event_name FROM analytics_events")
    .get() as { event_name: string };
  database.close();

  assert.equal(row.event_name, "purchase_click");
});

test("persiste eventos seguros do reader sem texto selecionado ou notas", async () => {
  const response = await handleAnalyticsRequest(
    request({
      event: "highlight_create",
      page_path: "/superficie/edicao-00",
      issue_id: "superficie-poc",
      page_number: 4,
      progress_percent: 50,
      color: "yellow",
      selected_text: "conteúdo privado",
      note_text: "nota privada",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  closeAnalyticsDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare("SELECT event_name, properties_json FROM analytics_events")
    .get() as { event_name: string; properties_json: string };
  database.close();
  assert.equal(row.event_name, "highlight_create");
  assert.deepEqual(JSON.parse(row.properties_json), {
    color: "yellow",
    issue_id: "superficie-poc",
    page_number: 4,
    progress_percent: 50,
  });
  assert.doesNotMatch(row.properties_json, /conteúdo privado|nota privada/u);
});

test("eventos do laboratório do Reader não entram no banco de produção", async () => {
  const response = await handleAnalyticsRequest(
    request({
      event: "page_view",
      page_path: "/superficie/lab/edicao-00",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  closeAnalyticsDatabases();
  assert.equal(
    existsSync(databasePath),
    false,
    "o laboratório não deveria criar analytics.sqlite de produção",
  );
});

test("recusa eventos desconhecidos e origem cruzada", async () => {
  const unknownEvent = await handleAnalyticsRequest(
    request({ event: "email_capture", page_path: "/" }),
    { allowedOrigin, databasePath, rateLimit: false },
  );
  const crossOrigin = await handleAnalyticsRequest(
    request({ event: "page_view", page_path: "/" }, "https://example.org"),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(unknownEvent.status, 422);
  assert.equal(crossOrigin.status, 403);
});

test("descarta honeypot sem criar banco", async () => {
  const response = await handleAnalyticsRequest(
    request({ event: "page_view", page_path: "/", company: "Bot" }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  assert.equal(
    await import("node:fs").then(({ existsSync }) => existsSync(databasePath)),
    false,
  );
});
