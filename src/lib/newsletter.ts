import { randomUUID } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MAX_BODY_BYTES = 8_192;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const CONSENT_VERSION = "privacy-2026-08-07";
const DEFAULT_DATABASE_PATH = "/var/lib/olhossecos/newsletter.sqlite";
const DEFAULT_PRODUCTION_ORIGIN = "https://olhossecos.com.br";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type NewsletterPayload = {
  name?: unknown;
  email?: unknown;
  profession?: unknown;
  company?: unknown;
  consent?: unknown;
};

export type NewsletterHandlerOptions = {
  allowedOrigin?: string;
  clientKey?: string;
  databasePath?: string;
  now?: () => Date;
  rateLimit?: boolean;
};

const rateLimits = new Map<string, RateLimitEntry>();
const databases = new Map<string, DatabaseSync>();

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  extraHeaders: HeadersInit = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      ...Object.fromEntries(new Headers(extraHeaders)),
    },
  });

const normalizeText = (value: unknown) =>
  typeof value === "string"
    ? value.normalize("NFKC").replace(/\s+/gu, " ").trim()
    : "";

const isValidEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);

const getDatabase = (databasePath: string) => {
  const cached = databases.get(databasePath);
  if (cached) return cached;

  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(databasePath);
  chmodSync(databasePath, 0o600);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      profession TEXT,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'unsubscribed')),
      source TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
      ON newsletter_subscribers (status, created_at);
  `);

  databases.set(databasePath, database);
  return database;
};

const saveSubscriber = (
  payload: { name: string; email: string; profession: string },
  databasePath: string,
  now: Date,
) => {
  const database = getDatabase(databasePath);
  const timestamp = now.toISOString();

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(
        `INSERT INTO newsletter_subscribers (
          id,
          email,
          name,
          profession,
          status,
          source,
          consent_version,
          consented_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, 'active', 'livros', ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          profession = excluded.profession,
          status = 'active',
          source = excluded.source,
          consent_version = excluded.consent_version,
          consented_at = excluded.consented_at,
          updated_at = excluded.updated_at`,
      )
      .run(
        randomUUID(),
        payload.email,
        payload.name,
        payload.profession || null,
        CONSENT_VERSION,
        timestamp,
        timestamp,
        timestamp,
      );
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
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
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  return {
    allowed: current.count <= RATE_LIMIT_MAX_REQUESTS,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
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

  return JSON.parse(body) as NewsletterPayload;
};

export const handleNewsletterRequest = async (
  request: Request,
  options: NewsletterHandlerOptions = {},
) => {
  if (request.method !== "POST") {
    return jsonResponse({ message: "Método não permitido." }, 405, {
      Allow: "POST",
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ message: "Formato de envio inválido." }, 415);
  }

  const requestOrigin = request.headers.get("origin");
  const allowedOrigin =
    options.allowedOrigin ??
    process.env.NEWSLETTER_ALLOWED_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? DEFAULT_PRODUCTION_ORIGIN
      : new URL(request.url).origin);
  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    (requestOrigin && requestOrigin !== allowedOrigin) ||
    (fetchSite && !["same-origin", "none"].includes(fetchSite))
  ) {
    return jsonResponse({ message: "Origem não permitida." }, 403);
  }

  const now = options.now?.() ?? new Date();
  if (options.rateLimit !== false && options.clientKey) {
    const limit = consumeRateLimit(options.clientKey, now.getTime());
    if (!limit.allowed) {
      return jsonResponse(
        { message: "Muitas tentativas. Aguarde alguns minutos." },
        429,
        { "Retry-After": String(limit.retryAfter) },
      );
    }
  }

  let payload: NewsletterPayload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return jsonResponse({ message: "Envio muito grande." }, 413);
    }
    return jsonResponse({ message: "Dados inválidos." }, 400);
  }

  if (normalizeText(payload.company)) {
    return jsonResponse({ message: "Cadastro recebido." }, 202);
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const profession = normalizeText(payload.profession);
  const consent = payload.consent === "accepted" || payload.consent === true;

  if (
    name.length < 2 ||
    name.length > 120 ||
    !isValidEmail(email) ||
    profession.length > 120 ||
    !consent
  ) {
    return jsonResponse(
      { message: "Revise os campos e confirme o consentimento." },
      422,
    );
  }

  try {
    saveSubscriber(
      { name, email, profession },
      options.databasePath ??
        process.env.NEWSLETTER_DATABASE_PATH ??
        DEFAULT_DATABASE_PATH,
      now,
    );
  } catch {
    return jsonResponse(
      { message: "Não foi possível concluir agora. Tente novamente." },
      503,
    );
  }

  return jsonResponse({ message: "Cadastro realizado. Obrigado." }, 201);
};

export const closeNewsletterDatabases = () => {
  for (const database of databases.values()) database.close();
  databases.clear();
};
