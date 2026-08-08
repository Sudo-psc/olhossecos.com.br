# Testes e QA

Este documento descreve somente as verificações realmente disponíveis no repositório.

## Validação automatizada

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run test:routes
```

O atalho abaixo executa a mesma sequência:

```bash
npm run check
```

### Testes Node

Os testes usam o runner nativo de Node e ficam em `src/lib/*.test.ts`.

- `newsletter.test.ts`: cadastro, deduplicação, consentimento, honeypot e origem;
- `partner-inquiries.test.ts`: solicitações de parceria, consentimento, honeypot, origem e proteção contra abuso;
- `superficie.test.ts`: tempo de leitura, relacionados, publicação, patrocínio e canonical;
- `repository-config.test.ts`: CI, ambiente e documentação operacional.

Também podem ser executados separadamente:

```bash
npm run test:newsletter
npm run test:partners
npm run test:gate5
npm run test:superficie
```

## Build

`npm run build` executa `astro check` e depois gera o artefato em `dist/`. Qualquer erro, aviso ou hint do Astro deve ser revisado antes de um release.

`npm run test:routes` inicia esse artefato localmente e confirma que `/superficie/parceiros` e `/newsletter` respondem 200, possuem H1 e canonical próprios e continuam presentes no sitemap. O smoke test também exige um link global para `/newsletter`. `npm run check` executa esse teste depois do build.

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

**Atualização desta seção**: 07/08/2026

## Gate 5 — newsletter e parceiros da SUPERFÍCIE

Os fluxos de aquisição do Gate 5 usam o test runner nativo do Node e bancos
SQLite temporários, sem escrever na base operacional.

```bash
npm run test:gate5
```

Arquivos:

- `src/lib/newsletter.test.ts`;
- `src/lib/partner-inquiries.test.ts`.

Cobertura atual:

- cadastro inicial da SUPERFÍCIE somente com e-mail e consentimento;
- cadastro inicial da newsletter geral somente com e-mail e consentimento;
- origens persistidas `livros`, `superficie` e `newsletter`; as duas últimas usam perfil progressivo;
- preservação de origem e UTMs;
- token temporário e de uso único para o perfil opcional;
- migração automática da tabela de assinantes já existente;
- compatibilidade com o formulário anterior da área de livros;
- validação, honeypot e proteção contra origem cruzada;
- registro de solicitações de mídia kit e parceria em base separada;
- consentimento versionado para newsletter e contatos comerciais.

Os novos comportamentos foram desenvolvidos em ciclos red-green. Antes da
implementação, os testes falharam respectivamente com `422` no cadastro sem
nome, `422` no perfil progressivo, `503` na base legada e ausência do módulo de
parcerias. A rota geral também falhou com `422` antes de sua origem ser aceita.
Após a implementação mínima, os 12 casos passaram.

**Atualização desta seção**: 08/08/2026

## Gate 6 — QA final da SUPERFÍCIE

O Gate 6 valida o build de produção em ambiente isolado, sempre com bancos
SQLite temporários.

Cobertura executada:

- `npm run test:gate5` e `npm run test:superficie`;
- `astro check`, ESLint, Prettier e `git diff --check`;
- canonical, metadados, Open Graph, JSON-LD, breadcrumbs e sitemap;
- exclusão do artigo-modelo do build público;
- crawl dos links internos das três rotas;
- newsletter, perfil progressivo e parceria via APIs e navegador;
- rejeição de método e origem inválidos;
- menu mobile, console, imagens, labels e overflow em seis larguras;
- Lighthouse mobile e desktop para home, Edição 00 e Parceiros.

Resultado final do Lighthouse:

| Rota                    | Perfil  | Performance | Acessibilidade | Boas práticas | SEO |
| ----------------------- | ------- | ----------: | -------------: | ------------: | --: |
| `/superficie`           | desktop |         100 |            100 |           100 | 100 |
| `/superficie`           | mobile  |          99 |            100 |           100 | 100 |
| `/superficie/edicao-00` | desktop |         100 |            100 |           100 | 100 |
| `/superficie/edicao-00` | mobile  |         100 |            100 |           100 | 100 |
| `/superficie/parceiros` | desktop |         100 |            100 |           100 | 100 |
| `/superficie/parceiros` | mobile  |         100 |            100 |           100 | 100 |

Os testes de formulário nunca devem apontar para a base operacional. O relatório
visual e de interação está em `design-qa.md`.

Na preparação do release, o lockfile estabilizado passou a resolver
`nanoid 3.3.18`. As auditorias completa e de produção retornaram zero
vulnerabilidades em 08/08/2026.

**Atualização desta seção**: 08/08/2026
