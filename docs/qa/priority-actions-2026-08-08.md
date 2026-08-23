# QA das correções prioritárias — 08/08/2026

## Escopo

- Worktree: `/root/worktrees/olhossecos-priority-actions-20260808`
- Branch: `codex/priority-actions-20260808`
- Commit-base: `de909c4deb44fd82a6f2843ba655135cc9721874`
- Servidor usado: build local em `127.0.0.1`, sem conexão com produção
- Produção: inalterada; não houve commit, push, merge ou deploy

## QA de navegador

O build local foi servido com Node/Astro e inspecionado no Chromium Headless
150 via CDP. Foram capturadas as rotas abaixo em 1440×1000 e 390×844:

| Rota                       |   Desktop |  Mobile | Resultado                                                   |
| -------------------------- | --------: | ------: | ----------------------------------------------------------- |
| `/newsletter`              | 1440×1000 | 390×844 | layout, formulário, consentimento e menu móvel renderizados |
| `/newsletter/confirmar`    | 1440×1000 | 390×844 | estado de token ausente renderizado sem ação habilitada     |
| `/newsletter/descadastrar` | 1440×1000 | 390×844 | estado de token ausente renderizado sem ação habilitada     |

Métricas de viewport:

- `document.scrollWidth === body.scrollWidth` em todas as rotas;
- 390 px: largura de documento 375 px, diferença explicada pela barra de
  rolagem, sem largura excedente;
- 1440 px: largura de documento 1425 px, diferença explicada pela barra de
  rolagem, sem largura excedente;
- exceções JavaScript e entradas de console em nível `error`: `0`.

As capturas ficaram no diretório temporário
`/tmp/olhossecos-browser-jfRxro/` durante esta validação. Hashes SHA-256:

```text
22e920d2f41bf5b30acdc785cf47938eac80359f6104e670c003f92f012a7e60  newsletter-1440.png
2199f746f9e0b2d81e12e1a9e17b72808c91429c546e2eb54f753b72d9169620  newsletter-390.png
26da826d4728ee15cf3923eb1d9aeb0ced843f1d2a6b02d684e13b719a44b4c1  newsletter-confirmar-1440.png
2727323fd1a747d2f737e882a789c911398d2c5c71d6acbd7f16afb9cabffcac  newsletter-confirmar-390.png
145fe89f75cd6c205ced254d0b256ef10c20794c5a62672979c478c6b95a89fd  newsletter-descadastrar-1440.png
dba635e63a29526a86bc4fde7168b273c6b91b8aa74375c3c5daa3be48f8bd57  newsletter-descadastrar-390.png
```

## Smokes funcionais e operacionais

- rotas, canonical, H1, sitemap, analytics e descadastro: aprovados por
  `npm run test:routes`;
- cadastro, descadastro, supressão, confirmação por token, limite de corpo e
  rate limit: cobertos pelos testes Node;
- exportação: somente assinantes ativos, modo `0600`, criação exclusiva e
  symlink de destino rejeitado;
- backup: snapshots SQLite íntegros, diretório `0700`, arquivos `0600` e
  manifesto SHA-256;
- smoke dos CLIs `scripts/export-newsletter-recipients.mjs` e
  `scripts/backup-private-data.mjs`: aprovado com três bancos temporários,
  sem tocar nos caminhos operacionais;
- deploy `prepare-only`: manifesto incorreto rejeitado, candidato executado
  sem root e release final `root:root` sem bits de escrita para o runtime;
- a auditoria formal de segurança permaneceu pulada conforme instrução do
  usuário.

O `BUILD_METADATA.json` gerado neste worktree registra `sourceClean: false`,
pois o worktree contém as alterações em revisão. Isso é esperado nesta etapa;
o deploy recusa corretamente uma árvore suja.
