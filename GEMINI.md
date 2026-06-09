# Olho Seco Caratinga - Project Context

## Project Overview
This is a web project for "Olho Seco Caratinga" (Dry Eye Caratinga), an informational site about dry eye syndrome and treatments.
**Framework:** Astro v5.x
**Language:** TypeScript
**Styling:** Tailwind CSS
**CMS:** Sanity.io (Headless)

**Important Note:** The repository contains a `CLAUDE.md` file that describes a Next.js 15 project. **This is incorrect for the current state of the directory.** The actual codebase is built with Astro. Always rely on the file structure (`src/pages/*.astro`, `astro.config.mjs`) over `CLAUDE.md`.

## Key Files & Directories

### Configuration
- **`astro.config.mjs`**: Main Astro configuration. Configured for static output with `node` adapter, Tailwind integration, and Sitemap generation.
- **`package.json`**: Project metadata and scripts.
- **`tailwind.config.mjs`**: Tailwind CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.
- **`.env`**: Environment variables (requires `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`).

### Source Code (`src/`)
- **`src/pages/`**: Application routes.
    - `*.astro` files define pages (e.g., `index.astro`, `blog/[slug].astro`).
- **`src/components/`**: Reusable UI components (e.g., `Header.astro`, `Footer.astro`).
- **`src/layouts/`**: Page layouts (e.g., `Layout.astro`).
- **`src/lib/`**: Utility libraries.
    - `sanity.ts`: Configures the Sanity client and defines TypeScript interfaces for content (e.g., `SanityPost`).

## Development

### Scripts
Run these using `npm` (preferred per README) or `pnpm`.

- **`npm run dev`**: Start the local development server (usually at http://localhost:4321).
- **`npm run build`**: Type-check and build the project for production (`dist/`).
- **`npm run preview`**: Preview the production build locally.
- **`npm run lint`**: Run ESLint.
- **`npm run format`**: Run Prettier.

### Sanity Integration
Content is fetched from Sanity.io using the client configured in `src/lib/sanity.ts`.
- **Project ID:** `qum5qhgj` (default fallback, likely overridden by env vars).
- **Dataset:** `production`.
- **API Version:** `2024-01-01`.

## Documentation
- **`README.md`**: General project info and setup instructions.
- **`docs/`**: Contains documentation on Sanity integration, SEO strategy, and VPS deployment.
