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

Os testes usam o runner nativo de Node e ficam em `src/lib/*.test.ts`, além do
smoke de deploy em `scripts/*.test.mjs`.

- `analytics*.test.ts`: taxonomia, agregação, deduplicação e redação semântica de PII no cliente e no servidor;
- `newsletter.test.ts`: cadastro, deduplicação, consentimento, honeypot e origem;
- `newsletter-operations.test.ts`: exportação exclusiva sem symlink e snapshots SQLite;
- `partner-inquiries.test.ts`: solicitações de parceria, consentimento, honeypot, origem e proteção contra abuso;
- `release.test.ts` e `deploy-atomic-release.test.mjs`: manifesto do build, smoke não privilegiado e permissões do release;
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

`npm run build` executa `astro check`, gera o artefato em `dist/` e grava
`dist/BUILD_METADATA.json`. O manifesto contém o SHA de `HEAD` e só pode marcar
`sourceClean: true` quando a árvore do checkout está limpa. O deploy verifica
ambos antes de aceitar um candidato; o `dist/` ignorado pelo Git não basta.

`npm run test:routes` inicia esse artefato localmente e confirma que
`/superficie/parceiros`, `/newsletter`, `/newsletter/descadastrar` e
`/newsletter/confirmar` respondem 200 e possuem H1/canonical próprios; também
confirma `/newsletter` no sitemap e o link global para ela. `npm run check`
executa esse teste depois do build.

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
- endereço suprimido nunca é reativado por cadastro anônimo; o retorno exige
  token de confirmação enviado ao e-mail;
- descadastro com limite incremental do corpo e rate limit independente;
- UTMs e demais propriedades passam por validação semântica de PII no cliente e
  no servidor.

Os novos comportamentos foram desenvolvidos em ciclos red-green. Antes da
implementação, os testes falharam respectivamente com `422` no cadastro sem
nome, `422` no perfil progressivo, `503` na base legada e ausência do módulo de
parcerias. A rota geral também falhou com `422` antes de sua origem ser aceita.
Após a implementação mínima, os 14 casos da newsletter e os 50 testes da
suíte completa passaram.

**Atualização desta seção**: 08/08/2026

## Correções operacionais — 08/08/2026

- o candidato de deploy é aceito somente quando `BUILD_METADATA.json` vincula o
  build ao SHA aprovado e a árvore está limpa;
- `npm ci` e o smoke do candidato executam como `www-data` (ou o usuário
  não-root do ambiente de teste), e o release final é normalizado para
  `root:root` sem escrita para o runtime;
- o backup systemd usa `/usr/local/libexec/olhossecos/backup-private-data.mjs`,
  instalado por `ops/install-private-data-backup.sh`, nunca pelo symlink do
  release;
- exportações privadas usam criação exclusiva com `O_EXCL`/`O_NOFOLLOW`.

As validações desta etapa continuam locais no worktree isolado. Produção não foi
alterada, e nenhuma operação de merge, push ou deploy foi executada.

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
