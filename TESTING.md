# Testes e QA

Este documento descreve somente as verificações realmente disponíveis no repositório.

## Validação automatizada

```bash
npm test
npm run lint
npm run format:check
npm run build
```

O atalho abaixo executa a mesma sequência:

```bash
npm run check
```

### Testes Node

Os testes usam o runner nativo de Node e ficam em `src/lib/*.test.ts`.

- `newsletter.test.ts`: cadastro, deduplicação, consentimento, honeypot e origem;
- `superficie.test.ts`: tempo de leitura, relacionados, publicação, patrocínio e canonical;
- `repository-config.test.ts`: CI, ambiente e documentação operacional.

Também podem ser executados separadamente:

```bash
npm run test:newsletter
npm run test:superficie
```

## Build

`npm run build` executa `astro check` e depois gera o artefato em `dist/`. Qualquer erro, aviso ou hint do Astro deve ser revisado antes de um release.

## QA visual e funcional

O projeto ainda não possui Playwright ou regressão visual versionados. Antes de um release, a verificação manual ou automatizada controlada deve cobrir:

- 320, 375, 390, 768, 1024, 1280 e 1440 px;
- navegação por teclado e foco visível;
- menu móvel, CTAs, links e formulário da newsletter;
- ausência de overflow horizontal e erros de console;
- um H1 por página, canonical, title, description e JSON-LD;
- sitemap, robots, 404, redirects e `/app`;
- imagens responsivas, dimensões explícitas e texto alternativo.

Capturas e relatórios de cada gate ficam em `docs/design/`. A ferramenta de navegador deve ser acordada antes da captura visual.

## Produção

O QA de produção só ocorre no Gate F, depois de backup e autorização explícita. A integração contínua não publica o site.
