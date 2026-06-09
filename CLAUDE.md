# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Olhos Secos Caratinga** (Dry Eye Clinic) website built with Astro and Sanity CMS. This is a static-first marketing site for Saraiva Vision clinic in Caratinga, MG, Brazil, specializing in dry eye treatment. The site features informational pages, blog content, and video library.

**Business Context:**
- Medical clinic: Saraiva Vision (CNPJ: 53.864.119/0001-79)
- Physician: Dr. Philipe Saraiva Cruz (CRM-MG 69.870)
- Location: Caratinga, Minas Gerais, Brazil
- Specialty: Dry eye treatment and ocular surface disorders

## Technology Stack

- **Framework**: Astro 5.16.6 (static site generation)
- **CMS**: Sanity.io (headless CMS for blog/video content)
- **Styling**: Tailwind CSS 3.4.10
- **Language**: TypeScript 5.5.2
- **Package Manager**: npm (use `npm` commands, not pnpm/yarn)
- **Output**: Static site (configured in astro.config.mjs)

## Development Commands

```bash
# Development server (http://localhost:4321)
npm run dev

# Type checking + production build
npm run build

# Preview production build locally
npm run preview

# Linting
npm run lint

# Code formatting
npm run format        # Format all files with Prettier
```

## Architecture

### Directory Structure

```
src/
├── components/           # Astro components
│   ├── Header.astro     # Site header with navigation
│   ├── Footer.astro     # Site footer
│   ├── VideoCard.astro  # Video display component
│   └── OfficialBlogCTA.astro
├── layouts/
│   └── Layout.astro     # Base layout with SEO, fonts, structured data
├── lib/
│   ├── sanity.ts        # Sanity client and types
│   └── config.ts        # Site configuration and structured data helpers
├── pages/               # File-based routing
│   ├── index.astro      # Homepage (dry eye info, symptoms, treatments)
│   ├── blog/            # Blog section
│   │   ├── index.astro  # Blog listing (static posts)
│   │   ├── [slug].astro # Dynamic blog posts (Sanity CMS)
│   │   └── *.astro      # Static blog posts
│   ├── videos/          # Video section
│   │   └── index.astro  # Video listing
│   ├── tratamentos/     # Treatment pages
│   │   ├── luz-pulsada-irpl.astro
│   │   ├── higiene-palpebral.astro
│   │   ├── medicamentos.astro
│   │   └── lentes-esclerais.astro
│   ├── olho-seco.astro  # Dry eye information page
│   ├── exames.astro     # Diagnostic exams page
│   ├── contato.astro    # Contact page
│   ├── testerapido.astro # Quick symptom test
│   └── 404.astro        # Error page
└── middleware.ts        # Astro middleware (if any)
```

### Key Files

**src/lib/config.ts** - Central configuration file containing:
- Site metadata (name, description, URL)
- Business information (address, phone, hours, coordinates)
- Doctor information (name, title, CRM, specialties)
- Social media links
- Navigation structure
- Structured data helpers for Schema.org (clinic, doctor, breadcrumbs, FAQ, articles)

**src/lib/sanity.ts** - Sanity CMS integration:
- Client configuration (project ID: `qum5qhgj`, dataset: `production`)
- Image URL builder helper (`urlFor()`)
- TypeScript interfaces for Sanity content (`SanityPost`)

**src/layouts/Layout.astro** - Base layout providing:
- SEO meta tags (OpenGraph, Twitter Cards)
- Structured data for every page (clinic, doctor, webpage, breadcrumbs)
- Font loading (Outfit for headings, Inter for body)
- Global CSS variables and styles
- Header and Footer components

### Sanity CMS Integration

The site uses Sanity.io primarily for dynamic blog posts. Configuration:

```typescript
// src/lib/sanity.ts
projectId: 'qum5qhgj'
dataset: 'production'
useCdn: true
apiVersion: '2024-01-01'
```

**Environment Variables** (.env):
```bash
PUBLIC_SANITY_PROJECT_ID=qum5qhgj
PUBLIC_SANITY_DATASET=production
```

**Image Handling**: Use the `urlFor()` helper for Sanity images:
```typescript
import { urlFor } from '@/lib/sanity'
const imageUrl = urlFor(image).width(800).url()
```

**Dynamic Blog Posts**: The `[slug].astro` file fetches posts from Sanity using GROQ queries. Static blog posts are also available as individual `.astro` files in `/pages/blog/`.

### Styling System

**Tailwind CSS** with custom design tokens defined in Layout.astro:

```css
--primary: #003D7A       /* Deep blue for headings */
--primary-light: #22d3ee /* Cyan-400 for accents */
--secondary: #64748b     /* Slate-500 for secondary text */
--accent: #ecfeff        /* Cyan-50 for backgrounds */
--text-main: #1e293b     /* Slate-800 for main text */
--bg-body: #f8fafc       /* Slate-50 for global background */
--bg-alt: #ffffff        /* White for cards */
```

**Typography**:
- Headings: `Outfit` (Google Fonts)
- Body: `Inter` (Google Fonts)

**Component Patterns**:
- `.container` - Max-width container with horizontal padding
- `.section-padding` - Responsive vertical padding (5rem desktop, 3.5rem mobile)
- `.btn-premium` - Button base class with variants
- `.glass` - Glassmorphism utility

### SEO and Structured Data

Every page includes comprehensive structured data via Layout.astro:

1. **LocalBusiness** - Clinic information, address, hours, contact
2. **Physician** - Doctor profile with medical specialty and credentials
3. **WebPage** - Page-specific metadata and medical condition information
4. **WebSite** - Site-level metadata with search action
5. **BreadcrumbList** - Breadcrumb navigation

Additional structured data helpers in `src/lib/config.ts`:
- `getClinicStructuredData()` - Detailed clinic Schema.org
- `getDoctorStructuredData()` - Physician Schema.org
- `getBreadcrumbStructuredData(items)` - Custom breadcrumbs
- `getFAQStructuredData(faqs)` - FAQ page Schema.org
- `getArticleStructuredData(article)` - Blog post Schema.org

### Static Site Generation

Astro is configured for static output (`output: 'static'`) with:
- Sitemap generation (excludes `/studio/` paths)
- Image optimization (restricted to `cdn.sanity.io` and own domain)
- HTML compression
- Prefetch enabled for faster navigation

## Common Development Tasks

### Adding a New Page

1. Create `.astro` file in `src/pages/` (e.g., `sobre.astro`)
2. Use Layout component with proper SEO props:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---
   <Layout
     title="Sobre a Clínica"
     description="História da Saraiva Vision..."
     image="/og-sobre.jpg"
   >
     <!-- Content -->
   </Layout>
   ```
3. Update navigation in `src/lib/config.ts` if needed

### Adding a New Treatment Page

1. Create file in `src/pages/tratamentos/` (e.g., `novo-tratamento.astro`)
2. Follow existing treatment page structure
3. Add treatment card to homepage (`src/pages/index.astro` in treatments section)
4. Use appropriate icons from `/public/icons/`

### Working with Sanity Content

For dynamic blog posts:
1. Content is managed in Sanity Studio (separate repo or hosted)
2. Fetch content using `client.fetch()` with GROQ queries
3. Example query pattern:
   ```typescript
   const posts = await client.fetch(`
     *[_type == "post"] | order(publishedAt desc) {
       title, slug, excerpt, mainImage, publishedAt
     }
   `)
   ```

### Updating Site Configuration

All site-wide constants live in `src/lib/config.ts`:
- Business hours, address, phone numbers
- Doctor credentials and bio text
- Navigation structure
- Social media links

**Important**: When updating doctor information, ensure compliance with CFM (Conselho Federal de Medicina) regulations:
- Use `titleFormal` for structured data and legal contexts
- Use `title` for user-facing UI
- Always include CRM number

### Image Optimization

Images are restricted to trusted domains (configured in `astro.config.mjs`):
- `cdn.sanity.io` - For Sanity CMS images
- `olhossecos.com.br` - Own domain
- `olhossecos.com` - Alternate domain

Local images go in `/public/` directory and are referenced as `/image.png`.

## Production Build

The site is optimized for static hosting (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build  # Creates ./dist/ directory
```

Build output is static HTML with:
- Pre-rendered pages
- Optimized images
- Compressed HTML
- Generated sitemap
- Prefetch hints

## Medical and Legal Compliance

**CFM Compliance** (Brazilian medical advertising regulations):
- Doctor titles must be accurate and complete in structured data
- Use `titleFormal` from config for legal contexts: "Médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco"
- Always display CRM number: CRM-MG 69.870
- No promises of guaranteed results in copy

**LGPD Considerations** (Brazilian data protection):
- Contact forms should link to privacy policy
- Patient data handling follows clinic protocols
- Privacy policy page expected at `/privacidade`

## Key Business Information

**Clinic Details:**
- Name: Saraiva Vision Clínica Especializada em Olho Seco
- Address: Rua Catarina Maria Passos, 97, Bairro Santa Zita (Amor e Saúde), Caratinga/MG, CEP 35300-299
- Phone/WhatsApp: (33) 99860-1427
- Email: contato@saraivavision.com.br
- Hours: Mon-Fri 08:00-18:00, Sat 08:00-12:00

**Primary Treatments Featured:**
1. E-Eye IRPL (Intense Regulated Pulsed Light) - Featured treatment
2. Higiene Palpebral (Eyelid hygiene)
3. Medicamentos (Medications - preservative-free drops, omega-3, immunomodulators)
4. Lentes Esclerais (Scleral lenses for severe cases)

**Target Conditions:**
- Síndrome do Olho Seco (Dry Eye Syndrome)
- Disfunção das Glândulas de Meibomius (Meibomian Gland Dysfunction)
- Blefarites (Blepharitis)
- Superfície Ocular (Ocular Surface disorders)
