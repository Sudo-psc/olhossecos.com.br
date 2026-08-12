---
name: frontend-review
description: Audit and score the frontend from 0 to 10 with prioritised improvement suggestions for approval. Runs a real browser against the built site to measure contrast, focus rings, horizontal overflow, CLS, heading order, images, tap targets and metadata. Use when asked to review, audit, score, grade or improve the frontend, UI, accessibility, responsiveness or visual quality of olhossecos.com.br.
---

# Revisão de frontend com nota

Auditoria automatizada que **mede** em vez de opinar. Sobe um Chromium real
contra o site construído, percorre rotas em vários viewports e devolve uma
**nota de 0 a 10 por categoria** mais uma lista priorizada de sugestões para
você aprovar antes de qualquer alteração.

O driver é `skills/frontend-review/driver.mjs`. Caminhos abaixo são relativos à
raiz do repositório.

## Pré-requisitos

Já satisfeitos neste repositório — Playwright e o Chromium vêm das
devDependencies. Se faltar o binário do navegador:

```bash
npx playwright install chromium
```

## Fluxo

### 1. Construa e suba o site

O driver precisa de um alvo servido. Rode contra o build de produção, não o
`astro dev` — só assim as imagens e o CSS estão nos formatos finais.

```bash
npm run build
HOST=127.0.0.1 PORT=44501 NODE_ENV=production node dist/server/entry.mjs &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:44501/
```

### 2. Rode a auditoria

```bash
node skills/frontend-review/driver.mjs \
  --base http://127.0.0.1:44501 \
  --routes /,/sintomas,/guias,/superficie,/superficie/radar/agosto-2026 \
  --shots /tmp/audit \
  --json /tmp/audit.json
```

Saída real desta execução:

```
    contraste         5  █████░░░░░
    foco             10  ██████████
    layout           10  ██████████
    estabilidade     10  ██████████
    semantica        10  ██████████
    imagens         9.7  ██████████
    metadados        10  ██████████

    GERAL           9.2  █████████░

   1. [ALTA ] contraste — Contraste 4.42:1 abaixo do mínimo 4.5:1
      /sintomas @ 1440x900
      small — "Links verificados em 26 de julho de 2026."
```

### 3. Apresente as sugestões e espere aprovação

A lista sai ordenada por severidade. **Não corrija nada sem aprovação** — a
skill existe para propor, e algumas categorias precisam de julgamento humano
(ver Limitações). Leve o item, a rota, o viewport e o número medido.

### 4. Encerre o servidor

```bash
kill $(lsof -ti:44501)
```

## Opções

| Flag          | Padrão                   | Para quê                                         |
| ------------- | ------------------------ | ------------------------------------------------ |
| `--base`      | `http://127.0.0.1:44501` | Origem a auditar; aceita a produção              |
| `--routes`    | `/`                      | Lista separada por vírgula                       |
| `--viewports` | `1440x900,390x844`       | DPR vira 2 no desktop e 3 abaixo de 500px        |
| `--min`       | `7`                      | Nota geral mínima; abaixo disso sai com código 1 |
| `--shots`     | —                        | Diretório para captura por rota e viewport       |
| `--json`      | —                        | Relatório completo em JSON                       |

Como sai com código 1 abaixo de `--min`, dá para usar como portão:

```bash
node skills/frontend-review/driver.mjs --base http://127.0.0.1:44501 \
  --routes /,/sintomas --min 8 || echo "reprovado"
```

## Como a nota é composta

Sete categorias, cada uma de 0 a 10, e a geral é a média das que tiveram dados.

| Categoria      | Mede                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `contraste`    | Razão WCAG do texto contra o fundo efetivo, resolvido subindo a árvore       |
| `foco`         | Os 12 primeiros focáveis por Tab têm `outline` ou `box-shadow` visível       |
| `layout`       | `scrollWidth` maior que `clientWidth` — overflow horizontal                  |
| `estabilidade` | CLS acumulado por `PerformanceObserver`                                      |
| `semantica`    | Exatamente um `h1` e nenhum salto de nível de heading                        |
| `imagens`      | `alt` presente, `width`/`height` declarados, variante do `srcset` suficiente |
| `metadados`    | `title`, `description`, `canonical`, `og:image`, `og:title`, `lang`          |

**A média sozinha mente.** Numa página com centenas de elementos, um texto
ilegível desaparece entre os aprovados e a categoria fecha em 10 — foi o que a
primeira versão fez. Por isso há teto por severidade: um achado ALTA limita a
categoria a 6,5; dois, a 5; três ou mais, a 4.

## Limitações — leia antes de confiar na nota

**Texto sobre imagem ou gradiente não é medido.** Sem fundo opaco não há razão
de contraste calculável. O relatório informa quantos trechos ficaram de fora;
esses precisam de conferência manual.

**Alvos de toque não implementam a exceção de espaçamento.** A WCAG 2.5.8 aprova
alvo pequeno que esteja suficientemente isolado. O driver não calcula isso, então
separa: altura abaixo de 20px vira achado de peso, entre 20 e 24px sai como
informativo para julgamento humano.

**O anel de foco é verificado por presença, não por contraste.** Ele confirma que
existe `outline` ou `box-shadow`, não que o indicador tem 3:1 contra o fundo.

**Doze elementos por rota no teste de foco.** Componentes fundo de página podem
não ser alcançados.

## Armadilhas

**`naturalWidth` mente para AVIF neste Chromium.** Um arquivo real de 1200×805 é
reportado como 780×523. A primeira versão do driver usava `naturalWidth` para
detectar imagem subdimensionada e marcava **toda** imagem AVIF como problema.
A checagem agora lê o descritor `w` do `srcset` correspondente ao `currentSrc`.
Se for estender o driver, não confie em `naturalWidth` para formatos modernos.

**Use o build de produção, não `astro dev`.** Em dev as imagens não passam pelo
pipeline e o CSS não está minificado — a auditoria mede outra coisa.

**Links inline em texto corrido são ignorados no teste de toque.** Sem essa
exceção, cada link dentro de parágrafo vira achado e o problema real afoga no
ruído.

**O servidor precisa estar de pé antes.** O driver não sobe nada; rota que não
carrega vira achado ALTA de disponibilidade, o que mascara o resto.

## Interpretando

| Nota geral | Leitura                                                 |
| ---------- | ------------------------------------------------------- |
| 9–10       | Sem falha grave; achados são refinamento                |
| 7–9        | Aprovável, com pendências que valem uma rodada          |
| 5–7        | Há falha de acessibilidade ou layout que atinge usuário |
| < 5        | Múltiplas falhas graves; corrija antes de publicar      |

Este é um site médico: **contraste e foco valem mais que estética**. Uma nota 9
com um achado ALTA de contraste ainda pede correção — a categoria afetada
carrega a informação, não a média.

## Solução de problemas

| Sintoma                                       | Causa e correção                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `net::ERR_CONNECTION_REFUSED`                 | Servidor não subiu. Rode `npm run build` e o `node dist/server/entry.mjs` antes      |
| `Executable doesn't exist`                    | Falta o Chromium: `npx playwright install chromium`                                  |
| Toda imagem AVIF marcada como subdimensionada | Driver antigo usando `naturalWidth`; use a versão atual que lê o `srcset`            |
| Contraste 10 com texto visivelmente apagado   | O texto está sobre imagem ou gradiente e entrou em "não verificável" — confira à mão |
| Porta 44501 ocupada                           | `kill $(lsof -ti:44501)`                                                             |
