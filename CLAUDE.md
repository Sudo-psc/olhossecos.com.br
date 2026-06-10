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
- **Deploy**: Docker on VPS via GitHub Actions (push to `master`)

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

**`src/layouts/Layout.astro`** — Base layout: SEO meta tags (OpenGraph/Twitter), per-page structured data (LocalBusiness, Physician, WebPage, WebSite, BreadcrumbList), font loading (Outfit headings / Inter body), global CSS variables, Header/Footer.

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

### Styling System

Custom design tokens defined in Layout.astro:

```css
--primary: #003D7A       /* Deep blue for headings */
--primary-light: #22d3ee /* Cyan-400 for accents */
--secondary: #64748b     /* Slate-500 for secondary text */
--accent: #ecfeff        /* Cyan-50 for backgrounds */
--text-main: #1e293b     /* Slate-800 for main text */
--bg-body: #f8fafc       /* Slate-50 global background */
--bg-alt: #ffffff        /* White for cards */
```

Patterns: `.container`, `.section-padding`, `.btn-premium`, `.glass`. Components use PascalCase filenames; pages use lowercase/kebab-case. Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`) are used in history.

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

## Deployment

- **CI/CD**: `.github/workflows/deploy.yml` — on push to `master`: type check, lint, build, then Docker deploy to VPS.
- **VPS layout**: app lives at `/opt/olhossecos` on the server with `docker-compose.prod.yml`, nginx, and certbot (those files live on the VPS, not in this repo). Full guide: `docs/VPS-DEPLOY.md`.
- **Scheduled jobs**: `crontab.txt` (SSL renewal, backups, Docker prune, health check at `/api/health`).
- Other docs: `docs/SANITY_INTEGRATION.md`, `docs/SEO-STRATEGY.md`, `SECURITY.md`, `TESTING.md`.

## Medical and Legal Compliance

**CFM Compliance** (Brazilian medical advertising regulations):
- Use `titleFormal` from config for structured data/legal contexts: "Médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco"
- Use `title` for user-facing UI; always display CRM-MG 69.870
- No promises of guaranteed results in copy

**LGPD** (Brazilian data protection):
- Contact/lead forms collect `consentimento` and must link to the privacy policy (`/privacidade`)
- API endpoints handle personal data (name, phone, email) — never log or expose it

## Key Business Information

- **Name**: Saraiva Vision Clínica Especializada em Olho Seco
- **Address**: Rua Catarina Maria Passos, 97, Bairro Santa Zita (Amor e Saúde), Caratinga/MG, CEP 35300-299
- **Phone/WhatsApp**: (33) 99860-1427 | **Email**: contato@saraivavision.com.br
- **Hours**: Mon–Fri 08:00–18:00, Sat 08:00–12:00
- **Featured treatments**: E-Eye IRPL (flagship), higiene palpebral, medicamentos, lentes esclerais
- **Target conditions**: Síndrome do Olho Seco, Disfunção das Glândulas de Meibomius, Blefarites, Superfície Ocular

All site-wide business constants live in `src/lib/config.ts` — update there, not in individual pages.
