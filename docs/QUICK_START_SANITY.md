# Guia Rápido - Sanity CMS

Guia prático para importar conteúdo inicial sobre olho seco no Sanity CMS.

## ⚡ Início Rápido (5 minutos)

### 1. Configure as Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=seu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=seu-token-de-escrita
```

**Como obter essas informações:**

1. Acesse [sanity.io/manage](https://sanity.io/manage)
2. Selecione seu projeto (ou crie um novo)
3. **Project ID**: Copie da URL ou da página do projeto
4. **Dataset**: Geralmente "production"
5. **Write Token**:
   - Vá em **API → Tokens**
   - Clique em **Add API Token**
   - Nome: "Next.js Write Token"
   - Permissions: **Editor** ou **Administrator**
   - Copie o token (você só verá uma vez!)

### 2. Importe o Conteúdo Inicial

```bash
pnpm seed:posts
```

**Isso criará:**
- ✅ 1 autor médico (Dr. Philipe Saraiva Cruz)
- ✅ 5 categorias temáticas
- ✅ 6 artigos completos sobre olho seco

### 3. Acesse o Sanity Studio

```bash
# Em outro terminal
pnpm dev
```

Abra: [http://localhost:3000/studio](http://localhost:3000/studio)

### 4. Publique os Documentos

No Sanity Studio:
1. Vá em **Post** no menu lateral
2. Abra cada post importado
3. Clique em **Publish** (canto superior direito)
4. Repita para **Author** e **Category**

### 5. Configure o Webhook (Opcional)

Para revalidação automática do cache:

1. No Sanity: **API → Webhooks → Create webhook**
2. Preencha:
   ```
   Name: Revalidate Next.js
   URL: https://seu-dominio.com/api/revalidate
   Dataset: production
   Trigger on: Create, Update, Delete
   HTTP method: POST
   Secret: gere-um-token-seguro
   ```
3. Adicione em `.env.local`:
   ```bash
   SANITY_REVALIDATE_SECRET=seu-token-seguro
   ```

---

## 📝 Artigos Importados

Os 6 artigos incluem SEO otimizado e compliance médico:

1. **O Que é Olho Seco?** - Introdução completa à síndrome
2. **Ar-Condicionado e Olho Seco em Caratinga** - Fatores ambientais locais
3. **Colírio para Olho Seco** - Guia de tipos e tratamentos
4. **Telas e Olho Seco** - Síndrome visual do computador + Regra 20-20-20
5. **Olho Seco em Mulheres** - Menopausa e alterações hormonais
6. **Lentes de Contato e Olho Seco** - Uso seguro e cuidados

Cada artigo contém:
- ✅ Título SEO otimizado
- ✅ Meta description única
- ✅ Estrutura de headings (H2, H3)
- ✅ Listas e parágrafos bem formatados
- ✅ Categorização temática
- ✅ Disclaimer médico
- ✅ Data de revisão médica

---

## 🎨 Próximos Passos

### Adicionar Imagens

1. No Sanity Studio, abra cada post
2. Clique em **Cover Image**
3. Faça upload de uma imagem relevante (1200x630px recomendado)
4. Preencha:
   - **Alt text**: Descrição para SEO e acessibilidade
   - **Caption** (opcional): Legenda da imagem

### Criar Mais Conteúdo

**No Sanity Studio:**
1. Clique em **+ Create** no menu
2. Selecione **Post**
3. Preencha os campos (todos os grupos são importantes!)
4. Publique quando pronto

**Via Código:**
Edite `scripts/seed-data.ts` e adicione novos posts ao array.

### Personalizar Autor

1. No Studio, vá em **Author**
2. Edite "Dr. Philipe Saraiva Cruz"
3. Adicione:
   - Foto profissional
   - Bio completa
   - Links de redes sociais

---

## 🔧 Solução de Problemas

### Erro: "SANITY_API_WRITE_TOKEN not defined"
✅ Certifique-se de ter criado `.env.local` com o token correto

### Erro: "Unauthorized"
✅ Verifique se o token tem permissões de **Editor** ou **Administrator**

### Posts não aparecem no site
✅ Publique os posts no Sanity Studio (eles são criados como rascunhos)

### Webhook não funciona
✅ Verifique se a URL está correta e acessível
✅ Confira se o secret no Sanity é igual ao `.env.local`

---

## 📚 Documentação Completa

Para informações detalhadas sobre schemas, queries GROQ, e arquitetura:
- [SANITY_INTEGRATION.md](./SANITY_INTEGRATION.md)
- [Documentação oficial do Sanity](https://www.sanity.io/docs)

---

**Precisa de ajuda?** Consulte [CLAUDE.md](../CLAUDE.md) para guia do projeto.
