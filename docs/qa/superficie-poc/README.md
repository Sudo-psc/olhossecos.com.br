# SUPERFÍCIE Reader POC — relatório de QA

Data da execução: 08/08/2026. Ambiente: worktree local na branch
`feature/superficie-flipbook-poc`; nenhuma alteração foi publicada ou aplicada
em produção.

## Arquitetura validada

- Implementação nativa em Astro 7 + TypeScript, sem React ou microfrontend.
- Rota isolada e não indexada: `/superficie/lab/flipbook`.
- Contrato `IssueManifest` validado antes de montar a edição.
- Page-turn encapsulado por `PageTurnAdapter`; `page-flip` só é importado em
  `reader/engines/` e é carregado em chunk dinâmico.
- Fallback em cadeia: StPageFlip → adapter simples → modo texto → PDF.
- Imagem responsiva e text layer JSON separados por página; somente a janela
  `currentPage ± 2` recebe imagens e texto no DOM. Páginas que saem da janela
  são desidratadas, inclusive quando a leitura avança até o fim da edição.
- Índice de busca carregado apenas quando a busca é aberta.
- Artigos HTML são sanitizados por allowlist antes de entrarem no modo texto;
  o sanitizador também é carregado sob demanda, fora do bundle crítico.
- Progresso, preferências, bookmarks, highlights e notas em IndexedDB por meio
  de `ReaderStorage`; fallback volátil mantém o reader funcional se a API local
  falhar.
- Analytics usa o coletor existente por meio de `ReaderAnalytics`. Texto de
  busca, seleção e notas não é enviado.

## Dependências auditadas

| Pacote                    | Escopo          | Licença / decisão                                                                                                                |
| ------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `page-flip@2.0.7`         | runtime         | MIT, sem dependências; 45,5 kB minificado no chunk atual. Último release antigo, portanto mantido atrás de adapter substituível. |
| `dompurify@3.4.13`        | runtime         | Apache-2.0/MPL-2.0; sanitiza artigos HTML por allowlist e fica em chunk dinâmico de 27,4 kB raw.                                 |
| `@playwright/test@1.55.1` | desenvolvimento | Apache-2.0; E2E e matriz de navegadores.                                                                                         |
| `fake-indexeddb@6.0.1`    | desenvolvimento | Apache-2.0; testes Node da persistência.                                                                                         |
| `sharp@0.35.3`            | desenvolvimento | Apache-2.0; gera WebPs do conteúdo de teste.                                                                                     |

`npm audit --omit=optional` retornou zero vulnerabilidades. Não foi adicionada
uma segunda biblioteca de flip, storage, busca ou UI.

## Gestos e mobile

- A biblioteca usa `mobileScrollSupport: true`; o reader declara `pan-y` e
  preserva scroll vertical e o gesto de navegação do sistema.
- Pinch não é reimplementado: permanece o zoom nativo do navegador, com
  viewport que não bloqueia escala.
- A text layer recebe pointer events somente nos blocos de texto. Assim, o
  arraste em texto cria seleção real e o arraste nas margens continua virando
  a página.
- O fallback reduced-motion usa pointer events apenas para swipe horizontal,
  exige 48 px de deslocamento, rejeita movimento predominantemente vertical e
  não navega quando há seleção de texto.
- iPad portrait e mobile montam página única. Desktop e tablet landscape usam
  spread quando o espaço útil do stage comporta duas páginas.
- Som é opt-in, volume 0,14, e não toca em saltos de busca, sumário, miniaturas
  ou input de página.

## Testes executados

- Node: 67 testes, 67 aprovados.
- E2E: 107 testes aprovados e 8 repetições intencionalmente ignoradas em 115
  execuções. A mesma suíte funcional passou em Chromium, Firefox, WebKit,
  iPhone 13 emulado e Pixel 7 emulado.
- O E2E cobre o fluxo crítico persistente, deep link, modo texto, seleção real
  por arraste, highlights, bookmarks, notas, zoom, virtualização, sanitização,
  degradação local de manifest/text layer/search inválidos, analytics, share,
  headers anti-indexação, troca de reduced-motion durante a sessão e foco dos
  painéis. Também valida persistência sem page turn, troca entre múltiplos
  artigos, respostas concorrentes de artigos e text layers, toolbar minimizada e
  fallback de fullscreen.
- Em Chromium, há cobertura adicional das larguras 320, 375, 390, 768, 1024 e
  1440 px, sem overflow horizontal, além do arraste visual do page turn.
- Build Astro: 0 erros, 0 warnings e 0 hints.
- ESLint: aprovado.
- Release routes: aprovado; a rota lab não aparece no sitemap.
- Console E2E e Lighthouse: sem erros críticos, promises rejeitadas ou 404.

Navegadores proprietários não disponíveis neste ambiente: Safari real no macOS
e iOS, Edge instalado e Chrome Android em aparelho físico. WebKit e Chromium
emulados passaram, mas esses três alvos continuam sendo uma etapa de homologação
humana antes de qualquer decisão de produção.

## Lighthouse e peso

Medição no build de produção servido localmente, com Lighthouse 13.4.1:

| Perfil  | Performance | Acessibilidade | Boas práticas | SEO |    LCP | CLS |   TBT | Transferência |
| ------- | ----------: | -------------: | ------------: | --: | -----: | --: | ----: | ------------: |
| desktop |         100 |            100 |           100 |  66 | 0,59 s |   0 |  0 ms |       271 KiB |
| mobile  |          97 |            100 |           100 |  66 | 2,55 s |   0 | 11 ms |       216 KiB |

O score SEO 66 é intencional: o POC usa `noindex,nofollow,noarchive` e foi
removido do sitemap. Lighthouse de laboratório não fornece INP sem dados reais;
TBT ficou entre 0 e 11 ms como proxy de bloqueio. Os JSONs completos estão neste
diretório.

Assets editoriais do POC: 846.269 bytes. O HTML possui 14.077 bytes raw. Os
chunks raw do reader são: controller 43,4 kB, page-turn 44,8 kB e sanitizador
27,4 kB; page-turn e sanitizador são carregados dinamicamente. O transfer
inicial medido inclui 93.753 bytes de JavaScript e somente a janela de imagens
virtualizada, não as oito páginas em resolução máxima.

## Screenshots

`screenshots/` contém:

- desktop: capa, dupla, page turn, busca, highlight e fullscreen;
- mobile: capa, toolbar, busca e highlight;
- tablet: portrait e landscape.

## Limitações e decisão

- O PDF é um fallback de teste; não representa a Edição Fundadora.
- Os sons são síntese procedural CC0, não áudio final de marca.
- Persistência não sincroniza entre dispositivos e não há login/offline completo.
- Zoom por pinch é nativo; o POC não implementa viewport pan/zoom customizado.
- A biblioteca de curl está sem release recente e precisa de homologação em
  Safari físico; o adapter reduz o custo de substituição.
- Os arquivos públicos do POC recebem `X-Robots-Tag` no servidor local e há
  regras versionadas em `_headers`, mas o Nginx atual não consome esse formato.
  Um preview remoto precisa espelhar essas regras na configuração do Nginx.
- Dados persistidos ficam somente no navegador, sem UI de limpeza exclusiva da
  edição neste POC; a política de dados do engine de produção deve incluir esse
  controle.
- Não existe URL pública de preview nesta infraestrutura. O preview aprovado é
  local em `http://127.0.0.1:4328/superficie/lab/flipbook`.

Recomendação: **Revise** antes de promover ao engine de produção. A arquitetura e
o POC são tecnicamente viáveis; a promoção depende de QA em aparelhos Safari/
Edge reais, validação editorial do visual e decisão sobre manutenção ou troca do
page-turn engine.

## Revisão de 04/09/2026

Segunda revisão, agora sobre a Edição 00 já sem páginas publicitárias (27
páginas de 1400 × 1867) e sobre o engine reescrito com `size: "fixed"` mais
`fit-page.ts`. Medições em 320, 375, 768, 1024, 1366, 1440 e 1920 px.

Quatro defeitos encontrados e corrigidos:

- **Zoom não fazia nada no engine padrão.** `applyZoom` calculava a caixa e
  chamava `fitToAvailable`, que guardava os valores e remontava; a primeira
  linha de `mount()` era `measureFit()`, que remedia o palco e sobrescrevia os
  dois. Os quatro ajustes davam a mesma página de 533 px. O adapter passou a
  honrar um `requestedSize`, e `.reader-stage` só rola quando a ampliação
  ultrapassa o palco (`data-zoom-overflow`), com margens automáticas para que a
  borda esquerda continue alcançável.
- **A camada de texto sumia quando o engine montava.** `upgradeToPageFlip`
  recriava as páginas e chamava apenas `hydrateImages`: 54 blocos
  selecionáveis viravam zero e só voltavam ao virar a página. Quem abria o
  leitor não conseguia selecionar, destacar nem anotar. As duas montagens
  passam a chamar `hydrateWindow`, que também carrega as imagens da janela.
- **Proporção fixa em A4.** `A4_PAGE_RATIO` é 990/700 = 1,4143, mas as placas
  são 1400 × 1867 = 1,3336. Com `object-fit: contain` não cortava mais, e sim
  deixava faixas vazias de cerca de 6%. O manifest passou a declarar
  `pageSize` (validado); `fitA4Page` aceita a proporção e o CSS a recebe em
  `--reader-page-ratio`.
- **Cabeçalho e toolbar no móvel.** Em 320 e 375 px o subtítulo quebrava em
  duas linhas e cruzava a barra de progresso, porque a regra móvel perdia em
  especificidade para `.reader-brand small:not([hidden])`. Os rótulos da
  toolbar colidiam em seis pares nas três larguras móveis, e entre 761 e
  1100 px a barra transbordava sem rolagem. A toolbar agora rola em qualquer
  largura, com rótulos em `nowrap`.

Ao corrigir o zoom apareceu uma regressão intermediária: com o palco limitado
pela altura, página única e dupla chegam à mesma largura por página, então a
comparação de tamanho fazia o engine ficar preso em uma página no desktop. O
adapter passou a guardar o modo com que montou, e o controlador define o modo
antes de montar.

Testes: 241 unitários e 30 E2E em Chromium, todos aprovados; `npm run check`
limpo. A suíte do leitor ganhou o bloqueio do Tag Manager (os eventos `gtm.*`
eram recusados com 422 e sujavam o console), um seletor qualificado para a
navegação — a barra de restauração repete `data-action="next"` — e três casos
novos: zoom que muda de tamanho de verdade nas duas engines, camada de texto
que sobrevive à montagem e proporção conferida contra o manifest. O caso de
zoom já falhava antes destas correções, porque media um `transform` que o
modelo atual não usa mais.
