/**
 * Fonte editorial da edição de laboratório `edicao-00`.
 *
 * O reader não importa este módulo — só o `manifest.json` gerado. A cópia
 * das páginas vem dos objetos já publicados em `src/lib/superficie.ts`
 * (why-it-matters / practice / limitations). O HTML canônico continua nas
 * rotas `/superficie/artigos/*`. `founderIssue.articles` permanece [].
 */
export const issue = {
  id: "edicao-00",
  number: "00",
  title: "A nova era da superfície ocular",
  subtitle:
    "Do sintoma ao fenótipo: diagnóstico multimodal e terapias dirigidas por mecanismo.",
  pages: [
    {
      type: "cover",
      plate: "capa",
      theme: "dark",
      eyebrow: "EDIÇÃO 00 · SUPERFÍCIE",
      title: "A nova era da superfície ocular",
      subtitle:
        "Do sintoma ao fenótipo: diagnóstico multimodal e terapias dirigidas por mecanismo.",
      body: [
        "Duas matérias já publicadas em HTML. A edição fundadora continua em produção.",
      ],
    },
    {
      type: "editorial",
      plate: "interior",
      theme: "light",
      eyebrow: "EDITORIAL · PÁGINA 02",
      title: "Duas leituras, edição ainda em produção",
      subtitle: "O HTML publicado é o texto canônico desta revista.",
      body: [
        "Este caderno de laboratório reúne as duas matérias já no ar da SUPERFÍCIE: a biologia molecular da DGM e o TFOS DEWS III na prática.",
        "A Edição Fundadora nº 0 continua em produção. O que você vê aqui é um objeto de revista para o reader — não é o editorial fundador ainda não escrito, e não substitui as páginas HTML.",
        "O texto canônico de cada matéria permanece em /superficie/artigos/. Referências, disclosures e o selo editorial estão lá. Nestas páginas impressas há só o recorte que cabe no papel.",
      ],
    },
    {
      type: "contents",
      plate: "interior",
      theme: "light",
      eyebrow: "SUMÁRIO · PÁGINA 03",
      title: "Nesta edição",
      subtitle:
        "Dois artigos já publicados; o restante da edição ainda está em produção.",
      body: [
        "02 — Editorial",
        "04 — Além da obstrução: a biologia molecular da DGM",
        "06 — TFOS DEWS III na prática",
      ],
    },
    {
      type: "article",
      articleId: "biologia-molecular-da-dgm",
      plate: "dgm",
      theme: "dark",
      eyebrow: "CLÍNICA · PÁGINA 04",
      title: "Além da obstrução: a biologia molecular da DGM",
      subtitle:
        "PPARγ, receptor androgênico e células progenitoras ajudam a explicar a perda funcional da glândula de Meibomius antes da atrofia.",
      body: [
        "A disfunção das glândulas de Meibomius não é apenas uma doença de glândulas obstruídas. Alterações na diferenciação dos meibócitos, na sinalização androgênica e na renovação do compartimento progenitor podem preceder a atrofia — mas a evidência permanece majoritariamente pré-clínica.",
        "A obstrução é apenas parte da história: a DGM também pode envolver falha na produção e na renovação de meibócitos funcionais.",
        "Três eixos convergem: redução de PPARγ, menor suporte androgênico e disfunção do nicho progenitor.",
        "A implicação clínica atual é fenotipar melhor, não prescrever vias moleculares.",
      ],
    },
    {
      type: "article",
      articleId: "biologia-molecular-da-dgm",
      plate: "dgm",
      theme: "dark",
      eyebrow: "CLÍNICA · PÁGINA 05",
      title: "O que muda na prática — e o que ainda não sabemos",
      subtitle: "A mudança imediata é de raciocínio, não de prescrição.",
      body: [
        "A meibografia mostra estrutura; a expressão glandular e o exame da margem palpebral mostram parte da função; sintomas e estabilidade lacrimal mostram repercussão. Nenhuma dessas medidas revela diretamente a atividade de PPARγ, receptor androgênico, Notch, Hedgehog ou ferroptose em um paciente.",
        "Por isso, um fenótipo aparentemente obstrutivo não deve ser interpretado como mecanismo único. A avaliação pode integrar morfologia, qualidade e expressibilidade da secreção, sinais inflamatórios, estabilidade do filme, exposições e contexto hormonal.",
        "A maior parte da evidência que sustenta este modelo vem de culturas celulares, organoides, rastreamento de linhagem e animais. Não estabelece, sozinha, causalidade clínica nem eficácia terapêutica em pessoas com DGM.",
        "Agonistas de PPARγ, moduladores de Hedgehog, terapias androgênicas e estratégias de rejuvenescimento do nicho progenitor são hipóteses translacionais. Neste estágio, não devem ser apresentados como tratamento estabelecido.",
      ],
    },
    {
      type: "article",
      articleId: "tfos-dews-iii-na-pratica",
      plate: "tfos",
      theme: "dark",
      eyebrow: "EVIDÊNCIA · PÁGINA 06",
      title: "TFOS DEWS III na prática",
      subtitle:
        "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção.",
      body: [
        "O TFOS DEWS III não aposenta a gravidade; muda sua função. Em vez de determinar, sozinha, uma sequência universal de tratamentos, ela passa a modular urgência, intensidade e proteção da superfície.",
        "O consenso define o olho seco como doença multifatorial e sintomática, marcada pela perda de homeostase do filme lacrimal e/ou da superfície ocular, na qual instabilidade e hiperosmolaridade, inflamação e dano, e anormalidades neurossensoriais atuam como fatores etiológicos.",
        "A superfície ocular passa a dividir explicitamente com o filme lacrimal o núcleo da homeostase. Isso acomoda melhor situações em que fricção, dano epitelial, anatomia, inflamação primária ou disfunção neural sustentam sintomas.",
        "A doença é, por definição, sintomática. Sinais isolados exigem acompanhamento, mas não preenchem sozinhos a definição. Sintomas sem evidência objetiva de perda de homeostase obrigam a ampliar o diagnóstico diferencial.",
      ],
    },
    {
      type: "article",
      articleId: "tfos-dews-iii-na-pratica",
      plate: "tfos",
      theme: "dark",
      eyebrow: "EVIDÊNCIA · PÁGINA 07",
      title: "Nove drivers e o mapa de seis minutos",
      subtitle:
        "O algoritmo pode ser iniciado com recursos presentes em grande parte dos consultórios oftalmológicos brasileiros.",
      body: [
        "Filme lacrimal: lipídico, aquoso e mucina/glicocálix.",
        "Pálpebras: piscar/fechamento e margem palpebral.",
        "Superfície ocular: desalinhamento anatômico, disfunção neural, dano/ruptura celular e inflamação primária/estresse oxidativo.",
        "0–1 min — Sintomas e impacto. 1–2 min — Mascaradores. 2–3 min — Filme sem corante. 3–4 min — Pálpebras e meibo. 4–5 min — Superfície com corantes. 5–6 min — Plano testável: nomeie os drivers, pareie cada conduta a um alvo e defina o que deverá ter mudado no retorno.",
      ],
    },
    {
      type: "back-cover",
      plate: "capa",
      theme: "dark",
      eyebrow: "CONTRACAPA · PÁGINA 08",
      title: "SUPERFÍCIE",
      subtitle: "Ler o artigo completo — o HTML é o texto canônico.",
      body: [
        "Além da obstrução: a biologia molecular da DGM — /superficie/artigos/biologia-molecular-da-dgm",
        "TFOS DEWS III na prática — /superficie/artigos/tfos-dews-iii-na-pratica",
        "A edição continua em produção. Estas páginas não substituem o HTML publicado.",
      ],
    },
  ],
  toc: [
    { title: "Editorial", page: 2 },
    { title: "Além da obstrução: a biologia molecular da DGM", page: 4 },
    { title: "TFOS DEWS III na prática", page: 6 },
  ],
  articles: [
    {
      id: "biologia-molecular-da-dgm",
      title: "Além da obstrução: a biologia molecular da DGM",
      pages: [4, 5],
      htmlPath:
        "/superficie/issues/edicao-00/articles/biologia-molecular-da-dgm.html",
    },
    {
      id: "tfos-dews-iii-na-pratica",
      title: "TFOS DEWS III na prática",
      pages: [6, 7],
      htmlPath:
        "/superficie/issues/edicao-00/articles/tfos-dews-iii-na-pratica.html",
    },
  ],
};
