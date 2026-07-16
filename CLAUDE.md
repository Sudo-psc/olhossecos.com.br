# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Olhos Secos Caratinga** (Dry Eye Clinic) website built with Astro 5 and Sanity CMS. Marketing/lead-generation site for Saraiva Vision clinic in Caratinga, MG, Brazil, specializing in dry eye treatment. Features informational pages, blog content, interactive tools (quiz, symptom test, calculator), video library, and lead-capture API endpoints.

**Business Context:**
- Medical clinic: Saraiva Vision (CNPJ: 53.864.119/0001-79)
- Physician: Dr. Philipe Saraiva Cruz (CRM-MG 69.870)
- Location: Caratinga, Minas Gerais, Brazil
- Specialty: Dry eye treatment and ocular surface disorders

## Technology Stack

- **Framework**: Astro 5 with **hybrid rendering** — static pages + on-demand SSR via `@astrojs/node` (standalone mode)
- **CMS**: Sanity.io (headless CMS for dynamic blog content)
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript
- **Package Manager**: npm (use `npm` commands; ignore the stale `pnpm-lock.yaml`)
- **Deploy**: systemd Node server on this VPS (see Deployment section — the Docker/GitHub Actions docs in the repo are stale)

Note: `package.json` description mentions "WordPress Headless CMS" — this is stale; the actual CMS is Sanity.

## Development Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # astro check (type checking) + production build
npm run preview    # Preview production build locally
npm run format     # Prettier (with prettier-plugin-astro)
npm run lint       # CAVEAT: eslint is NOT in devDependencies and there is no
                   # eslint config in the repo — this script currently fails.
                   # Use `npm run build` (astro check) for validation instead.
```

There are no automated tests configured (`TESTING.md` documents manual/security testing procedures).

## Architecture

### Rendering Model (important)

`astro.config.mjs` sets `output: 'static'` **with the Node adapter** (`@astrojs/node`, standalone). This means:

- Most pages are pre-rendered at build time (static HTML).
- Routes with `export const prerender = false` are server-rendered at request time:
  - `src/pages/api/contact.ts` — contact form endpoint
  - `src/pages/api/test-result.ts` — symptom test lead capture
  - `src/pages/blog/[slug].astro` — dynamic blog posts fetched from Sanity (SSR, not SSG)
- Build output (`dist/`) contains both `client/` (static assets) and `server/` (Node entry). Production runs as a Node server, **not** a purely static host.
- `src/middleware.ts` adds OWASP security headers (X-Frame-Options, CSP-related, Permissions-Policy, etc.) to all responses — runs on the Node server.

### Lead Capture Flow

API endpoints validate input (Brazilian phone format, email) then fan out notifications via services in `src/lib/services/`:

- **`email.ts`** — SendPulse (primary) with automatic fallback to Resend. Generates clinic-notification and patient-confirmation emails.
- **`whatsapp.ts`** — Evolution API for WhatsApp messages (clinic + patient), with optional n8n webhook integration. Clinic phone defaults to `5533998601427`.

### Key Files

**`src/lib/config.ts`** — Central configuration: site metadata, business info (address, phone, hours), doctor credentials, navigation, and Schema.org structured-data helpers (`getClinicStructuredData()`, `getDoctorStructuredData()`, `getBreadcrumbStructuredData()`, `getFAQStructuredData()`, `getArticleStructuredData()`).

**`src/lib/sanity.ts`** — Sanity client (project ID `qum5qhgj`, dataset `production`, CDN enabled, apiVersion `2024-01-01`), `urlFor()` image URL builder, and `SanityPost` types. Fetch content with `client.fetch()` + GROQ queries.

**`src/layouts/Layout.astro`** — Base layout: SEO meta tags (OpenGraph/Twitter), per-page structured data (LocalBusiness, Physician, WebPage, WebSite, BreadcrumbList), font loading, global CSS variables and utility classes, Header/Footer.

### Page Structure

```
src/pages/
├── index.astro                  # Homepage
├── olho-seco.astro              # Dry eye information
├── tratamentos.astro            # Treatments listing
├── tratamentos/                 # Individual treatments (luz-pulsada-irpl,
│                                #   higiene-palpebral, medicamentos, lentes-esclerais)
├── blog/
│   ├── index.astro              # Blog listing
│   ├── [slug].astro             # Sanity-backed posts (SSR, prerender=false)
│   └── *.astro                  # ~12 static blog posts (SEO content)
├── videos/                      # Video library
├── exames.astro                 # Diagnostic exams
├── contato.astro                # Contact page
├── testerapido.astro            # Quick symptom test (posts to /api/test-result)
├── quiz.astro                   # Interactive quiz
├── calculadora-olho-seco.astro  # Dry eye calculator
├── irpl-olho-seco-caratinga.astro  # IRPL landing page (ads)
├── widget.astro                 # Featured page for the Dry Eye Widget (see below)
└── api/                         # SSR endpoints (contact, test-result)
```

**Dry Eye Widget**: open-source desktop app (20-20-20 rule, Flutter, MIT, macOS/Windows) by Dr. Philipe Saraiva Cruz. Featured at `/widget`; the app's own landing lives at `olhossecos.com.br/app/` (separate codebase, served by nginx on the VPS) and source at `github.com/Sudo-psc/dry-eye-widget`. URLs centralized in `SITE_CONFIG.widget` (src/lib/config.ts).

Conversion-focused components: `WhatsAppFloat.astro` (floating WhatsApp button), `ExitIntentPopup.astro`.

### Styling System ("Premium Editorial Clínico")

Design tokens live in `:root` in Layout.astro (colors, radii, shadows, gradients). Core palette:

```css
--primary: #10314F        /* Deep navy ink — headings and buttons */
--primary-dark: #0B2239   /* Near-ink navy for hover/dark backgrounds */
--primary-light: #0F766E  /* The single accent: deep teal (links, details) */
--accent-ink: #0F766E     /* Semantic alias for the teal accent */
--secondary: #57616C      /* Slate gray for secondary text */
--accent: #EEF2F1         /* Soft neutral background with a teal hint */
--text-main: #2B3440      /* Dark slate for body text */
--bg-body: #F7F6F3        /* Warm paper-like off-white */
--bg-alt: #ffffff         /* White for cards */
--border: #E7E5E0         /* Stone hairline */
```

No neon/cyan colors — the palette is deliberately sober (navy + one teal accent on warm paper). Prefer the CSS variables over hardcoded hex; `tailwind.config.mjs` also exposes `brand` colors matching the navy.

**Typography**: self-hosted fonts in `public/fonts/fonts.css` — **Fraunces** (serif) for headings, **Inter** for body, Outfit available only for UI labels via `.font-ui`.

**`src/styles/article.css`** — editorial typography for blog article bodies (`.article-body`), imported by `blog/[slug].astro` and the static blog posts. Its selectors use `:not([class])` so Tailwind utilities applied inside articles are not overridden — keep that convention when extending it.

Utility patterns from Layout.astro: `.container`, `.section-padding`, `.btn-premium` (+ `-primary`/`-secondary`/`-dark` variants). Components use PascalCase filenames; pages use lowercase/kebab-case. Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`) are used in history.

### Image Handling

Remote images restricted to `cdn.sanity.io`, `olhossecos.com.br`, `olhossecos.com` (astro.config.mjs). Sanity images via `urlFor(image).width(800).url()`. Local images in `/public/`.

## Environment Variables

See `.env.example` for the base set. Full list used by the codebase:

```bash
# Sanity (build-time, public)
PUBLIC_SANITY_PROJECT_ID=qum5qhgj
PUBLIC_SANITY_DATASET=production

# Email service (runtime, server-only)
SENDPULSE_CLIENT_ID=          # Primary provider
SENDPULSE_CLIENT_SECRET=
SENDPULSE_FROM_EMAIL=         # default: noreply@olhossecos.com.br
SENDPULSE_FROM_NAME=
RESEND_API_KEY=               # Fallback provider
RESEND_FROM_EMAIL=

# WhatsApp (runtime, server-only)
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE_NAME=      # default: saraivavision
N8N_WHATSAPP_WEBHOOK_URL=     # optional
CLINIC_WHATSAPP=              # default: 5533998601427
```

## Deployment (actual production setup — June 2026)

This repo lives ON the production VPS at `/root/olhossecos.com.br-site` (the VPS IP is the DNS target of olhossecos.com.br). Production topology:

- **Node server**: systemd unit `olhossecos-astro.service` runs `node dist/server/entry.mjs` on `127.0.0.1:4321` (enabled at boot). Deploy = `npm run build && systemctl restart olhossecos-astro`.
- **Nginx** (`/etc/nginx/sites-available/olhossecos.com.br`): proxies `/` to the Node server; serves the Dry Eye Widget landing statically from `/var/www/olhossecos/app/` at `/app/` (separate codebase). `/sitemap.xml` is aliased to the app's legacy sitemap; the clinic site's sitemap is `/sitemap-index.xml`.
- **Security headers**: prerendered pages do NOT go through `src/middleware.ts` (it only runs on SSR routes), so nginx adds the basic headers on the proxied location; the middleware's CSP applies only to SSR routes.
- **Stale docs**: `.github/workflows/deploy.yml` and `docs/VPS-DEPLOY.md` describe a Docker deploy to `/opt/olhossecos` that is NOT in use — do not follow them; `crontab.txt` references an `/api/health` endpoint that does not exist.
- Other docs: `docs/SANITY_INTEGRATION.md`, `docs/SEO-STRATEGY.md`, `SECURITY.md`, `TESTING.md`.

## Medical and Legal Compliance

**CFM Compliance** (Brazilian medical advertising regulations):
- Use `titleFormal` from config for structured data/legal contexts: "Médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco"
- Use `title` for user-facing UI; always display CRM-MG 69.870
- No promises of guaranteed results in copy

**LGPD** (Brazilian data protection):
- Contact/lead forms collect `consentimento` and must link to the privacy policy (`/privacidade`)
- API endpoints handle personal data (name, phone, email) — never log or expose it

The repo ships a project skill, `skills/saraiva-vision-compliance-review`, for reviewing diffs/pages/copy against CFM compliance and Saraiva Vision visual identity — use it when asked to review changes to this site.

## Key Business Information

- **Name**: Saraiva Vision Clínica Especializada em Olho Seco
- **Address**: Rua Catarina Maria Passos, 97, Bairro Santa Zita (Amor e Saúde), Caratinga/MG, CEP 35300-299
- **Phone/WhatsApp**: (33) 99860-1427 | **Email**: contato@saraivavision.com.br
- **Hours**: Mon–Fri 08:00–18:00, Sat 08:00–12:00
- **Featured treatments**: E-Eye IRPL (flagship), higiene palpebral, medicamentos, lentes esclerais
- **Target conditions**: Síndrome do Olho Seco, Disfunção das Glândulas de Meibomius, Blefarites, Superfície Ocular

All site-wide business constants live in `src/lib/config.ts` — update there, not in individual pages.
