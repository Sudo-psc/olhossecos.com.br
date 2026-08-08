# Design QA — SUPERFÍCIE — Gate 6

## Artefatos comparados

- Verdade visual desktop: `/root/.codex/generated_images/019fdcba-a518-7861-9292-baa3142f7cbc/exec-bc481338-44d3-46ec-9ede-327b4b8cd91c.png` (725 × 2167 px).
- Verdade visual mobile: `/root/.codex/generated_images/019fdcba-a518-7861-9292-baa3142f7cbc/exec-f44d29cf-94e2-4c5a-b67c-47795ff54688.png` (720 × 2183 px).
- Render desktop da home: `docs/design/superficie/qa/gate6/home-1440.png` (1440 × 8981 px).
- Render mobile da home: `docs/design/superficie/qa/gate6/home-390.png` (390 × 11198 px).
- Renders adicionais: `docs/design/superficie/qa/gate6/edicao-1440.png`, `edicao-390.png`, `parceiros-1440.png` e `parceiros-390.png`.
- Build verificado: `build/superficie-gate6-20260808`.

## Normalização e estado

- Estado: pré-lançamento real, com a Edição Fundadora marcada como “Em produção”, artigos e convidados sem dados inventados, PDF indisponível e mídia kit condicionado à avaliação.
- CSS viewport: 1440 px e 390 px, `deviceScaleFactor: 1`; validação estrutural adicional em 320, 375, 768 e 1024 px.
- As pranchas aprovadas são composições verticais comprimidas, não capturas de um viewport real. A comparação foi normalizada por regiões, hierarquia e ordem editorial, sem alegar equivalência pixel a pixel.
- O Browser/IAB não estava disponível. A implementação foi renderizada em Chromium headless já instalado; Playwright não foi usado.

## Evidência de comparação

- A referência desktop e o render desktop, assim como a referência mobile e o render mobile, foram abertos no mesmo input de comparação em resolução original.
- A composição preserva masthead navy, wordmark dominante, hero científico, edição fundadora, curadoria, evidência, entrevistas, tecnologia, newsletter, independência, parceiros, sobre e ecossistema.
- Tipografia: serif editorial em títulos, sans em interface e metadados, hierarquia e quebras consistentes com a direção aprovada.
- Ritmo e layout: alternância entre papel e navy, grids amplos no desktop e coluna única sem compressão no mobile.
- Cores e tokens: navy, off-white, teal e dourado preservados; tons de texto e numeração foram escurecidos somente para contraste AA.
- Imagens: macro ocular e capa final permanecem nítidas, responsivas e sem falhas de carregamento; não foram adicionados logos ou ativos simulados.
- Copy: linguagem de pré-lançamento, estados vazios e separação editorial/comercial permanecem honestos.
- Não foi necessário recorte focal adicional: os arquivos foram abertos em resolução original e os elementos críticos — masthead, hero, formulários, numerações, CTAs e rodapé — ficaram legíveis nessa comparação. Os formulários também foram inspecionados em capturas dedicadas das páginas completas.

## Histórico de iterações P0–P2

1. P1 — contraste abaixo de WCAG 2.2 AA em textos auxiliares e números decorativos nas três rotas.
   - Evidência inicial: Lighthouse marcou `color-contrast` como falha; acessibilidade ficou entre 93 e 96.
   - Correção: `--surface-muted` foi escurecido em superfícies claras; textos sobre navy usam `--surface-muted-on-dark`; dourados pequenos receberam variante mais escura; números decorativos ganharam contraste mínimo; o CTA primário de parceiros passou a teal escuro; o link de privacidade do formulário recebeu sublinhado.
   - Evidência pós-fix: Lighthouse final em mobile e desktop marcou 100 em acessibilidade, boas práticas e SEO nas três rotas.
2. P2 — data de publicação da página de parceiros herdava o valor da home.
   - Evidência inicial: o teste do build esperava `2026-08-08` e recebeu `2026-08-07` no JSON-LD.
   - Correção: a rota define explicitamente `datePublished="2026-08-08"`.
   - Evidência pós-fix: auditoria do build passou com canonical, schema e datas corretas.

## Interações e integridade

- Menu mobile: abre por clique, fecha por `Escape`, atualiza `aria-expanded` e devolve foco ao botão.
- Newsletter: cadastro inicial, revelação do perfil opcional e conclusão do perfil foram executados; eventos `newsletter_signup` e `newsletter_profile_complete` foram observados.
- Parceiros: solicitação completa foi executada; `partner_lead_submit` foi observado.
- Console: sem exceções, erros ou warnings da página nas rotas e larguras auditadas.
- Layout: nenhum overflow horizontal em 320, 375, 390, 768, 1024 e 1440 px; controles rotulados e imagens carregadas.
- Lighthouse final: home 99–100 em performance e 100 nas demais categorias; Edição 00 e Parceiros, 100/100/100/100 em mobile e desktop.

## Achados remanescentes

Não restam achados P0, P1 ou P2. A diferença de densidade entre o wireframe comprimido e o produto longo é intencional: a implementação privilegia leitura, estados editoriais verdadeiros e formulários funcionais.

Na preparação do release, o lockfile estabilizado passou a resolver
`nanoid 3.3.18`. As auditorias completa e de produção retornaram zero
vulnerabilidades em 08/08/2026.

final result: passed
