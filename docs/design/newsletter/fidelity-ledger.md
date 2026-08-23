# Newsletter pública — fidelity ledger

Data: 8 de agosto de 2026  
Rota: `/newsletter`

## Referências aceitas

- Especificação aprovada: `docs/superpowers/specs/2026-08-08-newsletter-page-design.md`.
- Portal desktop: `docs/design/homepage-v2/gate2-implementation-desktop.png`.
- Portal mobile: `docs/design/homepage-v2/gate2-implementation-mobile.png`.
- Linguagem editorial da SUPERFÍCIE: `docs/design/superficie/qa/gate5/newsletter-desktop.png`.

Esta entrega é uma rota pequena dentro do design system já aprovado, sem nova
direção de arte nem novos assets. Por isso, a exceção prevista para pequenas
extensões de um sistema existente foi aplicada e não houve nova geração de
conceito por imagem.

## Método

O navegador integrado foi tentado primeiro, mas a conexão MCP retornou HTTP 404
antes de abrir a página. O fallback foi Chromium local controlado por
Playwright, usando o build de produção em `127.0.0.1:4335` e bancos SQLite
temporários. As capturas finais foram abertas com `view_image` em resolução
original e comparadas diretamente com as referências acima.

Larguras verificadas: 320, 375, 390, 768, 1024, 1280 e 1440 px. Em todas elas:

- um H1;
- canonical `https://olhossecos.com.br/newsletter`;
- nenhum overflow horizontal;
- nenhum erro de console;
- checkbox de consentimento inicialmente desmarcado;
- três acessos globais para `/newsletter` entre header, menu móvel e footer;
- foco inicial visível com outline de 3 px.

## Comparação visual

| Ponto               | Evidência da referência                                                | Evidência renderizada                                                                     | Veredito |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Header e navegação  | Logo editorial, navegação central e CTA contornado no portal           | Mesma estrutura e proporções em 1440 px; menu compacto em 390 px                          | Fiel     |
| Paleta              | Branco, azul-marinho, teal e fundos frios claros                       | Hero em `--mist`, texto em `--ink`, CTA/formulário em teal e seções brancas/navy          | Fiel     |
| Tipografia          | Títulos serifados amplos e corpo sans legível                          | H1 e títulos mantêm família, escala e ritmo editorial do portal                           | Fiel     |
| Formulário          | Controles ortogonais, filetes finos, CTA sóbrio e labels em caixa alta | Formulário usa borda de 1 px, topo teal, controles de 52 px e sem radius promocional      | Fiel     |
| Modelo de contêiner | Espaço aberto, divisores e faixas em vez de grade de cards             | Audiências divididas por filete; ecossistema em faixa navy; nenhum card genérico          | Fiel     |
| Responsividade      | Mobile em coluna, tipografia fluida e menu acessível                   | Texto precede formulário de 320 a 768 px; links e campos mantêm largura e toque adequados | Fiel     |
| Estado progressivo  | Fluxo editorial discreto, sem barreira de perfil inicial               | Após 201, painel opcional preserva a mesma linguagem e permite “Agora não”                | Fiel     |

## Copy acima da dobra

Copy permitida pela especificação:

- `Acompanhe a evolução do cuidado ocular.`
- `Uma correspondência editorial do olhossecos.com.br com conteúdos selecionados para diferentes jornadas de cuidado e prática profissional.`
- `E-mail`
- `Quero receber`
- consentimento editorial e link para a Política de Privacidade.

Resultado: nenhuma eyebrow, badge, claim, métrica, promessa de frequência ou
texto promocional adicional foi introduzido.

## Interação e acessibilidade

- menu móvel abre e fecha com `Escape`, devolvendo foco ao botão;
- cadastro mínimo retorna 201 e move o foco para o título do perfil opcional;
- “Agora não” fecha o painel e limpa e-mail/token temporários;
- perfil `paciente` retorna 200 e exibe `Preferência registrada.`;
- eventos de cadastro e perfil preservam `source`, `audience_role` e UTMs,
  sem expor o e-mail no `dataLayer`;
- `/`, `/privacidade`, `/superficie` e `/livros` foram reabertos em 390 e 1440
  px sem overflow ou erros; a SUPERFÍCIE continuou renderizando a variante
  compartilhada com origem `superficie`.

## Artefatos finais

- `newsletter-1440.png`: página completa em 1440 × 1000 px de viewport;
- `newsletter-390.png`: página completa em 390 × 844 px de viewport;
- `newsletter-profile-390.png`: estado progressivo em 390 × 844 px de viewport.

Não permaneceram divergências visuais materiais ou desvios intencionais.
