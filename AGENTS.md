# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro routes (e.g., `index.astro`, `olho-seco.astro`, `blog/` and `videos/`).
- `src/components/`: Reusable UI components in PascalCase (e.g., `Header.astro`, `VideoCard.astro`).
- `src/layouts/`: Base layout shells and shared page chrome.
- `src/lib/`: Client utilities (e.g., Sanity client/query helpers).
- `public/`: Static assets served as-is.
- `dist/`: Build output (generated).

## Build, Test, and Development Commands
- `npm run dev`: Start Astro dev server at `http://localhost:4321`.
- `npm run build`: Type-check (`astro check`) and build for production.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Lint `src/` with ESLint.
- `npm run format`: Format the repo with Prettier + `prettier-plugin-astro`.

## Coding Style & Naming Conventions
- Indentation follows existing files (2 spaces in `.astro` is typical here).
- Components use PascalCase filenames; pages use lowercase/kebab-case.
- Keep Tailwind class strings readable; prefer grouping by layout → spacing → color.
- Use TypeScript where applicable; keep helpers in `src/lib/`.

## Testing Guidelines
- No automated test scripts are configured in `package.json` yet.
- If you add tests, document them in `TESTING.md` and add scripts (e.g., `npm run test`).
- Suggested locations: `src/components/__tests__/` for unit tests or `e2e/` for end-to-end.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`.
- PRs should include a short summary, linked issue/ticket if applicable, and screenshots for UI changes.
- Confirm `npm run build` (and `npm run lint` when touching code) before requesting review.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and set `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET`.
- Never commit secrets; keep credentials out of `public/` and client-side code.

## Knowledge Protocol (ByteRover)
This agent uses ByteRover (`brv`) as its long-term structured memory.
You MUST use this for gathering contexts before any work. This is a Knowledge management for AI agents. Use `brv` to store and retrieve project patterns, decisions, and architectural rules in .brv/context-tree.
1.  **Start:** Before answering questions, run `brv query "<topic>"` to load existing patterns.
2.  **Finish:** After completing a task, run `brv curate "<summary>"` to save knowledge.
3.  **Don't Guess:** If you don't know anything, query it first.
4.  **Response Format:** When using knowledge, optionally cite it or mention storage:
    - "Based on brv contexts at `.brv/context-trees/...` and my research..."
    - "I also stored successfully knowledge to brv context-tree."
