# Redesign editorial — agosto de 2026

Registro do redesenho do portal para uma linguagem de publicação científica:
o que foi auditado, o que mudou, o que ficou de fora e por quê.

## 1. Auditoria do que existia

| Frente     | Estado antes                                                                        | Diagnóstico                                                                                       |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tokens     | `:root` duplicado dentro de `Layout.astro`, sem escala tipográfica nem de movimento | Cada página reinventava tamanho e espaçamento com `clamp()` local                                 |
| Tipografia | Pilha do sistema em tudo; manchete caía em Iowan/Palatino/Georgia                   | Duas máquinas, dois sites — a manchete não tinha assinatura própria                               |
| Home       | Hero + trilho de público + jornadas + essenciais + SUPERFÍCIE                       | Sequência de blocos equivalentes: nenhuma matéria em destaque, nada da revista publicada aparecia |
| Guias      | Índice lateral, progresso de leitura, fontes, relacionados                          | Faltavam resumo de abertura, assinatura visível, compartilhamento e componentes de evidência      |
| Ciência    | Figuras estáticas em `figures.ts`                                                   | Nenhum mecanismo explicado por movimento; nada interativo                                         |
| Header     | Branco a 96% com blur de 14px                                                       | Estático: não reagia ao scroll nem lia como material                                              |

Os doze artigos da SUPERFÍCIE já publicados **não aparecem na home** era o
achado mais caro: conteúdo pronto, invisível para quem chega pela porta da
frente.

## 2. Camada de design system

`src/styles/tokens.css` passa a ser a fonte única de cor, tipografia, espaço,
movimento, elevação e vidro. Os nomes antigos (`--ink`, `--teal`, `--paper`…)
continuam existindo como apelidos dos tokens novos — quarenta páginas dependem
deles e migrar tudo de uma vez seria risco sem ganho editorial.

- **Cor** — navy da identidade, papel levemente quente (`--paper-50`), cinzas,
  cobre editorial, teal científico e vermelho só para alerta clínico.
- **Tipografia** — escala `--text-display` … `--text-meta`; medida de leitura em
  `--measure` (68ch).
- **Movimento** — `--duration-fast|base|slow` (150/220/300 ms) e duas curvas.
- **Vidro** — `--glass-*`, com fallback opaco declarado em `@supports not
(backdrop-filter)`.
- **Elevação** — hover usa `filter: drop-shadow` (`--lift-hover`), nunca
  `box-shadow`: o anel de foco de dois tons já ocupa essa propriedade.

### Fonte

`src/styles/fonts.css` declara a única fonte web do site: **Source Serif 4**,
subset latino, eixo de peso 400–700, **29 KB**, servida de `/fonts` (a CSP
declara `font-src 'self'`; licença em `public/fonts/OFL.txt`). Só as manchetes a
usam — o corpo de texto continua na pilha do sistema, que é o que mantém a
página pintando sem esperar download.

As duas frentes compartilham a serifada. O portal e a SUPERFÍCIE seguem
distintos pela cor, pela escala e pelo ritmo, não por terem tipos diferentes.

## 3. Componentes novos

| Componente                       | Onde                      | O que faz                                                                           |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `science/ArticleSummary.astro`   | topo dos guias            | "Resumo em 30 segundos": achado, implicação clínica e limitações                    |
| `science/EvidenceCard.astro`     | seções de guia com número | desenho do estudo, efeito, amostra, nível e a limitação ao lado                     |
| `science/EvidenceLevel.astro`    | dentro do card            | grau em cinco pontos, sempre com o rótulo escrito                                   |
| `science/ScienceCallout.astro`   | prosa                     | mensagem-chave, implicação, limitações, controvérsia, diretriz, dado epidemiológico |
| `science/MechanismScrolly.astro` | home                      | círculo vicioso em seis etapas, ilustração fixa que se transforma                   |
| `science/EyeExplorer.astro`      | home                      | olho 3D com hotspots das cinco estruturas                                           |

`GuideSummary` e `GuideEvidence` entraram em `src/lib/guides.ts`. **`limits` e
`caveat` são campos da estrutura, não opcionais de fachada**: número sem a
limitação ao lado é o tipo de leitura que o portal não publica.

Os doze guias receberam resumo. Quatro receberam bloco de evidência, todos
derivados de estudo já citado nas fontes do próprio guia.

## 4. Home

Ordem nova: hero → trilho de público → **grande matéria** → destaques dos guias
→ SUPERFÍCIE → leituras curtas → **artigos recentes da revista** → mecanismo
(scrollytelling) → anatomia 3D → essenciais → jornadas → livros →
responsabilidade editorial → newsletter.

A grande matéria é escolhida por slug, não pela ordem do array: capa é decisão
editorial e não deve mudar sozinha quando um artigo novo entrar na lista.
Nenhum artigo da edição fundadora tem imagem própria — em vez de deixar a
coluna vazia ou gerar ilustração, ela recebe a ficha da matéria (edição, data,
selo de revisão, temas), que é informação editorial de verdade.

## 5. Movimento

- **Header** — transparência reage ao scroll com histerese (entra em 24px, sai
  em 8px); sem a folga o estado piscava a cada pixel.
- **Parallax** — só no hero, só ≥900px, só sem `prefers-reduced-motion`, com
  deslocamento máximo de 36px escrito numa custom property.
- **Scrollytelling** — `IntersectionObserver` com faixa estreita no meio da
  tela. O scroll do navegador não é tocado.
- **Transições de página** — `@view-transition { navigation: auto }`, a API de
  documento cruzado. Sem router no cliente: o ciclo de vida dos scripts das
  páginas não muda, e onde o navegador não implementa a navegação continua
  instantânea.

Todo movimento contínuo tem desligamento declarado em
`@media (prefers-reduced-motion: reduce)`.

## 6. O 3D

Three.js **só é buscado quando a seção se aproxima da viewport** e não é
buscado nunca quando: não há WebGL, `deviceMemory < 4`, `saveData` está ligado
ou a conexão declara 2G. Nesses casos fica a ilustração SVG — e a lista de
estruturas é HTML de verdade, com botões que operam por teclado. O conteúdo não
depende do canvas.

Em execução: DPR limitado a 2, render sob demanda (nunca loop contínuo), loop
cancelado quando a seção sai da viewport, deriva automática desligada em
`prefers-reduced-motion` e suspensa por 6 s após interação.

Custo medido: `three.module.js` = 707 KB sem compressão, fora do caminho
inicial. Confirmar na infraestrutura que o nginx serve `.js` com brotli/gzip.

## 7. Medições

Medido em `astro preview`, desktop 1440×900:

| Métrica                  | Valor         |
| ------------------------ | ------------- |
| LCP                      | 288 ms        |
| CLS                      | 0             |
| Requisições até `load`   | 12            |
| Fonte                    | 28,4 KB       |
| Three.js antes do scroll | não carregado |

Contraste (WCAG 2.2 AA) dos pares usados em texto: cobre escuro 6,68:1 sobre
papel, teal escuro 6,68:1 sobre branco, ouro 8,52:1 sobre navy, alerta 5,84:1
sobre o bege de alerta. O cobre claro (3,53:1) ficou restrito a numeral grande
(≥24px) e a elementos que não são texto.

## 8. O que não foi feito

- **Vídeo de resumo em 60 s** nos artigos (seção 16 do briefing): não há
  material gravado. O componente não foi criado para não nascer vazio.
- **Conselho editorial** com mais de uma pessoa: o site tem um responsável
  técnico. A seção da home mostra a responsabilidade editorial declarada, não um
  conselho que não existe.
- **Tilt 3D nos cards**: descartado. Com hover-lift por `filter` e a densidade
  editorial atual, o tilt só somava ruído.
- **Vídeo de resumo em 60 s** continua pendente de gravação — é a única parte
  do briefing sem implementação possível hoje.
