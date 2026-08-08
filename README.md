# olhossecos.com.br

Portal brasileiro especializado em doença do olho seco e superfície ocular. O projeto reúne educação para pacientes, conteúdo profissional, a publicação SUPERFÍCIE, biblioteca de livros, o Dry Eye Widget e newsletter editorial.

## Stack atual

- Astro 7 e TypeScript;
- CSS nativo e componentes Astro;
- geração estática com endpoint server-side em Node;
- SQLite privado para consentimentos da newsletter e contatos de parceiros;
- Nginx como proxy HTTPS e systemd para o processo Node em produção;
- conteúdo editorial estruturado localmente, sem CMS remoto ativo.

Sanity, Tailwind, Next.js, Docker, Vercel e Netlify não fazem parte da implementação atual.

## Requisitos

- Node.js 22.12 ou superior; produção e CI usam Node 24;
- npm;
- Linux, macOS ou ambiente compatível para desenvolvimento.

## Desenvolvimento

```bash
npm ci
cp .env.example .env
npm run dev
```

O servidor local usa `http://localhost:4321` por padrão. O arquivo `.env` não deve ser versionado.

## Verificação

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Para executar toda a validação local na mesma ordem da integração contínua:

```bash
npm run check
```

Os testes atuais cobrem o endpoint da newsletter, as regras editoriais da SUPERFÍCIE e a configuração operacional do repositório. O build executa `astro check` antes de gerar o artefato.

## Estrutura

- `src/pages/`: rotas públicas e endpoint da newsletter;
- `src/components/`: componentes compartilhados do portal e da SUPERFÍCIE;
- `src/layouts/`: layouts, metadados e dados estruturados;
- `src/lib/`: modelos editoriais, busca, newsletter e testes;
- `public/`: imagens e outros arquivos estáticos;
- `docs/`: arquitetura, QA, design e operação;
- `dist/`: artefato gerado, não versionado.

## Conteúdo e CMS

O conteúdo estratégico ainda é validado por estruturas TypeScript locais. A arquitetura aprovada prevê Astro Content Collections como próxima etapa, mantendo os componentes independentes da futura escolha de CMS.

Os documentos antigos sobre Sanity permanecem apenas como histórico e não devem ser usados para configurar esta versão.

## Produção

A produção atual usa:

- checkout em `/root/olhossecos.com.br-site`;
- serviço `olhossecos-astro.service`;
- processo Node em `127.0.0.1:4321`;
- Nginx para HTTPS, canonicalização, cache e headers de segurança;
- banco da newsletter em `/var/lib/olhossecos/newsletter.sqlite`;
- contatos de parceiros em `/var/lib/olhossecos/superficie-partner-inquiries.sqlite`.

O GitHub Actions executa somente CI. Deploy automático permanece desativado até o Gate F; publicação exige candidato identificado por commit, backup, QA e autorização explícita. Consulte `docs/VPS-DEPLOY.md`.

## Segurança

- Nunca versione `.env`, tokens, credenciais, bancos, listas da newsletter ou contatos de parceiros.
- Não execute `git reset --hard` no checkout de produção.
- Não compartilhe dados nominais de assinantes com parceiros.
- Mudanças de URLs públicas exigem mapa de redirects e validação prévia.
