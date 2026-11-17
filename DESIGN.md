---
version: alpha
name: Olhos Secos
description: Sistema de design do portal olhossecos.com.br — paleta navy/teal/paper do portal e paleta própria da SUPERFÍCIE, extraído de src/styles/tokens.css e dos layouts Astro, conferido no CSS público de 17/11/2026.
colors:
  primary: "#071d45"
  on-primary: "#ffffff"
  secondary: "#087f95"
  tertiary: "#6f461e"
  navy-900: "#04142f"
  navy-800: "#071d45"
  navy-700: "#12305e"
  navy-600: "#263d61"
  navy-400: "#405168"
  navy-300: "#8fa3bd"
  paper-0: "#ffffff"
  paper-50: "#fbfaf7"
  paper-100: "#f5f2ec"
  paper-200: "#ece8df"
  teal-700: "#00576a"
  teal-600: "#087f95"
  teal-100: "#dff3f7"
  teal-50: "#eff8fb"
  copper-700: "#6f461e"
  copper-600: "#9a6430"
  copper-500: "#b07a3f"
  copper-100: "#f3e8dc"
  gold-text: "#8a6516"
  error: "#8b3129"
  error-emphasis: "#e95f4f"
  error-container: "#fff6f3"
  line-strong: "#b8c7d6"
  line: "#d3dbe4"
  line-soft: "#e6e4dd"
  surface: "#ffffff"
  surface-subtle: "#fbfaf7"
  on-surface: "#071d45"
  on-surface-soft: "#263d61"
  surface-inverse: "#071d45"
  surface-inverse-strong: "#04142f"
  on-inverse: "#ffffff"
  on-inverse-soft: "rgb(255 255 255 / 76%)"
  on-inverse-muted: "rgb(255 255 255 / 60%)"
  on-inverse-line: "rgb(255 255 255 / 22%)"
  on-inverse-accent: "#78d7e5"
  glow-teal: "rgb(8 127 149 / 14%)"
  glow-copper: "rgb(176 122 63 / 11%)"
  selection-bg: "#cceef4"
  focus-ring: "#087f95"
  focus-ring-contrast: "#04142f"
  ink-on-dark: "#e8eef8"
  ink-soft-on-dark: "#b8c7dc"
  paper-0-on-dark: "#0c1628"
  paper-50-on-dark: "#0f1a2e"
  teal-on-dark: "#4eb8c9"
  line-on-dark: "#2a3d54"
  copper-700-on-dark: "#e0b07a"
  gold-text-on-dark: "#e0c07a"
  surface-navy: "#001a33"
  surface-navy-deep: "#001326"
  surface-paper: "#f7f4ed"
  surface-white: "#fffdf8"
  surface-ink: "#09223c"
  surface-copy: "#263c50"
  surface-muted: "#455461"
  surface-teal: "#0b827f"
  surface-teal-dark: "#055c5a"
  surface-gold: "#b98a36"
  surface-gold-text: "#694e1f"
  surface-gold-light: "#d9b665"
  surface-line: "#d8d3c7"
typography:
  headline-display:
    fontFamily: Source Serif 4 Var
    fontSize: 4rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: Source Serif 4 Var
    fontSize: 3.5rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.035em
  headline-md:
    fontFamily: Source Serif 4 Var
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.035em
  headline-sm:
    fontFamily: Source Serif 4 Var
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.035em
  body-lg:
    fontFamily: system-ui
    fontSize: 1.3125rem
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: system-ui
    fontSize: 1.1875rem
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: system-ui
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.65
  label-sm:
    fontFamily: system-ui
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0.14em
rounded:
  sm: 6px
  md: 10px
  lg: 18px
  control: 6px
spacing:
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  6: 1.5rem
  8: 2rem
  12: 3rem
  16: 4rem
  24: 6rem
  article-column: 720px
components:
  button-primary:
    backgroundColor: "{colors.teal-700}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 0.9rem
    height: 54px
  button-primary-hover:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
  header-cta:
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 1rem
    height: 44px
  header-cta-hover:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
  superficie-button-primary:
    backgroundColor: "{colors.surface-gold-light}"
    textColor: "{colors.surface-navy}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 0.78rem
    height: 48px
---

# DESIGN.md — Olhos Secos

Valores normativos estão nos tokens YAML. A prosa explica o uso. Nenhuma cor, fonte ou medida foi inventada: tudo veio de `src/styles/tokens.css`, `src/styles/fonts.css`, `src/layouts/Layout.astro` e `src/layouts/SuperficieLayout.astro` (branch `master`, tip `fb3afa3`; o artefato de deploy no KVM2 cita o SHA `6ff7dce`). Conferido no CSS público `Layout.Dv5pXvwv.css` em 17/11/2026 (America/Sao_Paulo). O `tailwind.config.mjs` do repositório é resquício e **não** é o sistema de design.

A spec DESIGN.md exige títulos de seção e chaves YAML em inglês. A prosa está em português, língua do produto e da equipe. A chave `version: alpha` é a versão do formato, não a do CLI `@google/design.md` (0.4.0).

## Overview

Portal editorial de olho seco e superfície ocular. Duas identidades convivem no mesmo domínio, com a mesma escala de tipo, espaço e movimento:

- **Portal** (páginas gerais, paciente, profissional): navy profundo, papel quente e teal de ação. Sensação de publicação científica acessível, não de clínica de conversão.
- **SUPERFÍCIE** (`/superficie`): paleta própria, mais noturna e dourada (`surface-navy`, `surface-paper`, `surface-gold`), documentada abaixo. Herda tipografia, ritmo e raios do portal.

O corpo de texto usa a pilha do sistema (`ui-sans-serif`, `system-ui`); só as manchetes baixam a Source Serif 4 variável (peso 400–700, ~29 KB, `font-src 'self'`). Isso é deliberado: a página pinta sem esperar fonte.

Há tema claro (padrão) e tema escuro (`[data-theme="dark"]` ou `prefers-color-scheme: dark` quando não há `data-theme="light"`). Os tokens `*-on-dark` existem no `:root` o tempo todo; o media query só remapeia os semânticos.

## Colors

A paleta do portal parte do navy `--navy-800` / `--ink` (`#071d45`), que também é o `theme-color` da home no ar. O teal `--teal-700` (`#00576a`) é a cor do botão cheio; `--teal-600` (`#087f95`) é o anel de foco (4,68:1 no branco). O cobre `--copper-700` (`#6f461e`) é o único cobre aprovado para texto (7:1 sobre fundos claros do portal); `--copper-600` e `--copper-500` são só fio, borda e fundo. `--gold-text` (`#8a6516`) existe para rótulo pequeno dourado com AA.

Apelidos históricos (`--ink`, `--teal`, `--paper`, `--coral`) apontam para os tokens novos e devem continuar sendo usados assim.

**SUPERFÍCIE** (só nesta frente): `--surface-navy` `#001a33`, `--surface-paper` `#f7f4ed`, `--surface-ink` `#09223c`, `--surface-teal` `#0b827f`, `--surface-gold` `#b98a36` (marca, sem exigência de contraste), `--surface-gold-text` `#694e1f` e `--surface-gold-light` `#d9b665`. O anel de foco da SUPERFÍCIE é `#d9b665` com contraste `#001a33`.

Tokens com alfa (`on-inverse-soft`, `glow-teal`, vidro) vieram do fonte; no CSS minificado no ar aparecem como hex de 8 dígitos equivalentes (`#ffffffc2`, etc.).

## Typography

A única webfont é `"Source Serif 4 Var"`, com fallback `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`. O corpo é `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Há também `--mono` para código.

A escala no CSS é fluida (`clamp`). A spec só aceita `px`/`em`/`rem` no token `fontSize`, então os tokens acima usam o **teto desktop** da escala. Os valores literais do fonte, que devem ser implementados, são:

- `--text-display`: `clamp(2.5rem, 1.6rem + 3.6vw, 4rem)`
- `--text-h1`: `clamp(2.25rem, 1.55rem + 2.8vw, 3.5rem)` — classe `.page-title`
- `--text-h2`: `clamp(1.75rem, 1.35rem + 1.6vw, 2.5rem)` — classe `.section-heading`
- `--text-h3`: `clamp(1.3rem, 1.15rem + 0.6vw, 1.75rem)`
- `--text-lead`: `clamp(1.125rem, 1.05rem + 0.4vw, 1.3125rem)`
- `--text-body`: `clamp(1.0625rem, 1.02rem + 0.16vw, 1.1875rem)`
- `--text-small`: `0.9375rem`
- `--text-meta`: `0.875rem`

Manchetes (`.section-heading`, `.page-title`, `.article-title`): `font-weight: 600`, `letter-spacing: -0.035em`, `line-height: 1.05` (h1) ou `1.25` (h2). Medida do texto científico: `--measure: 68ch` (estreita `58ch`); coluna de artigo `720px`.

O CSS de botões usa `font-weight: 750` e `650` (variável / sistema). A webfont serifada só declara o eixo 400–700; não inventar um peso 750 para manchetes.

## Layout

Escala de espaço em rem (base 16px): 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4 e 6rem. Entre grandes seções: `--space-section: clamp(3rem, 1.5rem + 6vw, 7.5rem)`. Entre blocos: `--space-block: clamp(2rem, 1.2rem + 3vw, 4rem)`. Altura do header: 76px, 68px abaixo de 1360px, 62px abaixo de 720px. Coluna de artigo: 720px.

## Elevation & Depth

Sombras tingidas com navy `rgb(7 29 69 / …)`: hairline `0 1px 2px / 6%`; card `0 1px 3px / 5%, 0 12px 28px / 5%`; grande `0 24px 60px / 10%`. Hover de cartão usa `filter: drop-shadow` (`--lift-hover`, `--lift-strong`), não `box-shadow`, para não apagar o anel de foco de dois tons.

Vidro do header: `--glass-bg: rgb(255 255 255 / 62%)`, blur `saturate(180%) blur(20px)`. Sem `backdrop-filter`, o vidro fica opaco (`97%` / `99%`) para preservar leitura.

## Shapes

Raios do fonte: `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 18px`. Controles e CTAs usam `--control-radius` (= `sm`, 6px). A SUPERFÍCIE define `--surface-radius-sm: 6px`, `--surface-radius-md: 10px`, `--surface-radius-lg: 16px` (este último é 16px, não 18px).

## Components

`.button-primary` do portal: fundo `--teal-700`, texto `--on-inverse`, borda da mesma cor, `min-height: 54px`, `padding: 0.9rem 1.5rem`, `font-size: 0.98rem`, `font-weight: 750`, raio `--control-radius`, verniz em gradiente linear de branco 12%. Hover: fundo `--surface-inverse`, `translateY(-2px)` e `--lift-hover`.

`.header-cta`: fundo transparente, borda `--ink`, `min-height: 44px`, `padding: 0.55rem 1rem`. Hover inverte para `--surface-inverse`.

Botão primário da SUPERFÍCIE: fundo e borda `--surface-gold-light`, texto `--surface-navy`, `min-height: 48px`, `padding: 0.78rem 1.35rem`, `font-size: 0.875rem`, `font-weight: 800`, `letter-spacing: 0.08em`, raio 6px.

O token de componente `padding` na spec é uma única dimensão; o CSS real usa padding assimétrico (vertical/horizontal). Implementar o par literal do fonte, não só o valor YAML.

## Do's and Don'ts

- Faça usar `--copper-700` ou `--gold-text` quando o ouro/cobre for texto; nunca `--copper-500` ou `--surface-gold` em texto corrido.
- Não trate `tailwind.config.mjs` como fonte da paleta (cores `brand` e `primary` azuis ali são resquício e não aparecem no portal).
- Faça manter o corpo na pilha do sistema e a serifada só nas manchetes.
- Não aplique a paleta da SUPERFÍCIE nas páginas do portal, nem o navy/teal do portal como identidade da SUPERFÍCIE.
- Faça preservar o anel de foco de dois tons (cor + `--focus-ring-contrast`) e não substituí-lo por `box-shadow` de elevação.
- Não invente valores de `clamp` ou pesos fora do que está em `tokens.css` e nos layouts.
