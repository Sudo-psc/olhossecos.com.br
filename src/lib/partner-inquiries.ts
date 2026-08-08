import { randomUUID } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1_000;
const CONSENT_VERSION = "privacy-2026-08-08";
const DEFAULT_DATABASE_PATH =
  "/var/lib/olhossecos/superficie-partner-inquiries.sqlite";
const DEFAULT_PRODUCTION_ORIGIN = "https://olhossecos.com.br";

type PartnerInquiryPayload = {
  organization?: unknown;
  name?: unknown;
  email?: unknown;
  interest?: unknown;
  message?: unknown;
  website?: unknown;
  consent?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type PartnerInquiryHandlerOptions = {
  allowedOrigin?: string;
  clientKey?: string;
  databasePath?: string;
  now?: () => Date;
  rateLimit?: boolean;
};

const rateLimits = new Map<string, RateLimitEntry>();
const databases = new Map<string, DatabaseSync>();
const interests = new Set([
  "media-kit",
  "publicidade",
  "parceria-educacional",
  "projeto-especial",
  "outro",
]);

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

    CREATE TABLE IF NOT EXISTS partner_inquiries (
      id TEXT PRIMARY KEY,
      organization TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE,
      interest TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
      source TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS partner_inquiries_status_idx
      ON partner_inquiries (status, created_at);
    CREATE INDEX IF NOT EXISTS partner_inquiries_email_idx
      ON partner_inquiries (email, created_at);
  `);

  databases.set(databasePath, database);
  return database;
};

const saveInquiry = (
  payload: {
    organization: string;
    name: string;
    email: string;
    interest: string;
    message: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    utmTerm: string;
  },
  databasePath: string,
  now: Date,
) => {
  const database = getDatabase(databasePath);
  const timestamp = now.toISOString();
  database
    .prepare(
      `INSERT INTO partner_inquiries (
        id,
        organization,
        contact_name,
        email,
        interest,
        message,
        status,
        source,
        consent_version,
        consented_at,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', 'superficie-parceiros', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      randomUUID(),
      payload.organization,
      payload.name,
      payload.email,
      payload.interest,
      payload.message || null,
      CONSENT_VERSION,
      timestamp,
      payload.utmSource || null,
      payload.utmMedium || null,
      payload.utmCampaign || null,
      payload.utmContent || null,
      payload.utmTerm || null,
      timestamp,
      timestamp,
    );
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

  return JSON.parse(body) as PartnerInquiryPayload;
};

export const handlePartnerInquiryRequest = async (
  request: Request,
  options: PartnerInquiryHandlerOptions = {},
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
    process.env.PARTNER_INQUIRY_ALLOWED_ORIGIN ??
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

  let payload: PartnerInquiryPayload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return jsonResponse({ message: "Envio muito grande." }, 413);
    }
    return jsonResponse({ message: "Dados inválidos." }, 400);
  }

  if (normalizeText(payload.website)) {
    return jsonResponse({ message: "Solicitação recebida." }, 202);
  }

  const organization = normalizeText(payload.organization);
  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const interest = normalizeText(payload.interest);
  const message = normalizeText(payload.message);
  const utmSource = normalizeText(payload.utmSource);
  const utmMedium = normalizeText(payload.utmMedium);
  const utmCampaign = normalizeText(payload.utmCampaign);
  const utmContent = normalizeText(payload.utmContent);
  const utmTerm = normalizeText(payload.utmTerm);
  const consent = payload.consent === "accepted" || payload.consent === true;

  if (
    organization.length < 2 ||
    organization.length > 160 ||
    name.length < 2 ||
    name.length > 120 ||
    !isValidEmail(email) ||
    !interests.has(interest) ||
    message.length > 1_200 ||
    [utmSource, utmMedium, utmCampaign, utmContent, utmTerm].some(
      (value) => value.length > 200,
    ) ||
    !consent
  ) {
    return jsonResponse(
      { message: "Revise os campos e confirme o consentimento." },
      422,
    );
  }

  try {
    saveInquiry(
      {
        organization,
        name,
        email,
        interest,
        message,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      },
      options.databasePath ??
        process.env.PARTNER_INQUIRY_DATABASE_PATH ??
        DEFAULT_DATABASE_PATH,
      now,
    );
  } catch {
    return jsonResponse(
      { message: "Não foi possível concluir agora. Tente novamente." },
      503,
    );
  }

  return jsonResponse(
    {
      message:
        "Solicitação recebida. Entraremos em contato para entender o projeto.",
    },
    201,
  );
};

export const closePartnerInquiryDatabases = () => {
  for (const database of databases.values()) database.close();
  databases.clear();
};
