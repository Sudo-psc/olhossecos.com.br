# Página pública de newsletter

Data: 8 de agosto de 2026  
Status: design e especificação aprovados

## Contexto

O portal possui um endpoint funcional em `/api/newsletter` e formulários nas
áreas de Livros e SUPERFÍCIE, mas a rota pública `/newsletter` não existe. A
ausência produz HTTP 404, contradiz a arquitetura editorial aprovada e bloqueia
o checklist do Gate F para o commit `44afb99`.

## Objetivo

Criar `/newsletter` como a camada transversal de relacionamento do
olhossecos.com.br. A página deve atender pacientes e profissionais sem exigir
uma escolha de público antes do cadastro, reduzir a coleta inicial ao mínimo e
permitir segmentação opcional após a confirmação.

## Princípios

- O portal é a marca principal da página; SUPERFÍCIE, Livros e conteúdos para
  pacientes aparecem como partes do ecossistema.
- O primeiro passo solicita somente e-mail e consentimento explícito.
- O perfil é opcional e aparece somente depois do cadastro bem-sucedido.
- Nenhum checkbox vem pré-selecionado.
- A página não promete frequência, edição, conteúdo ou benefício ainda não
  confirmado.
- O visual segue o design system atual do portal: branco, azul profundo, teal,
  tipografia editorial e linhas finas. Não serão criados novos assets.
- O conteúdo permanece educativo e não oferece diagnóstico, tratamento ou
  aconselhamento individual.

## Jornada do usuário

1. O visitante chega por `/newsletter`, pelo CTA do header, pelo menu móvel ou
   pelo footer.
2. O hero explica que a correspondência reúne conteúdos selecionados sobre
   olho seco, superfície ocular, publicações e ferramentas.
3. Dois blocos editoriais descrevem o valor para pacientes e profissionais,
   sem transformar essa distinção em uma barreira de entrada.
4. O formulário inicial coleta:
   - e-mail;
   - consentimento LGPD obrigatório;
   - honeypot invisível;
   - origem `newsletter` e UTMs.
5. Após HTTP 201, o formulário confirma o cadastro e oferece, de forma
   opcional, os perfis já suportados: paciente, médico, residente/fellow,
   pesquisador, outro profissional de saúde, indústria/parceiro ou outro.
6. O usuário pode concluir o perfil com o token temporário ou escolher “Agora
   não”. O token não aparece na URL nem é persistido no navegador.
7. Falhas de validação, origem, limite ou indisponibilidade aparecem em uma
   região `aria-live`, preservando os dados digitados quando apropriado.

## Arquitetura da página

### Hero

- Breadcrumbs: Início → Newsletter.
- H1: **Acompanhe a evolução do cuidado ocular.**
- Texto de apoio: correspondência editorial do olhossecos.com.br com conteúdo
  selecionado para diferentes jornadas de cuidado e prática profissional.
- Formulário visível na primeira dobra no desktop e imediatamente após o texto
  no mobile.

### Conteúdo para diferentes jornadas

- **Para pacientes:** conteúdos compreensíveis sobre sintomas, investigação,
  autocuidado responsável, tratamentos e quando procurar avaliação.
- **Para profissionais:** novas edições da SUPERFÍCIE, evidências, diagnóstico
  multimodal, tecnologias e publicações editoriais.
- A apresentação usa colunas editoriais separadas por filetes, sem cards
  genéricos ou seleção obrigatória.

### O ecossistema editorial

Uma faixa curta conecta a newsletter a três fontes reais do portal:

- guias e conteúdos educativos;
- SUPERFÍCIE;
- livros e ferramentas digitais.

Cada item aponta para uma rota existente. Não serão usados números, calendários
ou promessas de publicação não confirmados.

### Confiança e privacidade

- Consentimento claro e específico junto ao formulário.
- Links para `/privacidade` e `/politica-editorial`.
- Explicação concisa de que os dados não são compartilhados nominalmente com
  anunciantes sem base legal e consentimento específico.
- Sem trackers adicionais, dark patterns ou campos obrigatórios além de e-mail
  e consentimento.

## Componentes e reutilização

- Criar `src/pages/newsletter.astro` usando o layout geral `Layout.astro`.
- Extrair o fluxo interativo atual de
  `SuperficieNewsletterForm.astro` para um componente reutilizável
  `NewsletterSignupForm.astro`.
- Manter `SuperficieNewsletterForm.astro` como wrapper visual ou compatível,
  preservando a aparência e o comportamento já aprovados da revista.
- O componente compartilhado recebe pelo menos `endpoint`, `source` e
  `variant`. As variantes `portal` e `superficie` alteram somente apresentação
  e copy; validação, envio, acessibilidade e progressive profiling permanecem
  únicos.
- Não duplicar o JavaScript de cadastro em uma segunda implementação.

## Dados e backend

- Ampliar a origem aceita pelo backend de `livros | superficie` para
  `livros | superficie | newsletter`.
- Preservar o esquema SQLite e a migração aditiva existentes; nenhuma coluna
  nova é necessária.
- Continuar armazenando somente o hash do token de perfil, com expiração e uso
  único.
- Preservar validação de e-mail, limite de payload, rate limit, origem,
  honeypot, normalização e respostas sem cache.
- Não introduzir provedor externo de e-mail nesta entrega.

## Navegação e descoberta

- Atualizar os CTAs de newsletter do header e do menu móvel para
  `/newsletter`.
- Adicionar Newsletter ao footer do portal.
- Manter CTAs contextuais de Livros e SUPERFÍCIE apontando para seus próprios
  formulários quando isso preservar melhor a intenção local.
- Incluir `/newsletter` automaticamente no sitemap canônico.
- Não criar redirects para os anchors existentes; eles continuam válidos.

## SEO e dados estruturados

- Title: `Newsletter sobre Olho Seco e Superfície Ocular | Olhos Secos`.
- Meta description: `Receba conteúdos selecionados sobre olho seco, saúde
  ocular, novas publicações, livros e atualizações da revista SUPERFÍCIE.`
- Canonical: `https://olhossecos.com.br/newsletter`.
- Um único H1.
- Breadcrumbs visíveis e `BreadcrumbList` emitido pelo layout.
- Schema principal `WebPage`; não marcar conteúdo, periodicidade ou organização
  que não estejam visíveis.
- Open Graph reutiliza o asset social geral do portal.

## Analytics

- Preservar `newsletter_signup` no cadastro concluído.
- Preservar `newsletter_profile_complete` no perfil opcional concluído.
- Enviar `source: newsletter` e UTMs como contexto, sem dados pessoais no
  evento.
- Não duplicar eventos entre o formulário e a página.

## Acessibilidade e responsividade

- Objetivo WCAG 2.2 AA.
- Labels explícitos, foco visível, mensagens `aria-live`, ordem semântica e
  navegação integral por teclado.
- Touch targets adequados e layout sem overflow em 320, 375, 390, 768, 1024,
  1280 e 1440 px.
- Respeitar `prefers-reduced-motion`; a página não exige animação para
  compreensão ou conclusão do fluxo.

## Testes e critérios de aceite

### TDD

1. Estender o teste de release para exigir `/newsletter` com HTTP 200, H1,
   canonical própria e presença no sitemap; confirmar RED antes da página.
2. Adicionar teste do backend para aceitar `source: newsletter` e persistir a
   origem; confirmar RED antes da mudança.
3. Implementar o mínimo necessário e obter GREEN nos dois comportamentos.

### Regressão

- `npm run check` completo.
- `npm audit --audit-level=high` e auditoria de produção.
- Cadastro da página em banco temporário: 201 e origem `newsletter`.
- Origem cruzada: 403; GET no endpoint: 405; consentimento ausente: 422.
- Fluxos existentes de Livros e SUPERFÍCIE continuam aprovados.

### Browser QA

- Desktop e mobile nas larguras definidas.
- Sem overflow horizontal, erros de console ou links quebrados.
- Menu, foco, consentimento, sucesso, erro e perfil opcional exercitados.
- Comparação visual com o design system atual do portal e da SUPERFÍCIE.

## Rollout e rollback

- Implementar em branch e worktree isolados baseados em `master`.
- Submeter a revisão humana e CI antes de merge.
- Um novo commit de merge, e não `44afb99`, será o candidato de deploy.
- O Gate F deverá reconstruir o novo SHA, validar em porta separada, preservar o
  `dist` ativo e só então realizar a troca.
- Rollback restaura o `dist` preservado. A alteração de origem no backend é
  compatível com o banco existente e não exige rollback de schema.

## Fora de escopo

- Definir calendário ou frequência editorial.
- Enviar campanhas de e-mail.
- Integrar provedor externo de automação ou CRM.
- Criar central de preferências, automação de descadastro ou double opt-in.
- Coletar cidade, estado, especialidade ou organização no primeiro passo.
- Redesenhar os formulários existentes de Livros ou SUPERFÍCIE além do mínimo
  necessário para compartilhar a implementação.
- Fazer merge ou deploy sem novas autorizações explícitas.
