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
- integridade do SQLite da newsletter (ver seção adiante);
- `/superficie/parceiros` e seu endpoint;
- sitemap, robots e canonicalização;
- H1, title, description, JSON-LD e Open Graph;
- CSP, HSTS, `DENY`, `nosniff` e política de permissões;
- desktop/mobile, teclado, formulários, console, links e overflow;
- timer de backup, manifesto e integridade dos snapshots.

Remova registros sintéticos dos bancos depois do QA.

## Integridade do SQLite da newsletter

O banco em `/var/lib/olhossecos/newsletter.sqlite` **não** faz parte do artefato `dist`. Rollback do site não reverte o SQLite automaticamente. Validar integridade no Gate F e nunca copiar e-mails, nomes ou outros PII para logs públicos, chat ou Notion.

Expectativas operacionais:

- diretório `/var/lib/olhossecos` com modo `0700` e proprietário adequado (`www-data`);
- arquivo `.sqlite` com modo `0600`;
- tabela `newsletter_subscribers` e índice `newsletter_subscribers_status_idx`;
- `status` apenas em `active` ou `unsubscribed`;
- `email` único com `COLLATE NOCASE`;
- `consent_version` preenchido (ex.: `privacy-2026-08-07`).

### Baseline (antes da troca, se o arquivo já existir)

```bash
DB=/var/lib/olhossecos/newsletter.sqlite

ls -la /var/lib/olhossecos/
stat -c '%a %U:%G %n' /var/lib/olhossecos "$DB" 2>/dev/null || echo "DB ainda não existe"

if [ -f "$DB" ]; then
  sqlite3 "$DB" "SELECT COUNT(*) AS total FROM newsletter_subscribers;"
  sqlite3 "$DB" "SELECT status, COUNT(*) FROM newsletter_subscribers GROUP BY status;"
fi
```

Registrar apenas contagens agregadas no handoff.

### Checagem estrutural (pós-restart)

```bash
DB=/var/lib/olhossecos/newsletter.sqlite

sqlite3 "$DB" "PRAGMA integrity_check;"   # esperado: ok
sqlite3 "$DB" "PRAGMA quick_check;"       # esperado: ok
sqlite3 "$DB" "PRAGMA journal_mode;"      # esperado: wal (após uso pelo app)
sqlite3 "$DB" ".tables"
sqlite3 "$DB" "SELECT name, type FROM sqlite_master WHERE type IN ('table','index') ORDER BY type, name;"
```

### Consistência de dados (sem PII)

```bash
DB=/var/lib/olhossecos/newsletter.sqlite

sqlite3 "$DB" <<'SQL'
SELECT COUNT(*) AS total FROM newsletter_subscribers;
SELECT status, COUNT(*) AS n FROM newsletter_subscribers GROUP BY status;
SELECT consent_version, COUNT(*) AS n FROM newsletter_subscribers GROUP BY consent_version;
SELECT source, COUNT(*) AS n FROM newsletter_subscribers GROUP BY source;
SQL

# Violações — devem retornar 0
sqlite3 "$DB" <<'SQL'
SELECT COUNT(*) AS bad_status
FROM newsletter_subscribers
WHERE status NOT IN ('active', 'unsubscribed');

SELECT COUNT(*) AS empty_email
FROM newsletter_subscribers
WHERE email IS NULL OR trim(email) = '';

SELECT COUNT(*) AS short_name
FROM newsletter_subscribers
WHERE name IS NULL OR length(trim(name)) < 2;

SELECT COUNT(*) AS missing_consent
FROM newsletter_subscribers
WHERE consent_version IS NULL OR trim(consent_version) = '';

SELECT COUNT(*) AS dup_email FROM (
  SELECT lower(email) AS e
  FROM newsletter_subscribers
  GROUP BY lower(email)
  HAVING COUNT(*) > 1
);
SQL
```

### Ciclo sintético (prova de escrita e limpeza)

```bash
DB=/var/lib/olhossecos/newsletter.sqlite
MARKER="gatef-$(date -u +%Y%m%dT%H%M%SZ)@example.invalid"

BEFORE=$(sqlite3 "$DB" "SELECT COUNT(*) FROM newsletter_subscribers;")
echo "before=$BEFORE"

curl -sS -o /tmp/newsletter-gatef.json -w "%{http_code}\n" \
  -X POST "https://olhossecos.com.br/api/newsletter" \
  -H "Content-Type: application/json" \
  -H "Origin: https://olhossecos.com.br" \
  -H "Sec-Fetch-Site: same-origin" \
  --data "{\"name\":\"Gate F Test\",\"email\":\"$MARKER\",\"profession\":\"QA\",\"consent\":\"accepted\"}"
# esperado: 201

sqlite3 "$DB" "SELECT id, status, consent_version, source FROM newsletter_subscribers WHERE email = lower('$MARKER');"

sqlite3 "$DB" "DELETE FROM newsletter_subscribers WHERE email = lower('$MARKER');"
sqlite3 "$DB" "PRAGMA wal_checkpoint(TRUNCATE);"

AFTER=$(sqlite3 "$DB" "SELECT COUNT(*) FROM newsletter_subscribers;")
echo "after=$AFTER"
test "$BEFORE" = "$AFTER" && echo "count restored OK" || echo "COUNT MISMATCH"

sqlite3 "$DB" "PRAGMA integrity_check;"
```

Complementares HTTP do endpoint:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://olhossecos.com.br/api/newsletter
# esperado: 405

curl -sS -o /dev/null -w "%{http_code}\n" \
  -X POST "https://olhossecos.com.br/api/newsletter" \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.example" \
  --data '{"name":"x","email":"x@example.invalid","consent":"accepted"}'
# esperado: 403
```

### Critérios de falha (bloqueantes)

| Sintoma                                          | Ação                                                       |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `integrity_check` ≠ `ok`                         | Abortar Gate F; não seguir com o release                   |
| Tabela ou índice ausentes após o app subir       | Verificar `NEWSLETTER_DATABASE_PATH` e permissões          |
| Contagem final ≠ baseline após o ciclo sintético | Investigar path do DB e o `DELETE`                         |
| POST retorna 503 com DB íntegro                  | Regressão de app/permissão — considerar rollback do `dist` |
| PII em log/journal/handoff                       | Redigir; não registrar e-mails ou nomes                    |

### Bloco rápido (copiar e colar)

```bash
DB=/var/lib/olhossecos/newsletter.sqlite

echo "=== permissões ==="
stat -c '%a %U:%G %n' /var/lib/olhossecos "$DB"

echo "=== integrity ==="
sqlite3 "$DB" "PRAGMA integrity_check;"
sqlite3 "$DB" "PRAGMA quick_check;"
sqlite3 "$DB" "PRAGMA journal_mode;"

echo "=== schema ==="
sqlite3 "$DB" "SELECT name FROM sqlite_master WHERE type IN ('table','index') ORDER BY 1;"

echo "=== agregados (sem PII) ==="
sqlite3 "$DB" "SELECT COUNT(*) AS total FROM newsletter_subscribers;"
sqlite3 "$DB" "SELECT status, COUNT(*) FROM newsletter_subscribers GROUP BY status;"

echo "=== violações (0 esperado) ==="
sqlite3 "$DB" "SELECT COUNT(*) AS bad_status FROM newsletter_subscribers WHERE status NOT IN ('active','unsubscribed');"
sqlite3 "$DB" "SELECT COUNT(*) AS dup_email FROM (SELECT lower(email) e FROM newsletter_subscribers GROUP BY 1 HAVING COUNT(*)>1);"
```

Depois execute o ciclo sintético, remova o marcador e repita `PRAGMA integrity_check;`. No handoff registre somente contagens, resultado `ok` e o timestamp.

## Rollback

Rollback restaura atomicamente o alvo anterior de `current`, reinicia o serviço
e repete as verificações essenciais. Nunca apague o release com falha antes de
preservar evidências. Configurações de Nginx e systemd ficam fora do repositório;
qualquer mudança nelas exige backup próprio e validação independente.

O rollback do site **não** restaura o SQLite da newsletter: o banco vive fora do
artefato e não volta com o symlink. Se o ciclo sintético tiver sido executado,
confirme a remoção do marcador e a integridade do banco em separado.
