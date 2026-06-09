# Integração Sanity CMS - Olhos Secos Caratinga

Documentação completa da integração do Sanity CMS com Next.js 15 e processo de importação de conteúdo.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Schemas Disponíveis](#schemas-disponíveis)
4. [Importação de Conteúdo](#importação-de-conteúdo)
5. [Revalidação de Cache](#revalidação-de-cache)
6. [Boas Práticas](#boas-práticas)

---

## Visão Geral

O site utiliza **Sanity CMS** como headless CMS para gerenciamento de conteúdo, integrado ao Next.js 15 com App Router. A arquitetura foi projetada para:

- **SEO Otimizado**: Todos os schemas incluem campos SEO completos
- **Compliance Médico**: Campos específicos para revisão médica e disclaimers
- **Revalidação Inteligente**: Cache tags do Next.js com webhooks do Sanity
- **Preview Mode**: Visualização de rascunhos sem publicação

### Tecnologias

- **Sanity Studio**: 3.72.1 (embutido em `/studio`)
- **next-sanity**: 9.8.32 (integração oficial)
- **Queries**: GROQ (Graph-Relational Object Queries)
- **Imagens**: Sanity Image URL + Next.js Image Optimization

---

## Arquitetura

### Clientes Sanity

O projeto utiliza **3 clientes distintos** para diferentes propósitos:

#### 1. `client` - Cliente Público (Read-Only)
```typescript
// src/sanity/client.ts
export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // CDN em produção
    perspective: 'published',
})
```

**Uso**: Buscar conteúdo publicado no frontend (pages, components).

#### 2. `writeClient` - Cliente com Token de Escrita
```typescript
export const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
    perspective: 'published',
})
```

**Uso**: Webhooks, scripts de seed, operações administrativas.
⚠️ **NUNCA exponha ao browser!**

#### 3. `previewClient` - Cliente para Preview/Draft
```typescript
export const previewClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: 'previewDrafts',
})
```

**Uso**: Preview mode para visualizar rascunhos.

### Helper: `sanityFetch`

Wrapper inteligente que adiciona suporte a cache tags do Next.js:

```typescript
const posts = await sanityFetch<Post[]>({
    query: GET_ALL_POSTS,
    tags: ['posts'], // Next.js cache tag
    revalidate: 3600, // Revalidar a cada 1h
})
```

---

## Schemas Disponíveis

### Documentos de Conteúdo

#### 1. **Post** (`post`)
Artigos do blog otimizados para SEO e compliance médico.

**Campos Principais**:
- `title`, `slug`, `excerpt`, `coverImage`
- `body` (Portable Text com componentes customizados)
- `author` (referência a `author`)
- `categories` (array de referências a `category`)
- `tags` (array de referências a `tag`)
- `seo` (objeto `seoFields`)
- `medicalCompliance` (objeto `medicalCompliance`)
- `relatedPosts` (array de referências a outros posts)
- `faq` (array de `faqItem`)

**Grupos**:
- Content, SEO, Organization, Compliance, Relations

#### 2. **Video** (`video`)
Vídeos do YouTube integrados ao site.

**Campos Principais**:
- `title`, `slug`, `youtubeUrl`, `duration`
- `thumbnail` (imagem customizada ou auto do YouTube)
- `category`, `tags`
- `seo`, `medicalCompliance`

#### 3. **Author** (`author`)
Autores de conteúdo (médicos, editores).

**Campos Específicos para Médicos**:
```typescript
credentials: {
    crm: 'CRM-MG 69.870',
    specialty: 'Oftalmologia',
    rqe: 'RQE número'
}
```

#### 4. **Category** (`category`)
Categorias principais para organização.

**Campos**: `title`, `slug`, `description`, `icon`, `color`, `image`

#### 5. **Tag** (`tag`)
Tags para classificação granular.

#### 6. **SiteSettings** (`siteSettings`)
Configurações globais do site (singleton).

**Inclui**:
- Informações da clínica (nome, endereço, telefone)
- Horários de funcionamento
- Links sociais
- SEO global
- Configurações de contato

### Object Types (Reutilizáveis)

#### `seoFields`
Campos SEO completos para cada documento:
- `metaTitle`, `metaDescription`
- `focusKeyword`, `ogImage`
- `canonicalUrl`, `noIndex`

#### `medicalCompliance`
Compliance médico obrigatório:
- `lastReviewedDate` (data da última revisão)
- `reviewedBy` (profissional responsável)
- `disclaimer` (aviso legal)
- `references` (array de referências científicas)

#### `faqItem`
Perguntas frequentes estruturadas para SEO:
- `question` (string)
- `answer` (Portable Text)

#### `portableTextBody`
Rich text customizado com componentes:
- Headings (H2, H3, H4)
- Lists (bullet, number)
- Blockquotes
- Images com caption
- Callouts (info, warning, success)
- Code blocks
- Videos embarcados

---

## Importação de Conteúdo

### Conteúdo Inicial (Seed)

O projeto inclui **6 artigos iniciais sobre olho seco** prontos para importação.

#### Artigos Incluídos:

1. **O Que é Olho Seco?** - Introdução à síndrome
2. **Ar-Condicionado e Olho Seco em Caratinga** - Fatores ambientais locais
3. **Colírio para Olho Seco** - Guia de tratamentos
4. **Telas de Computador e Celular** - Olho seco digital + Regra 20-20-20
5. **Olho Seco em Mulheres** - Menopausa e fatores hormonais
6. **Lentes de Contato e Olho Seco** - Uso seguro

Além disso, o seed cria:
- **1 autor médico**: Dr. Philipe Saraiva Cruz
- **5 categorias**: Sintomas, Tratamentos, Causas, Prevenção, Local (Caratinga)

### Como Executar o Seed

#### Pré-requisitos:

1. Configure as variáveis de ambiente em `.env.local`:

```bash
# Obrigatórios
NEXT_PUBLIC_SANITY_PROJECT_ID=seu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=seu-token-de-escrita

# Opcional
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
```

2. Gere o token de escrita no Sanity:
   - Acesse https://sanity.io/manage
   - Vá em **API → Tokens**
   - Crie um token com permissão de **Editor** ou **Administrator**

#### Executar Seed:

```bash
# Importar todos os posts
pnpm seed:posts
```

#### Saída Esperada:

```
🌱 Iniciando seed do Sanity CMS...

👤 Criando autor...
✅ Autor criado: Dr. Philipe Saraiva Cruz (author-123)

📁 Criando categorias...
✅ Categoria criada: Sintomas e Diagnóstico
✅ Categoria criada: Tratamentos
✅ Categoria criada: Causas e Fatores de Risco
✅ Categoria criada: Prevenção e Cuidados
✅ Categoria criada: Olho Seco em Caratinga

📝 Criando posts...
✅ Post criado: O Que é Olho Seco? Entenda a Síndrome do Olho Seco
✅ Post criado: Ar-Condicionado e Olho Seco: Como o Clima de Caratinga Afeta Seus Olhos
✅ Post criado: Colírio para Olho Seco: Qual é o Melhor Tratamento?
✅ Post criado: Telas de Computador e Celular Causam Olho Seco?
✅ Post criado: Olho Seco em Mulheres: Menopausa e Alterações Hormonais
✅ Post criado: Lentes de Contato e Olho Seco: Como Usar com Segurança

✨ Seed concluído com sucesso!

📊 Resumo:
   - 1 autor criado
   - 5 categorias criadas
   - 6 posts criados
```

### Personalizar Conteúdo

Edite `scripts/seed-data.ts` para adicionar mais posts:

```typescript
export const seedData = {
    author: { /* ... */ },
    categories: [ /* ... */ ],
    posts: [
        {
            title: 'Seu Novo Artigo',
            slug: { _type: 'slug', current: 'seu-novo-artigo' },
            excerpt: 'Descrição do artigo...',
            categoryRefs: [0, 1], // Índices das categorias
            body: [ /* Portable Text blocks */ ],
            seo: { /* SEO fields */ },
            medicalCompliance: { /* Compliance fields */ },
        },
        // Adicione mais posts aqui
    ],
}
```

---

## Revalidação de Cache

### Sistema de Cache Tags

O site usa **cache tags do Next.js 15** para revalidação granular:

```typescript
// Exemplo: buscar posts com cache tag
const posts = await sanityFetch<Post[]>({
    query: GET_ALL_POSTS,
    tags: ['posts'], // Tag para revalidação
    revalidate: 3600, // 1 hora
})
```

### Tags Utilizadas:

| Tag | Revalida | Quando |
|-----|----------|--------|
| `posts` | Listagem de posts | Post criado/editado/deletado |
| `post:{slug}` | Post específico | Post editado |
| `videos` | Listagem de vídeos | Vídeo criado/editado/deletado |
| `video:{slug}` | Vídeo específico | Vídeo editado |
| `siteSettings` | Configurações globais | Settings editado |

### Webhook de Revalidação

Configure o webhook no Sanity para revalidação automática:

#### 1. No Sanity Studio:

- Vá em **API → Webhooks**
- Crie novo webhook:
  - **Name**: `Revalidate Next.js Cache`
  - **URL**: `https://seu-dominio.com/api/revalidate`
  - **Dataset**: `production`
  - **Trigger on**: Create, Update, Delete
  - **Filter**: (deixe vazio para todos os documentos)
  - **HTTP method**: `POST`
  - **Secret**: Gere um token seguro

#### 2. Configure a Secret:

```bash
# .env.local
SANITY_REVALIDATE_SECRET=seu-token-seguro-aqui
```

#### 3. Webhook Funcionando:

Ao publicar/editar conteúdo no Sanity Studio, o webhook:
1. Dispara requisição POST para `/api/revalidate`
2. Valida a assinatura HMAC
3. Identifica o tipo de documento (`_type`)
4. Revalida as cache tags apropriadas
5. Retorna sucesso/erro

**Exemplo de resposta:**

```json
{
  "revalidated": true,
  "tags": ["posts", "post:olho-seco-ar-condicionado"],
  "now": "2025-01-15T10:30:00.000Z"
}
```

---

## Boas Práticas

### 1. Sempre Use Cache Tags

```typescript
// ✅ Bom
const posts = await sanityFetch({
    query: GET_ALL_POSTS,
    tags: ['posts'],
})

// ❌ Ruim (não permite revalidação)
const posts = await client.fetch(GET_ALL_POSTS)
```

### 2. Use o Cliente Apropriado

```typescript
// ✅ Frontend (pages/components)
import { client, sanityFetch } from '@/sanity/client'

// ✅ Preview mode
import { previewClient } from '@/sanity/client'

// ✅ Scripts administrativos
import { writeClient } from '@/sanity/client'

// ❌ NUNCA no frontend
import { writeClient } from '@/sanity/client' // EXPÕE TOKEN!
```

### 3. Compliance Médico Obrigatório

Todos os posts devem incluir:

```typescript
medicalCompliance: {
    lastReviewedDate: new Date().toISOString(),
    reviewedBy: 'Dr. Nome Completo - CRM-UF 12345',
    disclaimer: 'Este conteúdo é apenas informativo e não substitui a consulta médica profissional.',
}
```

### 4. SEO em Todos os Documentos

```typescript
seo: {
    metaTitle: 'Título otimizado (50-60 caracteres)',
    metaDescription: 'Descrição concisa 150-160 caracteres',
    focusKeyword: 'palavra-chave principal',
}
```

### 5. Use Portable Text para Conteúdo Rico

```typescript
body: [
    {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Título da Seção' }],
    },
    {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: 'Parágrafo de texto.' }],
    },
    {
        _type: 'block',
        listItem: 'bullet',
        children: [{ _type: 'span', text: 'Item de lista' }],
    },
]
```

---

## Próximos Passos

1. **Acessar Sanity Studio**: http://localhost:3000/studio
2. **Importar Conteúdo Inicial**: `pnpm seed:posts`
3. **Configurar Webhook**: No painel do Sanity
4. **Criar Mais Conteúdo**: Direto no Studio ou via seed

Para dúvidas sobre queries GROQ, consulte [CLAUDE.md](../CLAUDE.md) ou a [documentação oficial do Sanity](https://www.sanity.io/docs/groq).

---

**Atualizado em**: 21 de dezembro de 2024
**Revisado por**: Dr. Philipe Saraiva Cruz - CRM-MG 69.870
