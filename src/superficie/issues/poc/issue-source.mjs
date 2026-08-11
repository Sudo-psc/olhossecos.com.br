export const issue = {
  id: "superficie-poc",
  number: "POC",
  title: "SUPERFÍCIE Reader Prototype",
  subtitle: "Revista de Olho Seco e Superfície Ocular",
  pages: [
    {
      type: "cover",
      eyebrow: "EDIÇÃO DE LABORATÓRIO · CONTEÚDO DE TESTE",
      title: "SUPERFÍCIE",
      subtitle:
        "Um protótipo para experimentar leitura digital com calma, clareza e contexto.",
      body: [
        "Esta capa pertence a uma edição fictícia criada apenas para validar o reader HTML5.",
      ],
    },
    {
      type: "editorial",
      eyebrow: "EDITORIAL · PÁGINA 2",
      title: "Ler também é perceber o espaço",
      subtitle: "Uma nota sobre o propósito deste ensaio editorial.",
      body: [
        "Esta edição de demonstração testa uma experiência de leitura que combina composição visual, texto selecionável e navegação acessível.",
        "Todo o conteúdo é neutro e temporário. Não há orientação clínica, recomendação terapêutica ou afirmação médica nesta publicação de laboratório.",
        "A proposta é simples: permitir que cada página seja bonita como uma revista e útil como um documento digital bem estruturado.",
      ],
    },
    {
      type: "contents",
      eyebrow: "SUMÁRIO · PÁGINA 3",
      title: "Nesta edição de teste",
      subtitle: "Quatro pontos de entrada para validar navegação direta.",
      body: [
        "02 — Editorial: a intenção do protótipo",
        "03 — Sumário: caminhos da edição",
        "04 — Artigo: duas camadas, uma leitura",
        "07 — Encerramento: próximos passos",
      ],
    },
    {
      type: "article",
      articleId: "duas-camadas",
      eyebrow: "ARTIGO DE DEMONSTRAÇÃO · PÁGINA 4",
      title: "Duas camadas, uma leitura",
      subtitle:
        "A página visual e o texto HTML trabalham juntos sem disputar atenção.",
      body: [
        "Uma revista digital pode preservar ritmo, hierarquia e identidade sem transformar cada página em uma imagem inacessível.",
        "Neste protótipo, a camada visual apresenta a composição editorial. Sobre ela, uma camada de texto real permite busca, seleção, destaque e tecnologias assistivas.",
        "A separação também prepara o conteúdo para outros contextos: modo texto, deep links e futuras integrações com um pipeline editorial.",
      ],
    },
    {
      type: "article",
      articleId: "duas-camadas",
      eyebrow: "ARTIGO DE DEMONSTRAÇÃO · PÁGINA 5",
      title: "Continuidade sem dependência",
      subtitle: "O engine recebe conteúdo; o conteúdo não conhece o engine.",
      body: [
        "Cada edição é descrita por um manifest validado. Páginas, miniaturas, textos, índice de busca e artigos acessíveis permanecem independentes da interface.",
        "Por isso, substituir esta edição fictícia por outra deve exigir novos arquivos editoriais, não uma reescrita do reader.",
        "O resultado esperado é uma infraestrutura que evolui por camadas e pode adotar novos formatos sem quebrar a experiência existente.",
      ],
    },
    {
      type: "infographic",
      eyebrow: "MAPA DO ENGINE · PÁGINA 6",
      title: "Conteúdo entra. Experiências saem.",
      subtitle: "Um diagrama conceitual, sem dados clínicos.",
      body: [
        "01 · Manifest — descreve a edição",
        "02 · Renders — preservam a composição",
        "03 · Texto — habilita busca e acesso",
        "04 · Storage — guarda preferências locais",
        "05 · Reader — coordena a experiência",
      ],
    },
    {
      type: "closing",
      eyebrow: "ENCERRAMENTO · PÁGINA 7",
      title: "Este é apenas o primeiro caderno",
      subtitle: "O POC existe para revelar decisões antes da edição real.",
      body: [
        "Os próximos passos dependem de revisão humana: validar gestos, legibilidade, peso dos assets e comportamento em navegadores reais.",
        "Nenhum conteúdo da Edição Fundadora foi processado ou publicado nesta fase.",
        "Ao aprovar o protótipo, o mesmo contrato poderá orientar pipeline, artigos HTML e novas edições.",
      ],
    },
    {
      type: "back-cover",
      eyebrow: "CONTRACAPA · PÁGINA 8",
      title: "SUPERFÍCIE",
      subtitle: "Protótipo funcional · uso interno · não indexar",
      body: [
        "Fim da edição de laboratório.",
        "Use o sumário, a busca ou as miniaturas para continuar explorando o reader.",
      ],
    },
  ],
  toc: [
    { title: "Editorial", page: 2 },
    { title: "Sumário", page: 3 },
    { title: "Duas camadas, uma leitura", page: 4 },
    { title: "Encerramento", page: 7 },
  ],
  articles: [
    {
      id: "duas-camadas",
      title: "Duas camadas, uma leitura",
      pages: [4, 5],
      htmlPath: "/superficie/issues/poc/articles/duas-camadas.html",
    },
  ],
};
