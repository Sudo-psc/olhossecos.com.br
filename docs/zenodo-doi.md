# DOI via Zenodo — SUPERFÍCIE

O pipeline do site já consome o campo `doi` do artigo (Highwire,
JSON-LD, “Como citar”, BibTeX e RIS). **Nenhum depósito é criado
automaticamente.** Quem deposita é o Dr. Philipe Saraiva Cruz.

## Quando depositar

Quando um artigo publicado da SUPERFÍCIE precisar de identificador
citável permanente. Não deposite rascunho, prévia ou matéria com
selo de processo ainda aberto.

## Procedimento

1. Entre em [https://zenodo.org](https://zenodo.org) com a conta
   editorial da SUPERFÍCIE / Saraiva Vision.
2. **New upload** → tipo *Journal article* (ou *Publication / Article*).
3. Envie o PDF da matéria **ou** o arquivo que o Zenodo usará como
   objeto do registro. Se o PDF público ainda não existir, o depósito
   pode ficar restrito até o arquivo estar pronto — o DOI reserva o
   registro; a URL `citation_pdf_url` só entra no site quando o PDF
   estiver público.
4. Preencha:
   - Title: o título do artigo no site
   - Creators: Philipe Saraiva Cruz (ORCID `0000-0002-4073-8371`)
   - Description: o `excerpt` do artigo
   - Publication date: o `publishedAt`
   - Journal title: SUPERFÍCIE — Revista de Olho Seco e Superfície Ocular
   - Related/alternate identifier: URL canônica
     `https://olhossecos.com.br/superficie/artigos/<slug>`
   - License: a mesma da política editorial (CC BY-NC-ND, se for essa
     a escolha da edição — confirmar antes de publicar)
   - Communities: criar ou usar a comunidade SUPERFÍCIE, se existir
5. Publique o registro. Zenodo emite um DOI no padrão
   `10.5281/zenodo.<id>`.
6. No módulo `src/lib/superficie.ts`, no artigo correspondente:
   ```ts
   doi: "10.5281/zenodo.1234567",
   pdfUrl: "https://zenodo.org/records/1234567/files/artigo.pdf",
   ```
   Use o identificador nu, **sem** `https://doi.org/`.
7. Rode `npm run check`. O validador recusa DOI com URL ou formato
   inválido. Highwire, JSON-LD e os arquivos de citação passam a
   incluir o campo sozinhos.

## O que não fazer

- Não criar depósito a partir de script, CI ou agente.
- Não inventar DOI. Campo vazio é o estado honesto até o Zenodo
  devolver o número.
- Não reutilizar o DOI de uma referência citada pelo artigo.
- Não apontar `pdfUrl` para um arquivo que exija login.

## Conceitos / reservas

Zenodo permite *reserve DOI* antes de publicar. Só preencha o
frontmatter depois que o registro estiver público — um DOI reservado
e não publicado quebra o clique do leitor.
