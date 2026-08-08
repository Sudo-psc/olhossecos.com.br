# Operação e deploy do olhossecos.com.br

## Arquitetura publicada

- repositório: `/root/olhossecos.com.br-site`;
- build: `/root/olhossecos.com.br-site/dist`;
- serviço: `olhossecos-astro.service`;
- usuário do processo: `www-data`;
- aplicação: `127.0.0.1:4321`;
- proxy público: Nginx;
- ambiente: `/root/olhossecos.com.br-site/.env`;
- newsletter: `/var/lib/olhossecos/newsletter.sqlite`.

O serviço executa `dist/server/entry.mjs`. A pasta da newsletter e o banco não fazem parte do artefato nem do repositório.

## Política de release

O GitHub Actions valida o código, mas não faz deploy. Uma publicação exige:

1. Gate de conteúdo/design aprovado;
2. commit ou tag exatos;
3. checkout isolado e limpo desse commit;
4. `npm ci` e `npm run check` aprovados;
5. auditoria de dependências;
6. build candidato separado do `dist` ativo;
7. backup recuperável do build anterior;
8. autorização explícita para o Gate F;
9. troca controlada, verificação e plano de rollback.

Nunca use `git reset --hard` no checkout de produção. Não construa um candidato a partir de uma árvore suja.

## Variáveis de produção

O `.env` operacional deve permanecer fora do Git e legível apenas por `root:www-data`. Variáveis atuais:

```env
PUBLIC_NEWSLETTER_ENDPOINT=/api/newsletter
NEWSLETTER_DATABASE_PATH=/var/lib/olhossecos/newsletter.sqlite
NEWSLETTER_ALLOWED_ORIGIN=https://olhossecos.com.br
```

Não armazene tokens, usuários da newsletter ou credenciais no repositório ou em logs de CI.

## Preparação do candidato

Em um worktree limpo apontando para o commit aprovado:

```bash
npm ci
npm run check
npm audit --omit=dev --audit-level=high
```

O diretório `dist/` produzido é o candidato. Registre o SHA e compare-o com o commit aprovado antes da troca.

## Gate F

A troca do artefato deve ocorrer somente após autorização explícita. O procedimento operacional deve:

- criar um diretório datado em `/var/backups/olhossecos/`;
- preservar o `dist` ativo nesse diretório;
- ativar o candidato no mesmo sistema de arquivos;
- reiniciar `olhossecos-astro.service`;
- executar `nginx -t` antes de qualquer reload do Nginx;
- confirmar o serviço ativo e ausência de erros novos no journal.

Os comandos exatos e o timestamp do backup devem ser apresentados para revisão no Gate F. Este documento não autoriza a execução automática.

## Verificação pós-deploy

Verificar pelo menos:

- homepage, `/olho-seco`, `/profissionais`, `/superficie`, `/superficie/edicao-00`, `/livros`, `/app` e `/newsletter`;
- endpoint da newsletter: GET 405, origem cruzada 403 e cadastro sintético autorizado;
- integridade do SQLite da newsletter (ver seção seguinte);
- sitemap e robots;
- canonicalização de HTTP, `www` e trailing slash;
- H1, title, description, JSON-LD e Open Graph;
- CSP, HSTS, `DENY`, `nosniff` e política de permissões;
- desktop e mobile, navegação por teclado, formulário e console;
- ausência de 404 internas e overflow horizontal.

A assinatura sintética usada no teste deve ser removida do banco após a validação.

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

| Sintoma | Ação |
|---------|--------|
| `integrity_check` ≠ `ok` | Abortar Gate F; não seguir com o release |
| Tabela ou índice ausentes após o app subir | Verificar `NEWSLETTER_DATABASE_PATH` e permissões |
| Contagem final ≠ baseline após o ciclo sintético | Investigar path do DB e o `DELETE` |
| POST retorna 503 com DB íntegro | Regressão de app/permissão — considerar rollback do `dist` |
| PII em log/journal/handoff | Redigir; não registrar e-mails ou nomes |

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

Rollback significa restaurar o `dist` preservado no backup do release, reiniciar o serviço e repetir as verificações essenciais. Nunca apague o build com falha antes de preservar uma cópia para diagnóstico.

O rollback do `dist` **não** restaura o SQLite da newsletter. Se o ciclo sintético tiver sido executado, confirme a remoção do marcador e a integridade do banco independentemente do artefato do site.

Configurações de Nginx e systemd ficam fora do repositório; qualquer alteração nelas exige backup próprio e validação independente.
