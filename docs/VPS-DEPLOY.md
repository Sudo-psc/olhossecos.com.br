# Operação e deploy do olhossecos.com.br

> Instruções antigas de Docker em `/opt/olhossecos` estão **abandonadas**.
> O caminho vigente é o release atômico descrito abaixo e em `CLAUDE.md`
> (`npm run ops:deploy`). Não há `/api/health`.

## Arquitetura operacional alvo

- repositório de trabalho: `/root/olhossecos.com.br-site`;
- releases imutáveis: `/var/www/olhossecos/releases/<sha>`;
- release ativo: symlink `/var/www/olhossecos/current`;
- serviço: `olhossecos-astro.service`;
- usuário do processo: `www-data`;
- aplicação: `127.0.0.1:4321`;
- proxy público: Nginx;
- ambiente: `/etc/olhossecos/olhossecos.env`;
- backup privado: `/usr/local/libexec/olhossecos/backup-private-data.mjs`;
- newsletter: `/var/lib/olhossecos/newsletter.sqlite`;
- contatos de parceiros: `/var/lib/olhossecos/superficie-partner-inquiries.sqlite`;
- analytics first-party: `/var/lib/olhossecos/analytics.sqlite`.

O serviço executa `/var/www/olhossecos/current/dist/server/entry.mjs`. Cada
release inclui o build, dependências de produção e scripts operacionais. Bancos
privados e ambiente ficam fora do artefato e não são substituídos no deploy.
Os releases são mantidos `root:root`, com arquivos sem escrita para
`www-data`; o processo Node precisa apenas de leitura e execução de diretórios.

Até a execução aprovada do bootstrap, a produção continua executando o `dist`
do checkout em `/root/olhossecos.com.br-site`. Não trate a presença destes
arquivos no repositório como migração já concluída.

## Política de release

O GitHub Actions valida o código, mas não faz deploy. Uma publicação exige:

1. Gate de conteúdo/design aprovado;
2. commit ou tag exatos;
3. checkout isolado e limpo desse commit;
4. `npm ci` e `npm run check` aprovados;
5. auditoria de dependências;
6. build candidato separado do release ativo;
7. release anterior válido para rollback;
8. autorização explícita para o Gate F;
9. troca atômica, health gate e verificação pós-deploy.

Nunca use `git reset --hard` no checkout de produção. Não construa um candidato
a partir de uma árvore suja e nunca escreva dentro do release ativo.

## Variáveis de produção

O ambiente operacional deve permanecer fora do Git, legível apenas por
`root:www-data` e com modo `0640`:

```env
PUBLIC_ANALYTICS_ENDPOINT=/api/analytics
ANALYTICS_DATABASE_PATH=/var/lib/olhossecos/analytics.sqlite
ANALYTICS_ALLOWED_ORIGIN=https://olhossecos.com.br
PUBLIC_NEWSLETTER_ENDPOINT=/api/newsletter
PUBLIC_NEWSLETTER_UNSUBSCRIBE_ENDPOINT=/api/newsletter-unsubscribe
NEWSLETTER_DATABASE_PATH=/var/lib/olhossecos/newsletter.sqlite
NEWSLETTER_ALLOWED_ORIGIN=https://olhossecos.com.br
NEWSLETTER_TOKEN_SECRET=<segredo aleatorio com pelo menos 32 caracteres>
NEWSLETTER_CONFIRMATION_SENDMAIL=/usr/sbin/sendmail
PUBLIC_PARTNER_INQUIRY_ENDPOINT=/api/superficie-parceiros
PARTNER_INQUIRY_DATABASE_PATH=/var/lib/olhossecos/superficie-partner-inquiries.sqlite
PARTNER_INQUIRY_ALLOWED_ORIGIN=https://olhossecos.com.br
```

Não armazene segredos, usuários, contatos, exportações ou registros individuais
de analytics no repositório ou em logs de CI.

## Preparação do candidato

Em um worktree limpo apontando para o commit aprovado:

```bash
npm ci
npm run check
npm audit --omit=dev --audit-level=high
```

`npm run build` executa o type check, gera `dist` e grava
`dist/BUILD_METADATA.json` com o SHA de `HEAD`. O script de release exige que
esse manifesto exista e corresponda ao `--sha`; a presença de um `dist`
ignorado pelo Git não é suficiente.

Para preparar o release sem ativá-lo:

```bash
node scripts/deploy-atomic-release.mjs \
  --source /caminho/do/worktree-validado \
  --sha <sha-completo> \
  --release-root /var/www/olhossecos \
  --mode prepare-only
```

O comando recusa checkout sujo, SHA divergente, release existente e artefato
incompleto. Antes de criar o diretório final, instala somente dependências de
produção e testa `/`, `/newsletter`, `/superficie` e `/app` em porta isolada.

## Bootstrap único da arquitetura atômica

Antes do primeiro deploy usando `current`, prepare como release o commit que já
está em produção. Somente depois do smoke desse release:

1. instalar o helper de backup fora dos releases, como root:

   ```bash
   /caminho/do/worktree/ops/install-private-data-backup.sh
   ```

   O instalador grava o arquivo em `/usr/local/libexec/olhossecos/` com
   proprietário `root:root` e modo `0755`.

2. criar `/var/www/olhossecos/current` apontando relativamente para o release
   atual;
3. copiar o ambiente para `/etc/olhossecos/olhossecos.env`, com proprietário
   `root:www-data` e modo `0640`;
4. instalar `ops/systemd/olhossecos-astro.service` e as unidades de backup;
5. executar `systemctl daemon-reload` e reiniciar o serviço;
6. confirmar HTTP 200 e o SHA em `current/RELEASE_SHA`;
7. preservar a unidade e o `dist` anteriores no backup do Gate F.

O deploy automatizado recusa a primeira ativação enquanto `current` não tiver
um alvo anterior válido, pois não haveria rollback automático.

## Gate F e ativação

Depois do bootstrap, executar o mesmo script com `--mode activate`. Ele:

- prepara o candidato dentro de `releases/.incoming-*`;
- executa smoke antes da troca;
- renomeia o candidato para `releases/<sha>`;
- troca `current` por renomeação atômica de symlink;
- reinicia `olhossecos-astro.service`;
- aguarda HTTP 200 na aplicação ativa;
- restaura o symlink anterior e reinicia novamente se o health gate falhar.

Os comandos exatos, SHA e backup devem ser apresentados no Gate F. Este
documento e os scripts não autorizam execução automática em produção.

## Newsletter, analytics e backup

- `npm run newsletter:export`: exige `NEWSLETTER_EXPORT_PATH` novo e gera JSONL
  modo `0600`, apenas com assinantes ativos e URL opaca de descadastro;
- `npm run analytics:report`: mostra somente contagens agregadas do período
  configurado por `ANALYTICS_REPORT_DAYS`;
- `npm run ops:backup`: cria snapshots consistentes dos três bancos, verifica
  `PRAGMA integrity_check`, aplica diretório `0700`, arquivos `0600` e grava
  checksums SHA-256 no manifesto.

O helper root-owned em `/usr/local/libexec/olhossecos/` é usado por
`olhossecos-private-data-backup.service`; ele não é resolvido pelo symlink
`current` e não muda quando um release é trocado. Os templates
`ops/systemd/olhossecos-private-data-backup.service` e `.timer` agendam o
backup diário. Antes de habilitar o timer, execute manualmente o serviço,
confira o manifesto e faça um ensaio de restauração em caminho temporário.
Cópia externa criptografada exige armazenamento e chave definidos
separadamente.

## Verificação pós-deploy

Verificar pelo menos:

- homepage, `/olho-seco`, `/profissionais`, `/superficie`,
  `/superficie/edicao-00`, `/livros`, `/app` e `/newsletter`;
- analytics: origem cruzada 403 e evento sintético autorizado 202;
- newsletter: GET 405, origem cruzada 403, cadastro sintético, descadastro e
  supressão;
- `/superficie/parceiros` e seu endpoint;
- sitemap, robots e canonicalização;
- H1, title, description, JSON-LD e Open Graph;
- CSP, HSTS, `DENY`, `nosniff` e política de permissões;
- desktop/mobile, teclado, formulários, console, links e overflow;
- timer de backup, manifesto e integridade dos snapshots.

Remova registros sintéticos dos bancos depois do QA.

## Rollback

Rollback restaura atomicamente o alvo anterior de `current`, reinicia o serviço
e repete as verificações essenciais. Nunca apague o release com falha antes de
preservar evidências. Configurações de Nginx e systemd ficam fora do repositório;
qualquer mudança nelas exige backup próprio e validação independente.
