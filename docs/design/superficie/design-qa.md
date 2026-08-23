# SUPERFÍCIE — Design QA do Gate 3

Data: 7 de agosto de 2026

Resultado: **aprovado para revisão do Gate 3**.

## Escopo validado

- `/superficie`
- `/superficie/edicao-00`
- Viewports de referência: 1440 × 1100 e 390 × 844.
- Capturas longas adicionais: 1440 × 5000 e 390 × 9000.

## Comparação com a direção aprovada

A implementação foi comparada lado a lado com a direção “Observatório de
Evidência” (híbrido das direções 3 + 2). O resultado preserva os elementos
centrais aprovados:

- masthead navy com wordmark editorial de grande presença;
- off-white, teal e dourado como paleta secundária;
- macro biomédica no hero, com capa integrada;
- eixo vertical da Edição 00 no desktop;
- serif editorial para títulos e sans legível para navegação e corpo;
- composição modular, bastante espaço em branco e ausência de linguagem de
  venda agressiva.

Arquivo de comparação:
`docs/design/superficie/qa/reference-vs-desktop.png`.

## Ajustes realizados após inspeção

- Corrigida a largura do símbolo do portal no header compartilhado da revista.
- Reduzidos wordmark e espaçamento tipográfico em telas de até 430 px para
  evitar overflow.
- Mantidos botões e navegação com alvo mínimo de 44 px no mobile.
- Tópicos da edição foram convertidos em disclosure no mobile para evitar um
  grid comprimido.

## Estados editoriais

- Edição 00 identificada como “Em produção”, com previsão editorial e sem CTA
  de leitura ou download ativo.
- Artigos, evidências, entrevistas, autores e parceiros usam estados vazios
  explícitos; nenhum nome, artigo, patrocinador ou logo foi inventado.
- Newsletter e PDF permanecem desabilitados, com explicação textual.
- Rótulos de publicidade e patrocínio aparecem apenas como padrões de
  transparência, não como anúncios reais.

## Verificações técnicas e de acessibilidade

- Astro Check: 0 erros, 0 avisos e 0 hints.
- ESLint: aprovado.
- Build estático isolado: aprovado em
  `build/superficie-gate3-20260807`.
- Rotas locais: HTTP 200 para as duas páginas.
- Canonical, Open Graph, Twitter Card, breadcrumbs e JSON-LD verificados no
  HTML gerado.
- `prefers-reduced-motion`, skip link, foco visível, headings, labels e estados
  disabled presentes.

## Capturas

- `docs/design/superficie/qa/superficie-desktop.png`
- `docs/design/superficie/qa/superficie-mobile.png`
- `docs/design/superficie/qa/superficie-desktop-long.png`
- `docs/design/superficie/qa/superficie-mobile-long.png`
- `docs/design/superficie/qa/edicao-00-desktop.png`

## Gate 4 — template HTML de artigos

Resultado: **aprovado no QA interno para revisão do Gate 4**.

### Referências e método

- Direção-mãe aprovada: “Observatório de Evidência”.
- Conceito complementar do artigo:
  `docs/design/superficie/article-template-concept.png`.
- Render nativo comparado em 863 × 1823:
  `docs/design/superficie/qa/article-template-final-863x1823.png`.
- Comparação lado a lado:
  `docs/design/superficie/qa/article-template-concept-vs-render.png`.
- Mobile longo:
  `docs/design/superficie/qa/article-template-final-mobile-long.png`.
- Método de renderização: Chromium headless já disponível no projeto. O
  Browser/IAB não estava exposto como ferramenta de navegação; o MCP do
  Playwright não foi usado porque exigiria autorização explícita do usuário.

### Fidelity ledger

| Ponto                  | Evidência do conceito                                                     | Evidência do render                                            | Resultado                                                     |
| ---------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Masthead               | Wordmark navy central com descriptor, filete dourado, tagline e nav       | Mesma anatomia e paleta; versão compacta exclusiva dos artigos | Ajustado breakpoint para manter a navegação desktop em 863 px |
| Hero do artigo         | Breadcrumb, rótulo de prévia, categoria, título, resumo e rail de autoria | Mesma sequência e alinhamento em duas colunas                  | Escala do H1 reduzida para recuperar o balanço do conceito    |
| Tipografia             | Serif editorial nos títulos; sans precisa nos metadados                   | Mesma divisão tipográfica com corpo ampliado para leitura real | Fiel, com desvio intencional de legibilidade                  |
| Estrutura longa        | Sumário lateral e quatro blocos numerados                                 | Sumário sticky, numeração 01–04 e coluna editorial             | Fiel                                                          |
| Evidência e limitações | Bandas editoriais distintas, teal e dourado                               | Painéis planos com borda teal/dourada, sem cards arredondados  | Fiel                                                          |
| Transparência          | Referências e disclosures ao final                                        | Seções próprias, sempre disponíveis no modelo                  | Fiel                                                          |
| Mobile                 | Continuação em uma coluna e hierarquia preservada                         | 390 px sem overflow, conteúdo, referências e footer completos  | Fiel                                                          |

### Copy diff acima da dobra

O rótulo de prévia, a categoria, o título, o subtítulo, o resumo, a autoria e o
tempo de leitura coincidem com a lista aprovada para o modelo. Não foi
adicionada alegação clínica, data de publicação, convidado, parceiro ou
patrocinador.

### Desvios intencionais

- O conceito ilustra download e compartilhamento; esses controles não foram
  implementados porque o modelo está em prévia e não há PDF publicado.
- “Leia também” só é renderizado quando existem artigos publicados com relação
  semântica positiva. O sistema não preenche a área aleatoriamente.
- O corpo usa tamanho maior que a prancha comprimida para assegurar leitura em
  produção e WCAG 2.2 AA.
- A rota de prévia é `noindex` no desenvolvimento e não é gerada no build de
  produção.

Não restam divergências materiais corrigíveis entre o sistema aprovado e o
template implementado. A implementação foi verificada fielmente contra a
direção aceita, com as exceções editoriais acima deliberadamente preservadas.

## Gate 5 — newsletter e parceiros

Resultado: **aprovado no QA interno para revisão do Gate 5**.

### Referências e método

- Direção aceita: “Observatório de Evidência”.
- Wireframe desktop aprovado: 725 × 2167 px em
  `/root/.codex/generated_images/019fdcba-a518-7861-9292-baa3142f7cbc/exec-bc481338-44d3-46ec-9ede-327b4b8cd91c.png`.
- Wireframe mobile aprovado: 720 × 2183 px em
  `/root/.codex/generated_images/019fdcba-a518-7861-9292-baa3142f7cbc/exec-f44d29cf-94e2-4c5a-b67c-47795ff54688.png`.
- Renderização atual em desktop real de 1280 px e mobile real de 390 px:
  `docs/design/superficie/qa/gate5/`.
- O Browser/IAB não estava exposto. Foi usado Chromium headless, já disponível
  no ambiente, sem Playwright, com inspeção posterior das referências e dos
  renders no `view_image`.
- As pranchas aprovadas são composições verticais, não viewports reais. Por
  isso, seus tamanhos nativos foram inspecionados, mas a responsividade foi
  validada nos viewports reais de 1280 e 390 px.

### Fidelity ledger

| Ponto                 | Evidência aprovada                                    | Evidência do render                                              | Resultado |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- | --------- |
| Banda da newsletter   | Fundo navy, título serifado e formulário claro        | Mesma divisão em duas colunas e mesmo contraste                  | Fiel      |
| Conversão principal   | E-mail como primeiro campo e CTA teal                 | Cadastro inicial exige somente e-mail e consentimento            | Fiel      |
| Progressive profiling | Perfil profissional somente depois do cadastro        | Painel opcional é revelado após sucesso e aceita sete perfis     | Fiel      |
| Hierarquia comercial  | Parcerias abaixo da independência e com dois CTAs     | “Conheça as oportunidades” e “Solicitar mídia kit” preservados   | Fiel      |
| Tipografia e paleta   | Serif editorial, sans de interface, navy/teal/dourado | Tokens e famílias da SUPERFÍCIE reutilizados sem novo tema       | Fiel      |
| Mobile                | Formulários em coluna única e CTAs largos             | 390 px sem overflow; alvos e controles com 44 px ou mais         | Fiel      |
| Transparência         | Publicidade e parceria separadas do editorial         | Página pública não exibe logos, preços nem promessa de conclusão | Fiel      |

### Copy diff e desvios intencionais

- O título “Receba a SUPERFÍCIE”, o texto de benefício, “Quero receber”,
  “Conheça as oportunidades de parceria” e “Solicitar mídia kit” coincidem com
  a arquitetura aprovada.
- O formulário acrescenta somente o texto de consentimento necessário e a
  etapa opcional de identificação prevista no briefing.
- O ícone decorativo de envelope do wireframe não foi reproduzido; o Gate 3 já
  havia aprovado a banda sem esse ativo, e não foi criado desenho aproximado em
  CSS ou SVG.
- A rota `/superficie/parceiros` é uma extensão funcional solicitada no
  briefing. Como o wireframe mostrava apenas seu ponto de entrada, a página
  reutiliza estritamente os tokens, tipografia, bandas e componentes já
  aprovados.
- O mídia kit privado não é exposto diretamente. A página registra uma
  solicitação para avaliação, conforme o gate comercial vigente.

### Interações e validação

- Cadastro inicial, atualização do perfil opcional e solicitação de mídia kit
  foram executados contra o build de produção com bancos temporários: respostas
  HTTP 201, 200 e 201.
- Eventos preparados: `newsletter_signup`, `newsletter_profile_complete`,
  `partner_click`, `media_kit_click`, `partner_page_view` e
  `partner_lead_submit`.
- UTMs são preservadas no evento de visualização e nas bases de aquisição.
- Formulários têm labels, estados de envio, `aria-live`, foco visível,
  honeypots, consentimento e mensagens de erro sem exposição de dados.

Não restam divergências materiais corrigíveis no escopo aprovado. A home foi
verificada fielmente contra os wireframes; a página de parceiros foi verificada
como extensão coerente e funcional do mesmo sistema editorial.

## Gate 6 — QA final consolidado

Resultado: **QA funcional e visual aprovado, sem deploy**.

- Build isolado: `build/superficie-gate6-20260808`.
- Evidências visuais finais: `docs/design/superficie/qa/gate6/`.
- Relatório obrigatório do handoff: `design-qa.md` na raiz do projeto, com
  `final result: passed`.
- Lighthouse final nas três rotas, em mobile e desktop: acessibilidade, boas
  práticas e SEO em 100; performance entre 99 e 100.
- Foram corrigidos contrastes abaixo de AA em textos auxiliares, numerações e
  CTA da página de parceiros. A auditoria final de contraste passou em todas as
  rotas.
- A data estruturada da página de parceiros foi corrigida para 08/08/2026.
- A navegação foi exercitada em 320, 375, 390, 768, 1024 e 1440 px, sem overflow
  horizontal, imagens quebradas ou controles sem rótulo.
- Menu mobile, newsletter em duas etapas e solicitação comercial foram
  executados em navegador, com eventos de analytics e console limpo.
- O artigo-modelo permaneceu ausente do build público e do sitemap.
- Na preparação do release, o lockfile estabilizado passou a resolver
  `nanoid 3.3.18`; as auditorias completa e de produção retornaram zero
  vulnerabilidades em 08/08/2026.

Não houve deploy, publicação editorial, compartilhamento do mídia kit ou
contato externo.
