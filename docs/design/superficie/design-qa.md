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
