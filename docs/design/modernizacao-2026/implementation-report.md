# Relatório de implementação — modernização 2026

Data: 6 de agosto de 2026

Direção: **A · Fluxo editorial compacto + progresso/seção ativa de B**

Estado: **candidato local validado; sem push e sem deploy**

## O que mudou

- A primeira dobra foi compactada com busca como ação principal, faixa de
  segurança mais enxuta e “Comece por onde você está” adaptado como lista no
  mobile.
- Guias ganharam progresso de leitura, sumário recolhível com âncoras, indicação
  de seção ativa e cabeçalho editorial compacto.
- A biblioteca mantém resultados visíveis durante a busca, recolhe filtros com
  query, anuncia o status por `aria-live` e oferece ação de limpar com retorno de
  foco.
- O menu móvel fecha com `Escape` e devolve o foco ao acionador.
- Tipografia, espaços, estados de hover/foco e microinterações foram refinados em
  Astro e CSS nativos, com respeito a `prefers-reduced-motion`.

Nenhuma dependência foi adicionada. URLs, conteúdo clínico, JSON-LD, canonical,
sitemap, IndexNow, CSP e configuração Nginx ficaram fora da alteração.

## Evidências visuais

| Página         | Antes                                   | Depois                                             |
| -------------- | --------------------------------------- | -------------------------------------------------- |
| Início mobile  | [baseline](baseline-home-mobile.png)    | [implementação](implementation-home-mobile.png)    |
| Guia mobile    | [baseline](baseline-guide-mobile.png)   | [implementação](implementation-guide-mobile.png)   |
| Busca mobile   | [baseline](baseline-search-mobile.png)  | [implementação](implementation-search-mobile.png)  |
| Início desktop | [baseline](baseline-home-desktop.png)   | [implementação](implementation-home-desktop.png)   |
| Guia desktop   | [baseline](baseline-guide-desktop.png)  | [implementação](implementation-guide-desktop.png)  |
| Busca desktop  | [baseline](baseline-search-desktop.png) | [implementação](implementation-search-desktop.png) |

O comparativo de fidelidade está em [design-qa.md](design-qa.md). Os dados brutos
estão em [baseline-metrics.json](baseline-metrics.json) e
[final-metrics.json](final-metrics.json).

## Primeira dobra e performance

Medições sintéticas locais em Chromium; valores de LCP são úteis para detectar
regressões neste candidato, mas não substituem Core Web Vitals de campo.

| Estado         | Indicador estrutural         |       Antes |    Depois | Variação |
| -------------- | ---------------------------- | ----------: | --------: | -------: |
| Início mobile  | início do conteúdo principal |   575,61 px | 421,77 px |   −26,7% |
| Guia mobile    | primeiro parágrafo           | 1.065,97 px | 488,45 px |   −54,2% |
| Busca mobile   | primeiro resultado           |   431,52 px | 397,08 px |    −8,0% |
| Início desktop | início do conteúdo principal |   740,00 px | 628,94 px |   −15,0% |
| Guia desktop   | primeiro parágrafo           |   785,23 px | 513,06 px |   −34,7% |
| Busca desktop  | primeiro resultado           |   938,94 px | 416,38 px |   −55,7% |

| Estado                  |      LCP antes |  LCP depois | CLS depois |
| ----------------------- | -------------: | ----------: | ---------: |
| Início desktop / mobile |    220 / 68 ms | 284 / 52 ms |      0 / 0 |
| Guia desktop / mobile   |    88 / 508 ms |  68 / 44 ms |      0 / 0 |
| Busca desktop / mobile  | 376 / 1.380 ms |  68 / 56 ms |      0 / 0 |

Todos os seis cenários ficaram sem overflow horizontal, com um único H1, sem
erros de console e com LCP local abaixo de 2,5 s.

## QA funcional e acessível

- Guia: sumário abre e fecha; âncora fecha o disclosure móvel, posiciona e foca o
  H2; seção ativa recebe `aria-current`; progresso chega a 100%.
- Busca: filtros começam recolhidos com query; seleção atualiza estado e rótulo;
  limpar restaura 9 guias, abre filtros e retorna foco à busca.
- Menu: abre por teclado, fecha com `Escape` e devolve foco ao botão.
- Foco: contorno teal visível nos controles; busca também sinaliza foco via
  `:focus-within`.
- Movimento: transições são removidas quando `prefers-reduced-motion` está ativo.

## Integridade técnica

- Prettier: aprovado.
- ESLint: 0 erros e 0 avisos.
- Astro Check: 32 arquivos, 0 erros, 0 avisos e 0 hints.
- Build candidato isolado:
  `build/deploy-candidate-modernizacao-20260806`, gerado em worktree destacado e
  limpo do commit de release, sem usar `dist`; o timestamp de `dist` permaneceu
  inalterado durante a validação.
- Assets de CSS e JavaScript saíram com hash de conteúdo no diretório `_astro`,
  preservando a estratégia de cache imutável do Nginx.
- `git diff --check`: aprovado.
- Rotas: 23 URLs canônicas responderam HTTP 200, todas com H1 único, canonical e
  JSON-LD.
- Tipos estruturados verificados: `MedicalWebPage` + `BreadcrumbList` em página
  clínica e `Article` + `BreadcrumbList` em guia.
- Sitemap: 23 URLs, sem barra final.

Commits incrementais:

- `5199714` — `docs: registrar conceitos visuais da modernização`
- `bd8e72e` — `docs: registrar baseline da modernização visual`
- `fe86721` — `feat: modernizar entrada e jornada inicial`
- `7b3ff09` — `feat: adicionar orientação de leitura aos guias`
- `829449c` — `feat: refinar busca e filtros dos guias`

## Riscos remanescentes

- As métricas são locais; produção ainda precisa de observação de RUM/Core Web
  Vitals após eventual deploy.
- Leitores de tela e dispositivos físicos devem complementar o QA automatizado
  antes de uma liberação ampla.
- O modo escuro não foi implementado: permanece um protótipo sujeito a revisão
  de contraste, figuras e `color-scheme`.
- O repositório já continha alterações não relacionadas em imagens educativas e
  configuração; elas foram preservadas e não fazem parte destes commits.
- Nenhum backup ou troca de serviço foi feito, pois deploy não foi autorizado.
