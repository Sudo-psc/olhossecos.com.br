# Sistema de implementação aprovado

Direção: **A — Fluxo editorial compacto**, com orientação de leitura do
conceito **B — Trilha guiada**.

## Tokens

- fundo: branco real `#ffffff`;
- texto principal: azul profundo `#071d45`;
- texto secundário: `#334969`;
- ação e foco: teal `#087f95` / teal escuro `#00657a`;
- superfícies educativas: mist `#eff8fb`;
- linhas: `#c8d7e2`, sempre finas;
- alerta: coral `#e95f4f`, texto coral `#a93c32` e fundo `#fff6f3`;
- raios: 6–8 px em controles; listas e seções permanecem abertas;
- sombra: apenas em estados elevados necessários, nunca como estrutura padrão.

## Tipografia

- títulos: stack editorial serifada existente;
- corpo, navegação e controles: stack sans-serif existente;
- H1 de entrada: `clamp(2.8rem, 5.6vw, 5.7rem)` no desktop e
  `clamp(2.55rem, 11vw, 3.25rem)` no mobile;
- H1 de guia: `clamp(2.7rem, 4.8vw, 4.8rem)` no desktop e
  `clamp(2.35rem, 10.8vw, 3rem)` no mobile;
- labels: 0,68–0,76 rem, peso 800 e tracking apenas em categorias/estado.

## Espaçamento e contêiner

- escala: 4, 8, 12, 16, 24, 32, 48, 64, 96 px;
- contêiner: máximo de 1340 px, 32 px de respiro em cada lado no desktop e
  16 px no mobile;
- header: 76 px no desktop e 62 px no mobile;
- áreas de tarefa usam espaçamento compacto; leitura longa mantém ritmo amplo.

## Famílias de componentes

- `Header`: marca, navegação essencial, fonte/revisão e menu móvel;
- `PortalSearch`: borda azul, botão teal, tipografia de controle explícita;
- `SafetyStrip`: única superfície coral da entrada;
- `JourneyList`: lista aberta numerada, sem grade genérica no mobile;
- `GuideReadingHeader`: breadcrumb curto, categoria, H1, metadados e resumo;
- `ReadingProgress`: linha teal de 4 px abaixo do header;
- `GuideToc`: rail fixo no desktop e `details/summary` recolhível no mobile;
- `SearchResults`: status imediato, filtros recolhidos e linhas compactas.

## Movimento e estados

- transições de 160–180 ms apenas para cor, deslocamento curto e disclosure;
- foco com contorno teal de 3 px e offset de 3–4 px;
- `prefers-reduced-motion` reduz transições e desativa rolagem suave;
- seção atual do guia usa cor/peso e linha lateral, sem animação decorativa.

## Conteúdo permitido na primeira dobra

- marca e navegação existentes;
- “Informação independente e baseada em fontes”;
- “Entenda seus sintomas com clareza.”;
- resumo educativo aprovado;
- busca, botão “Buscar” e sugestões existentes;
- faixa de segurança e link para sinais de alerta;
- início de “Comece por onde você está”.

Não adicionar cidades, profissionais, agenda, contato, produtos, publicidade,
métricas promocionais ou recomendações individuais.
