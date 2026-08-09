# SUPERFÍCIE Reader POC — especificação visual

## Referências aceitas

- Desktop 1440 × 1000: `concept-desktop.png`.
- Mobile 390 × 844: `concept-mobile.png`.
- Marca/capa: `public/images/superficie/capa-edicao-00.png`.

Os conceitos são especificação de composição e linguagem visual. O conteúdo
clínico que aparece nas imagens geradas não será reproduzido: o POC usa apenas
texto editorial neutro, identificado como conteúdo de teste.

## Sistema visual

- Fundo do aplicativo: navy quase preto `#061725` / `#081d2d`.
- Superfícies de controles: `#0d2638`; separadores `#294253`.
- Papel: `#f7f3ea`; texto da página: `#102840`.
- Acentos: ouro `#d7ad52`, teal `#3fb5a7`.
- Highlights: amarelo `#ffd166`, verde `#63d5ad`, azul `#69aefc`, rosa `#f486a8`.
- Headings editoriais: Iowan Old Style/Palatino/Georgia.
- Chrome e controles: Inter/system sans, 13–14 px no desktop e 14–15 px no mobile.
- Controles com bordas finas, raios discretos e targets mínimos de 44 px.
- Papel com vinco central, sombra difusa e perspectiva sutil; sem espetáculo visual.

## Estrutura

Desktop: topbar; rail de miniaturas recolhível; spread central; drawer lateral;
toolbar inferior minimizável; barra de progresso. Mobile: topbar compacta;
página única; ações primárias no dock inferior; demais ações em bottom sheet.

Painéis previstos: sumário, miniaturas, busca, bookmarks, highlights, notas e
configurações. O modo texto substitui o viewport pelo artigo HTML acessível.

## Copy lock acima da dobra

- `SUPERFÍCIE`
- `PROTÓTIPO • 8 PÁGINAS`
- `4 / 8` (dinâmico)
- `Sumário`, `Miniaturas`, `Buscar`, `Zoom`, `Marcador`, `Destaques`, `Notas`,
  `Som`, `Tela cheia`, `Modo texto`, `Mais`
- `Buscar na edição`, `Copiar link desta página`, `Reduzir animações`
- `Adicionar nota`

Não adicionar métricas, marketing, conteúdo médico, badges decorativos ou
outras áreas do produto.

## Ícones

SVG outline com `currentColor`, stroke 1.7–1.9, cantos arredondados e viewBox
24 × 24. A navegação usa setas circulares; bookmark ativo é outline dourado.

## Responsividade e movimento

- Single page até tablet portrait; double page somente quando o espaço útil
  comportar duas páginas legíveis.
- Respeitar safe areas, orientação e barras móveis.
- Gestos horizontais começam apenas após limiar e não capturam seleção,
  controles, pinch nem gesto iniciado junto à borda do viewport.
- `prefers-reduced-motion` e preferência manual substituem curl por fade curto.

## Tratamento de mídia

As páginas são assets responsivos com text layer HTML sobreposta. A imagem não
recebe wash ou overlay; sombra e vinco ficam ao redor do papel. Áudio é local,
opt-in e sem autoplay.
