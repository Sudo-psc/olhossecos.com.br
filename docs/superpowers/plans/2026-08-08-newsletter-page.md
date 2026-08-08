# Public Newsletter Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a rota pública `/newsletter` com cadastro mínimo, perfil opcional, origem própria, SEO, navegação e QA suficientes para liberar um novo Gate F.

**Architecture:** O endpoint SQLite existente continuará sendo a única fronteira de persistência. O fluxo interativo hoje contido em `SuperficieNewsletterForm.astro` será extraído para um componente compartilhado configurável por `source` e `variant`, enquanto a nova página usa o layout geral do portal. Testes de backend e de release serão escritos e observados em RED antes da implementação.

**Tech Stack:** Astro 7, TypeScript, CSS nativo, Node 24 test runner, Node SQLite, endpoint server-side Astro, sitemap Astro e JavaScript nativo no navegador.

## Global Constraints

- Trabalhar somente em `/root/worktrees/olhossecos-newsletter-20260808`, branch `codex/newsletter-page-20260808`, baseada no merge commit `44afb99`.
- Não tocar no checkout sujo `/root/olhossecos.com.br-site`, no candidato `/root/olhossecos-release-44afb99-FPF6P4/worktree`, no `dist` ativo, nos bancos de produção, em Nginx ou systemd.
- O primeiro passo solicita somente e-mail e consentimento explícito; o perfil aparece apenas após HTTP 201 e permanece opcional.
- Nenhum checkbox pré-selecionado, tracker adicional, promessa de frequência, conteúdo fictício ou claim clínico.
- Preservar os fluxos `livros` e `superficie`, o token de perfil armazenado somente como hash, origem/UTMs, rate limit, honeypot, limites de payload e política de origem.
- Visual do portal: branco, `#071d45`, teal, tipografia editorial e linhas finas; nenhuma imagem nova.
- WCAG 2.2 AA e validação consciente em 320, 375, 390, 768, 1024, 1280 e 1440 px.
- Não executar push, PR, merge ou deploy sem autorização explícita posterior.

---

## File Map

- Create `src/components/NewsletterSignupForm.astro`: markup, progressive profiling, analytics, acessibilidade e estilos comuns das variantes `portal` e `superficie`.
- Modify `src/components/superficie/SuperficieNewsletterForm.astro`: wrapper compatível que delega ao componente compartilhado.
- Create `src/pages/newsletter.astro`: conteúdo, layout, SEO, breadcrumbs e composição editorial da nova rota.
- Modify `src/lib/newsletter.ts`: aceitar a origem `newsletter` e emitir token de perfil para origens progressivas.
- Modify `src/lib/newsletter.test.ts`: provar persistência da nova origem e token de perfil.
- Modify `scripts/verify-release-routes.mjs`: exigir rota, H1, canonical, sitemap e navegação para `/newsletter`.
- Modify `src/components/Header.astro`: apontar CTAs desktop/mobile para `/newsletter`.
- Modify `src/components/Footer.astro`: adicionar o hub Newsletter.
- Modify `src/pages/privacidade.astro`: descrever o cadastro transversal e a segmentação opcional.
- Modify `astro.config.mjs`: registrar `lastmod` de `/newsletter` em 2026-08-08.
- Modify `TESTING.md`: documentar o novo contrato de release e o QA do fluxo.
- Preserve `src/pages/livros/index.astro`: o formulário contextual de Livros continua com origem `livros`.
- Preserve `src/pages/superficie/index.astro`: continua consumindo o wrapper da SUPERFÍCIE sem alteração visual deliberada.

---

### Task 1: Accept the portal newsletter source

**Files:**
- Modify: `src/lib/newsletter.test.ts`
- Modify: `src/lib/newsletter.ts`

**Interfaces:**
- Consumes: `handleNewsletterRequest(request, options): Promise<Response>` e tabela `newsletter_subscribers` existentes.
- Produces: `type NewsletterSource = "livros" | "superficie" | "newsletter"`; cadastro `source: "newsletter"` com token de perfil temporário.

- [ ] **Step 1: Write the failing backend test**

Adicionar depois do teste da SUPERFÍCIE:

```ts
test("aceita a origem geral da newsletter com cadastro mínimo", async () => {
  const response = await handleNewsletterRequest(
    request({
      email: "portal@example.com",
      source: "newsletter",
      consent: "accepted",
      utmSource: "header",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 201);
  const result = (await response.json()) as { profileToken?: string };
  assert.equal(typeof result.profileToken, "string");

  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT email, name, source, utm_source
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get("portal@example.com") as Record<string, string>;
  database.close();

  assert.equal(row.name, "");
  assert.equal(row.source, "newsletter");
  assert.equal(row.utm_source, "header");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
rtk npm run test:newsletter
```

Expected: FAIL porque a implementação atual converte `newsletter` em `livros`, exige nome e retorna 422.

- [ ] **Step 3: Add the source type and progressive-source rule**

Em `src/lib/newsletter.ts`, definir perto de `NewsletterPayload`:

```ts
type NewsletterSource = "livros" | "superficie" | "newsletter";

const newsletterSources = new Set<NewsletterSource>([
  "livros",
  "superficie",
  "newsletter",
]);
```

Alterar `saveSubscriber` para receber `source: NewsletterSource`. Na leitura do payload, substituir a decisão binária por:

```ts
const requestedSource = normalizeText(payload.source) as NewsletterSource;
const source: NewsletterSource = newsletterSources.has(requestedSource)
  ? requestedSource
  : "livros";
const usesProgressiveProfile = source !== "livros";
```

Usar `usesProgressiveProfile` tanto na exigência de nome quanto na emissão do token:

```ts
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
```

- [ ] **Step 4: Verify GREEN and regression behavior**

Run:

```bash
rtk npm run test:newsletter
rtk npm run test:gate5
```

Expected: 8 newsletter tests and 12 Gate 5 tests pass; `livros` still requires name, while `superficie` and `newsletter` accept e-mail-only signup.

- [ ] **Step 5: Review the diff and commit the backend slice**

Run:

```bash
rtk git diff --check
rtk git diff -- src/lib/newsletter.ts src/lib/newsletter.test.ts
rtk git add src/lib/newsletter.ts src/lib/newsletter.test.ts
rtk git commit -m "feat: aceitar origem geral da newsletter"
```

Expected: one focused commit with no schema change.

---

### Task 2: Make the public route contract fail first

**Files:**
- Modify: `scripts/verify-release-routes.mjs`

**Interfaces:**
- Consumes: built server at `dist/server/entry.mjs` and sitemap at `/sitemap-0.xml`.
- Produces: release contract for `/newsletter` and both global navigation entry points.

- [ ] **Step 1: Add reusable page-metadata assertions**

Adicionar depois de `assertStatus`:

```js
const assertPage = async (path, canonicalPath) => {
  const response = await assertStatus(path);
  const html = await response.text();
  const h1Count = html.match(/<h1(?:\s|>)/gu)?.length ?? 0;
  if (h1Count !== 1) {
    throw new Error(`${path}: esperado um H1, encontrados ${h1Count}`);
  }
  const canonical = `<link rel="canonical" href="${productionOrigin}${canonicalPath}">`;
  if (!html.includes(canonical)) {
    throw new Error(`${path}: canonical ausente ou incorreto`);
  }
  return html;
};
```

No bloco principal, ler a homepage e exigir o CTA:

```js
const homeHtml = await (await assertStatus("/")).text();
if (!/href="\/newsletter"/u.test(homeHtml)) {
  throw new Error("homepage: link global para /newsletter ausente");
}

await assertPage("/superficie/parceiros", "/superficie/parceiros");
await assertPage("/newsletter", "/newsletter");
```

Após ler o sitemap, exigir as duas rotas:

```js
for (const path of ["/superficie/parceiros", "/newsletter"]) {
  if (!sitemap.includes(`<loc>${productionOrigin}${path}</loc>`)) {
    throw new Error(`sitemap: ${path} ausente`);
  }
}
```

Remover somente as asserções duplicadas de H1/canonical/parceiros que foram absorvidas por `assertPage`.

- [ ] **Step 2: Build the unchanged app and verify RED**

Run:

```bash
rtk npm run build
rtk npm run test:routes
```

Expected: FAIL com `homepage: link global para /newsletter ausente` ou `/newsletter: esperado HTTP 200, recebido 404`. Registrar a mensagem exata no handoff.

- [ ] **Step 3: Leave the RED test uncommitted until Task 3 is GREEN**

Run:

```bash
rtk git status --short
rtk git diff --check
```

Expected: somente `scripts/verify-release-routes.mjs` modificado, sem artefatos rastreados.

---

### Task 3: Extract the shared form and create `/newsletter`

**Files:**
- Create: `src/components/NewsletterSignupForm.astro`
- Modify: `src/components/superficie/SuperficieNewsletterForm.astro`
- Create: `src/pages/newsletter.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `astro.config.mjs`
- Test: `scripts/verify-release-routes.mjs` from Task 2

**Interfaces:**
- Consumes: `PUBLIC_NEWSLETTER_ENDPOINT`, `source: NewsletterSource`, `Layout`, `Breadcrumbs` and analytics event convention.
- Produces: `NewsletterSignupForm` props `{ endpoint?: string; source: "superficie" | "newsletter"; variant: "superficie" | "portal" }`, plus route `/newsletter`.

- [ ] **Step 1: Create the shared component contract**

Mover o markup, script e estilos de `SuperficieNewsletterForm.astro` para
`src/components/NewsletterSignupForm.astro` e substituir o frontmatter por:

```astro
---
interface Props {
  endpoint?: string;
  source: "superficie" | "newsletter";
  variant: "superficie" | "portal";
}

const {
  endpoint = "/api/newsletter",
  source,
  variant,
} = Astro.props;

const formId = `${source}-newsletter-form`;
const emailId = `${source}-newsletter-email`;
const consentId = `${source}-newsletter-consent`;
const statusId = `${source}-newsletter-status`;
const profileTitleId = `${source}-profile-title`;
---
```

O elemento raiz e o formulário principal devem expor a configuração sem
colocar dados pessoais no DOM:

```astro
<div class="newsletter-card" data-newsletter-root data-variant={variant}>
  <form
    id={formId}
    method="post"
    action={endpoint}
    data-newsletter-form
    data-endpoint={endpoint}
    data-source={source}
    novalidate
  >
```

Para o consentimento, renderizar copy por origem:

```astro
<span>
  {
    source === "newsletter"
      ? "Concordo em receber comunicações editoriais do olhossecos.com.br, conforme a "
      : "Concordo em receber comunicações editoriais da SUPERFÍCIE, conforme a "
  }
  <a href="/privacidade">Política de Privacidade</a>.
</span>
```

- [ ] **Step 2: Scope the browser behavior to each component root**

Substituir os seletores globais únicos por um loop:

```ts
document
  .querySelectorAll<HTMLElement>("[data-newsletter-root]")
  .forEach((root) => {
    const newsletterForm = root.querySelector<HTMLFormElement>(
      "[data-newsletter-form]",
    );
    const newsletterStatus = root.querySelector<HTMLElement>(
      "[data-newsletter-status]",
    );
    const profilePanel = root.querySelector<HTMLElement>(
      "[data-profile-panel]",
    );
    const profileForm = root.querySelector<HTMLFormElement>(
      "[data-profile-form]",
    );
    const profileStatus = root.querySelector<HTMLElement>(
      "[data-profile-status]",
    );
    const profileSkip = root.querySelector<HTMLButtonElement>(
      "[data-profile-skip]",
    );
    const source = newsletterForm?.dataset.source;

    if (!newsletterForm || !source) return;
    // Os listeners existentes permanecem dentro deste escopo.
  });
```

No payload e analytics, usar o valor validado no dataset:

```ts
const payload: Record<string, string> = {
  ...(Object.fromEntries(formData) as Record<string, string>),
  source,
};

track("newsletter_signup", { source });
```

Adicionar os atributos `data-newsletter-status`, `data-profile-panel`,
`data-profile-form`, `data-profile-status` e `data-profile-skip` aos elementos
correspondentes. Manter o e-mail e o token somente nos inputs hidden do painel
em memória; limpar o token ao escolher “Agora não”.

- [ ] **Step 3: Preserve the SUPERFÍCIE wrapper**

Substituir `SuperficieNewsletterForm.astro` por:

```astro
---
import NewsletterSignupForm from "@/components/NewsletterSignupForm.astro";

interface Props {
  endpoint?: string;
}

const { endpoint = "/api/newsletter" } = Astro.props;
---

<NewsletterSignupForm
  {endpoint}
  source="superficie"
  variant="superficie"
/>
```

Preservar na variante `superficie` os tokens visuais atuais por meio de
variáveis internas do componente. A variante `portal` deve mapear para
`--paper`, `--ink`, `--ink-soft`, `--teal-dark` e `--line`, sem alterar o CSS
global.

- [ ] **Step 4: Create the public page with the approved copy**

Criar `src/pages/newsletter.astro` com este frontmatter e estrutura semântica:

```astro
---
import Breadcrumbs from "@/components/Breadcrumbs.astro";
import NewsletterSignupForm from "@/components/NewsletterSignupForm.astro";
import Layout from "@/layouts/Layout.astro";

const breadcrumbs = [
  { name: "Início", url: "/" },
  { name: "Newsletter", url: "/newsletter" },
];
const endpoint =
  import.meta.env.PUBLIC_NEWSLETTER_ENDPOINT || "/api/newsletter";
---

<Layout
  title="Newsletter sobre Olho Seco e Superfície Ocular | Olhos Secos"
  description="Receba conteúdos selecionados sobre olho seco, saúde ocular, novas publicações, livros e atualizações da revista SUPERFÍCIE."
  schemaType="WebPage"
  datePublished="2026-08-08"
  dateModified="2026-08-08"
  breadcrumbs={breadcrumbs}
>
  <header class="newsletter-hero">
    <div class="page-shell">
      <Breadcrumbs items={breadcrumbs} />
      <div class="hero-grid">
        <div class="hero-copy">
          <h1>Acompanhe a evolução do cuidado ocular.</h1>
          <p>
            Uma correspondência editorial do olhossecos.com.br com conteúdos
            selecionados para diferentes jornadas de cuidado e prática
            profissional.
          </p>
        </div>
        <NewsletterSignupForm
          {endpoint}
          source="newsletter"
          variant="portal"
        />
      </div>
    </div>
  </header>

  <section class="audiences page-shell" aria-labelledby="audiences-title">
    <h2 id="audiences-title">Conteúdo para diferentes jornadas.</h2>
    <article>
      <h3>Para pacientes</h3>
      <p>Informação compreensível sobre sintomas, investigação, autocuidado responsável, tratamentos e quando procurar avaliação.</p>
    </article>
    <article>
      <h3>Para profissionais</h3>
      <p>Novas edições da SUPERFÍCIE, evidências, diagnóstico multimodal, tecnologias e publicações editoriais.</p>
    </article>
  </section>

  <section class="ecosystem" aria-labelledby="ecosystem-title">
    <div class="page-shell">
      <h2 id="ecosystem-title">Do portal para a sua caixa de entrada.</h2>
      <nav aria-label="Ecossistema editorial">
        <a href="/guias">Guias e conteúdos educativos</a>
        <a href="/superficie">SUPERFÍCIE</a>
        <a href="/livros">Livros</a>
        <a href="/app">Dry Eye Widget</a>
      </nav>
    </div>
  </section>

  <aside class="trust page-shell" aria-labelledby="trust-title">
    <h2 id="trust-title">Uma relação editorial transparente.</h2>
    <p>Consentimento explícito, dados mínimos e nenhuma lista nominal compartilhada com anunciantes sem base legal e consentimento específico.</p>
    <p><a href="/privacidade">Privacidade</a> · <a href="/politica-editorial">Política editorial</a></p>
  </aside>
</Layout>
```

Adicionar CSS local que produza hero de duas colunas no desktop e fluxo
texto → formulário no mobile; usar filetes entre as duas audiências, não cards;
garantir `min-width: 0`, inputs com 44 px ou mais e breakpoints em 900 e 640 px.

- [ ] **Step 5: Point global navigation to the new route**

Em `Header.astro`, substituir os dois `href="/livros#newsletter"` por
`href="/newsletter"`. Em `Footer.astro`, adicionar na coluna “Sobre o portal”:

```astro
<a href="/newsletter">Newsletter</a>
```

Em `astro.config.mjs`, adicionar `"/newsletter"` ao conjunto
`revisedOnAugust8`.

- [ ] **Step 6: Run GREEN checks for the route and existing forms**

Run:

```bash
rtk npm run test:newsletter
rtk npm run test:gate5
rtk npm run build
rtk npm run test:routes
```

Expected: all focused tests pass; `/newsletter` returns 200 with one H1 and
canonical; homepage links to it; sitemap includes it; `/superficie` still
builds through the compatibility wrapper.

- [ ] **Step 7: Format, inspect and commit the page slice**

Run:

```bash
rtk npm run format
rtk git diff --check
rtk git diff --stat
rtk git add scripts/verify-release-routes.mjs src/components/NewsletterSignupForm.astro src/components/superficie/SuperficieNewsletterForm.astro src/pages/newsletter.astro src/components/Header.astro src/components/Footer.astro astro.config.mjs
rtk git commit -m "feat: adicionar página pública de newsletter"
```

Expected: one commit containing the RED test plus the GREEN route and shared
component, with no generated `dist` tracked.

---

### Task 4: Align privacy, documentation and release QA

**Files:**
- Modify: `src/pages/privacidade.astro`
- Modify: `TESTING.md`
- Test: complete application and browser behavior

**Interfaces:**
- Consumes: new source `newsletter`, public route, shared component and current privacy policy.
- Produces: accurate visible disclosure and reproducible release evidence.

- [ ] **Step 1: Update the privacy disclosure**

Substituir o início da seção “Newsletter editorial” por copy coerente com o
fluxo geral:

```astro
<p>
  Ao assinar as comunicações editoriais, você fornece inicialmente o e-mail.
  Em formulários específicos, nome e profissão também podem ser solicitados.
  Depois do cadastro mínimo, a identificação como médico, residente/fellow,
  pesquisador, outro profissional, indústria ou parceiro, paciente ou outro
  perfil é opcional. Esses dados são usados para enviar e selecionar
  atualizações sobre conteúdos do portal, livros e edições da SUPERFÍCIE, com
  base no consentimento manifestado no formulário.
</p>
```

Preservar o texto existente sobre armazenamento privado, dados sensíveis e
descadastro; não inventar prazo de retenção.

- [ ] **Step 2: Document the automated and browser checks**

Em `TESTING.md`, acrescentar à seção de build:

```markdown
O smoke test de release também exige `/newsletter` com HTTP 200, H1 e canonical
próprios, presença no sitemap e link na navegação global.
```

Na seção Gate 5, registrar que as origens persistidas são `livros`,
`superficie` e `newsletter`, e que as duas últimas usam progressive profiling.

- [ ] **Step 3: Run the complete proof gate**

Run:

```bash
rtk npm run check
rtk npm audit --audit-level=high
rtk npm audit --omit=dev --audit-level=high
rtk git diff --check origin/master...HEAD
rtk git status --short --branch
```

Expected: 22 Node tests, ESLint, Prettier, Astro Check, build, route smoke and
both audits pass; working tree contains only the documentation changes before
the final commit.

- [ ] **Step 4: Exercise the built app against temporary databases**

Start the built server with paths created by `mktemp -d`, never the production
databases:

```bash
qa_root=$(rtk mktemp -d /tmp/olhossecos-newsletter-qa-XXXXXX)
HOST=127.0.0.1 \
PORT=4335 \
NODE_ENV=production \
NEWSLETTER_DATABASE_PATH="$qa_root/newsletter.sqlite" \
NEWSLETTER_ALLOWED_ORIGIN=http://127.0.0.1:4335 \
PARTNER_INQUIRY_DATABASE_PATH="$qa_root/partners.sqlite" \
PARTNER_INQUIRY_ALLOWED_ORIGIN=http://127.0.0.1:4335 \
rtk node dist/server/entry.mjs
```

Em outro terminal, enviar:

```bash
rtk curl -sS -o /tmp/newsletter-response.json -w '%{http_code}\n' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://127.0.0.1:4335' \
  -H 'Sec-Fetch-Site: same-origin' \
  --data '{"email":"qa-newsletter@example.invalid","source":"newsletter","consent":"accepted","company":"","utmSource":"qa"}' \
  http://127.0.0.1:4335/api/newsletter
```

Expected: 201; query of the temporary DB returns
`qa-newsletter@example.invalid|newsletter|qa|privacy-2026-08-08`. Also verify:

```bash
rtk curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4335/newsletter
rtk curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4335/api/newsletter
```

Expected: 200 and 405 respectively. Cross-origin POST must return 403 and POST
without consent must return 422.

- [ ] **Step 5: Run responsive browser QA**

Usar o Browser integrado; usar Playwright Chromium apenas se o Browser estiver
indisponível. Em 320, 375, 390, 768, 1024, 1280 e 1440 px, verificar:

- um H1 e canonical `/newsletter`;
- sem overflow horizontal ou erro de console;
- ordem hero → formulário no mobile;
- foco visível e menu fechando por Escape;
- checkbox inicialmente desmarcado;
- cadastro 201, painel opcional focado, “Agora não” fechando o painel;
- seleção de perfil concluindo com 200;
- header, footer, Privacidade, SUPERFÍCIE e Livros sem regressão visual.

Salvar capturas em:

```text
docs/design/newsletter/newsletter-1440.png
docs/design/newsletter/newsletter-390.png
docs/design/newsletter/newsletter-profile-390.png
```

Abrir as capturas com `view_image` e comparar diretamente com o design system
existente, usando como referências concretas
`docs/design/homepage-v2/gate2-implementation-desktop.png`,
`docs/design/homepage-v2/gate2-implementation-mobile.png`,
`docs/design/superficie/qa/gate5/newsletter-desktop.png` e
`docs/design/superficie/qa/gate5/newsletter-mobile.png`. Como esta é uma nova
rota dentro do sistema visual já aprovado, sem nova direção de arte nem novo
asset, não é necessário gerar conceito adicional. Corrigir qualquer
divergência antes do handoff.

- [ ] **Step 6: Commit compliance and QA evidence**

Run:

```bash
rtk git add src/pages/privacidade.astro TESTING.md docs/design/newsletter/
rtk git commit -m "docs: registrar QA da newsletter"
rtk git status --short --branch
```

Expected: clean branch with three implementation commits after the approved
specification commit.

---

### Task 5: Review and prepare the delivery handoff

**Files:**
- Review only: `origin/master...HEAD`
- No new implementation files

**Interfaces:**
- Consumes: complete branch and proof artifacts.
- Produces: evidence-backed review verdict and shipping-ready PR packet.

- [ ] **Step 1: Run change review in read-only mode**

Review the spec axis and the standards axis across:

```text
src/pages/newsletter.astro
src/components/NewsletterSignupForm.astro
src/components/superficie/SuperficieNewsletterForm.astro
src/lib/newsletter.ts
src/lib/newsletter.test.ts
scripts/verify-release-routes.mjs
src/components/Header.astro
src/components/Footer.astro
src/pages/privacidade.astro
astro.config.mjs
TESTING.md
```

Classify findings as P0–P3, separate blockers from follow-ups, and return to
implementation if any P0/P1 remains.

- [ ] **Step 2: Re-run final proof after any approved correction**

Run:

```bash
rtk npm run check
rtk npm audit --audit-level=high
rtk git diff --check origin/master...HEAD
rtk git status --short --branch
rtk git log --oneline origin/master..HEAD
```

Expected: all checks pass on the exact final SHA and the branch is clean.

- [ ] **Step 3: Stop for explicit shipping authorization**

Report the exact SHA, commits, files, tests, screenshots, review verdict,
rollback notes and the preserved deploy blocker resolution. Do not push, create
a PR, merge or deploy until the user authorizes those concrete actions.
