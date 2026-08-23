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

## Maestro & Multi-Agent Coordination Protocol

Este workspace utiliza o conjunto de habilidades do **Maestro** e o protocolo de coordenação de agentes:

- **Contexto do Projeto:** `.maestro/context.md` e `.maestro.md`.
- **Regras de Interação entre Agentes:** `.agent/rules/agent-interaction.md`.
- **Comandos & Skills:** Localizados em `skills/` e `.agent/skills/` (`/diagnose`, `/fortify`, `/zero-defect`, `/refine`, `/compose`, `/streamline`, `/teach-maestro`, `/capture`, `/recap`).
- **Padrão de Handoff:** Ao delegar tarefas para subagentes, use mensagens estruturadas com Objetivo, Contexto Essencial e Saída Esperada. Evite polling manual e valide tudo via `npm run check`.
