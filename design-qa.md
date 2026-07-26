# Design QA — hero mobile da página inicial

## Evidências

- Fonte visual: `docs/audit-2026-07-26-ux/12-concept-combined-search-editorial.png`
- Fonte normalizada: `docs/audit-2026-07-26-ux/12-concept-combined-normalized.png`
- Implementação final:
  `docs/audit-2026-07-26-ux/18-implementation-mobile-final.png`
- Comparação final:
  `docs/audit-2026-07-26-ux/19-comparison-mobile-final.png`
- Rota: `/`
- Estado: tema claro, viewport inicial, menu fechado e busca vazia
- Viewport CSS: 390 × 844
- `deviceScaleFactor`: 1
- Fonte original: 853 × 1844
- Fonte normalizada: 390 × 844
- Implementação: 390 × 844

A fonte foi reduzida e recortada centralmente para o mesmo tamanho da captura
do navegador. A comparação usa duas imagens 390 × 844 colocadas lado a lado,
sem browser chrome.

## Findings

Não restam diferenças P0, P1 ou P2 acionáveis.

### Fontes e tipografia

- O H1 mantém a família serifada editorial, peso, hierarquia, três linhas e
  proporção visual da referência.
- Corpo, rótulos, busca, chips e segurança usam a família sans-serif e os pesos
  já adotados pelo portal.
- O placeholder aparece integralmente no viewport de 390 px.
- Diferença aceita: a referência gerada usa aproximações rasterizadas das
  fontes; a implementação usa os tokens reais do projeto.

### Espaçamento e ritmo

- Ordem, alinhamento e agrupamento correspondem à referência: cabeçalho, H1,
  resumo, busca, sugestões, alerta e link secundário.
- Margens laterais seguem o `page-shell` existente e os alvos interativos
  mantêm no mínimo 44 px.
- O conteúdo seguinte começa discretamente no fim da captura; isso preserva a
  continuidade da página real e é classificado como diferença P3 aceitável.

### Cores e tokens

- Azul profundo, teal, branco, linhas e coral de segurança usam os tokens
  existentes.
- A implementação preserva superfícies planas, sem introduzir gradientes ou
  sombras não usados pelo produto.
- Contraste e separação semântica do alerta permanecem consistentes.

### Imagem e assets

- O resumo reutiliza a ilustração editorial real do filme lacrimal, servida em
  AVIF/WebP com fallback PNG.
- O recorte, assunto, nitidez e tratamento de fundo correspondem à direção
  visual; não há placeholders ou arte recriada em CSS.
- Logo, busca, menu, seta e sino reutilizam os assets e ícones existentes.
- Diferença P3 aceita: ícones meramente decorativos dos chips e das duas frases
  do mock não foram adicionados para evitar uma nova dependência de ícones.

### Copy e conteúdo

- Textos principais correspondem à direção aprovada:
  “Entenda seus sintomas com clareza”, as duas frases educativas, placeholder,
  sugestões, faixa de segurança e link secundário.
- A busca continua sem coleta de dados e encaminha para a biblioteca local.

### Interação, responsividade e acessibilidade

- Busca, botão, três sugestões e links são controles funcionais.
- O link “Lentes de contato” foi testado até o estado filtrado da biblioteca,
  incluindo atualização do status acessível.
- Não houve erro de console ou `pageerror`.
- Não houve overflow horizontal em 320, 375, 390, 430, 720 ou 1024 px.
- Campo com rótulo acessível, imagem decorativa com `alt=""`, foco global
  visível e alvos de toque preservados.
- A composição desktop de 1440 × 1000 permaneceu visualmente intacta.

## Histórico de comparação

### Rodada 1

- Evidência: `docs/audit-2026-07-26-ux/15-comparison-mobile-v1.png`
- [P1] O placeholder terminava cortado.
- [P2] H1 menor que a referência.
- [P2] O link secundário ficou incorporado à superfície coral.
- Correções: redistribuição do campo e botão, aumento do H1 e separação do link
  em superfície branca.

### Rodada 2

- Evidência: `docs/audit-2026-07-26-ux/17-comparison-mobile-v2.png`
- [P2] O recorte da ilustração ocupava largura excessiva.
- [P2] As frases educativas tinham peso maior que o necessário.
- [P3] Linha coral permanecia abaixo do link secundário.
- Correções: coluna visual reduzida para 126 px, peso tipográfico suavizado e
  borda inferior removida no mobile.

### Rodada final

- Evidência: `docs/audit-2026-07-26-ux/19-comparison-mobile-final.png`
- Nenhuma diferença P0, P1 ou P2 permanece.

## Open Questions

Nenhuma.

## Implementation Checklist

- [x] Hero mobile fiel à direção selecionada.
- [x] Busca e sugestões funcionais.
- [x] Segurança visível antes da rolagem.
- [x] Desktop preservado.
- [x] Lint e build aprovados.
- [x] Interações, console e overflow verificados em Chromium.

## Follow-up Polish

- P3: avaliar uma biblioteca de ícones já compatível com Astro antes de
  acrescentar ícones decorativos aos chips.

final result: passed
