import { createHash, randomBytes, randomUUID } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MAX_BODY_BYTES = 8_192;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const CONSENT_VERSION = "privacy-2026-08-08";
const DEFAULT_DATABASE_PATH = "/var/lib/olhossecos/newsletter.sqlite";
const DEFAULT_PRODUCTION_ORIGIN = "https://olhossecos.com.br";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type NewsletterPayload = {
  stage?: unknown;
  name?: unknown;
  email?: unknown;
  profession?: unknown;
  audienceRole?: unknown;
  profileToken?: unknown;
  company?: unknown;
  consent?: unknown;
  source?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
};

type NewsletterSource = "livros" | "superficie" | "newsletter";

export type NewsletterHandlerOptions = {
  allowedOrigin?: string;
  clientKey?: string;
  databasePath?: string;
  now?: () => Date;
  rateLimit?: boolean;
};

const rateLimits = new Map<string, RateLimitEntry>();
const databases = new Map<string, DatabaseSync>();
const audienceRoles = new Set([
  "medico",
  "residente-fellow",
  "pesquisador",
  "outro-profissional",
  "industria-parceiro",
  "paciente",
  "outro",
]);
const newsletterSources = new Set<NewsletterSource>([
  "livros",
  "superficie",
  "newsletter",
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

const createProfileToken = () => {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
  };
};

const ensureNewsletterColumns = (database: DatabaseSync) => {
  const existing = new Set(
    (
      database
        .prepare("PRAGMA table_info(newsletter_subscribers)")
        .all() as Array<{
        name: string;
      }>
    ).map(({ name }) => name),
  );
  const additions = [
    ["audience_role", "TEXT"],
    ["profile_token_hash", "TEXT"],
    ["profile_token_expires_at", "TEXT"],
    ["utm_source", "TEXT"],
    ["utm_medium", "TEXT"],
    ["utm_campaign", "TEXT"],
    ["utm_content", "TEXT"],
    ["utm_term", "TEXT"],
  ] as const;

  for (const [name, definition] of additions) {
    if (!existing.has(name)) {
      database.exec(
        `ALTER TABLE newsletter_subscribers ADD COLUMN ${name} ${definition}`,
      );
    }
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
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      profession TEXT,
      audience_role TEXT,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'unsubscribed')),
      source TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      profile_token_hash TEXT,
      profile_token_expires_at TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
      ON newsletter_subscribers (status, created_at);
  `);
  ensureNewsletterColumns(database);

  databases.set(databasePath, database);
  return database;
};

const saveSubscriber = (
  payload: {
    name: string;
    email: string;
    profession: string;
    source: NewsletterSource;
    profileTokenHash: string | null;
    profileTokenExpiresAt: string | null;
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

  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(
        `INSERT INTO newsletter_subscribers (
          id,
          email,
          name,
          profession,
          audience_role,
          status,
          source,
          consent_version,
          consented_at,
          profile_token_hash,
          profile_token_expires_at,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          utm_term,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, NULL, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = CASE
            WHEN excluded.name <> '' THEN excluded.name
            ELSE newsletter_subscribers.name
          END,
          profession = excluded.profession,
          status = 'active',
          source = excluded.source,
          consent_version = excluded.consent_version,
          consented_at = excluded.consented_at,
          profile_token_hash = excluded.profile_token_hash,
          profile_token_expires_at = excluded.profile_token_expires_at,
          utm_source = COALESCE(excluded.utm_source, newsletter_subscribers.utm_source),
          utm_medium = COALESCE(excluded.utm_medium, newsletter_subscribers.utm_medium),
          utm_campaign = COALESCE(excluded.utm_campaign, newsletter_subscribers.utm_campaign),
          utm_content = COALESCE(excluded.utm_content, newsletter_subscribers.utm_content),
          utm_term = COALESCE(excluded.utm_term, newsletter_subscribers.utm_term),
          updated_at = excluded.updated_at`,
      )
      .run(
        randomUUID(),
        payload.email,
        payload.name,
        payload.profession || null,
        payload.source,
        CONSENT_VERSION,
        timestamp,
        payload.profileTokenHash,
        payload.profileTokenExpiresAt,
        payload.utmSource || null,
        payload.utmMedium || null,
        payload.utmCampaign || null,
        payload.utmContent || null,
        payload.utmTerm || null,
        timestamp,
        timestamp,
      );
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
};

const saveSubscriberProfile = (
  payload: { email: string; audienceRole: string; profileToken: string },
  databasePath: string,
  now: Date,
) => {
  const database = getDatabase(databasePath);
  const tokenHash = createHash("sha256")
    .update(payload.profileToken)
    .digest("hex");
  const result = database
    .prepare(
      `UPDATE newsletter_subscribers
       SET audience_role = ?,
           profile_token_hash = NULL,
           profile_token_expires_at = NULL,
           updated_at = ?
       WHERE email = ? COLLATE NOCASE
         AND profile_token_hash = ?
         AND profile_token_expires_at > ?`,
    )
    .run(
      payload.audienceRole,
      now.toISOString(),
      payload.email,
      tokenHash,
      now.toISOString(),
    );

  return result.changes === 1;
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

  const databasePath =
    options.databasePath ??
    process.env.NEWSLETTER_DATABASE_PATH ??
    DEFAULT_DATABASE_PATH;
  const stage = normalizeText(payload.stage);

  if (stage === "profile") {
    const email = normalizeText(payload.email).toLowerCase();
    const audienceRole = normalizeText(payload.audienceRole);
    const profileToken = normalizeText(payload.profileToken);

    if (
      !isValidEmail(email) ||
      !audienceRoles.has(audienceRole) ||
      profileToken.length < 32 ||
      profileToken.length > 128
    ) {
      return jsonResponse({ message: "Dados de perfil inválidos." }, 422);
    }

    try {
      const updated = saveSubscriberProfile(
        { email, audienceRole, profileToken },
        databasePath,
        now,
      );
      return updated
        ? jsonResponse({ message: "Preferência registrada." }, 200)
        : jsonResponse(
            { message: "Link de perfil inválido ou expirado." },
            403,
          );
    } catch {
      return jsonResponse(
        { message: "Não foi possível concluir agora. Tente novamente." },
        503,
      );
    }
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const profession = normalizeText(payload.profession);
  const requestedSource = normalizeText(payload.source) as NewsletterSource;
  const source: NewsletterSource = newsletterSources.has(requestedSource)
    ? requestedSource
    : "livros";
  const usesProgressiveProfile = source !== "livros";
  const utmSource = normalizeText(payload.utmSource);
  const utmMedium = normalizeText(payload.utmMedium);
  const utmCampaign = normalizeText(payload.utmCampaign);
  const utmContent = normalizeText(payload.utmContent);
  const utmTerm = normalizeText(payload.utmTerm);
  const consent = payload.consent === "accepted" || payload.consent === true;

  if (
    (!usesProgressiveProfile && name.length < 2) ||
    name.length > 120 ||
    !isValidEmail(email) ||
    profession.length > 120 ||
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

  const profileToken = usesProgressiveProfile ? createProfileToken() : null;
  const profileTokenExpiresAt = profileToken
    ? new Date(now.getTime() + 24 * 60 * 60 * 1_000).toISOString()
    : null;

  try {
    saveSubscriber(
      {
        name,
        email,
        profession,
        source,
        profileTokenHash: profileToken?.hash ?? null,
        profileTokenExpiresAt,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
      },
      databasePath,
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
      message: "Cadastro realizado. Obrigado.",
      ...(profileToken ? { profileToken: profileToken.token } : {}),
    },
    201,
  );
};

export const closeNewsletterDatabases = () => {
  for (const database of databases.values()) database.close();
  databases.clear();
};
