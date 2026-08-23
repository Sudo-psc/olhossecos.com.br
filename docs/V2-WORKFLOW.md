# Fluxo `v2` → `master`

`v2` é a branch de integração e pré-produção do portal. O checkout isolado
correspondente fica em `/root/worktrees/olhossecos-v2` e o build dessa branch
usa o prefixo `https://olhossecos.com.br/v2`.

## Regra de promoção

1. Crie a branch de trabalho a partir de `v2`.
2. Faça o merge da alteração em `v2` e valide a pré-produção.
3. Depois do QA editorial, visual, funcional e operacional, abra a promoção
   de `v2` para `master`.
4. Só então publique a raiz `https://olhossecos.com.br/` pelo Gate F de produção.

`master` continua sendo a branch da raiz e não recebe o prefixo. O CI roda nas
duas branches: em `v2`, `SITE_BASE_PATH=/v2`; em `master`, o valor fica vazio.

## Comandos locais

No worktree da `v2`:

```bash
npm ci
npm run check:v2
```

Para a branch de produção:

```bash
npm run check
```

O build da `v2` ajusta links internos, endpoints públicos, assets, manifestos,
JSON do Reader, canonical, sitemap e robots para o prefixo. O build sem
`SITE_BASE_PATH` permanece compatível com a raiz.

## Infraestrutura da pré-produção

O código e o CI ficam preparados para `/v2`; a URL pública precisa ser servida
por um processo separado do site de produção, em uma porta própria (por
exemplo, `127.0.0.1:4322`), com uma localização Nginx `/v2/` apontando para
esse processo. A pré-produção deve usar bancos SQLite e origens de API
separados, para nunca misturar testes com newsletter, parceiros ou analytics de
produção.

Não use o symlink `current` de `/var/www/olhossecos` para a `v2`: ele pertence à
produção. Prepare a `v2` em uma raiz de releases própria e mantenha a mesma
política de rollback atômico antes de ativar o proxy.
