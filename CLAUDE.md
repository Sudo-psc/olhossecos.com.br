# CLAUDE.md

Orientação para o Claude Code (claude.ai/code) trabalhando neste repositório.

## Visão geral

**olhossecos.com.br** é um portal editorial sobre olho seco e superfície ocular,
da Saraiva Vision (Caratinga/MG). Não é um site institucional de clínica: o
conteúdo é a entrega. São quatro frentes no mesmo repositório:

| Frente                 | Rotas                                                                                                          | O que é                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Portal do paciente** | `/`, `/sintomas`, `/causas`, `/diagnostico`, `/tratamentos`, `/autocuidado`, `/sinais-de-alerta`, `/glossario` | Conteúdo explicativo para pacientes                                               |
| **Guias**              | `/guias`, `/guias/[slug]`                                                                                      | 13 leituras curtas e aprofundadas, com referências                                |
| **SUPERFÍCIE**         | `/superficie/**`                                                                                               | Revista para profissionais: edição fundadora, RADAR Científico, área de parceiros |
| **Livros e app**       | `/livros/**`, `/app`                                                                                           | Obras do autor e o Dry Eye Widget                                                 |

**Responsável técnico:** Dr. Philipe Saraiva Cruz — CRM-MG 69.870 · RQE 71.903.

## Stack

- **Astro 7** (`^7.1.3`) com `output: "static"` + adapter `@astrojs/node` standalone
- **TypeScript**, CSS puro com custom properties
- **SQLite** (`node:sqlite`) para os dados capturados pelos endpoints
- **npm** — ignore o `pnpm-lock.yaml` obsoleto

**Não há CMS.** Todo o conteúdo editorial vive em módulos TypeScript tipados sob
`src/lib/`. Sanity foi removido; se encontrar menção a ele em qualquer doc, está
desatualizada.

**Não há Tailwind.** `tailwind.config.mjs` sobrou de uma fase anterior e não é
usado por nada — nenhuma dependência, nenhuma classe. O estilo é CSS com escopo
do Astro e custom properties, com a camada de tokens em `src/styles/tokens.css`
(cor, tipografia, espaço, movimento, vidro, elevação). Os nomes antigos
(`--ink`, `--teal`, `--paper`) continuam como apelidos dos tokens novos.

**Uma fonte web, servida por nós.** `src/styles/fonts.css` declara a Source
Serif 4 (subset latino, 400–700, 29 KB) em `/fonts` — só para manchetes. O corpo
segue na pilha do sistema. A CSP declara `font-src 'self'`: fonte de host
externo funciona no dev e falha calada em produção, e `src/lib/typography.test.ts`
tranca essa porta.

## Comandos

```bash
npm run dev          # servidor local em http://localhost:4321
npm run check        # PORTÃO COMPLETO: test + lint + format:check + build + test:routes
npm run build        # scripts/build-release.mjs → astro check + build + BUILD_METADATA.json
npm test             # suíte node:test (o número cresce; não fixe aqui)
npm run lint         # ESLint 9 (funciona; docs antigas dizem o contrário)
npm run format       # Prettier + prettier-plugin-astro
npm run test:routes  # verifica que as rotas do release respondem
```

Antes de pedir revisão ou publicar, rode `npm run check` — ele encadeia tudo.

## Modelo de conteúdo

Cada frente tem um módulo em `src/lib/` que exporta dados tipados. As páginas
apenas renderizam.

| Módulo                               | Exporta                                               | Consumido por             |
| ------------------------------------ | ----------------------------------------------------- | ------------------------- |
| `guides.ts`                          | `guides: Guide[]`, `getGuide()`                       | `/guias`, `/guias/[slug]` |
| `superficie.ts`                      | `founderIssue`, `publishedArticles`, tipos da revista | `/superficie/**`          |
| `radar.ts`                           | `radarReports: RadarReport[]`                         | `/superficie/radar/**`    |
| `books.ts`                           | catálogo de livros                                    | `/livros/**`              |
| `figures.ts`                         | `figures` — todo o acervo de imagens educativas       | qualquer página           |
| `sources.ts`, `home.ts`, `search.ts` | fontes, blocos da home, busca                         | portal                    |

Para publicar conteúdo novo, edite o módulo — não crie HTML solto na página.

### Referências: verifique antes de citar

Este é um site médico. Toda referência nova deve ser conferida no Crossref ou no
PubMed **antes** de entrar no código — autor e título precisam bater. Isso já
evitou pelo menos um erro real: uma busca por um estudo do 20-20-20 devolveu
como primeiro resultado uma _carta ao editor_ sobre o artigo, não o artigo.

Onde a evidência for curta, fraca ou de efeito transitório, **o texto deve dizer
isso**. Não omita limitação para deixar a recomendação mais atraente.

## Rotas SSR e dados

Quase tudo é pré-renderizado. Só quatro rotas têm `export const prerender = false`:

```
src/pages/api/analytics.ts             → analytics.sqlite
src/pages/api/newsletter.ts            → newsletter.sqlite
src/pages/api/newsletter-unsubscribe.ts
src/pages/api/superficie-parceiros.ts  → superficie-partner-inquiries.sqlite
```

Em produção os bancos ficam em `/var/lib/olhossecos/`, pertencendo a `www-data`.

> **Armadilha já vivida:** um servidor de dev rodando como root abriu o
> `analytics.sqlite` e passou os arquivos para root. O serviço, que roda como
> `www-data`, perdeu a escrita e **todo evento passou a falhar com 503 por
> três dias**. Se o analytics parar de gravar, confira o dono dos arquivos antes
> de procurar bug no código.

### Analytics: a allowlist morde

`src/lib/analytics.ts` mantém `canonicalEvents` — um conjunto fechado de nomes de
evento. Qualquer `data-analytics-event` que não esteja lá é rejeitado com **422 e
descartado em silêncio**. A página não quebra e nada aparece no console.

**Ao adicionar um evento novo na marcação, adicione o nome em `canonicalEvents`
no mesmo commit.** Já aconteceu de uma seção inteira ficar sem medição por isso.

O laboratório do Reader (`/superficie/lab/**`) escreve no mesmo banco de
produção. Uma execução da suíte E2E injeta milhares de eventos de teste — leve
isso em conta antes de extrair qualquer número.

## Dois sistemas de design

O portal e a SUPERFÍCIE são visualmente distintos **de propósito**. Não misture
os tokens.

**Portal** — `src/layouts/Layout.astro`:

```css
--ink: #071d45; /* navy dos títulos */
--ink-soft: #263d61;
--teal: #087f95; /* cor de marca, única */
--teal-dark: #00657a;
```

**SUPERFÍCIE** — `src/layouts/SuperficieLayout.astro`: navy `#001a33`, papel
`#f7f4ed`, teal `#0b827f`, ouro `#d9b665`, serifa para títulos. Também define
`--surface-radius-sm/md/lg`, `--surface-lift-*` e `--surface-shadow-lg`.

A escala (tipografia, espaço, movimento) é compartilhada pelas duas frentes; o
que as separa é cor, ritmo e densidade — não o tipo da manchete.

### Componentes científicos

`src/components/science/` reúne o vocabulário editorial de evidência:

| Componente                       | Para quê                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| `ArticleSummary`                 | resumo de abertura: achado, implicação, limitações                  |
| `EvidenceCard` + `EvidenceLevel` | resultado quantitativo com desenho, amostra, grau e ressalva        |
| `ScienceCallout`                 | mensagem-chave, implicação, limitação, controvérsia, diretriz, dado |
| `MechanismScrolly`               | círculo vicioso em seis etapas, ilustração fixa                     |
| `EyeExplorer`                    | olho 3D com hotspots (Three.js sob demanda, fallback SVG)           |

`GuideSummary.limits` e `GuideEvidence.caveat` são campos obrigatórios da
estrutura de propósito: número sem a limitação ao lado vira promessa.

### Regras que não são óbvias

**Elevação no hover usa `filter`, não `box-shadow`.** O anel de foco de dois
tons já ocupa o `box-shadow`; usar a mesma propriedade nas duas faz uma esconder
a outra quando hover e foco coincidem.

**O anel de foco não fixa `border-radius`.** `outline` e `box-shadow` já seguem o
raio do elemento; fixar um valor faria o canto pular no momento do foco.

**O 3D não pode ser condição para o conteúdo.** `EyeExplorer` só busca o
Three.js quando a seção se aproxima da viewport, e não busca em WebGL ausente,
`deviceMemory < 4`, `saveData` ou 2G. A lista de estruturas é HTML com botões
que funcionam por teclado; o canvas é enfeite informativo, não a informação.

**Cuidado ao mover CSS com escopo para global.** O escopo do Astro adiciona um
atributo ao seletor, o que aumenta a especificidade. Regras que funcionavam
dentro de uma página podem perder para resets antigos ao virarem globais — foi o
que aconteceu com `.superficie-document a { color: inherit }` sobrepondo a cor
dos botões.

## Imagens

Todo o acervo é declarado em `src/lib/figures.ts` e renderizado por
`EducationalFigure.astro`. O padrão de cada figura:

```
nome.jpg              fallback, 1200px de largura
nome-760.avif/webp    e nome-1200.avif/webp
alt                   descritivo, não decorativo
caption               ensina algo — não repete o texto ao lado
disclosure            obrigatório quando gerada por IA
```

Há duas redações de divulgação, e a diferença importa:

- **esquemática** — "representação esquemática, sem escala anatômica e não é uma
  fotografia clínica"
- **com pessoas** — "cena ilustrativa com pessoas fictícias, não é fotografia de
  paciente real nem registro clínico"

Uma figura precisa ilustrar **o que a seção afirma**. Já foi descartada uma
imagem tecnicamente boa que mostrava olho fechado × olho aberto numa seção sobre
piscada completa × incompleta — o modelo leu "incompleta" como "aberta". Confira
o conceito, não só a estética.

### Marca, ícones e OpenGraph

A marca é **vetorial** (`public/favicon.svg` e `src/components/EyeMark.astro`),
em `#087f95`. Não gere logo nem favicon com IA: sairia raster, divergente do SVG
e impossível de manter.

Derivados são gerados a partir do SVG. Se a marca mudar, regenere:

```bash
# ícones: icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico
# cards OpenGraph por seção (texto em vetor, ~15 KB cada)
node scripts/build-og-cards.mjs
```

Ao mudar o título de uma página que tem card próprio, rode o script de novo.

## Deploy

> As instruções antigas de `npm run build && systemctl restart` estão **erradas**.
> O serviço não roda do repositório.

Releases são atômicos, identificados por SHA:

```bash
npm run check                      # portão completo
npm run build                      # carimba dist/BUILD_METADATA.json com o commit
npm run ops:deploy -- --source /root/olhossecos.com.br-site --sha $(git rev-parse HEAD)
```

O `ops:deploy` copia o build para `/var/www/olhossecos/releases/<sha>`, instala
dependências de produção, sobe um candidato numa porta separada, faz smoke test
em `/`, `/newsletter`, `/superficie` e `/app`, troca o symlink `current` e
reinicia o serviço — com rollback se algo falhar. A árvore precisa estar limpa e
o build precisa corresponder ao commit.

- serviço systemd: `olhossecos-astro` em `127.0.0.1:4321`, usuário `www-data`
- nginx: `/etc/nginx/sites-available/olhossecos.com.br`
- headers de segurança: `snippets/olhossecos-security-headers.conf`, incluído por
  `location /` **e** pelo bloco do laboratório

> `add_header` não é herdado entre blocos `location` irmãos. Um bloco novo que
> sirva HTML precisa incluir o snippet, senão perde CSP, HSTS e X-Frame-Options.

## Conformidade

**CFM.** Toda página que nomeia o médico deve exibir **CRM-MG 69.870 · RQE
71.903**. Nada de promessa de resultado, superlativo ou comparação com outros
serviços. Ao descrever tratamento, diga o que ele pretende e o que ainda é
incerto.

**LGPD.** Os formulários coletam consentimento explícito e linkam
`/privacidade`. Os endpoints lidam com dado pessoal: nunca registre em log nem
exponha e-mail, telefone ou nome.

**Independência editorial.** A SUPERFÍCIE separa conteúdo editorial de
publicidade. Parceria comercial não determina pauta nem conclusão clínica. Rótulo
de publicidade e disclosure são obrigatórios onde houver patrocínio.

O repositório traz a skill `skills/saraiva-vision-compliance-review` para revisar
diffs e textos contra esses critérios.

## Arquivos desatualizados no repositório

Não siga estes; descrevem um mundo que não existe mais:

- `.github/workflows/deploy.yml` e `docs/VPS-DEPLOY.md` — deploy Docker em
  `/opt/olhossecos`, abandonado
- `crontab.txt` — referencia `/api/health`, que não existe
- `tailwind.config.mjs` — Tailwind não é usado
- `docs/SANITY_INTEGRATION.md` — o CMS foi removido
- `pnpm-lock.yaml` — o gerenciador é npm

Redirects 301 preservam URLs antigas: `/blog` → `/guias`, `/exames` →
`/diagnostico`. São páginas sem conteúdo — não adicione imagem nem texto nelas.

## Convenções

- Commits em **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`),
  com corpo em português explicando **por que**, não só o quê
- Componentes em PascalCase; páginas em minúsculas com hífen
- Constantes do negócio ficam em `src/lib/` — não repita endereço, telefone ou
  credencial dentro das páginas
