import { randomUUID } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { sanitizeAnalyticsProperty } from "./analytics-safety.ts";

const MAX_BODY_BYTES = 4_096;
const RATE_LIMIT_MAX_REQUESTS = 120;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const DEFAULT_DATABASE_PATH = "/var/lib/olhossecos/analytics.sqlite";
const DEFAULT_PRODUCTION_ORIGIN = "https://olhossecos.com.br";
const RETENTION_DAYS = 180;

type AnalyticsPayload = Record<string, unknown> & {
  event?: unknown;
  page_path?: unknown;
  company?: unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type AnalyticsHandlerOptions = {
  allowedOrigin?: string;
  clientKey?: string;
  databasePath?: string;
  now?: () => Date;
  rateLimit?: boolean;
};

const canonicalEvents = new Set([
  "app_click",
  "article_click",
  "article_read_depth",
  "article_view",
  "author_click",
  "book_click",
  "book_view",
  "magazine_download",
  "magazine_entry",
  "magazine_home_view",
  "magazine_issue_click",
  "magazine_issue_view",
  "newsletter_profile_complete",
  "newsletter_signup",
  "outbound_click",
  "page_view",
  "partner_click",
  "partner_lead_submit",
  "partner_media_kit_click",
  "partner_page_view",
  "patient_path_click",
  "professional_area_entry",
  "sponsored_content_view",
]);

const eventAliases = new Map([
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

canonicalEvents.add("purchase_click");

const allowedProperties = new Set([
  "article_path",
  "article_slug",
  "audience_role",
  "book",
  "content_title",
  "depth",
  "destination_host",
  "label",
  "link_text",
  "link_url",
  "placement",
  "source",
  "store",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
]);

const databases = new Map<string, DatabaseSync>();
const rateLimits = new Map<string, RateLimitEntry>();

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

const normalizeText = (value: unknown, maxLength = 200) =>
  typeof value === "string"
    ? value.normalize("NFKC").replace(/\s+/gu, " ").trim().slice(0, maxLength)
    : "";

const normalizePagePath = (value: unknown) => {
  const path = normalizeText(value, 500);
  if (!path.startsWith("/") || path.startsWith("//")) return "";
  try {
    return new URL(path, DEFAULT_PRODUCTION_ORIGIN).pathname;
  } catch {
    return "";
  }
};

const getDatabase = (databasePath: string) => {
  const cached = databases.get(databasePath);
  if (cached) return cached;

  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(databasePath);
  chmodSync(databasePath, 0o600);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      page_path TEXT NOT NULL,
      properties_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS analytics_events_name_date_idx
      ON analytics_events (event_name, created_at);
  `);
  databases.set(databasePath, database);
  return database;
};

const consumeRateLimit = (key: string, now: number) => {
  for (const [entryKey, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(entryKey);
  }

  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  current.count += 1;
  return current.count <= RATE_LIMIT_MAX_REQUESTS;
};

const readJsonBody = async (request: Request) => {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RangeError("payload_too_large");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    throw new RangeError("payload_too_large");
  }
  return JSON.parse(body) as AnalyticsPayload;
};

const normalizeProperties = (payload: AnalyticsPayload) => {
  const properties: Record<string, string | number> = {};
  for (const key of allowedProperties) {
    const value = payload[key];
    const sanitized = sanitizeAnalyticsProperty(key, value);
    if (sanitized === null) continue;
    if (key === "depth" && typeof sanitized === "number") {
      properties[key] = Math.max(0, Math.min(100, Math.round(sanitized)));
      continue;
    }
    if (typeof sanitized === "string") properties[key] = sanitized;
  }
  return properties;
};

export const handleAnalyticsRequest = async (
  request: Request,
  options: AnalyticsHandlerOptions = {},
) => {
  if (request.method !== "POST") {
    return jsonResponse({ message: "Método não permitido." }, 405);
  }

  if (
    !(request.headers.get("content-type") ?? "")
      .toLowerCase()
      .startsWith("application/json")
  ) {
    return jsonResponse({ message: "Formato de envio inválido." }, 415);
  }

  const allowedOrigin =
    options.allowedOrigin ??
    process.env.ANALYTICS_ALLOWED_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? DEFAULT_PRODUCTION_ORIGIN
      : new URL(request.url).origin);
  const requestOrigin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    (requestOrigin && requestOrigin !== allowedOrigin) ||
    (fetchSite && !["same-origin", "none"].includes(fetchSite))
  ) {
    return jsonResponse({ message: "Origem não permitida." }, 403);
  }

  const now = options.now?.() ?? new Date();
  if (
    options.rateLimit !== false &&
    options.clientKey &&
    !consumeRateLimit(options.clientKey, now.getTime())
  ) {
    return jsonResponse({ message: "Limite temporário atingido." }, 429);
  }

  let payload: AnalyticsPayload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return jsonResponse(
      {
        message:
          error instanceof RangeError
            ? "Envio muito grande."
            : "Dados inválidos.",
      },
      error instanceof RangeError ? 413 : 400,
    );
  }

  if (normalizeText(payload.company)) {
    return jsonResponse({ message: "Evento recebido." }, 202);
  }

  const requestedEvent = normalizeText(payload.event, 80);
  const eventName = eventAliases.get(requestedEvent) ?? requestedEvent;
  const pagePath = normalizePagePath(payload.page_path);
  if (!canonicalEvents.has(eventName) || !pagePath) {
    return jsonResponse({ message: "Evento inválido." }, 422);
  }

  const databasePath =
    options.databasePath ??
    process.env.ANALYTICS_DATABASE_PATH ??
    DEFAULT_DATABASE_PATH;
  try {
    const database = getDatabase(databasePath);
    const timestamp = now.toISOString();
    const retentionBoundary = new Date(
      now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1_000,
    ).toISOString();
    database.exec("BEGIN IMMEDIATE");
    try {
      database
        .prepare(
          `INSERT INTO analytics_events (
            id, event_name, page_path, properties_json, created_at
          ) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(
          randomUUID(),
          eventName,
          pagePath,
          JSON.stringify(normalizeProperties(payload)),
          timestamp,
        );
      database
        .prepare("DELETE FROM analytics_events WHERE created_at < ?")
        .run(retentionBoundary);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  } catch {
    return jsonResponse({ message: "Evento indisponível." }, 503);
  }

  return jsonResponse({ message: "Evento recebido." }, 202);
};

export const closeAnalyticsDatabases = () => {
  for (const database of databases.values()) database.close();
  databases.clear();
};
