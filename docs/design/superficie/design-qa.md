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
