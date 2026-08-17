# Repository Guidelines

Guia curto para agentes e contribuidores. O contexto completo do projeto —
arquitetura, sistema de design, deploy e conformidade — está em `CLAUDE.md`.

## Estrutura

- `src/pages/` — rotas Astro. Portal na raiz (`sintomas.astro`, `causas.astro`),
  mais `guias/`, `livros/`, `superficie/` e `api/`.
- `src/lib/` — **o conteúdo editorial mora aqui**, em módulos TypeScript
  tipados: `guides.ts`, `superficie.ts`, `radar.ts`, `books.ts`, `figures.ts`.
  Não há CMS; para publicar, edite o módulo.
- `src/components/` — componentes em PascalCase. Os da revista ficam em
  `components/superficie/`.
- `src/layouts/` — `Layout.astro` (portal) e `SuperficieLayout.astro` (revista).
  São **dois sistemas de design distintos**; não misture os tokens.
- `src/superficie/reader/` — o Reader POC da revista, isolado do resto.
- `scripts/` — build, deploy atômico, geração de cards OG, exportações.
- `public/` — estáticos servidos como estão.
- `dist/` — saída de build (gerada, não versionada).

## Comandos

```bash
npm run dev     # http://localhost:4321
npm run check   # test + lint + format:check + build + test:routes
npm test        # 67 testes (node:test)
npm run lint    # ESLint 9
npm run format  # Prettier + prettier-plugin-astro
```

`npm run check` é o portão. Rode antes de pedir revisão.

## Estilo

- 2 espaços; siga o arquivo ao redor.
- Componentes em PascalCase, páginas em minúsculas com hífen.
- CSS puro com custom properties e escopo do Astro. **Não há Tailwind** — o
  `tailwind.config.mjs` é resquício e não é usado por nada.
- Helpers e dados em `src/lib/`, tipados.
- Comentário explica **por que**, não o que o código já diz. Prefira comentar
  a restrição não óbvia (uma regra de especificidade, um limite de API) a
  narrar a linha seguinte.

## Testes

- `node:test`, arquivos `*.test.ts` ao lado do módulo em `src/lib/`.
- O Reader tem suíte própria: `npm run test:reader` e `npm run test:e2e:reader`
  (Playwright).
- `npm run test:routes` valida que as rotas do release respondem.
- Ao corrigir um bug, escreva primeiro o teste que falha por causa dele.

## Commits e PRs

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`.
- Corpo em português explicando a motivação e o que foi descartado. Um commit que
  só repete o título em prosa não ajuda ninguém.
- PR com resumo curto e, para mudança visual, captura de antes e depois.
- Confirme `npm run check` antes de pedir revisão.

## Conteúdo médico

Este site publica orientação de saúde sob a responsabilidade de um médico
identificado (CRM-MG 69.870 · RQE 71.903).

- Referência nova precisa ser **conferida no Crossref ou PubMed** antes de entrar:
  autor e título têm que bater. Buscas devolvem cartas ao editor e errata como
  primeiro resultado com frequência.
- Onde a evidência for fraca, curta ou de efeito transitório, **diga isso no
  texto**. Não omita limitação para deixar a recomendação mais atraente.
- Nada de promessa de resultado, superlativo ou comparação com concorrente.
- Imagem gerada por IA carrega divulgação obrigatória (ver `figures.ts`), e
  precisa ilustrar o que a seção de fato afirma — não só parecer bonita.

## Segurança e configuração

- Copie `.env.example` para `.env`. As variáveis reais cobrem analytics,
  newsletter e contatos de parceiros, todas em SQLite local. Menções a Sanity,
  SendPulse, Resend ou Evolution API em documentos antigos estão obsoletas.
- Nunca versione segredo; nada de credencial em `public/` ou em código de
  cliente.
- Os endpoints tratam dado pessoal: não registre em log nem exponha e-mail,
  telefone ou nome.

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

O Notion guarda a estratégia editorial e comercial da SUPERFÍCIE — banco de
pautas, roadmap de capas, gates comerciais. Consulte antes de decidir sobre
conteúdo ou posicionamento da revista.

## Cursor Cloud specific instructions

Standard commands live in `README.md`, `TESTING.md`, and `package.json` scripts
(`npm run dev`, `npm test`, `npm run lint`, `npm run build`, `npm run test:routes`,
`npm run check`). The notes below only cover non-obvious gotchas discovered in the
cloud environment; dependency install (`nvm install 24` + `npm ci` + `.env`) is
handled automatically by the environment update script on startup.

- **Node 24 is required, and the default shell node is not it.** Tests, `astro
  check`, and the build rely on native TypeScript type-stripping, which the
  default `/exec-daemon` node shim (v22.14) does not enable — `npm test` fails
  with `ERR_UNKNOWN_FILE_EXTENSION ".ts"` under it. The update script installs
  Node 24 via `nvm`, and `~/.bashrc` prepends the nvm Node 24 bin ahead of the
  shim, so interactive shells resolve `node -> v24` automatically. Verify with
  `node --version`; if it still reports v22 in some non-login context, run
  `export PATH="$(ls -d "$HOME"/.nvm/versions/node/v24*/bin | sort -V | tail -1):$PATH"`.
  Note `nvm use 24` alone does **not** help — the `/exec-daemon` shim stays ahead
  in `PATH`; only a direct prepend wins.
- **The dev server does not read `.env` into `process.env`.** Astro/Vite only
  loads `.env` into `import.meta.env`, but the SSR API endpoints (`newsletter`,
  `analytics`, `superficie-parceiros`, `newsletter-unsubscribe`) read
  `process.env.*` for their SQLite paths and allowed origins. Without exporting
  the vars first, those endpoints fall back to the production path
  `/var/lib/olhossecos/…` and every POST fails with `503`. Start the dev server
  with the env loaded: `set -a; . ./.env; set +a; npm run dev`. Page rendering
  works without this, only the write endpoints need it.
- **SQLite files are created lazily under the path in `.env`** (`./var/*.sqlite`,
  git-ignored). The endpoints create the file/tables on first write, so no
  migration step is needed; just ensure the dev server can write to `./var/`.
- **Hello-world sanity check** (dev server running with `.env` loaded):
  `curl -s -X POST http://localhost:4321/api/newsletter -H "Content-Type: application/json" -H "Origin: http://localhost:4321" -d '{"name":"Teste","email":"t@example.com","consent":"accepted","source":"livros"}'`
  should return `201` with `Cadastro realizado. Obrigado.` and persist a row in
  `./var/newsletter.sqlite`.
