# Homepage V2 — auditoria e plano de preservação

Data da auditoria: 7 de agosto de 2026.

## Estado atual

- Stack: Astro 7, TypeScript, CSS local/global, SSG, sem framework pesado de interface.
- Homepage: `src/pages/index.astro`.
- Shell global: `src/layouts/Layout.astro`, `src/components/Header.astro` e `src/components/Footer.astro`.
- Conteúdo: arrays locais tipados para guias, fontes, figuras e livros. A configuração de Sanity permanece apenas no `.env.example`; não há cliente CMS ativo no código atual.
- Analytics: a homepage não dispara eventos. Um padrão local de `dataLayer` + `CustomEvent("olhossecos:analytics")` existe apenas no trabalho ainda não publicado da seção de livros.
- SEO: canonical, Open Graph, Twitter Card e grafo JSON-LD (`Organization`, `WebSite`, `ImageObject`, `WebPage` e breadcrumbs internos) já são emitidos pelo layout.
- Acessibilidade existente: skip link, foco visível, menu com `aria-expanded`, Escape, landmarks e hierarquia de headings consistente.
- Rotas já existentes relevantes: `/olho-seco`, `/sintomas`, `/causas`, `/diagnostico`, `/autocuidado`, `/tratamentos`, `/sinais-de-alerta`, `/guias`, `/livros`, `/app`, `/autor/philipe-saraiva-cruz`, `/fontes`, `/politica-editorial` e `/privacidade`.
- Rotas exigidas pela V2 que ainda não existem: `/profissionais`, `/superficie` e `/newsletter`.

## Baseline visual e técnico

- Captura desktop atual: `audit-current-desktop.png` (1440 × 1000).
- Captura mobile atual: `audit-current-mobile.png` (390 × 844).
- Lighthouse móvel atual: performance 99; FCP 1,7 s; LCP 1,7 s; TBT 0 ms; CLS 0; Speed Index 1,7 s.
- Relatório bruto: `lighthouse-current-mobile.json`.

## Inventário da homepage atual

1. Header com EyeMark, “Olho Seco — Portal do paciente”, sete links e atalho de fontes.
2. Hero focado no paciente, busca de guias, sugestões de busca e imagem responsiva das camadas do filme lacrimal.
3. Faixa de sinais urgentes.
4. Quatro caminhos do paciente.
5. Explicação visual do filme lacrimal.
6. Biblioteca com um guia principal e três leituras.
7. Bloco de confiança editorial.
8. Footer navy com três grupos de links e disclaimer.

## Preservar

- EyeMark e a identidade existente até revisão explícita da marca.
- Navy, teal, branco, títulos serifados, corpo sans-serif e regras editoriais finas.
- Busca do portal como utilidade secundária da jornada do paciente; ela não precisa competir com os dois CTAs do novo hero.
- Conteúdo clínico, guias, glossário, fontes, datas de revisão e política editorial já existentes.
- Sinais de alerta e disclaimers de segurança, realocados sem dominar o hero.
- Imagem científica do filme lacrimal e seus formatos AVIF/WebP como fallback/recurso editorial; a nova direção pode usar outro visual somente após aprovação.
- Infraestrutura de SEO, canonical, Open Graph, JSON-LD e breadcrumbs.
- Menu acessível, skip link, foco, reduced motion e navegação por teclado.
- SSG, ausência de bibliotecas pesadas, imagens responsivas e dimensões reservadas.
- Rotas `/app` e `/livros` e dados tipados já preparados para os dois livros reais.
- Mudanças locais não relacionadas já em andamento em livros, autor, header, footer, configuração e política editorial.

## Transformar

- Posicionamento de “portal do paciente” para portal temático central com jornadas separadas de paciente e profissional.
- Hero de busca única para hero de identificação de intenção com dois CTAs e visual científico editorial.
- Caminhos exclusivamente do paciente para dois territórios editoriais irmãos: Pacientes e Profissionais.
- Biblioteca genérica para “Comece por aqui” com seis guias essenciais e origem de dados preparada para CMS.
- Bloco de confiança para uma arquitetura completa com SUPERFÍCIE, livros, app, atualização profissional, newsletter e responsabilidade editorial.
- Header/footer para refletir os hubs temáticos, mantendo clareza e acessibilidade.

## Não carregar para a V2

- O subtítulo de marca “Portal do paciente” no topo, pois exclui a nova jornada profissional.
- A busca como ação dominante do hero.
- Cards uniformes e repetitivos.
- Qualquer CTA clínico/agendamento ou centralidade biográfica.
- Claims não documentados do Dry Eye Widget.
- Referências ou edições inventadas.

## Dependências antes da implementação

1. Aprovar wireframe desktop, wireframe mobile e hero em alta fidelidade.
2. Decidir a apresentação final do nome no header: preservar “Olho Seco” com EyeMark ou ajustar apenas o descritor.
3. Definir o estado das rotas ainda ausentes (`/profissionais`, `/superficie`, `/newsletter`) para evitar links mortos no primeiro release.
4. Confirmar endpoint/provedor da newsletter e texto final de consentimento/LGPD.
5. Confirmar a fonte de conteúdo para os módulos dinâmicos; até lá, usar adaptadores tipados locais e estados vazios honestos.
6. Confirmar se o mockup da Edição Fundadora aprovado no Google Drive poderá ser usado no site; até então, mostrar somente composição conceitual identificada como “EM DESENVOLVIMENTO”.
7. Definir o responsável técnico/editorial e identificação profissional completa exigida pela regulamentação antes da publicação.

## Plano incremental pós-aprovação

- Gate 2A: header, hero, roteamento paciente/profissional, “Comece por aqui” e SUPERFÍCIE.
- QA intermediário: screenshots, 320–1440px, teclado, contraste, console, links e regressão de performance.
- Gate 2B: livros, app, atualização profissional, evidência quando real, newsletter, sobre, responsabilidade editorial e footer.
- QA final: metadata, OG, JSON-LD, analytics, formulários, LGPD, páginas legais, todos os CTAs e Core Web Vitals de laboratório.
