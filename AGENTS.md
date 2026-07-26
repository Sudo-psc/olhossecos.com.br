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

## Knowledge Protocol (Notion Plugin)
This project uses the installed Notion plugin as its long-term structured memory.
Do not use ByteRover or run `brv` commands for this project.

1. **Start:** Before answering questions or changing code, use the Notion plugin
   search tool to find existing pages about the project and the current topic.
2. **Read:** Fetch the most relevant Notion pages before making decisions. Prefer
   project-specific documentation, decision logs, architecture notes, and known
   implementation patterns.
3. **Don't Guess:** If the required context is not in the repository, search
   Notion before making assumptions.
4. **Finish:** After completing material work, search for the existing project
   knowledge page and update it with durable decisions, patterns, architecture
   changes, operational notes, and important caveats. Create a new page only
   when no appropriate page exists.
5. **Avoid Duplicates:** Always search before creating a page. Update or link to
   existing knowledge whenever possible.
6. **Unavailable Plugin:** If the Notion plugin is unavailable or disconnected,
   report that limitation clearly. Do not silently fall back to ByteRover.
7. **Response Format:** When Notion knowledge materially informs the work,
   optionally cite or link the relevant Notion page. When durable knowledge is
   stored, mention the page that was created or updated.
