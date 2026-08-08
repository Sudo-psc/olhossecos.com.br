# Operação e deploy do olhossecos.com.br

## Arquitetura publicada

- repositório: `/root/olhossecos.com.br-site`;
- build: `/root/olhossecos.com.br-site/dist`;
- serviço: `olhossecos-astro.service`;
- usuário do processo: `www-data`;
- aplicação: `127.0.0.1:4321`;
- proxy público: Nginx;
- ambiente: `/root/olhossecos.com.br-site/.env`;
- newsletter: `/var/lib/olhossecos/newsletter.sqlite`;
- contatos de parceiros: `/var/lib/olhossecos/superficie-partner-inquiries.sqlite`.

O serviço executa `dist/server/entry.mjs`. Os bancos privados não fazem parte do artefato nem do repositório e devem integrar a política de backup do servidor.

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
PUBLIC_PARTNER_INQUIRY_ENDPOINT=/api/superficie-parceiros
PARTNER_INQUIRY_DATABASE_PATH=/var/lib/olhossecos/superficie-partner-inquiries.sqlite
PARTNER_INQUIRY_ALLOWED_ORIGIN=https://olhossecos.com.br
```

Não armazene tokens, usuários da newsletter, contatos de parceiros ou credenciais no repositório ou em logs de CI.

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
- `/superficie/parceiros` e seu endpoint: GET 405, origem cruzada 403 e contato sintético autorizado;
- sitemap e robots;
- canonicalização de HTTP, `www` e trailing slash;
- H1, title, description, JSON-LD e Open Graph;
- CSP, HSTS, `DENY`, `nosniff` e política de permissões;
- desktop e mobile, navegação por teclado, formulário e console;
- ausência de 404 internas e overflow horizontal.

Os registros sintéticos usados nos testes devem ser removidos dos respectivos bancos após a validação.

## Rollback

Rollback significa restaurar o `dist` preservado no backup do release, reiniciar o serviço e repetir as verificações essenciais. Nunca apague o build com falha antes de preservar uma cópia para diagnóstico.

Configurações de Nginx e systemd ficam fora do repositório; qualquer alteração nelas exige backup próprio e validação independente.
