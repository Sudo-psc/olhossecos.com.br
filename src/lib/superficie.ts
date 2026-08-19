export const magazineCategories = [
  "Clínica",
  "Diagnóstico",
  "Tecnologia",
  "Terapêutica",
  "Evidência",
  "Entrevista",
  "Gestão",
  "Perspectiva",
  "Inovação",
] as const;

export type MagazineCategory = (typeof magazineCategories)[number];

export type MagazineIssueStatus = "planning" | "in_production" | "published";
export type MagazineArticleStatus =
  "draft" | "review" | "scheduled" | "published";

export type MagazineArticleSectionKind =
  "body" | "why-it-matters" | "evidence" | "practice" | "limitations";

export interface MagazineContributor {
  name: string;
  slug?: string;
  specialty?: string;
  affiliation?: string;
}

export interface MagazineArticleFigure {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  avif?: string;
  webp?: string;
}

export interface MagazineArticleSection {
  id: string;
  title: string;
  kind: MagazineArticleSectionKind;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
  figure?: MagazineArticleFigure;
}

export interface MagazineReference {
  label: string;
  url: string;
  doi?: string;
  accessedAt?: string;
}

export interface MagazineSponsor {
  name: string;
  label: "CONTEÚDO PATROCINADO" | "PARCERIA EDUCACIONAL";
}

/**
 * Selo público de processo editorial. Nenhum selo é automático: a matéria só
 * recebe o selo correspondente se o processo tiver sido concluído e
 * registrado. Sem revisor independente nomeado, o selo honesto é
 * "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES".
 */
export const magazineReviewSeals = [
  "REVISÃO CIENTÍFICA EDITORIAL",
  "REVISÃO METODOLÓGICA",
  "AVALIAÇÃO EDITORIAL INDEPENDENTE",
  "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  "OPINIÃO",
] as const;

export type MagazineReviewSeal = (typeof magazineReviewSeals)[number];

/**
 * Declaração editorial nomeada. São categorias distintas exigidas pelo ICMJE
 * — financiamento, conflito, uso de IA, revisão, ética. Num parágrafo único
 * o leitor que procura uma delas precisa garimpar as outras quatro.
 */
export interface MagazineDisclosure {
  label: string;
  text: string;
}

export interface MagazineArticle {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: MagazineArticleSection[];
  category: MagazineCategory;
  author: MagazineContributor;
  reviewer?: MagazineContributor;
  reviewSeal: MagazineReviewSeal;
  status: MagazineArticleStatus;
  issue?: string;
  publishedAt?: string;
  modifiedAt?: string;
  references: MagazineReference[];
  disclosures: MagazineDisclosure[];
  sponsored: boolean;
  sponsor?: MagazineSponsor;
  featuredImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    avif?: string;
    webp?: string;
  };
  heroBackground?: {
    src: string;
    avif?: string;
    webp?: string;
    width?: number;
    height?: number;
  };
  ogImage?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
    type?: string;
  };
  tags: string[];
  seo: {
    title: string;
    description: string;
    canonical: string;
  };
}

const WORDS_PER_MINUTE = 220;

const articleText = (article: MagazineArticle) =>
  article.content
    .flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.callout ? [section.callout] : []),
      ...(section.bullets ?? []),
    ])
    .join(" ")
    .trim();

export const calculateArticleReadingTime = (article: MagazineArticle) => {
  const words = articleText(article).split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

export const validateMagazineArticle = (article: MagazineArticle) => {
  const errors: string[] = [];

  if (article.status === "published" && !article.publishedAt) {
    errors.push("Artigos publicados exigem data de publicação.");
  }

  if (article.status === "published" && article.references.length === 0) {
    errors.push("Artigos publicados exigem ao menos uma referência.");
  }

  const requiredSectionKinds: MagazineArticleSectionKind[] = [
    "why-it-matters",
    "evidence",
    "practice",
    "limitations",
  ];
  const sectionKinds = new Set(article.content.map(({ kind }) => kind));

  if (
    article.status === "published" &&
    requiredSectionKinds.some((kind) => !sectionKinds.has(kind))
  ) {
    errors.push(
      "Artigos publicados exigem as seções: por que importa, evidência, aplicação prática e limitações.",
    );
  }

  if (article.seo.canonical !== getMagazineArticlePath(article)) {
    errors.push("O canonical do artigo deve corresponder ao slug editorial.");
  }

  const exigidas = ["Financiamento", "Conflitos de interesse"];
  const declaradas = new Set(article.disclosures.map(({ label }) => label));
  const faltando = exigidas.filter((label) => !declaradas.has(label));

  if (faltando.length > 0) {
    errors.push(`Declarações obrigatórias ausentes: ${faltando.join(", ")}.`);
  }

  if (article.disclosures.some(({ text }) => !text.trim())) {
    errors.push("Declaração editorial sem conteúdo.");
  }

  // Nenhum selo é automático. Um selo que afirma revisão exige revisor
  // nomeado; sem isso o rótulo declara ao leitor um processo que não houve.
  const seloExigeRevisor: MagazineReviewSeal[] = [
    "REVISÃO CIENTÍFICA EDITORIAL",
    "REVISÃO METODOLÓGICA",
    "AVALIAÇÃO EDITORIAL INDEPENDENTE",
  ];

  if (
    seloExigeRevisor.includes(article.reviewSeal) &&
    !article.reviewer?.name
  ) {
    errors.push(
      `O selo "${article.reviewSeal}" exige revisor nomeado. Sem revisor, use "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES".`,
    );
  }

  if (
    article.sponsored &&
    (!article.sponsor?.name.trim() || !article.sponsor.label)
  ) {
    errors.push("Conteúdo patrocinado exige patrocinador e rótulo explícito.");
  }

  return errors;
};

const relatedScore = (current: MagazineArticle, candidate: MagazineArticle) => {
  const currentTags = new Set(
    current.tags.map((tag) => tag.toLocaleLowerCase()),
  );
  const sharedTags = candidate.tags.filter((tag) =>
    currentTags.has(tag.toLocaleLowerCase()),
  ).length;

  return sharedTags * 4 + (candidate.category === current.category ? 2 : 0);
};

export const selectRelatedArticles = (
  current: MagazineArticle,
  candidates: MagazineArticle[],
  limit = 3,
) =>
  candidates
    .filter(
      (candidate) =>
        candidate.slug !== current.slug && candidate.status === "published",
    )
    .map((candidate) => ({
      article: candidate,
      score: relatedScore(current, candidate),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (right.article.publishedAt ?? "").localeCompare(
          left.article.publishedAt ?? "",
        ) ||
        left.article.slug.localeCompare(right.article.slug),
    )
    .slice(0, Math.max(0, limit))
    .map(({ article }) => article);

export const getMagazineArticlePath = (article: MagazineArticle) =>
  `/superficie/artigos/${article.slug}`;

const dgmBiologiaMolecular: MagazineArticle = {
  slug: "biologia-molecular-da-dgm",
  title: "Além da obstrução: a biologia molecular da DGM",
  subtitle:
    "PPARγ, receptor androgênico e células progenitoras ajudam a explicar a perda funcional da glândula de Meibomius antes da atrofia.",
  excerpt:
    "Na prática, é tentador reduzir a DGM a uma sequência simples: meibum espesso, obstrução, instabilidade lacrimal e sintomas. Esse modelo é útil, mas incompleto.",
  category: "Clínica",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "Na prática, é tentador reduzir a DGM a uma sequência simples: meibum espesso, obstrução, instabilidade lacrimal e sintomas. Esse modelo é útil, mas incompleto.",
        "Por que pacientes com imagem glandular parecida respondem de forma desigual a intervenções só mecânicas? A glândula de Meibomius é um tecido de renovação contínua. Cada meibócito amadurece, acumula lipídios e é eliminado pela secreção holócrina. Quando essa transição falha, a perda funcional pode começar antes da atrofia avançada na imagem.",
        "Essa hipótese não identifica a via molecular de um paciente no consultório. Ela muda a pergunta clínica: de “onde está a obstrução?” para “quais componentes obstrutivos, inflamatórios, hormonais, metabólicos e degenerativos podem coexistir neste fenótipo?”.",
        "A implicação atual é fenotipar melhor, não prescrever vias moleculares. Três eixos sustentam essa leitura: PPARγ, suporte androgênico e nicho progenitor.",
      ],
    },
    {
      id: "metodo",
      title: "Método e base de evidência",
      kind: "body",
      paragraphs: [
        "Revisão narrativa translacional. A pergunta de síntese foi: como PPARγ, receptor androgênico, vias de manutenção do nicho progenitor, envelhecimento e inflamação contribuem para a perda funcional na DGM?",
        "As 27 referências do rascunho original foram conferidas individualmente no Crossref e no PubMed em agosto de 2026. Vinte e quatro foram confirmadas com identificador persistente; duas foram substituídas por fonte mais adequada ao que o texto afirma; duas foram removidas junto com as afirmações que sustentavam sozinhas. O texto publicado reflete essa depuração.",
        "A natureza predominante da evidência é pré-clínica: estudos celulares, organoides, rastreamento de linhagem e modelos animais. Parte das relações hormonais inclui observações humanas. A translação terapêutica permanece limitada.",
      ],
    },
    {
      id: "ppar-gama",
      title: "PPARγ: identidade e diferenciação do meibócito",
      kind: "evidence",
      paragraphs: [
        "O que define a identidade funcional do meibócito, além da quantidade de lipídio que ele acumula? O receptor gama ativado por proliferadores de peroxissoma (PPARγ) ocupa posição central nessa diferenciação.",
        "Sua expressão acompanha o início da maturação celular e da síntese lipídica durante o desenvolvimento glandular. Em células humanas, a ativação dessa via promove saída do ciclo celular e aumenta a expressão de genes lipogênicos, entre eles ADFP, ELOVL4 e FABP4.",
        "Modelos genéticos reforçam a centralidade da via, ainda que por caminho indireto. A deleção condicional de Fgfr2 ou de Hdac3 no epitélio meibomiano produz atrofia acinar e maturação meibocitária defeituosa, acompanhada de queda de PPARγ e de seus alvos lipogênicos. Nesses modelos o PPARγ cai junto com o fenótipo. Não há, até aqui, demonstração de que sua deleção isolada seja a causa da atrofia.",
        "Estudos de envelhecimento descrevem menor atividade da via e perda de eficiência da diferenciação, com deslocamento da localização de PPARγ do citoplasma para o núcleo em glândulas de camundongos e humanos mais velhos.",
      ],
    },
    {
      id: "androgenos",
      title: "Andrógenos: suporte metabólico e imunomodulador",
      kind: "evidence",
      paragraphs: [
        "Os andrógenos sustentam a glândula, ou só acompanham o fenótipo? A glândula de Meibomius expressa receptor androgênico e as enzimas necessárias à síntese e ao metabolismo local de esteroides.",
        "Em camundongo castrado, a testosterona eleva o RNA mensageiro de enzimas lipogênicas e das proteínas SREBP 1 e 2, além de enzimas da via de biossíntese do colesterol. Em células meibomianas humanas imortalizadas, a di-hidrotestosterona altera a expressão de milhares de genes, com efeito sobre vias que incluem a sinalização PPAR.",
        "Há também sinal anti-inflamatório em modelos experimentais: a di-hidrotestosterona reduz mediadores como IL-6, IL-1β e VEGF-A em células meibomianas.",
        "Em humanos, a disfunção do receptor androgênico na síndrome de insensibilidade androgênica completa associa-se a alterações meibomianas e a mais sinais e sintomas de olho seco. O uso de antiandrogênicos altera o perfil de lipídios neutros da secreção. Esses dados dão plausibilidade biológica ao papel dos andrógenos na função glandular. Não demonstram que a reposição hormonal beneficie a DGM. A morfologia glandular bruta não se mostrou consistentemente dependente de andrógenos nos modelos animais disponíveis.",
      ],
    },
    {
      id: "nicho-progenitor",
      title: "Renovação celular: o nicho progenitor também pode falhar",
      kind: "evidence",
      paragraphs: [
        "A manutenção da glândula depende de reposição celular contínua. Estudos de rastreamento de linhagem identificaram populações progenitoras envolvidas nesse processo.",
        "Células KROX20+ contribuem para a manutenção glandular. Sua perda experimental produz atrofia e sinais de doença do olho seco. A sinalização Notch1 participa desse controle. A superexpressão de Notch1 resgata parcialmente a atrofia causada pela perda de Krox20, configurando um eixo Krox20–Notch1 relevante para a homeostase.",
        "A via Hedgehog participa do mesmo circuito, porém de forma menos linear do que “mais sinalização, glândula melhor”. Em células epiteliais meibomianas de rato, o receptor Smoothened e os fatores Gli são expressos in vivo e in vitro, e sua expressão diminui à medida que a célula se diferencia. O bloqueio farmacológico de Smoothened reduziu a proliferação, mas aumentou a expressão de SREBP1 e o acúmulo lipídico. O agonista (SAG) inibiu SREBP1 e o acúmulo lipídico, sem aumento significativo do número celular ou de Ki67. A leitura mais provável é que o Hedgehog sustente o compartimento proliferativo e precise ser atenuado para que a diferenciação meibocitária se complete.",
        "Estudos de rastreamento de linhagem e sequenciamento de núcleos em camundongo reforçam o Hedgehog como regulador da proliferação das células-tronco meibomianas. A glândula envelhecida apresenta menor sinalização Hedgehog e EGF, inervação deficiente e perda de colágeno I nos fibroblastos do nicho. A degeneração associada à idade não está apenas no epitélio: envolve também o microambiente que o sustenta.",
        "O conjunto sugere que a DGM pode ser, em parte, uma doença da transição entre célula progenitora e meibócito maduro.",
      ],
    },
    {
      id: "envelhecimento-inflamacao",
      title: "Envelhecimento e inflamação fecham o circuito",
      kind: "evidence",
      paragraphs: [
        "“Exaustão” não deve ser entendida apenas como desaparecimento das células progenitoras. A capacidade clonogênica diminui com a idade. Em análise clonal de glândulas de camundongo e humanas, holoclones e meroclones ficaram menores e menos frequentes em modelos de DGM associada à idade, com queda de K14, K6a e PPARγ nos clones. A questão relevante não é somente quantas células progenitoras restam, mas se elas ainda encontram o ambiente e os sinais necessários para completar o programa de maturação.",
        "A IL-1β ativa p38 MAPK, reduz PPARγ, prejudica a diferenciação meibocitária e favorece hiperqueratinização. Em modelos organoides, o bloqueio de p38 com SB203580 ou a restauração da atividade de PPARγ com rosiglitazona reverteu parte dessas alterações.",
        "O estresse oxidativo acrescenta outra camada. A ferroptose, morte celular dependente de ferro e peroxidação lipídica, foi identificada em células progenitoras Lrig1+ em modelos experimentais de DGM. Inibidores de ferroptose atenuaram as manifestações nesses modelos. Inflamação, dano oxidativo e falha de diferenciação podem formar um circuito de retroalimentação: a piora da função glandular altera o meibum, favorece obstrução e inflamação e, por sua vez, agride ainda mais o nicho responsável pela renovação.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "A mudança imediata é de raciocínio, não de prescrição. Nenhuma medida de consultório revela diretamente a atividade de PPARγ, receptor androgênico, Notch, Hedgehog ou ferroptose em um paciente.",
        "Um fenótipo aparentemente obstrutivo não deve ser interpretado como mecanismo único. A avaliação pode integrar qualidade e expressibilidade da secreção, sinais inflamatórios, estabilidade do filme lacrimal, doenças concomitantes da superfície ocular, exposições ambientais, medicamentos e contexto hormonal. A imagem, quando existir, mostra estrutura. Como adquirir, ler e não superinterpretar essa imagem está em “Além do meiboscore”.",
        "No contexto brasileiro, a principal utilidade deste modelo é permitir fenotipagem progressiva sem tornar uma tecnologia isolada requisito para o cuidado. Onde meibografia, interferometria ou outros recursos avançados não estiverem disponíveis, biomicroscopia sistemática, avaliação da margem palpebral, expressão glandular, caracterização do meibum e documentação clínica seriada ainda podem organizar a decisão. Esta aplicação é uma inferência clínica e editorial: o conjunto de referências não apresenta estudo brasileiro comparativo de implementação, análise de custo-efetividade ou validação de biomarcadores moleculares para uso rotineiro.",
        "Descreva o fenótipo antes de nomear o mecanismo: margem palpebral, orifícios, expressibilidade, qualidade do meibum, sinais inflamatórios e morfologia glandular quando disponível.",
        "Procure fatores que modulam a glândula (idade, doenças da superfície ocular, medicamentos, exposição ambiental e contexto hormonal) sem atribuir causalidade a uma associação isolada.",
        "Defina um alvo clínico observável: melhorar expressibilidade, reduzir inflamação, estabilizar o filme lacrimal ou controlar um fator associado.",
        "Reavalie resposta e coerência diagnóstica. Se a evolução não for a esperada, reveja adesão, diagnósticos diferenciais e componentes coexistentes antes de intensificar procedimentos.",
        "Não transforme alvos experimentais em prescrição. Modulação de PPARγ, Hedgehog, andrógenos ou nicho progenitor exige evidência clínica, avaliação regulatória e protocolos apropriados.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "A maior parte da evidência que sustenta este modelo vem de culturas celulares, organoides, rastreamento de linhagem e animais. Esses estudos são valiosos para demonstrar plausibilidade e mecanismos. Não estabelecem, sozinhos, causalidade clínica, acurácia diagnóstica ou eficácia terapêutica em pessoas com DGM.",
        "Agonistas de PPARγ, moduladores de Hedgehog, terapias androgênicas e estratégias de rejuvenescimento do nicho progenitor são hipóteses translacionais. Neste estágio, não devem ser apresentados como tratamento estabelecido.",
        "Faltam biomarcadores clínicos validados para medir diretamente essas vias na glândula humana.",
        "Faltam estudos longitudinais que demonstrem a sequência entre disfunção molecular, perda funcional e atrofia.",
        "Não há definição de subgrupos em que deficiência androgênica, inflamação, ferroptose ou falha progenitora seja realmente dominante.",
        "Faltam ensaios clínicos que testem benefício, risco, dose e durabilidade de terapias dirigidas a essas vias.",
        "Faltam dados de implementação, acesso e custo-efetividade no Brasil.",
      ],
    },
  ],
  references: [
    {
      label:
        "Jester JV, Brown DJ. Wakayama Symposium: Peroxisome Proliferator-Activated Receptor-Gamma (PPARγ) and Meibomian Gland Dysfunction. Ocul Surf. 2012;10(4):224-9.",
      url: "https://doi.org/10.1016/j.jtos.2012.07.001",
      doi: "10.1016/j.jtos.2012.07.001",
    },
    {
      label:
        "Nien CJ, Massei S, Lin G, et al. The development of meibomian glands in mice. Mol Vis. 2010;16:1132-40.",
      url: "https://pubmed.ncbi.nlm.nih.gov/20664693",
    },
    {
      label:
        "Kim SW, Xie Y, Nguyen PQ, et al. PPARγ regulates meibocyte differentiation and lipid synthesis of cultured human meibomian gland epithelial cells (hMGEC). Ocul Surf. 2018;16(4):463-9.",
      url: "https://doi.org/10.1016/j.jtos.2018.07.004",
      doi: "10.1016/j.jtos.2018.07.004",
    },
    {
      label:
        "Kim SW, Brown DJ, Jester JV. Transcriptome analysis after PPARγ activation in human meibomian gland epithelial cells (hMGEC). Ocul Surf. 2019;17(4):809-16.",
      url: "https://doi.org/10.1016/j.jtos.2019.02.003",
      doi: "10.1016/j.jtos.2019.02.003",
    },
    {
      label:
        "Zhu X, Xu M, Millar SE. HDAC1/2 and HDAC3 play distinct roles in controlling adult Meibomian gland homeostasis. Ocul Surf. 2024 Jul;33:39-49.",
      url: "https://doi.org/10.1016/j.jtos.2024.04.005",
      doi: "10.1016/j.jtos.2024.04.005",
    },
    {
      label:
        "Reneker LW, Wang L, Irlmeier RT, Huang AJW. Fibroblast Growth Factor Receptor 2 (FGFR2) Is Required for Meibomian Gland Homeostasis in the Adult Mouse. Invest Ophthalmol Vis Sci. 2017;58(5):2638.",
      url: "https://doi.org/10.1167/iovs.16-21204",
      doi: "10.1167/iovs.16-21204",
    },
    {
      label:
        "Nien CJ, Paugh JR, Massei S, et al. Age-related changes in the meibomian gland. Exp Eye Res. 2009;89(6):1021-7.",
      url: "https://doi.org/10.1016/j.exer.2009.08.013",
      doi: "10.1016/j.exer.2009.08.013",
    },
    {
      label:
        "Nien CJ, Massei S, Lin G, et al. Effects of age and dysfunction on human meibomian glands. Arch Ophthalmol. 2011;129(4):462-9.",
      url: "https://doi.org/10.1001/archophthalmol.2011.69",
      doi: "10.1001/archophthalmol.2011.69",
    },
    {
      label:
        "Rocha EM, Wickham LA, da Silveira LA, et al. Identification of androgen receptor protein and 5α-reductase mRNA in human ocular tissues. Br J Ophthalmol. 2000;84(1):76-84.",
      url: "https://doi.org/10.1136/bjo.84.1.76",
      doi: "10.1136/bjo.84.1.76",
    },
    {
      label:
        "Schirra F, Suzuki T, Dickinson DP, et al. Identification of steroidogenic enzyme mRNAs in the human lacrimal gland, meibomian gland, cornea, and conjunctiva. Cornea. 2006;25(4):438-42.",
      url: "https://doi.org/10.1097/01.ico.0000183664.80004.44",
      doi: "10.1097/01.ico.0000183664.80004.44",
    },
    {
      label:
        "Schirra F, Suzuki T, Richards SM, et al. Androgen control of gene expression in the mouse meibomian gland. Invest Ophthalmol Vis Sci. 2005;46(10):3666-75.",
      url: "https://doi.org/10.1167/iovs.05-0426",
      doi: "10.1167/iovs.05-0426",
    },
    {
      label:
        "Schirra F, Richards SM, Liu M, et al. Androgen regulation of lipogenic pathways in the mouse meibomian gland. Exp Eye Res. 2006;83(2):291-6.",
      url: "https://doi.org/10.1016/j.exer.2005.11.026",
      doi: "10.1016/j.exer.2005.11.026",
    },
    {
      label:
        "Khandelwal P, Liu S, Sullivan DA. Androgen regulation of gene expression in human meibomian gland and conjunctival epithelial cells. Mol Vis. 2012;18:1055-67.",
      url: "https://pubmed.ncbi.nlm.nih.gov/22605918",
    },
    {
      label:
        "Marangoz D, Oner C, Schicht M, et al. The Effect of Androgens on Proinflammatory Cytokine Secretion from Human Ocular Surface Epithelial Cells. Ocul Immunol Inflamm. 2021;29(3):546-54.",
      url: "https://doi.org/10.1080/09273948.2019.1686155",
      doi: "10.1080/09273948.2019.1686155",
    },
    {
      label:
        "Sahin A, Liu Y, Kam WR, et al. Dihydrotestosterone suppression of proinflammatory gene expression in human meibomian gland epithelial cells. Ocul Surf. 2020;18(2):199-205.",
      url: "https://doi.org/10.1016/j.jtos.2020.02.006",
      doi: "10.1016/j.jtos.2020.02.006",
    },
    {
      label:
        "Sullivan BD, Evans JE, Krenzer KL, et al. Impact of antiandrogen treatment on the fatty acid profile of neutral lipids in human meibomian gland secretions. J Clin Endocrinol Metab. 2000;85(12):4866-73.",
      url: "https://doi.org/10.1210/jc.85.12.4866",
      doi: "10.1210/jc.85.12.4866",
    },
    {
      label:
        "Sullivan DA, Sullivan BD, Ullman MD, et al. Androgen influence on the meibomian gland. Invest Ophthalmol Vis Sci. 2000;41(12):3732-42.",
      url: "https://pubmed.ncbi.nlm.nih.gov/11053270",
    },
    {
      label:
        "Sullivan DA, Sullivan BD, Evans JE, et al. Androgen deficiency, Meibomian gland dysfunction, and evaporative dry eye. Ann N Y Acad Sci. 2002;966:211-22.",
      url: "https://doi.org/10.1111/j.1749-6632.2002.tb04217.x",
      doi: "10.1111/j.1749-6632.2002.tb04217.x",
    },
    {
      label:
        "Parfitt GJ, Lewis PN, Young RD, et al. Renewal of the Holocrine Meibomian Glands by Label-Retaining, Unipotent Epithelial Progenitors. Stem Cell Reports. 2016;7(3):399-410.",
      url: "https://doi.org/10.1016/j.stemcr.2016.07.010",
      doi: "10.1016/j.stemcr.2016.07.010",
    },
    {
      label:
        "Tchegnon E, Liao CP, Ghotbi E, et al. Epithelial stem cell homeostasis in Meibomian gland development, dysfunction, and dry eye disease. JCI Insight. 2021;6(20):e151078.",
      url: "https://doi.org/10.1172/jci.insight.151078",
      doi: "10.1172/jci.insight.151078",
    },
    {
      label:
        "Zhang Y, Tchegnon E, Ghotbi E, et al. Disruption of Krox20-Notch1 signaling blocks meibomian gland development and homeostasis leading to dry eye disease. Nat Commun. 2025;16(1):11584.",
      url: "https://doi.org/10.1038/s41467-025-66740-6",
      doi: "10.1038/s41467-025-66740-6",
    },
    {
      label:
        "Qu JY, Xiao YT, Zhang YY, et al. Hedgehog Signaling Pathway Regulates the Proliferation and Differentiation of Rat Meibomian Gland Epithelial Cells. Invest Ophthalmol Vis Sci. 2021;62(2):33.",
      url: "https://doi.org/10.1167/iovs.62.2.33",
      doi: "10.1167/iovs.62.2.33",
    },
    {
      label:
        "Zhu X, Xu M, Portal C, et al. Identification of Meibomian gland stem cell populations and mechanisms of aging. Nat Commun. 2025;16(1):1663.",
      url: "https://doi.org/10.1038/s41467-025-56907-6",
      doi: "10.1038/s41467-025-56907-6",
    },
    {
      label:
        "Guo Y, Zhang R, Zhang M, et al. Assessment of the clonal growth potential of meibomian gland stem/progenitor cells via clonal analysis. Ocul Surf. 2025;37:1-10.",
      url: "https://doi.org/10.1016/j.jtos.2025.02.006",
      doi: "10.1016/j.jtos.2025.02.006",
    },
    {
      label:
        "Qu JY, Xie HT, Xiao YT, et al. The inhibition of p38 MAPK blocked inflammation to restore the functions of rat meibomian gland epithelial cells. Exp Eye Res. 2023;231:109470.",
      url: "https://doi.org/10.1016/j.exer.2023.109470",
      doi: "10.1016/j.exer.2023.109470",
    },
    {
      label:
        "Qu J, Yang L, Wang X, et al. Establishment of Mouse Meibomian Gland Organoids for In Vitro Modeling of Meibomian Gland Dysfunction. Invest Ophthalmol Vis Sci. 2026;67(1):6.",
      url: "https://doi.org/10.1167/iovs.67.1.6",
      doi: "10.1167/iovs.67.1.6",
    },
    {
      label:
        "Guo Y, Luo S, Li W, et al. Ferroptosis in Meibomian Gland Progenitor Cells Contributes to Pathogenesis of Meibomian Gland Dysfunction. Invest Ophthalmol Vis Sci. 2026;67(1):9.",
      url: "https://doi.org/10.1167/iovs.67.1.9",
      doi: "10.1167/iovs.67.1.9",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "DGM",
    "PPARγ",
    "Andrógenos",
    "Células progenitoras",
    "Ferroptose",
    "Superfície ocular",
  ],
  seo: {
    title: "Além da obstrução: a biologia molecular da DGM | SUPERFÍCIE",
    description:
      "PPARγ, sinalização androgênica e nicho progenitor na DGM: o que a evidência pré-clínica mostra e o que ainda não sustenta prescrição.",
    canonical: "/superficie/artigos/biologia-molecular-da-dgm",
  },
};

const tfosDewsIiiNaPratica: MagazineArticle = {
  slug: "tfos-dews-iii-na-pratica",
  title: "TFOS DEWS III na prática",
  subtitle:
    "De escalada por gravidade para tratamento dirigido por mecanismo: o que muda no consultório brasileiro",
  excerpt:
    'Durante anos, a doença do olho seco foi ensinada como uma escada. O caso "leve" começava com educação e lubrificante. O "moderado" recebia anti-inflamatório ou tratamento palpebral. O "grave" avançava para lágrimas biológicas, lentes terapêuticas ou cirurgia.',
  category: "Evidência",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        'Durante anos, a doença do olho seco foi ensinada como uma escada. O caso "leve" começava com educação e lubrificante. O "moderado" recebia anti-inflamatório ou tratamento palpebral. O "grave" avançava para lágrimas biológicas, lentes terapêuticas ou cirurgia. A estrutura era didática. Também era perigosa: podia fazer o clínico tratar a intensidade da manifestação antes de identificar o que a produz.',
        'O TFOS DEWS III (terceiro workshop da Tear Film & Ocular Surface Society, publicado em 2025 no American Journal of Ophthalmology) desloca o centro dessa lógica. Sistemas que agrupam pacientes apenas como leve, moderado ou grave, ou somente como aquodeficiente versus evaporativo, escondem a coexistência e a variação temporal dos mecanismos. A pergunta operacional deixa de ser só "quão grave é?". Passa a ser: quais fatores etiológicos são clinicamente relevantes neste olho, hoje?',
        'A mudança não é "gravidade versus mecanismo". É um sistema de duas coordenadas. O eixo horizontal (o mecanismo) indica o que tratar. O eixo vertical (gravidade e risco) indica quanto, quão rápido e com quanta proteção tratar. Uma paciente com sintomas moderados e lagoftalmo não deve esperar fracassar em vários lubrificantes para que a exposição seja tratada. Outra, com dor intensa e poucos sinais, não deve receber indefinidamente mais colírios sem investigação neurossensorial. No Brasil, o acesso a osmolarímetro, meibógrafo, IPL ou hemoderivados varia entre o consultório de médio porte, o centro de superfície e o SUS. O DEWS III, lido com rigor, não exige plataforma tecnológica. Exige hipótese explícita.',
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa e uma interpretação prática dos relatórios oficiais do TFOS DEWS III (2025), do resumo executivo (2026) e de estudos complementares citados. Não constitui diretriz nacional nem prescrição individual. Referências conferidas no Crossref em 15 de agosto de 2026. O Digest tem corrigendum em 2026. Data de corte da busca: 14 de agosto de 2026. Disponibilidade e registro sanitário de fármacos e dispositivos devem ser conferidos em fontes regulatórias brasileiras atualizadas.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O consenso define o olho seco como doença multifatorial e sintomática, marcada pela perda de homeostase do filme lacrimal e/ou da superfície ocular, na qual instabilidade e hiperosmolaridade, inflamação e dano, e anormalidades neurossensoriais atuam como fatores etiológicos.",
        'Três escolhas têm consequência clínica imediata. Primeiro, o olho seco é doença, não síndrome. Uma síndrome é um agrupamento de queixas. Uma doença tem fisiopatologia, drivers identificáveis e razão para terapia dirigida. O rótulo "síndrome do olho seco" ainda circula em prontuários e laudos. Vale abandoná-lo.',
        "Segundo, a superfície ocular passa a dividir explicitamente com o filme lacrimal o núcleo da homeostase. Isso acomoda melhor situações em que fricção, dano epitelial, anatomia, inflamação primária ou disfunção neural sustentam sintomas, mesmo quando a produção aquosa não é a história principal.",
        "Terceiro, a doença é, por definição, sintomática. Sinais isolados (disfunção de glândula meibomiana, blefarite, coloração puntiforme) exigem acompanhamento e busca de doença associada, mas não preenchem, sozinhos, a definição. Sintomas sem evidência objetiva de perda de homeostase obrigam a ampliar o diagnóstico diferencial. A discórdia entre queixa e sinal, e o mapeamento dos eixos quando eles não batem, está na matéria Quando sintomas e sinais não batem.",
        "O algoritmo separa duas tarefas que frequentemente se confundem na mesma consulta: confirmar a doença e, depois, explicá-la.",
        "Para confirmar, o rastreamento recomendado é o OSDI-6, com ponto de corte ≥ 4 na soma bruta dos 6 itens (escala 0–24), não no índice 0–100 do OSDI-12, seguido da demonstração de ao menos um marcador de perda de homeostase. Estabilidade: NIBUT < 10 s. Se o método não invasivo não estiver disponível, TBUT com volume mínimo de fluoresceína e corte < 5 s. Osmolaridade: ≥ 308 mOsm/L em qualquer olho ou diferença interocular > 8 mOsm/L (cortes estabelecidos com o sistema TearLab, não automaticamente transferíveis a qualquer equipamento). Coloração: > 5 pontos corneanos com fluoresceína; > 9 pontos conjuntivais com lisamina verde; e/ou margem palpebral com ≥ 2 mm de extensão e ≥ 25% de largura.",
        "O instrumento não deve ser reproduzido ou incorporado a prontuário, site ou aplicativo sem verificar as condições de uso e licenciamento aplicáveis. A versão completa do OSDI já foi traduzida e validada para o português. Isso não autoriza tratar o OSDI-6 como equivalente automático. Até que haja validação brasileira específica da versão curta, o escore integra (e não substitui) a entrevista clínica.",
        "Um único marcador positivo confirma a doença em paciente sintomático. Para não perder o diagnóstico, é desejável avaliar mais de um grupo de sinais. Em 1.427 participantes, o uso de um único marcador teria deixado sem diagnóstico entre 12,3% e 36,2% dos casos que preencheriam o protocolo completo. Limitar-se à fluoresceína só corneana reduz a sensibilidade a 44,6%. A avaliação ampla (córnea, conjuntiva e margem palpebral) é especialmente informativa.",
        'Depois de confirmar, o exame localiza os fatores etiológicos. O DEWS III organiza nove componentes em três territórios. Filme: lipídico, aquoso, mucina/glicocálix. Pálpebras: piscar/fechamento, margem. Superfície: desalinhamento anatômico, disfunção neural, dano/ruptura celular, inflamação primária/estresse oxidativo. "Evaporativo" e "aquodeficiente" continuam úteis como descrição ampla, mas perdem poder se forem o ponto final. Dois pacientes evaporativos podem exigir condutas radicalmente diferentes: um apresenta meibo obstruído e telangiectasia; outro, piscar incompleto por trabalho prolongado em tela.',
        "Os drivers não são mutuamente exclusivos. Em doença multifatorial, tratamento combinado pode ser a estratégia inicial mais coerente, desde que cada item tenha alvo, segurança e desfecho definidos.",
        "No Brasil, essa atenção ao contexto não é detalhe epidemiológico. Levantamentos identificaram associação com sexo feminino, idade, uso de telas, cirurgia ocular e medicamentos. Um inquérito domiciliar encontrou sintomas mais frequentes em área urbana que rural. O TFOS Lifestyle Report (2023) tornou formal o que o consultório brasileiro vê todos os dias: telas, ambiente, cosméticos e iatrogenia como drivers, não como apêndice.",
        'O que não mudou: o diagnóstico continua clínico. O exame precisa excluir mascaradores. A evidência varia entre intervenções. "Dirigido por mecanismo" frequentemente significa dirigido por um mecanismo provável, inferido de história, sinais e resposta longitudinal. Biomarcadores que predizem resposta individual ainda são limitados.',
      ],
    },
    {
      id: "nove-drivers",
      title: "O mapa dos nove drivers",
      kind: "evidence",
      figure: {
        src: "/images/superficie/artigos/tfos-dews-iii-na-pratica/mapa-nove-drivers.png",
        alt: "Mapa dos nove drivers da TFOS DEWS III: filme lacrimal (lipídico, aquoso, mucina/glicocálix), pálpebras (piscar e fechamento, margem palpebral) e superfície ocular (anatomia, disfunção neural, dano celular, inflamação).",
        caption:
          "O mapa dos nove drivers. Três territórios etiológicos — TFOS DEWS III.",
        width: 1680,
        height: 980,
      },
      paragraphs: [
        "Os drivers não são mutuamente exclusivos. Em doença multifatorial, tratamento combinado pode ser a estratégia inicial mais coerente, desde que cada item tenha alvo, segurança e desfecho definidos.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "O DEWS III não exige que toda consulta se transforme em um laboratório de superfície ocular. Osmolaridade, interferometria, meibografia, MMP-9, estesiometria e microscopia confocal podem aumentar a precisão em casos selecionados. O algoritmo, porém, pode ser iniciado com recursos presentes em grande parte dos consultórios oftalmológicos brasileiros.",
        'Antes de confirmar, exclua o que muda a prioridade. Dor verdadeira, assimetria importante, secreção, edema, trauma, início abrupto, inflamação intraocular, defeito epitelial, infecção, queda visual não explicada ou suspeita sistêmica não são "olho seco grave". São outro problema, ou um problema que convive com o olho seco e o ultrapassa. Revise alergia, medicamentos, cosméticos, cirurgia, lente de contato e doenças da superfície que podem mascarar ou coexistir.',
        "Além de secura, ardor e flutuação visual, pergunte quando o sintoma aparece, o que o interrompe e qual exposição o antecede. Tela, ar-condicionado, vento, cosméticos, lente de contato, colírios crônicos, cirurgia recente, alergia, rosácea, dor sistêmica, sono e medicamentos deixam de ser uma lista protocolar e passam a gerar hipóteses testáveis.",
        "Antes de instilar fluoresceína, observe piscar, fechamento, posição palpebral, menisco, debris, espuma e padrão de ruptura não invasivo, quando disponível. Muitos topógrafos e tomógrafos já instalados no país medem NIBUT. O gargalo costuma ser usá-los de forma padronizada, não comprá-los. Examine margem, orifícios, vascularização e expressão do meibo. Depois, use os corantes para mapear córnea, conjuntiva e margem palpebral. Lisamina verde é barata e subutilizada. Altura do menisco e Schirmer ganham valor quando há suspeita aquodeficiente. Sensibilidade corneana e pistas de dor neuropática tornam-se prioritárias quando sintomas e sinais divergem.",
        "Tecnologia entra como modificadora de probabilidade. Meibografia documenta perda glandular, mas não substitui a expressão, não mede sozinha a função atual e não diagnostica doença do olho seco isoladamente. Osmolaridade pode confirmar perda de homeostase, mas não localiza o mecanismo. MMP-9 sugere atividade inflamatória dentro das limitações do teste, mas não autoriza concluir que toda queixa decorre de inflamação. O investimento em equipamento deve responder a uma pergunta clínica concreta e alterar uma decisão.",
        "No filme lacrimal, a pergunta é se há DGM funcional que sustente instabilidade, produção aquosa insuficiente, perda ou retenção inadequada, ou superfície que perdeu a capacidade de manter o filme uniformemente distribuído. Procure meibo, expressibilidade, orifícios, padrão lipídico, menisco, Schirmer quando indicado, padrão de ruptura, coloração conjuntival e sinais de toxicidade.",
        "Nas pálpebras: a distribuição e a proteção falham por dinâmica palpebral? A margem gera inflamação, obstrução, fricção ou contaminação? Observe frequência e completude do piscar, vedação, lagoftalmo, exposição noturna, cílios, debris, Demodex, telangiectasias e queratinização.",
        "Na superfície ocular: anatomia ou fricção perpetua a perda de homeostase? Há comprometimento trófico ou sensibilização além do filme? A prioridade imediata é proteger e regenerar tecido? A inflamação é driver primário clinicamente sustentado? Procure conjuntivocálase, pterígio, irregularidade, malposição palpebral, sensibilidade, alodinia, fotofobia, filamentos, hiperemia e pistas de doença sistêmica.",
        "A pergunta prática, para cada item da receita, é uma frase incompleta: estou indicando isto para modificar aquilo e vou reavaliar por meio de um desfecho definido. Se médico e paciente não conseguem preenchê-la, o item provavelmente não pertence ao plano.",
        "Na escada, os três casos abaixo poderiam receber o mesmo rótulo e o mesmo lubrificante. No mapa mecanístico, a intensidade pode ser parecida. O alvo inicial não.",
        "Caso 1 (tela, instabilidade e piscar): arquiteta, 38 anos, ardor e visão flutuante ao fim do expediente. Piscar incompleto, NIBUT reduzido, meibo expressível, pouca coloração. O driver dominante é piscar/exposição. Deficiência lipídica não está demonstrada como alvo principal. A primeira decisão é reorganizar piscar, pausas e ambiente, e escolher suplemento compatível com a instabilidade. Procedimento palpebral agressivo não decorre apenas de NIBUT baixo.",
        "Caso 2 (aquodeficiência e risco epitelial): mulher, 62 anos, boca seca, menisco muito baixo, coloração corneoconjuntival e piora após cirurgia de catarata. O mapa combina deficiência aquosa e dano celular. A suspeita sistêmica aumenta risco e urgência. Reposição compatível, redução de toxicidade, proteção da superfície e investigação de Sjögren podem caminhar em paralelo. Não é racional esperar falhas sequenciais de lubrificante.",
        "Caso 3 (dor 9/10, poucos sinais): homem, 46 anos, fotofobia e alodinia ao vento, sem marcador objetivo de perda de homeostase. Usa cinco colírios. A doença do olho seco ainda não está confirmada. Toxicidade e disfunção neural entram no diferencial. O passo seguinte não é o sexto colírio. É revisar superfície, sensibilidade, cirurgia prévia, enxaqueca e dor crônica, e estruturar avaliação neurossensorial. Olho seco discreto e dor neuropática podem coexistir, mas exigem planos paralelos.",
        "Traduzir o DEWS III não é importar uma lista de moléculas aprovadas no exterior. É montar, para cada mecanismo, uma cesta de opções disponíveis, sustentáveis do ponto de vista regulatório e executáveis por aquele paciente. A lista do consenso não é formulário nacional. Moléculas e dispositivos devem ser conferidos, no dia da decisão, nas bases da Anvisa. Uma denominação comum não prova que exista produto registrado. Para IPL, luz de baixa intensidade e sistemas térmicos, a regularização é específica do produto, do modelo e das instruções de uso. Um aparelho dermatológico não deve ser presumido como indicado para aplicação periocular. Lágrimas de soro autólogo exigem serviço licenciado, rastreabilidade e controle de qualidade, nos termos da Nota Técnica nº 03/2018 da Anvisa.",
        "Até a data de corte desta matéria, não havia protocolo clínico e diretriz terapêutica nacional específico para doença do olho seco na lista da Conitec. Procedimentos básicos como Schirmer e oclusão de ponto lacrimal têm mais clareza de nomenclatura do que NIBUT, osmolaridade, meibografia, MMP-9 e terapias instrumentais. Ausência de denominação específica não significa negativa automática, mas ajuda a explicar a heterogeneidade e o desembolso direto. O protocolo precisa funcionar em camadas.",
        "Abandonar a escada rígida não equivale a tratar todos com a mesma intensidade. O próprio consenso não oferece um escore ponderado de gravidade validado: a associação fraca entre sinais e sintomas inviabilizou esse atalho. Gravidade permanece julgamento clínico, indispensável para urgência, proteção, carga terapêutica e intervalo de seguimento. A melhor imagem não é demolir a escada, mas girá-la. Ela deixa de ser a rota universal de escolha e se torna o eixo vertical de intensidade dentro de um mapa horizontal de mecanismos.",
        "Amanhã, no consultório (seis minutos):",
        "0–1 min. Sintomas e impacto: aplique instrumento autorizado e registre frequência, gatilhos, flutuação visual, dor e limitação funcional.",
        "1–2 min. Mascaradores: alergia predominante, infecção, toxicidade, erosão recorrente, alteração palpebral aguda, neuralgia e sinais de doença sistêmica ou urgência.",
        "2–3 min. Filme sem corante: piscar, fechamento, menisco, debris e estabilidade. NIBUT se disponível.",
        "3–4 min. Pálpebras e meibo: margem, Demodex, orifícios, vascularização, posição palpebral e qualidade/expressibilidade da secreção.",
        "4–5 min. Superfície com corantes: mapeie córnea, conjuntiva e margem. Evite reduzir o exame à fluoresceína central.",
        "5–6 min. Plano testável: nomeie os drivers dominantes, pareie cada conduta a um alvo e defina o que deverá ter mudado no retorno.",
        "Separe diagnóstico de subclassificação. Primeiro confirme sintomas mais perda de homeostase. Depois localize os drivers. Não pare em evaporativo versus aquodeficiente. Dê um alvo a cada item da receita. Use gravidade para intensidade e proteção, não como portão que adia a correção de uma causa evidente. Refenotipe no retorno.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Consenso não é ensaio clínico. Um algoritmo abrangente não iguala a força da evidência entre intervenções. Há heterogeneidade em definições, dispositivos, parâmetros, comparadores e desfechos. Muitas terapias melhoram um sinal sem efeito proporcional nos sintomas. Outras têm estudos curtos, amostras pequenas ou forte dependência de tecnologia proprietária.",
        "O relatório de manejo declara apoio por doações irrestritas de múltiplas empresas e apresenta conflitos individuais dos autores. Transparência exige considerar esse contexto junto com método, consistência e qualidade dos estudos. Não é rejeição automática.",
        '"Tratamento dirigido por mecanismo" ainda é, muitas vezes, fenótipo dirigido por mecanismo provável. A honestidade clínica consiste em explicitar a hipótese, escolher uma intervenção coerente e usar a resposta longitudinal como parte da inferência.',
        "Não há escore ponderado de gravidade validado pelo consenso. Gravidade permanece julgamento clínico. A lista internacional de classes e dispositivos não é formulário brasileiro. Biomarcadores que predizem resposta individual ainda são limitados.",
        "Este texto é uma interpretação editorial dos relatórios TFOS DEWS III, não uma reprodução integral do consenso e não uma diretriz brasileira. Não substitui leitura das fontes, bula, registro sanitário, julgamento clínico nem decisão compartilhada. Data de corte: 14 de agosto de 2026.",
      ],
    },
  ],
  references: [
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. Am J Ophthalmol. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "Jones L, Craig JP, Markoulli M, et al. TFOS DEWS III: Management and Therapy. Am J Ophthalmol. 2025;279:289-386.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.039",
      doi: "10.1016/j.ajo.2025.05.039",
    },
    {
      label:
        "Stapleton F, Argüeso P, Asbell P, et al. TFOS DEWS III: Digest. Am J Ophthalmol. 2025;279:451-553.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.040",
      doi: "10.1016/j.ajo.2025.05.040",
    },
    {
      label:
        'Stapleton F, Argüeso P, Asbell P, et al. Corrigendum to "TFOS DEWS III: Digest" Am J Ophthalmol. 2025;279:451-553. Am J Ophthalmol. 2026;288:350-351.',
      url: "https://doi.org/10.1016/j.ajo.2026.04.007",
      doi: "10.1016/j.ajo.2026.04.007",
    },
    {
      label:
        "Perez VL, Chen W, Craig JP, et al. TFOS DEWS III: Executive Summary. Am J Ophthalmol. 2026;282:135-145.",
      url: "https://doi.org/10.1016/j.ajo.2025.09.035",
      doi: "10.1016/j.ajo.2025.09.035",
    },
    {
      label:
        "Wolffsohn JS, Travé-Huarte S, Stapleton F, et al. Relative importance of tear homeostatic signs for the diagnosis of dry eye disease. Ocul Surf. 2025;36:151-155.",
      url: "https://doi.org/10.1016/j.jtos.2025.01.010",
      doi: "10.1016/j.jtos.2025.01.010",
    },
    {
      label:
        "Craig JP, Nichols KK, Akpek EK, et al. TFOS DEWS II Definition and Classification Report. Ocul Surf. 2017;15(3):276-283.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.008",
      doi: "10.1016/j.jtos.2017.05.008",
    },
    {
      label:
        "Jones L, Downie LE, Korb D, et al. TFOS DEWS II Management and Therapy Report. Ocul Surf. 2017;15(3):575-628.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.006",
      doi: "10.1016/j.jtos.2017.05.006",
    },
    {
      label:
        "Pult H, Wolffsohn JS. The development and evaluation of the new Ocular Surface Disease Index-6. Ocul Surf. 2019;17(4):817-821.",
      url: "https://doi.org/10.1016/j.jtos.2019.08.008",
      doi: "10.1016/j.jtos.2019.08.008",
    },
    {
      label:
        "Prigol AM, Tenório MB, Matschinske R, Gehlen ML, Skare T. Tradução e validação do índice da doença da superfície ocular para a língua portuguesa. Arq Bras Oftalmol. 2012;75(1):24-28.",
      url: "https://doi.org/10.1590/s0004-27492012000100005",
      doi: "10.1590/s0004-27492012000100005",
    },
    {
      label:
        "Facchin A, Boccardo L. Psychometric properties and diagnostic performance of three dry eye questionnaires in Italian: OSDI, OSDI-6, and SPEED. Optom Vis Sci. 2024;101(9):579-588.",
      url: "https://doi.org/10.1097/opx.0000000000002184",
      doi: "10.1097/opx.0000000000002184",
    },
    {
      label:
        "Pereira LA, Arantes LB, Persona ELS, et al. Prevalence of dry eye in Brazil: Home survey reveals differences in urban and rural regions. Clinics. 2025;80:100578.",
      url: "https://doi.org/10.1016/j.clinsp.2025.100578",
      doi: "10.1016/j.clinsp.2025.100578",
    },
    {
      label:
        "Castro JS, Selegatto IB, Castro RS, et al. Prevalence and Risk Factors of self-reported dry eye in Brazil using a short symptom questionnaire. Sci Rep. 2018;8:2076.",
      url: "https://doi.org/10.1038/s41598-018-20273-9",
      doi: "10.1038/s41598-018-20273-9",
    },
    {
      label:
        "Marculino LGC, Hazarbassanov RM, Hazarbassanov NGTQ, et al. Prevalence and risk factors for dry eye disease: the Sao Paulo dry eye study. Arq Bras Oftalmol. 2022;85(6):549-557.",
      url: "https://doi.org/10.5935/0004-2749.202200100",
      doi: "10.5935/0004-2749.202200100",
    },
    {
      label:
        "Wolffsohn JS, Lingham G, Downie LE, et al. TFOS Lifestyle: Impact of the digital environment on the ocular surface. Ocul Surf. 2023;28:213-252.",
      url: "https://doi.org/10.1016/j.jtos.2023.04.004",
      doi: "10.1016/j.jtos.2023.04.004",
    },
    {
      label:
        "Alves M, Asbell P, Dogru M, et al. TFOS Lifestyle Report: Impact of environmental conditions on the ocular surface. Ocul Surf. 2023;29:1-52.",
      url: "https://doi.org/10.1016/j.jtos.2023.04.007",
      doi: "10.1016/j.jtos.2023.04.007",
    },
    {
      label:
        "Craig JP, Alves M, Wolffsohn JS, et al. TFOS Lifestyle Report Executive Summary: A Lifestyle Epidemic — Ocular Surface Disease. Ocul Surf. 2023;30:240-253.",
      url: "https://doi.org/10.1016/j.jtos.2023.08.009",
      doi: "10.1016/j.jtos.2023.08.009",
    },
    {
      label:
        "Ministério da Saúde / Conitec. Protocolos Clínicos e Diretrizes Terapêuticas — lista nacional.",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/protocolos-clinicos-e-diretrizes-terapeuticas/pcdt",
    },
    {
      label: "Anvisa. Consulta de medicamentos e produtos para saúde.",
      url: "https://consultas.anvisa.gov.br/",
    },
    {
      label:
        "Anvisa. Nota Técnica nº 03/2018 — produção de colírio de soro autólogo.",
      url: "https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/sangue-tecidos-celulas-e-orgaos/notas-tecnicas/vigentes/nota-tecnica-no-03-de-2018/view",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "TFOS DEWS III",
    "Olho seco",
    "Diagnóstico",
    "Mecanismo",
    "Consultório brasileiro",
  ],
  seo: {
    title: "TFOS DEWS III na prática | SUPERFÍCIE",
    description:
      "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção. Interpretação prática do TFOS DEWS III para o consultório brasileiro.",
    canonical: "/superficie/artigos/tfos-dews-iii-na-pratica",
  },
};

const fenotipagemIntegrada: MagazineArticle = {
  slug: "quando-sintomas-e-sinais-nao-batem",
  title: "Quando sintomas e sinais não batem",
  subtitle:
    "Fenotipagem integrada no consultório: mapear eixos, não forçar concordância",
  excerpt:
    "Quando o questionário é alto e a coloração, o tempo de ruptura ou a osmolaridade são baixos (ou o inverso), a tentação do consultório é repetir o exame, trocar o instrumento ou escalar o tratamento como se a discórdia fosse erro de medida.",
  category: "Diagnóstico",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "Quando o questionário é alto e a coloração, o tempo de ruptura ou a osmolaridade são baixos (ou o inverso), a tentação do consultório é repetir o exame, trocar o instrumento ou escalar o tratamento como se a discórdia fosse erro de medida. O paciente descreve queimação, fotofobia ou dor ao vento. A córnea está quase limpa, o menisco é aceitável, o tempo de ruptura não é catastrófico. Ou o inverso: a superfície está marcada, o volume é baixo, e o paciente quase não se queixa. Essa reação pressupõe que sintomas e sinais deveriam convergir. Não deveriam. A discórdia é um achado clínico, não um exame inconsistente.",
        "A pergunta útil é outra. Como mapear o paciente aos eixos aquoso, evaporativo-DGM, inflamatório, neurossensorial e mecânico quando sintomas, sinais e mecanismos não batem, sem forçar concordância e sem transformar o contínuo em checklist?",
        'O consultório brasileiro, na maior parte dos dias, ainda escala por gravidade de sintoma ou por um binário aquoso versus evaporativo. Nenhum dos dois explica o paciente que dói desproporcionalmente, o Sjögren oligosintomático com superfície destruída, ou o misto em que filme, margem e dor convivem e a polifarmácia cresce. Fenótipos mistos são a regra, não a exceção. A mudança de pergunta é esta: em vez de "qual a gravidade?", "qual eixo está dirigindo esta consulta?"',
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual. As referências foram conferidas no Crossref em 15 de agosto de 2026 (quatorze de quatorze DOIs resolvidos). Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O framework de fenótipo está no relatório de definição do DEWS II. Craig e colaboradores (2017) descrevem a doença do olho seco como perda de homeostase do filme lacrimal, com sintomas de desconforto ou distúrbio visual, e com etiologias-chave em instabilidade, hiperosmolaridade, inflamação e dano. O componente neurossensorial entra pela primeira vez. Aquoso e evaporativo existem em contínuo, não como polos que se excluem. O esquema já admitia as duas discórdias: sinais sem sintomas (inclusive o olho neurótrofico) e sintomas sem sinais demonstráveis (inclusive a dor neuropática).",
        "O mapa que o leitor conhece é o do relatório de metodologia do DEWS II (Wolffsohn e colaboradores, 2017): triagem com DEQ-5 ou OSDI; em seguida tempo de ruptura (de preferência não invasivo), osmolaridade e coloração de córnea, conjuntiva e margem; depois, subclassificação evaporativo versus aquoso. Esse mapa ainda organiza a maior parte das fichas. Não é o mapa operacional desta matéria. É o contraste: o que se pedia em 2017 e o que se pede agora.",
        "O mapa operacional é o relatório de metodologia diagnóstica do DEWS III (Wolffsohn e colaboradores, 2025). A doença é multifatorial e sintomática. Os fatores etiológicos incluem instabilidade, hiperosmolaridade, inflamação e dano, e anormalidades neurossensoriais como fator formal, não como comorbidade opcional. O screening recomendado é OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24), não no índice 0–100 do OSDI-12. O diagnóstico fecha com screening positivo mais um signo de homeostase: NIBUT menor que 10 segundos, ou hiperosmolaridade (≥ 308 mOsm/L ou diferença interocular maior que 8), ou coloração (córnea > 5, ou conjuntiva > 9, ou margem palpebral ≥ 2 mm e ≥ 25% da largura). Isso é a porta diagnóstica. Não é o recap dos nove drivers (esse mapa está na matéria TFOS DEWS III na prática).",
        'Duas categorias do consultório mudam de endereço. "Olho seco silencioso" (sinais sem sintomas) deixa de ser doença do olho seco no sentido DEWS III. Pode ser superfície alterada, neurotrofia ou outro diagnóstico. Não fecha o critério de doença sintomática. "Olho seco sem teste" (sintomas sem signo de homeostase) também não fecha. O que se investiga é o ramo neurossensorial, a dor neuropática ocular, o driver neural. A discórdia não desaparece. Ela ganha endereço.',
        "A subclassificação em filme, pálpebra e superfície é o esqueleto. No consultório, isso se traduz nos eixos aquoso, evaporativo-DGM, inflamatório e neurossensorial, com o desalinhamento como caixa mecânica. O Digest do DEWS III (Stapleton e colaboradores, 2025) ancora o que esta matéria precisa do consenso de 2025 sem reabrir a biologia da glândula de Meibomius: o eixo dor e sensação, e a distinção fisiopatológica entre deficiência aquosa e evaporativa, inclusive o papel do estresse neural.",
        "A discórdia como fato clínico tem um landmark. Nichols e colaboradores (2004) examinaram 75 pacientes com doença do olho seco e não encontraram associação entre sinais e sintomas após ajuste para idade e lágrima artificial. A amostra é pequena. O protocolo é anterior à osmolaridade e ao NIBUT de rotina. O OSDI ainda não era o instrumento padronizado daquele desenho. Nada disso apaga o achado: a correlação que o consultório espera não estava lá.",
        "Vehof e colaboradores (2017) dão o que o landmark não dava: preditores acionáveis, nas duas direções, em 648 pacientes de um serviço terciário holandês (83% mulheres, mais próximo do consultório brasileiro do que as cohorts de veteranos). Mais sintomas que sinais: dor crônica, atopia, anti-histamínicos, depressão, osteoartrite, antidepressivos. Essa direção associou-se a pior saúde percebida. Menos sintomas que sinais: idade, Sjögren (sobretudo a forma primária), doença do enxerto contra o hospedeiro. Associação transversal não é causalidade. Continua sendo a lista que muda a anamnese quando a discórdia aparece.",
        "As cohorts de veteranos americanos descrevem a outra face (a discórdia como fenótipo de sensibilização) e exigem caveat de população. Ong e colaboradores (2018) estudaram 326 pacientes de um hospital VA, 92% homens. O escore de discórdia associou-se a dor não ocular, transtorno de estresse pós-traumático, índices de saúde mental e hiperalgesia em testes quantitativos sensoriais, com pós-sensações ao calor e ao frio. Galor e colaboradores (2015), na mesma linha de serviço, mostraram que sintomas medidos por DEQ-5 e OSDI correlacionavam-se moderadamente com dor não ocular, depressão e PTSD, e fraca ou não se correlacionavam com parâmetros do filme lacrimal. Na regressão, nenhum parâmetro lacrimal permaneceu associado. A implicação é direta e limitada: tratar só o filme em um paciente com discórdia alta e carga de dor não ocular pode ser o mecanismo errado. Para o consultório brasileiro (maioria mulher, terciário misto), a direção da discórdia apoia-se em Vehof, não nessas cohorts.",
        "O substrato do eixo neurossensorial está no relatório de dor e sensação do DEWS II (Belmonte e colaboradores, 2017). Nociceptores polimodais e mecânicos sensibilizados, somados a termorreceptores ao frio anormais, produzem a queixa de ressecamento e dor. Lesão prolongada altera canais e receptores e pode gerar dor neuropática referida à superfície. A avaliação que o relatório aponta (questionários, estesiometria, microscopia confocal in vivo) descreve método. A confocal não é rotina do consultório médio e não será aprofundada aqui. O que cabe é o reconhecimento de que o sintoma pode nascer no nervo, não só no filme.",
        "Galor e colaboradores (2018) traduzem isso em clínica. Doença do olho seco e dor neuropática compartilham epidemiologia e apresentação. Features de dor neuropática ocular (fotoalodinia, hipersensibilidade ao vento) marcam persistência e gravidade de sintomas com sinais semelhantes. Sem um ramo neurossensorial explícito, o paciente com dor desproporcional continua recebendo o mesmo escalonamento de lubrificante e anti-inflamatório que o paciente cujo driver é o filme.",
        "Há um contraste de definição que o leitor vai encontrar, sobretudo em literatura asiática, e que não deve ser apresentado como substituto. A Asia Dry Eye Society (Tsubota e colaboradores, 2017) descreveu um paradigma de sintomas mais tempo de ruptura curto (o fenótipo short-TFBUT, frequente em usuários de tela), mesmo com poucos outros sinais. É um fenótipo real. O DEWS III, porém, exige sintoma (OSDI-6) e um signo de homeostase. Pacientes que fecham ADES podem ou não fechar DEWS III. A harmonização não está resolvida. Esta matéria não adota o paradigma ADES como algoritmo. Usa-o como contraste para não apagar o paciente de TBUT curto e muitos sintomas.",
        "Os questionários que mudam decisão nesta lista são três, com funções distintas. O OSDI de Schiffman e colaboradores (2000) tem doze itens e três subescalas (função visual, sintomas, gatilhos ambientais) e foi validado para gravidade. É instrumento de caracterização, não só de screening. O DEQ-5 de Chalmers, Begley e Caffery (2010) combina frequência e intensidade vespertina de desconforto e ressecamento com frequência de lacrimejamento: escore maior que 6 sugere doença do olho seco; maior que 12 sugere investigar Sjögren (sugere investigar, não diagnostica). O OSDI-6 de Pult e Wolffsohn (2019) reúne os itens 1, 4, 7, 9, 10 e 11 do OSDI, correlaciona-se com o instrumento completo (r ≈ 0,90) e prediz o DEQ-5 (AUC 0,80). É o atalho que o DEWS III adotou para screening. Não é sucessor do OSDI de doze itens. Não cobre as três subescalas. Foi derivado em amostras europeias relativamente jovens (no primeiro estudo, idade média em torno de 34 anos). O cutoff que o consenso usa não está validado no Brasil.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        'A mudança imediata é de raciocínio, não de escada prescritiva. Se o OSDI-6 ou o DEQ-5 estão altos e a coloração, o tempo de ruptura e a osmolaridade estão baixos (ou o inverso), o primeiro gesto é registrar a discórdia como dado. Não como "exame inconsistente". Não como motivo para repetir a lâmpada de fenda até os números coincidirem. A discórdia é o achado que abre o mapa, não o que o invalida.',
        "Os questionários entram na decisão, não na ficha por obrigação. O OSDI-6 decide se o paciente entra no algoritmo DEWS III. O DEQ-5, sobretudo acima de 12, puxa a investigação de Sjögren no eixo aquoso. O OSDI completo entra quando o formulário curto não explica o fenótipo: quando a queixa é função visual, ou quando os gatilhos ambientais são o que distingue este paciente daquele. SPEED e SANDE servem como alternativas de acompanhamento, não como instrumentos adotados para mudar o eixo.",
        'O eixo aquoso se reconhece por volume baixo (Schirmer, menisco) e, quando o DEQ-5 está alto, pela pergunta de Sjögren. Sjögren, GVHD e idade predizem menos sintomas que sinais. O paciente oligosintomático com superfície marcada não é "olho seco leve". Não se aprofunda imunologia nesta matéria. Aprofunda-se o reconhecimento de que o volume e o contexto sistêmico podem ser o driver mesmo quando a queixa é discreta.',
        "O eixo evaporativo-DGM se reconhece por tempo de ruptura curto, margem e expressibilidade, e filme lipídico. Nesta matéria, o eixo existe para ser nomeado quando é ele que explica a visita. A biologia da glândula e os procedimentos de margem são de outras matérias.",
        'O eixo inflamatório se reconhece por coloração, hiperosmolaridade e, se o teste já estiver disponível no serviço, MMP-9 como bandeira (não como tema). A inflamação pode ser primária, no bloco de superfície, ou secundária a qualquer outro eixo. Fenótipo inflamatório "puro" é constructo clínico: coloração não é inflamação primária. O que cabe é não tratar toda coloração como se fosse o mesmo mecanismo.',
        "O eixo neurossensorial é o núcleo desta matéria. Dor desproporcional aos sinais. Features de dor neuropática ocular (vento, fotoalodinia). Comorbidades de dor crônica, depressão, PTSD quando o contexto as trouxer. Testes quantitativos sensoriais se o serviço os tiver. A conduta que muda hoje não é uma nova gota: é parar de escalar lubrificante e anti-inflamatório indefinidamente quando o driver é neural, reconhecer o ramo e encaminhar. O que se tem no consultório médio (discórdia, features de NOP, comorbidades de dor) é proxy. Não é gold standard. Estesiometria, confocal e QST não são rotina e não devem ser fingidos como se fossem.",
        "A caixa mecânica é reconhecimento, não tratado. Desalinhamento anatômico, exposição, atrito, conjuntivocálase óbvia: reconhecer. Critérios de alerta cabem em uma linha: lagoftalmo, CCh evidente, atrito visível.",
        "Mistos: a maioria dos pacientes terá dois eixos ou mais. Hierarquizar pelo driver da visita (o que explica a discórdia de hoje) é o gesto. Completar o checklist de todos os eixos em toda consulta é o que produz polifarmácia. Não há série de cinco casos nesta atualização. Não há fluxograma mestre validado para quinze a vinte minutos. Há um mapa e uma pergunta.",
        "Amanhã, no consultório:",
      ],
      bullets: [
        "Se OSDI-6 ou DEQ-5 altos e coloração, TBUT ou osmolaridade baixos (ou o inverso), registrar a discórdia como dado.",
        "OSDI-6 para o algoritmo DEWS III. DEQ-5 quando Sjögren ou deficiência aquosa está em jogo. OSDI completo quando o curto não explica função visual ou gatilhos.",
        "Aquoso: volume baixo. DEQ-5 > 12 sugere investigar Sjögren. Menos sintomas que sinais se Sjögren, GVHD ou idade.",
        "Evaporativo-DGM: TBUT curto, margem, expressibilidade, lipídio. Nomear o eixo. Não esgotar a glândula aqui.",
        'Inflamatório: coloração, osmolaridade, MMP-9 só como bandeira se já disponível. Primário ou secundário. "Puro" é constructo.',
        "Neurossensorial: dor desproporcional, vento, fotoalodinia, comorbidades de dor. Não escalar filme indefinidamente. Reconhecer e encaminhar o ramo de dor.",
        "Mecânico: lagoftalmo, CCh óbvia, atrito. Caixa.",
        "Mistos: hierarquizar o driver de hoje, não o checklist completo.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta matéria propõe um mapa. Não vende desfecho. Não há ensaio randomizado que teste fenotipagem integrada contra escalada por gravidade de sintomas. Não há algoritmo consultorial validado que hierarquize cinco eixos e mistos em uma visita de quinze a vinte minutos. O DEWS III dá testes e cut-offs. Não dá a ordem dos drivers quando eles convivem.",
        "Não há gold standard de fenótipo neurossensorial no consultório médio. Microscopia confocal, estesiometria e testes quantitativos sensoriais não são rotina. Features de dor neuropática ocular, discórdia e comorbidades de dor são o melhor proxy disponível. E é proxy.",
        "O cutoff OSDI-6 ≥ 4 na soma 0–24 não foi validado no Brasil. O instrumento foi derivado em amostras europeias relativamente jovens. O pacote de cut-offs do DEWS III (OSDI-6, NIBUT, osmolaridade, coloração) não foi testado prospectivamente como conjunto na clínica brasileira.",
        "A harmonização entre ADES e DEWS III não está resolvida. Sintomas mais TBUT curto não são o mesmo critério que sintoma mais um signo de homeostase.",
        "A direção da discórdia em mulheres brasileiras (a maioria do consultório) apoia-se em Vehof, serviço terciário holandês, não nas cohorts VA de Ong e Galor, predominantemente masculinas. Nichols 2004 permanece landmark e permanece amostra pequena, pré-osmolaridade e pré-NIBUT de rotina.",
        'Fenótipo inflamatório "puro", sem biomarcador de consultório, é constructo. Coloração e osmolaridade não autorizam essa etiqueta.',
        "O Digest do DEWS III tem corrigendum em 2026. Esta matéria usa só o eixo dor e sensação e a distinção ADDE versus evaporativo, sem recap de DGM, e não afirma ter verificado o texto da correção (o full text não estava disponível no corte).",
        "Um artigo citado em base de consenso (Mejía-Salgado e colaboradores, 2026) não foi confirmado no PubMed até 15 de agosto de 2026 e não é citado.",
      ],
    },
  ],
  references: [
    {
      label:
        "Craig JP, Nichols KK, Akpek EK, et al. TFOS DEWS II Definition and Classification Report. Ocul Surf. 2017;15(3):276-283.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.008",
      doi: "10.1016/j.jtos.2017.05.008",
    },
    {
      label:
        "Wolffsohn JS, Arita R, Chalmers R, et al. TFOS DEWS II Diagnostic Methodology report. Ocul Surf. 2017;15(3):539-574.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.001",
      doi: "10.1016/j.jtos.2017.05.001",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. Am J Ophthalmol. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "Stapleton F, Argüeso P, Asbell P, et al. TFOS DEWS III: Digest. Am J Ophthalmol. 2025;279:451-553.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.040",
      doi: "10.1016/j.ajo.2025.05.040",
    },
    {
      label:
        "Nichols KK, Nichols JJ, Mitchell GL. The Lack of Association Between Signs and Symptoms in Patients With Dry Eye Disease. Cornea. 2004;23(8):762-770.",
      url: "https://doi.org/10.1097/01.ico.0000133997.07144.9e",
      doi: "10.1097/01.ico.0000133997.07144.9e",
    },
    {
      label:
        "Vehof J, Sillevis Smitt-Kamminga N, Nibourg SA, Hammond CJ. Predictors of Discordance between Symptoms and Signs in Dry Eye Disease. Ophthalmology. 2017;124(3):280-286.",
      url: "https://doi.org/10.1016/j.ophtha.2016.11.008",
      doi: "10.1016/j.ophtha.2016.11.008",
    },
    {
      label:
        "Ong ES, Felix ER, Levitt RC, et al. Epidemiology of discordance between symptoms and signs of dry eye. Br J Ophthalmol. 2018;102(5):674-679.",
      url: "https://doi.org/10.1136/bjophthalmol-2017-310633",
      doi: "10.1136/bjophthalmol-2017-310633",
    },
    {
      label:
        "Belmonte C, Nichols JJ, Cox SM, et al. TFOS DEWS II pain and sensation report. Ocul Surf. 2017;15(3):404-437.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.002",
      doi: "10.1016/j.jtos.2017.05.002",
    },
    {
      label:
        "Galor A, Moein HR, Lee C, et al. Neuropathic pain and dry eye. Ocul Surf. 2018;16(1):31-44.",
      url: "https://doi.org/10.1016/j.jtos.2017.10.001",
      doi: "10.1016/j.jtos.2017.10.001",
    },
    {
      label:
        "Tsubota K, Yokoi N, Shimazaki J, et al. New Perspectives on Dry Eye Definition and Diagnosis: A Consensus Report by the Asia Dry Eye Society. Ocul Surf. 2017;15(1):65-76.",
      url: "https://doi.org/10.1016/j.jtos.2016.09.003",
      doi: "10.1016/j.jtos.2016.09.003",
    },
    {
      label:
        "Pult H, Wolffsohn JS. The development and evaluation of the new Ocular Surface Disease Index-6. Ocul Surf. 2019;17(4):817-821.",
      url: "https://doi.org/10.1016/j.jtos.2019.08.008",
      doi: "10.1016/j.jtos.2019.08.008",
    },
    {
      label:
        "Chalmers RL, Begley CG, Caffery B. Validation of the 5-Item Dry Eye Questionnaire (DEQ-5): Discrimination across self-assessed severity and aqueous tear deficient dry eye diagnoses. Cont Lens Anterior Eye. 2010;33(2):55-60.",
      url: "https://doi.org/10.1016/j.clae.2009.12.010",
      doi: "10.1016/j.clae.2009.12.010",
    },
    {
      label:
        "Schiffman RM, Christianson MD, Jacobsen G, Hirsch JD, Reis BL. Reliability and Validity of the Ocular Surface Disease Index. Arch Ophthalmol. 2000;118(5):615-621.",
      url: "https://doi.org/10.1001/archopht.118.5.615",
      doi: "10.1001/archopht.118.5.615",
    },
    {
      label:
        "Galor A, Felix ER, Feuer WJ, et al. Dry eye symptoms align more closely to non-ocular conditions than to tear film parameters. Br J Ophthalmol. 2015;99(8):1126-1129.",
      url: "https://doi.org/10.1136/bjophthalmol-2014-306481",
      doi: "10.1136/bjophthalmol-2014-306481",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "Fenotipagem",
    "Olho seco",
    "Discórdia sintomas-sinais",
    "DEWS III",
    "Consultório brasileiro",
  ],
  seo: {
    title: "Quando sintomas e sinais não batem | SUPERFÍCIE",
    description:
      "A discórdia entre sintomas e sinais é um achado clínico, não um erro de medida. Fenotipagem integrada no consultório: mapear eixos, não forçar concordância.",
    canonical: "/superficie/artigos/quando-sintomas-e-sinais-nao-batem",
  },
};

const tresMesesNaoSaoDoze: MagazineArticle = {
  slug: "tres-meses-nao-sao-doze",
  title: "Três meses não são doze",
  subtitle:
    "Quando um ranking de curto prazo vira argumento de venda, a evidência começa a ser lida além do que realmente demonstra.",
  excerpt:
    "Uma nova tecnologia chega com um gráfico: primeiro lugar em TBUT, melhor P-score em coloração. P-score não é ranking de compra. Três meses não são doze.",
  category: "Tecnologia",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "Uma nova tecnologia chega com um gráfico: primeiro lugar em TBUT, melhor P-score em coloração. A pergunta do consultório não é só se o paciente melhorou aos três meses. É quanto melhorou, em qual fenótipo, comparado a quê, por quanto tempo, com qual risco, quantas vezes será preciso retratar e a que custo.",
        "A maior meta-análise em rede recente sobre tecnologias para olho seco reuniu 47 ensaios randomizados, 3.581 participantes de 16 países. Comparou IPL, pulsação térmica, TearCare, iLUX, LLLT, estimulação elétrica e ressonância molecular quântica. O trabalho é valioso. O horizonte principal foi de 2 a 4 meses. Três meses não são doze.",
        "P-score não é ranking de compra. IRPL não é o IPL de consultório.",
      ],
    },
    {
      id: "o-que-o-ranking-realmente-significa",
      title: "O que o ranking realmente significa",
      kind: "body",
      paragraphs: [
        "Na análise de Noyman e colaboradores (2026), TearCare associado à expressão das glândulas meibomianas e IPL associado a máscara aquecida ficaram entre as estratégias mais bem posicionadas para estabilidade lacrimal. QMR ocupou posição elevada para coloração corneana. Modalidades baseadas em IPL tiveram bom desempenho para sintomas.",
        "Isso não significa que um equipamento tenha vencido os demais.",
        "Meta-análises em rede combinam comparações diretas e indiretas. São úteis quando não existem ensaios com todas as tecnologias frente a frente. Os pacientes não são idênticos. Os protocolos variam. Os comparadores mudam. Algumas tecnologias aparecem em poucos estudos. Várias intervenções incluem cointervenções diferentes. A rede de 2026 misturou subtipos de IPL, relatou heterogeneidade extrema (I² de 98,6% em TBUT e 97,2% em coloração) e cerca de 30% dos ensaios com conflito industrial.",
        "O P-score ordena tratamentos dentro daquela rede estatística. Ele não mede retorno sobre investimento, durabilidade, aplicabilidade a outro equipamento da mesma classe nem a probabilidade clínica de uma tecnologia ser a melhor para determinado paciente. Uma tecnologia pode ocupar o primeiro lugar em um desfecho e ainda ter evidência baseada em poucos estudos, comparações indiretas, protocolo específico ou seguimento curto.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Quando a literatura é observada por outra lente, a certeza diminui.",
        "McCann e colaboradores (2024), num overview no JAMA Ophthalmology, avaliaram 71 revisões elegíveis. Apenas 26 foram consideradas metodologicamente confiáveis. Nenhuma intervenção apresentou evidência conclusiva de alta certeza. IPL e pulsação térmica aparecem como potencialmente eficazes. Potencialmente eficaz não é superior.",
        "Pucker e colaboradores (2024), na Cochrane dedicada ao LipiFlow, avaliaram 13 ensaios e 1.155 participantes. Comparado a compressas mornas básicas, os resultados para sintomas foram conflitantes. Também não surgiu evidência clara de superioridade para expressão glandular, qualidade do meibum ou tempo de ruptura do filme lacrimal. A certeza global foi baixa ou muito baixa.",
        "Chen e colaboradores (2025) encontraram, no LipiFlow, melhora da função glandular (MGYSS) e discreta melhora da coloração corneana (CFS), sem benefício significativo para OSDI ou espessura da camada lipídica (LLT). As duas sínteses não precisam ser lidas como contraditórias. A conclusão muda conforme os estudos incluídos, os comparadores, o desfecho e o método de análise.",
        "Peira e colaboradores (2025) atualizam o IPL. Comparado a placebo, IPL provavelmente produz uma redução clinicamente relevante dos sintomas, aproximadamente 16 pontos no OSDI. Quando IPL foi analisado como adjuvante ao tratamento padrão, a diferença caiu para cerca de 7 pontos. Nesse cenário, tornou-se menos claro se o ganho adicional seria clinicamente relevante. Funcionar contra placebo responde a uma pergunta. Acrescentar benefício a um tratamento padrão já bem conduzido responde a outra. No consultório, interessa a segunda.",
        "IRPL e IPL de consultório não são a mesma intervenção. Xue e colaboradores (2020) usaram E-Eye Intense Regulated Pulsed Light (E-Swin): flashes homogêneos sequenciados, 4 versus 5 flashes, curso de pelo menos quatro sessões antes de julgar. Isso é IRPL. Não é o IPL genérico da classe Toyos.",
        "Wu e colaboradores (2020) compararam OPT versus IRPL. OPT ganhou em função da glândula da pálpebra inferior, NIKBUT e FTBUT. Os dois melhoram versus a linha de base. Não é Lumenis versus E-Eye.",
        "Jiang e colaboradores (2022) compararam Eyesis versus E-Eye em duas sessões (D0 e D7). Eyesis foi não inferior. Duas sessões não são o curso de Xue.",
        "Cong e colaboradores (2025) meta-analisam em rede OPT com ou sem expressão, E-Eye com ou sem expressão e Eyesis com expressão. O ranking é indireto. A heterogeneidade é alta. Não há vencedor de consultório.",
        "Não foi identificado ensaio randomizado comparando E-Eye/IRPL com M22/Lumenis ou Toyos no mesmo calendário, mesma fluência e mesma política de expressão glandular. A ausência não prova equivalência. Também não prova superioridade.",
        "Eficácia inicial e durabilidade são desfechos diferentes. SAHARA (Ayres e colaboradores, 2023) comparou TearCare associado à expressão com ciclosporina oftálmica 0,05% em 345 participantes, com seguimento de seis meses. TBUT melhorou mais no braço térmico. OSDI melhorou nos dois, sem diferença entre braços. A extensão (Hovanesian e colaboradores, 2025) trouxe o dado mais útil para o consultório: no grupo térmico, a mediana até o retratamento ficou em torno de oito meses. Isso começa a responder quantas sessões poderão ser necessárias por ano, qual será o custo acumulado e qual é o intervalo esperado de benefício.",
        'Alguns pacientes com LipiFlow mantêm benefício por períodos prolongados, inclusive além de um ano. Isso é relevante. Não é promessa universal de duração. O comportamento correto é falar em distribuição de resposta e necessidade de retratamento, não em frases como "o efeito dura 12 meses".',
        "LLLT apresenta resultados promissores, principalmente em protocolos combinados. O problema metodológico é separar quanto do efeito pertence à fotobiomodulação e quanto pertence à intervenção associada.",
        "QMR apresenta sinais favoráveis em ensaios recentes e alcançou posição elevada para coloração corneana na rede de 2026. Uma posição elevada em um desfecho não compensa uma base de evidência comparativa menor. Quanto menor a quantidade de ensaios por tecnologia, maior a possibilidade de o ranking oscilar quando novos estudos entram na rede.",
        "A rede de 2026 não registrou eventos adversos graves. A Cochrane do LipiFlow também não identificou eventos relacionados ao tratamento com ameaça à visão. A evidência de eventos adversos do IPL permanece de certeza muito baixa ou muito incerta. Ensaios relativamente pequenos e com seguimento curto detectam eventos comuns. São menos eficientes para caracterizar eventos raros. Não existe atualmente um sinal consistente de toxicidade grave. A segurança comparativa de longo prazo ainda é menos bem caracterizada do que a eficácia inicial.",
        "Duas tecnologias com ganho semelhante aos três meses podem exigir uma sessão e retratamento eventual, ou quatro sessões iniciais, consumíveis caros e manutenção periódica. Uma terceira pode oferecer efeito um pouco menor com custo operacional muito inferior. A meta-análise não escolhe.",
        "Os estudos comparativos ainda são muito mais desenvolvidos para eficácia clínica do que para custo por respondedor, custo por mês de benefício sustentado ou impacto econômico do retratamento. No Brasil, custo do equipamento, impostos, consumíveis, treinamento, peças, tempo de sala e perfil da população atendida podem modificar o valor de uma tecnologia. Diferença estatisticamente significativa não é investimento economicamente racional.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Antes de transformar um ranking de curto prazo em decisão de compra, estas seis perguntas separam o que o estudo mostrou do que o consultório precisa saber.",
        "Qual foi o horizonte do estudo? Semanas, três meses, seis meses ou pelo menos um ano?",
        "Qual foi o comparador? Placebo, compressa, higiene palpebral, fármaco ou outro equipamento sob protocolo equivalente?",
        "Qual era o fenótipo? DGM obstrutiva, olho seco evaporativo, deficiência aquosa ou população mista?",
        "Qual protocolo foi realmente estudado? Plataforma, fluência, número de sessões, intervalo e expressão glandular importam.",
        "Qual é a certeza da evidência? Há comparações diretas? Quantos estudos sustentam o resultado? Qual o risco de viés?",
        "Qual é o valor ao longo do tempo? Durabilidade, retratamento, segurança, custo total e ganho incremental sobre o cuidado padrão.",
        "O que muda amanhã: IPL e sistemas térmicos são ferramentas legítimas e podem melhorar sinais e sintomas em pacientes selecionados, especialmente quando existe DGM e componente evaporativo relevante.",
        "Para IPL, a evidência de benefício contra placebo é mais convincente do que a de benefício incremental sobre um tratamento padrão bem conduzido. Para pulsação térmica, há melhora documentada, sem demonstração consistente de superioridade universal sobre alternativas mais simples. LLLT e QMR ainda dependem de redes comparativas menores.",
        "Nenhuma meta-análise resolve sozinha o equilíbrio entre fenótipo, magnitude, durabilidade, segurança e custo para aquele paciente e aquela prática.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta é uma revisão narrativa editorial, e não uma revisão sistemática registrada. Não foi realizada meta-análise independente. A conferência das fontes numeradas nesta versão é de 17 de agosto de 2026.",
        "A rede de 2026 assume transitividade e não inclui SAHARA como confronto entre aparelhos. Pucker para em 2022. Peira atualiza sintoma do IPL e não substitui uma Cochrane nova.",
        "Xue é IRPL (E-Eye/E-Swin), não o IPL genérico de consultório. Jiang usa duas sessões. Xue usa quatro a cinco. Fluência e fototipo brasileiros não foram validados nesta lista. Furo duro: zero ensaio randomizado E-Eye/IRPL versus M22/Lumenis/Toyos no mesmo calendário, mesma fluência e mesmo uso de expressão.",
        "Nenhum paper numerado é brasileiro. Registro e disponibilidade nacional não foram verificados. Não se inventa status ANVISA. Não se afirma que IPL cura DGM.",
      ],
    },
  ],
  references: [
    {
      label:
        "Noyman DBE, Chan CC, Teichman JC, et al. Technological Interventions for Dry Eye Disease: A Systematic Review and Random-Effects Network Meta-analysis of 3-Month Outcomes. Ophthalmology and Therapy. 2026;15(5):1721-1759.",
      url: "https://doi.org/10.1007/s40123-026-01360-x",
      doi: "10.1007/s40123-026-01360-x",
    },
    {
      label:
        "McCann P, Kruoch Z, Lopez S, Malli S, Qureshi R, Li T. Interventions for Dry Eye: An Overview of Systematic Reviews. JAMA Ophthalmology. 2024;142(1):58-74.",
      url: "https://doi.org/10.1001/jamaophthalmol.2023.5751",
      doi: "10.1001/jamaophthalmol.2023.5751",
    },
    {
      label:
        "Pucker AD, Yim TW, Rueff E, Ngo W, Tichenor AA, Conto JE. LipiFlow for the treatment of dry eye disease. Cochrane Database of Systematic Reviews. 2024;2(2):CD015448.",
      url: "https://doi.org/10.1002/14651858.CD015448.pub2",
      doi: "10.1002/14651858.CD015448.pub2",
    },
    {
      label:
        "Peira N, Ali EM, Modén NK, Fjellgren E, Lennmarken C, Hultcrantz M. Effectiveness and safety of intense pulsed light therapy for dry eye symptoms due to meibomian gland dysfunction. A systematic review and meta-analysis. Acta Ophthalmologica. 2025;103(4):371-379.",
      url: "https://doi.org/10.1111/aos.16802",
      doi: "10.1111/aos.16802",
    },
    {
      label:
        "Xue AL, Wang MTM, Ormonde SE, Craig JP. Randomised double-masked placebo-controlled trial of the cumulative treatment efficacy profile of intense pulsed light therapy for meibomian gland dysfunction. The Ocular Surface. 2020;18(2):286-297.",
      url: "https://doi.org/10.1016/j.jtos.2020.01.003",
      doi: "10.1016/j.jtos.2020.01.003",
    },
    {
      label:
        "Wu Y, Li J, Hu M, et al. Comparison of two intense pulsed light patterns for treating patients with meibomian gland dysfunction. International Ophthalmology. 2020;40(7):1695-1705.",
      url: "https://doi.org/10.1007/s10792-020-01337-0",
      doi: "10.1007/s10792-020-01337-0",
    },
    {
      label:
        "Jiang X, Yuan H, Zhang M, et al. The Efficacy and Safety of New-Generation Intense Pulsed Light in the Treatment of Meibomian Gland Dysfunction-Related Dry Eye: A Multicenter, Randomized, Patients-Blind, Parallel-Control, Non-Inferiority Clinical Trial. Ophthalmology and Therapy. 2022;11(5):1895-1912.",
      url: "https://doi.org/10.1007/s40123-022-00556-1",
      doi: "10.1007/s40123-022-00556-1",
    },
    {
      label:
        "Cong J, Wu Y, Dong C, et al. Network meta-analysis of different modalities of intense pulsed light therapy in the treatment of dry eye disease induced by meibomian gland dysfunction. Lasers in Medical Science. 2025;40(1):303.",
      url: "https://doi.org/10.1007/s10103-025-04545-1",
      doi: "10.1007/s10103-025-04545-1",
    },
    {
      label:
        "Ayres BD, Bloomenstein MR, Loh J, et al. A Randomized, Controlled Trial Comparing Tearcare and Cyclosporine Ophthalmic Emulsion for the Treatment of Dry Eye Disease (SAHARA). Clinical Ophthalmology. 2023;17:3925-3940.",
      url: "https://doi.org/10.2147/OPTH.S442971",
      doi: "10.2147/OPTH.S442971",
    },
    {
      label:
        "Hovanesian J, Ayres BD, Bloomenstein MR, et al. Durability of the TearCare treatment effect in subjects with dry eye disease: Stage 3 of the Sahara randomized controlled trial. Optometry and Vision Science. 2025;102(8):495-504.",
      url: "https://doi.org/10.1097/OPX.0000000000002278",
      doi: "10.1097/OPX.0000000000002278",
    },
    {
      label:
        "Yim TW, Pucker AD, Rueff E, et al. LipiFlow for the treatment of dry eye disease: A Cochrane systematic review summary. Contact Lens & Anterior Eye. 2025.",
      url: "https://doi.org/10.1016/j.clae.2024.102335",
      doi: "10.1016/j.clae.2024.102335",
    },
    {
      label:
        "Ben Ephraim Noyman D, Chan CC, Teichman JC, et al. Dry Eye Disease Management Via Technological Methods: A Systematic Review and Network Meta-analysis. Ophthalmology and Therapy. 2025.",
      url: "https://doi.org/10.1007/s40123-025-01187-y",
      doi: "10.1007/s40123-025-01187-y",
    },
    {
      label:
        "Blackie CA, Murakami D, Donnenfeld ED, Oliff HS. Vectored Thermal Pulsation as a Treatment for Meibomian Gland Dysfunction: A Review Spanning 15 Years. Ophthalmology and Therapy. 2024.",
      url: "https://doi.org/10.1007/s40123-024-00976-1",
      doi: "10.1007/s40123-024-00976-1",
    },
    {
      label:
        "Demolin L, Es-Safi M, Soyfoo MS, Motulsky E. Intense Pulsed Light Therapy in the Treatment of Dry Eye Diseases: A Systematic Review and Meta-Analysis. Journal of Clinical Medicine. 2023;12:3039.",
      url: "https://doi.org/10.3390/jcm12083039",
      doi: "10.3390/jcm12083039",
    },
    {
      label:
        "Chen KY, Chan HC, Chan CM. Is a thermal pulsation system (LipiFlow) effective as a standalone treatment for meibomian gland dysfunction and dry eye? A systematic review and meta-analysis. Ther Adv Ophthalmol. 2025;17:25158414251338775.",
      url: "https://doi.org/10.1177/25158414251338775",
      doi: "10.1177/25158414251338775",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "IPL",
    "IRPL",
    "TearCare",
    "evidência comparativa",
    "olho seco",
    "consultório brasileiro",
  ],
  seo: {
    title: "Três meses não são doze | SUPERFÍCIE",
    description:
      "Uma meta-análise em rede ordena tecnologias de olho seco a 2–4 meses. P-score não é ranking de compra, e três meses não são doze.",
    canonical: "/superficie/artigos/tres-meses-nao-sao-doze",
  },
};

const alemDoMeiboscore: MagazineArticle = {
  slug: "alem-do-meiboscore",
  title: "Além do meiboscore",
  subtitle: "Como adquirir, ler e não superinterpretar a meibografia",
  excerpt:
    "O meiboscore virou atalho de consultório. A pálpebra é evertida, o software devolve um número, o laudo sai “DGM grau 2”. A pergunta útil é outra: como adquirir, ler e não superinterpretar a imagem.",
  category: "Diagnóstico",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O meiboscore virou atalho de consultório. A pálpebra é evertida, o software devolve um número, o laudo sai “DGM grau 2”. A pergunta útil é outra: como adquirir, ler e não superinterpretar a imagem.",
        "O meiboscore de Arita (0 a 3 por pálpebra, soma 0 a 6) quantifica perda de área glandular visível. Não mede expressibilidade. Não distingue atrofia de oclusão. Não diagnostica doença do olho seco.",
        "Usá-lo como “teste de DGM” isolado é overclaim. O que o escore não mede é o ponto desta matéria.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quinze de quinze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O marco de aquisição é a meibografia infravermelha sem contato de Arita, Itoh, Inoue e Amano (2008). Lâmpada de fenda, CCD infravermelho e filtro transmissor, sem sonda de transiluminação. Eversão de superior e inferior. Graus por pálpebra: 0 = sem perda; 1 = perda menor que um terço da área; 2 = um terço a dois terços; 3 = mais de dois terços. Em 236 “normais” de 4 a 98 anos, a correlação idade–meiboscore foi R = 0,428. Isso é norma etária e protocolo de captura.",
        "A técnica clássica de contato (silhueta por retroiluminação transcutânea com sonda) cobre mal a pálpebra superior e incomoda. A revisão de Pult e Nichols (2012) descreve quatro décadas de técnicas, escalas e relevância diagnóstica. O princípio que cabe é infravermelho de contato versus sem contato, campo e eversão. Não é catálogo de aparelho.",
        "Os critérios de qualidade estão no fulltext de Arita e colaboradores (2014). Excluir fora de foco e campo com dedo. Reflexo forte o software toma por glândula. Área escura em perda extensa exige correção manual. Eversão excessiva faz a área de análise incluir tarso além da zona glandular, indistinguível de dropout ou encurtamento. Dilatação ductal precoce pode aumentar a área medida: a porcentagem isolada subestima o início, não o denuncia. O recorte automático ainda precisa de correção humana; o sistema não é totalmente automático. ImageJ clássico exige o examinador desenhar a região. Software reduz ruído. Não substitui critério de qualidade.",
        "Em disfunção obstrutiva versus controle, ambos em torno de 71 anos, Arita e colaboradores (2009) acharam o escore de sintomas com o maior AUC como parâmetro isolado, seguido de margem, meibo-score e tempo de ruptura. A proposta: suspeitar DGM obstrutiva se dois de três (sintomas, margem, meibo-score) forem anormais; “muito provável” se os três. A imagem é um dos três. Não é o ouro.",
        "O relatório da subcomissão de diagnóstico do workshop internacional de DGM (Tomlinson e colaboradores, 2011) é a âncora de que o padrão TFOS nunca foi meiboscore isolado. O corpo do workshop não foi recuperado em fulltext nesta busca. Não se cita cut-off nem frase específica do relatório.",
        "O DEWS III (Wolffsohn e colaboradores, 2025), lido no abstract, fecha doença do olho seco com screening (OSDI-6 ≥ 4 na soma bruta dos 6 itens, escala 0–24, não o índice 0–100 do OSDI-12) mais um signo de homeostase: tempo de ruptura não invasivo, ou osmolaridade, ou coloração. A doença é sempre sintomática. A meibografia não está no critério diagnóstico. O abstract descreve subclassificação em filme, pálpebra e superfície. É o endereço da imagem, se tanto.",
        "Superior e inferior diferem. Pult, Riede-Pult e Nichols (2012), em 20 participantes, acharam correlação de perda e de ângulo de curvatura entre as pálpebras; a espessura não correlacionou. Perda menor na superior (26,9% versus 32,3%); inferior mais espessa e mais curva. A perda correlacionou com camada lipídica e tempo de ruptura não invasivo. Combinar as duas pálpebras deu melhor AUC para OSDI positivo ou negativo (0,929). É piloto. Não é norma. Continua sendo o argumento para não laudar só a inferior.",
        "A concordância interexaminador do dropout é, no máximo, moderada. Powell, Nichols e Nichols (2012), em 410 mulheres pós-menopausa, acharam acordo observado de 42,8% e kappa ponderado de 0,50 entre exame em tempo real e fotografia; ácinos e debris foram piores (kappa ponderado em torno de 0,23). Dogan e colaboradores (2018), em 30 casos lidos por três clínicos, acharam kappa ponderado moderado a bom na superior (0,52–0,65) e apenas regular a moderado na inferior (0,21–0,53); o tempo de ruptura com fluoresceína correlacionou com perda só na superior. Pult e Riede-Pult (2013) compararam escalas subjetivas de 4 e 5 graus com ImageJ (0–100): o acordo intra e inter foi melhor na escala computadorizada; mesmo assim a variação intra-observador objetiva foi ±17 a 18 pontos percentuais. Meiboscore ordinal é ruidoso. Porcentagem contínua é menos ruidosa. Não é ouro.",
        "Wang e colaboradores (2025) cruzaram, em 227 participantes, um desenho crossover mascarado de dois aparelhos infravermelhos de consultório, meiboscale versus porcentagem por ImageJ. A porcentagem de dropout (C-stat 0,63–0,65) superou a meiboscale (0,55–0,56) para detectar doença do olho seco pelo critério DEWS II, não DEWS III. O corte de Youden foi porcentagem maior que 20% ou meiboscale maior que 1. Kappa inter-aparelho 0,68–0,73; limites de concordância da porcentagem de cerca de −28 a +26 pontos. Não trocar de aparelho no follow-up e chamar de “progressão”. Não adotar esse corte Youden como diagnóstico de DGM no Brasil: o C-stat em torno de 0,63 diz que a imagem é fraca como teste de doença do olho seco, e esse é o ponto, não um defeito a esconder. ImageJ, aqui, é quantificação humana assistida. Não substitui o examinador.",
        "A escala importa. A meiboscale de Pult é 0 a 4. Misturá-la com o meiboscore de Arita sem dizer qual é o erro de ficha. Se for ordinal, a escala de 5 graus concordou mais que a de 4. Se for pesquisa ou follow-up, a porcentagem contínua reduz ruído, e ainda oscila.",
        "Função e estrutura não se substituem. Korb e Blackie (2008) mostraram que o número de glândulas que rendem secreção líquida no cílio inferior correlaciona com sintomas. A distribuição não é uniforme: nasal 3,10 ± 0,15, central 2,14 ± 0,13, temporal 0,27 ± 0,06; 86% dos terços temporais tinham zero glândulas expressáveis versus 6% dos nasais. Amostragem só no terço temporal subestima a função. Kim, Eom e Song (2018) lembram que a classificação de baixo versus alto delivery assume correlação morfologia–função que a clínica não confirma: muitos casos são mistos. Dropout na meibografia não é obstrução. Obstrução não é atrofia.",
        "Uma imagem mente. Swiderska e colaboradores (2024), em 15 participantes, mostraram que após expressão terapêutica o contraste e a razão de comprimento caem e, em 24 horas, voltam ao baseline. A interpretação dos autores: a meibografia captura também atividade acinar (lipídio hiper-reflexivo), não só “estrutura morta”. Não laudar encurtamento ou atrofia em imagem imediatamente pós-expressão. Não tratar mudança de contraste como ganho ou perda anatômica permanente. Perda de contraste, glândula pouco visível, pode ser artefato, esvaziamento transitório ou aquisição ruim. Não é grau validado.",
        "Lente de contato e idade são normas, não diagnósticos. Arita e colaboradores (2009) compararam 121 usuários de lente com 137 controles, idade em torno de 32 anos. Meiboscore médio 1,72 versus 0,96; o dos usuários aproximava a faixa etária 60–69 anos da população “normal” de 2008. Houve correlação positiva entre duração de uso e meiboscore. Associação transversal não é causalidade: a lente se associa a mais perda visível; o desenho não prova que a lente causa DGM. A perda glandular visível aumenta com a idade em “normais” (Arita e colaboradores, 2008). Um meiboscore 2 em octogenário não é, sozinho, DGM. Não há nomograma etário brasileiro nesta lista. Distorção e dilatação entram na leitura além da área (Arita e colaboradores, 2014; Pult e Nichols, 2012); não se afirma prevalência. O paper clássico não está neste arquivo de quinze.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "A mudança imediata é de recusa. Imagem fora de foco, com reflexo, com dedo no campo, com eversão incompleta ou excessiva: não se lauda. Pede-se nova aquisição. Não chutar meiboscore 2 ou 3 em frame granulado.",
        "O protocolo mínimo: infravermelho sem contato; eversão reproduzível das duas pálpebras de ambos os olhos; iluminação sem reflexo no tarso; foco no plano das glândulas; registrar pré- ou pós-expressão; follow-up no mesmo aparelho, mesma pálpebra, mesma eversão.",
        "O atlas mínimo lê dropout, encurtamento, distorção, dilatação e baixo contraste. Dilatação pode aumentar a área no início. Contraste baixo pode ser esvaziamento, não atrofia. Superior e inferior não são intercambiáveis.",
        "Acoplar função: expressibilidade padronizada ao longo da pálpebra inferior, não só no terço temporal, mais qualidade do meibum e margem. Imagem sem expressão é laudo incompleto.",
        "Antes de escrever “DGM”, anote idade, lente de contato e tempo de uso. Não comparar aparelhos diferentes. Se a escala for ordinal, preferir 5 graus a 4 e dizer se é Arita 0–3 por pálpebra ou Pult 0–4. Se for pesquisa ou follow-up, porcentagem contínua.",
        "Onde a imagem decide: documentar baseline; acompanhar no mesmo sistema; subclassificar o eixo lipídio ou pálpebra. Onde não decide: diagnosticar doença do olho seco; fechar DGM sozinha; “provar” resposta terapêutica em 24 horas.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta matéria ensina método. Não vende desfecho. Não há ensaio randomizado que teste laudo padronizado contra meiboscore isolado.",
        "Arita 2008 e 2009 são cohorts japonesas de um grupo. Normas etárias e de lente não foram revalidadas no Brasil. Não há nomograma brasileiro nesta lista. Pult 2012 é n = 20; Dogan 2018 é n = 30; Swiderska 2024 é n = 15: pilotos, não normas. Powell 2012 é só mulheres pós-menopausa; o acordo é foto versus tempo real, não dois clínicos no mesmo exame ao vivo.",
        "Wang e colaboradores (2025) usam critério DEWS II de doença do olho seco, não DEWS III. O C-stat da meibografia é só cerca de 0,63. O corte Youden (porcentagem maior que 20% ou meiboscale maior que 1) não se adota como corte brasileiro de DGM. O corpo do Tomlinson 2011 não foi recuperado: o PMC devolveu só front matter. Não se inventam frases do workshop. Wolffsohn e colaboradores (2025): claims de meibografia extraídas só do abstract. Não se afirma cut-off de imagem DEWS III.",
        "Perda de contraste como grau, laterality sistemática em olho sem doença unilateral e nomograma etário brasileiro não têm fonte âncora nesta lista. Não há protocolo de aquisição brasileiro validado (eversão, iluminação, qual pálpebra, pré versus pós-expressão) com concordância interobservador em consultório real. Wang e colaboradores (2025) e Swiderska e colaboradores (2024) declaram financiamento de Johnson & Johnson Vision; o caveat de conflito cabe nesta frase, sem transformar o achado em ataque.",
      ],
    },
  ],
  references: [
    {
      label:
        "Arita R, Itoh K, Inoue K, et al. Noncontact Infrared Meibography to Document Age-Related Changes of the Meibomian Glands in a Normal Population. Ophthalmology. 2008;115(5):911-915.",
      url: "https://doi.org/10.1016/j.ophtha.2007.06.031",
      doi: "10.1016/j.ophtha.2007.06.031",
    },
    {
      label:
        "Arita R, Itoh K, Inoue K, et al. Contact Lens Wear Is Associated with Decrease of Meibomian Glands. Ophthalmology. 2009;116(3):379-384.",
      url: "https://doi.org/10.1016/j.ophtha.2008.10.012",
      doi: "10.1016/j.ophtha.2008.10.012",
    },
    {
      label:
        "Arita R, Itoh K, Maeda S, et al. Proposed Diagnostic Criteria for Obstructive Meibomian Gland Dysfunction. Ophthalmology. 2009;116(11):2058-2063.e1.",
      url: "https://doi.org/10.1016/j.ophtha.2009.04.037",
      doi: "10.1016/j.ophtha.2009.04.037",
    },
    {
      label:
        "Tomlinson A, Bron AJ, Korb DR, et al. The International Workshop on Meibomian Gland Dysfunction: Report of the Diagnosis Subcommittee. Invest Ophthalmol Vis Sci. 2011;52(4):2006-2049.",
      url: "https://doi.org/10.1167/iovs.10-6997f",
      doi: "10.1167/iovs.10-6997f",
    },
    {
      label:
        "Pult H, Nichols JJ. A Review of Meibography. Optom Vis Sci. 2012;89(5):E760-E769.",
      url: "https://doi.org/10.1097/OPX.0b013e3182512ac1",
      doi: "10.1097/OPX.0b013e3182512ac1",
    },
    {
      label:
        "Pult H, Riede-Pult BH, Nichols JJ. Relation Between Upper and Lower Lids' Meibomian Gland Morphology, Tear Film, and Dry Eye. Optom Vis Sci. 2012;89(3):E310-E315.",
      url: "https://doi.org/10.1097/OPX.0b013e318244e487",
      doi: "10.1097/OPX.0b013e318244e487",
    },
    {
      label:
        "Pult H, Riede-Pult B. Comparison of subjective grading and objective assessment in meibography. Cont Lens Anterior Eye. 2013;36(1):22-27.",
      url: "https://doi.org/10.1016/j.clae.2012.10.074",
      doi: "10.1016/j.clae.2012.10.074",
    },
    {
      label:
        "Powell DR, Nichols JJ, Nichols KK. Inter-Examiner Reliability in Meibomian Gland Dysfunction Assessment. Invest Ophthalmol Vis Sci. 2012;53(6):3120.",
      url: "https://doi.org/10.1167/iovs.12-9600",
      doi: "10.1167/iovs.12-9600",
    },
    {
      label:
        "Korb DR, Blackie CA. Meibomian Gland Diagnostic Expressibility: Correlation With Dry Eye Symptoms and Gland Location. Cornea. 2008;27(10):1142-1147.",
      url: "https://doi.org/10.1097/ICO.0b013e3181814cff",
      doi: "10.1097/ICO.0b013e3181814cff",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. Am J Ophthalmol. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "Arita R, Suehiro J, Haraguchi T, et al. Objective image analysis of the meibomian gland area. Br J Ophthalmol. 2014;98(6):746-755.",
      url: "https://doi.org/10.1136/bjophthalmol-2012-303014",
      doi: "10.1136/bjophthalmol-2012-303014",
    },
    {
      label:
        "Dogan AS, Kosker M, Arslan N, et al. Interexaminer Reliability of Meibography: Upper or Lower Eyelid?. Eye Contact Lens. 2018;44(2):113-117.",
      url: "https://doi.org/10.1097/ICL.0000000000000307",
      doi: "10.1097/ICL.0000000000000307",
    },
    {
      label:
        "Kim HM, Eom Y, Song JS. The Relationship Between Morphology and Function of the Meibomian Glands. Eye Contact Lens. 2018;44(1):1-5.",
      url: "https://doi.org/10.1097/ICL.0000000000000336",
      doi: "10.1097/ICL.0000000000000336",
    },
    {
      label:
        "Wang MTM, Power B, Xue AL, et al. Diagnostic performance of qualitative and quantitative methods of meibomian gland dropout evaluation in dry eye disease: An investigator-masked, randomised crossover study. Cont Lens Anterior Eye. 2025;48(2):102324.",
      url: "https://doi.org/10.1016/j.clae.2024.102324",
      doi: "10.1016/j.clae.2024.102324",
    },
    {
      label:
        "Swiderska K, Blackie CA, Maldonado-Codina C, et al. Evaluation of Meibomian gland structure and appearance after therapeutic Meibomian gland expression. Clin Exp Optom. 2024;107(5):504-514.",
      url: "https://doi.org/10.1080/08164622.2023.2251994",
      doi: "10.1080/08164622.2023.2251994",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "Meibografia",
    "DGM",
    "meiboscore",
    "diagnóstico",
    "consultório brasileiro",
  ],
  seo: {
    title: "Além do meiboscore | SUPERFÍCIE",
    description:
      "O meiboscore quantifica perda de área visível. Não mede expressibilidade, não distingue atrofia de oclusão e não diagnostica olho seco.",
    canonical: "/superficie/artigos/alem-do-meiboscore",
  },
};

const cincoTestesCincoPerguntas: MagazineArticle = {
  slug: "cinco-testes-cinco-perguntas",
  title: "Cinco testes, cinco perguntas",
  subtitle:
    "NIBUT, osmolaridade, coloração, interferometria e MMP-9: o que cada um mede, e o que não mede",
  excerpt:
    "O consultório ainda trata tempo de ruptura, osmolaridade, coloração, interferometria e MMP-9 como se fossem proxies intercambiáveis de gravidade. Cada um responde a uma pergunta. A discórdia entre eles é dado, não falha do exame.",
  category: "Diagnóstico",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O consultório ainda trata tempo de ruptura, osmolaridade, coloração, interferometria e MMP-9 como se fossem proxies intercambiáveis de gravidade. Cada um responde a uma pergunta. A discórdia entre eles é dado, não falha do exame.",
        "NIBUT pergunta se o filme é estável. Osmolaridade pergunta se há estresse hiperosmolar e perda de homeostase. Coloração pergunta onde o epitélio falhou. Interferometria pergunta se a camada lipídica é fina ou pobre. MMP-9 ponto-de-cuidado pergunta se há bandeira de inflamação agora. Nenhum é escala de gravidade. Nenhum substitui o outro.",
        "O DEWS III fixou cortes operacionais para três desses testes. Isso não os valida como escala. O pacote não foi validado no Brasil. Interferometria e MMP-9 não entram no critério diagnóstico. O custo de osmolaridade e de MMP-9 só se justifica quando a decisão muda. Não se justifica como screening universal nem para “confirmar DED”.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos. Data de corte da busca: 15 de agosto de 2026. A escala NEI de 1995 não tem DOI Crossref e não é citada.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O mapa clássico é o do DEWS II (Wolffsohn e colaboradores, 2017): depois da triagem, tempo de ruptura de preferência não invasivo, osmolaridade e coloração de córnea, conjuntiva e margem. Cada teste foi desenhado para um constructo. A subclassificação evaporativo versus aquoso informa manejo. Não é o tema desta matéria.",
        "O dicionário de limiares é o DEWS III (Wolffsohn e colaboradores, 2025), depois de OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24): NIBUT menor que 10 segundos, ou hiperosmolaridade (≥ 308 mOsm/L ou diferença interocular maior que 8), ou coloração (córnea > 5, ou conjuntiva > 9, ou margem ≥ 2 mm e ≥ 25% da largura). Interferometria e MMP-9 ficam em subclassificação ou bandeira. Não se reabre o mapa de eixos das pp. 23–28.",
        "O filme é estável? NIBUT não é FBUT. Szczesna-Iskander e Llorens-Quintana (2024; n = 33) compararam dois videoceratóscopos automatizados com o tempo de ruptura por fluoresceína, com piscar padronizado. Um NIBUT ficou 0,6 ± 2,6 s mais curto que o FBUT. O outro, 3,3 ± 2,4 s mais longo. Limites de concordância de 26 a 31 segundos. Concordância melhor nos tempos curtos. Não são intercambiáveis. A fluoresceína desestabiliza o filme.",
        "NIBUT de uma plataforma não é NIBUT de outra. Lim, Wang e Craig (2021; n = 134, critério DEWS II) acharam correlação positiva entre dois sistemas automatizados, mas um deu tempos mais longos e maior variabilidade. Cortes de Youden: ≤ 8 s numa plataforma, ≤ 14 s na outra. AUC comparáveis, acima de 0,65. O corte menor que 10 segundos é compromisso operacional, não o Youden de cada aparelho. Não se “corrige” o consenso no texto.",
        "Há estresse hiperosmolar? Osmolaridade não é “DED sim ou não” numa única leitura. Tomlinson e colaboradores (2006), em meta-análise, propuseram o referente 316 mOsm/L. Sensibilidade 59%, especificidade 94%, acurácia global 89% naquelas amostras. Lemp e colaboradores (2011; n = 314, dez centros, financiamento de fabricante) acharam o corte mais sensível em 308, o mais específico em 315. Em 312, sensibilidade 73% e especificidade 92%. AUC 0,89 contra coloração, TBUT, Schirmer e meibômio. A diferença interocular correlacionou com gravidade (r² = 0,32). O 308 do DEWS III é o limiar sensível de Lemp, não o referente de Tomlinson. A frase do estudo de 2011, “melhor métrica única para diagnosticar e classificar”, é claim do paper, não conclusão desta matéria.",
        "O contrapeso independente é Bunya e colaboradores (2015; n = 37: 18 Sjögren, 11 blefarite, 8 controles). Três medidas por sessão, até três sessões no mesmo dia. Médias 307, 304 e 301, sem diferença entre grupos. Erro intra-sessão: controles 10,5; blefarite 14,6; Sjögren 15,8 mOsm/L. O intervalo de confiança de uma leitura atravessa o cinza 305–316. A diferença entre sessões em controles chegou a ±34 mOsm/L. Uma leitura no cinza 300–320 não tranquiliza e não condena. Delta visita a visita, se não for de dezenas de mOsm, costuma ser ruído.",
        "Onde o epitélio falhou? Coloração localiza dano. Não mede “quanto inflamado”. Bron, Evans e Smith (2003) descrevem a escala de Oxford, painéis A–E, com incremento logarítmico de pontos. Fluoresceína para córnea, lisamina para conjuntiva, com filtros. Rosa bengala aceitável, não preferido em ensaios. A escala localiza e gradua dano. Não mede gravidade global da doença. Escalas de uso clínico com nomes diferentes, entre elas a chamada escala NEI, não são equivalentes e não se somam. A escala NEI original de 1995 não tem DOI resolvível e não entra como fonte.",
        "O mecanismo importa. Bron e colaboradores (2015) descrevem corantes hidrossolúveis excluídos por tight junctions, membrana e glicocálice. “Erosão pontuada” é, provavelmente, misnomer: entrada transcelular, não micropool. Fluoresceína, de peso molecular menor, espalha. Lisamina e rosa bengala ficam mais confinados. Padrão e corante mudam a pergunta. Córnea sem mancha não exclui dano conjuntival ou de margem.",
        "A margem é um sítio. Korb e colaboradores (2010) acharam epiteliopatia do lid wiper em 88% dos sintomáticos versus 16% dos assintomáticos. Grau ≥ 2 em 66% versus 2%. O DEWS III inclui coloração de margem no critério. É este o lastro. Não é um “extra” da córnea.",
        "A camada lipídica é fina ou pobre? Interferometria mede camada lipídica, não DGM. Finis e colaboradores (2013; 199 olhos) viram correlação entre espessura da camada lipídica e glândulas expressíveis (r = 0,36). Corte ≤ 75 nm: sensibilidade 65,8%, especificidade 63,4% para DGM. Corte ≤ 60 nm: 47,9% e 90,2%. Screening possível. Diagnóstico de DGM, não. Os autores pedem estudos prospectivos. Camada lipídica normal não exclui DGM obstrutiva.",
        "Há bandeira de inflamação agora? MMP-9 ponto-de-cuidado é bandeira, não fenótipo. Sambursky e colaboradores (2013; n = 206) reportaram sensibilidade 85% e especificidade 94% contra avaliação clínica (OSDI, Schirmer, TBUT, coloração), não contra gold standard independente. Ensaio com apoio da fabricante. O limiar operacional do teste é da ordem de 40 ng/mL. Lanza, Valenzuela, Perez e Galor (2016) lembram que inflamação é componente, mas nem todo olho seco tem inflamação mensurável e nem todo positivo responde a anti-inflamatório. Nenhum teste de screening prediz curso ou resposta. MMP-9 pode ajudar a escolher terapia quando a clínica é ambígua. Não define fenótipo inflamatório “puro”.",
        "O único paper que tenta “quando muda a conduta” é Sambursky (2016; n = 100, retrospectivo, mesmo autor do teste). Positivos receberam anti-inflamatório mais ômega-3 e lágrima. Negativos, só ômega-3 e lágrima. Melhora de pelo menos 50% em 85% versus 86%. Os braços andam iguais. Conversão de positivo para negativo em 54%. Não demonstra que o teste muda desfecho. Evidência fraca para “o custo se justifica”.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Cinco perguntas. Uma caixa de custo. Sem escada prescritiva.",
        "NIBUT: o filme é estável? Não “quão grave”. Preferir não invasivo. Reportar a plataforma e se é a primeira ruptura ou a média. Não converter FBUT em NIBUT nem o inverso. Se só houver FBUT: volume mínimo de fluoresceína, cronometrar, não chamar de NIBUT. Usar o corte operacional do consenso. Os Youden das duas plataformas do recorte ficam como caveat, não como correção.",
        "Osmolaridade: há estresse hiperosmolar, perda de homeostase? Ler o pior olho e o delta interocular. O signo do consenso não é gravidade. Uma leitura isolada no cinza não decide. Repetir na mesma sessão se a decisão depende do número. Não usar para “monitorar terapia” visita a visita sem delta grande.",
        "Colorações: onde o epitélio falhou? Fluoresceína, córnea. Lisamina, conjuntiva e margem. Rosa bengala: histórico, sicca, irrita; não é primeira linha. Oxford para documentar evolução. Não somar escalas. Margem e lid wiper são o sítio que o leitor esquece.",
        "Interferometria: a camada lipídica é fina ou pobre? Não “é DGM”. Camada baixa mais poucas glândulas expressíveis aumenta probabilidade. Camada normal não exclui obstrução. Sem atlas de marcas. Sem ponte para meibografia.",
        "MMP-9: há bandeira de inflamação agora? Positivo: considera anti-inflamatório, adia plug, cuida o timing pré-cirurgia se isso muda a data. Negativo: não é “sem DED” e não proíbe anti-inflamatório se a clínica pedir. Não repetir como follow-up de gravidade.",
        "O custo só se justifica se a decisão muda. Justifica, com evidência fraca a moderada e lógica de decisão: discórdia sintomas/sinais quando a pergunta é homeostase; decisão de iniciar ou escalar anti-inflamatório versus só lágrima quando a clínica é ambígua; pré-cirurgia de superfície se o resultado muda o timing. Não justifica: screening de todo sintomático; “confirmar DED” quando NIBUT ou coloração já fecham o critério; monitorar visita a visita; substituir o exame clínico. Não há estudo de custo-efetividade brasileiro até 15 de agosto de 2026.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Não há ensaio que teste este cardápio contra o exame usual com desfecho de paciente. Não há estudo de custo-efetividade de osmolaridade ou MMP-9 no Brasil até a data de corte. O pacote de cortes DEWS III não foi validado como algoritmo no consultório brasileiro.",
        "Lemp 2011 e Sambursky 2013 e 2016 têm conflito de fabricante. Bunya e Lanza são o contrapeso. A matéria precisa dos dois lados, não só do Se/Sp publicitário. Bunya é n pequeno, terciário, muitos já tratados. Szczesna é n = 33. Os Youden de Lim são amostra-específicos e não estão harmonizados com os 10 segundos do consenso.",
        "Finis é retrospectivo, um interferômetro, Se/Sp modestos. Generalizar “espessura lipídica = qualidade meibomiana” é excesso. Sambursky 2016: sem controle, braços com tratamentos diferentes, desfecho autorrelatado, perda de seguimento. Não fecha que MMP-9 muda conduta com ganho.",
        "A escala NEI de 1995 não é citável: sem DOI no Crossref. van Bijsterveld 1969 não foi numerado e não é gold standard paralelo ao Oxford. Preço, registro e disponibilidade ficam de fora. Esta matéria não é catálogo.",
      ],
    },
  ],
  references: [
    {
      label:
        "Wolffsohn JS, Arita R, Chalmers R, et al. TFOS DEWS II Diagnostic Methodology report. The Ocular Surface. 2017;15(3):539-574.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.001",
      doi: "10.1016/j.jtos.2017.05.001",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. American Journal of Ophthalmology. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "Lemp MA, Bron AJ, Baudouin C, et al. Tear osmolarity in the diagnosis and management of dry eye disease. American Journal of Ophthalmology. 2011;151(5):792-798.e1.",
      url: "https://doi.org/10.1016/j.ajo.2010.10.032",
      doi: "10.1016/j.ajo.2010.10.032",
    },
    {
      label:
        "Tomlinson A, Khanal S, Ramaesh K, Diaper C, McFadyen A. Tear film osmolarity: determination of a referent for dry eye diagnosis. Investigative Ophthalmology & Visual Science. 2006;47(10):4309-4315.",
      url: "https://doi.org/10.1167/iovs.05-1504",
      doi: "10.1167/iovs.05-1504",
    },
    {
      label:
        "Bunya VY, Fuerst NM, Pistilli M, et al. Variability of Tear Osmolarity in Patients With Dry Eye. JAMA Ophthalmology. 2015;133(6):662-667.",
      url: "https://doi.org/10.1001/jamaophthalmol.2015.0429",
      doi: "10.1001/jamaophthalmol.2015.0429",
    },
    {
      label:
        "Bron AJ, Evans VE, Smith JA. Grading of corneal and conjunctival staining in the context of other dry eye tests. Cornea. 2003;22(7):640-650.",
      url: "https://doi.org/10.1097/00003226-200310000-00008",
      doi: "10.1097/00003226-200310000-00008",
    },
    {
      label:
        "Bron AJ, Argüeso P, Irkec M, Bright FV. Clinical staining of the ocular surface: mechanisms and interpretations. Progress in Retinal and Eye Research. 2015;44:36-61.",
      url: "https://doi.org/10.1016/j.preteyeres.2014.10.001",
      doi: "10.1016/j.preteyeres.2014.10.001",
    },
    {
      label:
        "Korb DR, Herman JP, Blackie CA, et al. Prevalence of lid wiper epitheliopathy in subjects with dry eye signs and symptoms. Cornea. 2010;29(4):377-383.",
      url: "https://doi.org/10.1097/ICO.0b013e3181ba0cb2",
      doi: "10.1097/ICO.0b013e3181ba0cb2",
    },
    {
      label:
        "Lim J, Wang MTM, Craig JP. Evaluating the diagnostic ability of two automated non-invasive tear film stability measurement techniques. Contact Lens and Anterior Eye. 2021;44(4):101362.",
      url: "https://doi.org/10.1016/j.clae.2020.08.006",
      doi: "10.1016/j.clae.2020.08.006",
    },
    {
      label:
        "Szczesna-Iskander DH, Llorens-Quintana C. Agreement between invasive and noninvasive measurement of tear film breakup time. Scientific Reports. 2024;14(1):3852.",
      url: "https://doi.org/10.1038/s41598-024-54219-1",
      doi: "10.1038/s41598-024-54219-1",
    },
    {
      label:
        "Finis D, Pischel N, Schrader S, Geerling G. Evaluation of lipid layer thickness measurement of the tear film as a diagnostic tool for Meibomian gland dysfunction. Cornea. 2013;32(12):1549-1553.",
      url: "https://doi.org/10.1097/ICO.0b013e3182a7f3e1",
      doi: "10.1097/ICO.0b013e3182a7f3e1",
    },
    {
      label:
        "Sambursky R, Davitt WF 3rd, Latkany R, et al. Sensitivity and specificity of a point-of-care matrix metalloproteinase 9 immunoassay for diagnosing inflammation related to dry eye. JAMA Ophthalmology. 2013;131(1):24-28.",
      url: "https://doi.org/10.1001/jamaophthalmol.2013.561",
      doi: "10.1001/jamaophthalmol.2013.561",
    },
    {
      label:
        "Lanza NL, Valenzuela F, Perez VL, Galor A. The Matrix Metalloproteinase 9 Point-of-Care Test in Dry Eye. The Ocular Surface. 2016;14(2):189-195.",
      url: "https://doi.org/10.1016/j.jtos.2015.10.004",
      doi: "10.1016/j.jtos.2015.10.004",
    },
    {
      label:
        "Sambursky R. Presence or absence of ocular surface inflammation directs clinical and therapeutic management of dry eye. Clinical Ophthalmology. 2016;10:2337-2343.",
      url: "https://doi.org/10.2147/OPTH.S121256",
      doi: "10.2147/OPTH.S121256",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: ["NIBUT", "osmolaridade", "coloração", "interferometria", "MMP-9"],
  seo: {
    title: "Cinco testes, cinco perguntas | SUPERFÍCIE",
    description:
      "NIBUT, osmolaridade, coloração, interferometria e MMP-9 não são proxies intercambiáveis de gravidade. A discórdia entre eles é dado, não falha.",
    canonical: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
};

const aPregaOAtritoEOpiscar: MagazineArticle = {
  slug: "a-prega-o-atrito-e-o-piscar",
  title: "A prega, o atrito e o piscar",
  subtitle: "Olho seco mecânico: CCh mimetiza DED, não é DED",
  excerpt:
    "O consultório ainda escala o paciente que não responde à lágrima como se o filme fosse o único endereço. Irritação, epífora, tempo de ruptura curto na córnea inferior: o reflexo é trocar o lubrificante, acrescentar anti-inflamatório, chamar de “olho seco refratário”.",
  category: "Clínica",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O consultório ainda escala o paciente que não responde à lágrima como se o filme fosse o único endereço. Irritação, epífora, tempo de ruptura curto na córnea inferior: o reflexo é trocar o lubrificante, acrescentar anti-inflamatório, chamar de “olho seco refratário”. Uma parte desses pacientes tem desalinhamento, atrito ou dinâmica palpebral. A conjuntivocálase é o achado mais comum e o mais ignorado. Mimetiza doença do olho seco. Coexiste com ela. Não é ela.",
        "O work-up filme-cêntrico organiza a ficha. Não fecha o paciente cuja prega invade o menisco, cujo lid wiper está marcado e cujo filme “normal” não explica a queixa. O DEWS III já formalizou o endereço: desalinhamento anatômico no bloco superfície, piscar e fechamento no bloco pálpebra. O eixo mecânico não é opinião editorial. É subclasse.",
        "Três sinais se misturam na lâmpada. LWE marca atrito quando o filme é “normal”. LIPCOF prediz sintoma e não é CCh. CCh é redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir os três é o gesto. Piscar incompleto, floppy eyelid e lagoftalmo noturno são fenocópias de exposição. Mapear. Não abrir neuro-oftalmo. Higiene palpebral não trata CCh. DGM pode coexistir. Não se absorve aqui a biologia da glândula.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos. Data de corte da busca: 15 de agosto de 2026. Höh (1995) e Hirotani (2003) não têm DOI Crossref e não são citados.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Wolffsohn e colaboradores (2025) já colocam desalinhamento anatômico e dinâmica palpebral no mapa do DEWS III. Não se reabre o recap do workshop. Não se refaz a bateria de testes das pp. 33–36.",
        "Esta prega explica este sintoma? A definição clássica é de Meller e Tseng (1998). CCh é conjuntiva redundante, tipicamente entre o globo e a pálpebra inferior, frequentemente ignorada como mudança senil. Espectro: agrava olho seco no leve; perturba o outflow no moderado; exposição no grave. Lubrificantes tópicos podem ser tentados e frequentemente falham. Excisão pode ser necessária. Os autores propõem um sistema de gradação e uma fisiopatologia hipotética centrada na dinâmica lacrimal. Marco de classificação. Não prova de que toda prega é doença.",
        "Mimura e colaboradores (2009) aplicaram essa gradação em nasal, médio e temporal, n = 1.416, 1 a 94 anos, prospectivo hospitalar. Prevalência sobe com a idade: 6,8% na primeira década, 90,2% entre 41 e 50 anos, quase universal depois dos 60. Grau médio maior em mulheres. Temporal pior que nasal. Mudança ao olhar para baixo e à pressão digital, e ceratite pontuada, aumentam com a idade e correlacionam com gravidade, sobretudo da conjuntiva média. CCh é etária e assimétrica por sítio. Temporal não é nasal. Série hospitalar japonesa: não é prevalência populacional brasileira. “Quase universal após 60” não autoriza operar todo idoso.",
        "Yokoi e colaboradores (2005) dão o impacto clínico. Cento e sessenta e oito olhos, 131 pacientes, CCh proeminente no menisco inferior, sintoma não controlado por colírio. Cinquenta olhos com DED, 118 sem. Sintoma-chefe: irritação (51,7% sem DED; 80% com DED) e lacrimejamento (31,4% sem DED). Melhora do sintoma-chefe em 88,2% sem DED e 78,0% com DED após cirurgia. No grupo com DED, escores de fluoresceína caíram. Imunohistoquímica em n pequeno: CCh e conjuntiva normal com inflamação desprezível frente a conjuntiva inflamada. CCh causa sintomas e dano de superfície mesmo sem DED clássica. Coexistir com DED não a torna “só DED”. Inflamação da prega não é o driver. Série sem braço controle. A técnica “nova” dos autores não entra aqui; entra o desfecho.",
        "Marmalidou, Kheirkhah e Dana (2018) sintetizam a doença. Pregas redundantes, tipicamente conjuntiva bulbar inferior bilateral. Causa comum de irritação no idoso, frequentemente ignorada. Fator de risco principal: envelhecimento. Sintomas via instabilidade do filme e/ou clearance tardio. Patogênese em aberto: conjuntiva envelhecida, filme instável, atrito mecânico, inflamação de superfície, clearance tardio. Histologia contraditória: alguns estudos com estrutura microscópica normal. Tratamento médico: lubrificação e anti-inflamatório. Refratário: cirurgia. CCh é entidade própria que se associa a DED. Não é sinônimo.",
        "Há atrito quando o filme é “normal”? LWE é o marcador. Korb e colaboradores (2005) compararam 50 sintomáticos e 50 assintomáticos, todos com FBUT ≥ 10 s, Schirmer ≥ 10 mm, sem coloração corneana. Lid wiper: a conjuntiva marginal da pálpebra superior que varre a superfície no piscar. LWE, fluoresceína mais rosa bengala, grau 0–3, em 76% dos sintomáticos (44% grau 1, 22% grau 2, 10% grau 3) versus 12% dos assintomáticos (8% grau 1, 4% grau 2, nenhum grau 3). LWE explica sintomas com work-up filme-cêntrico “normal”. Não é ouro: nem todos os estudos replicam a associação com a mesma força. Não se reusa aqui o paper de 2010, que já entrou nas pp. 33–36 como sítio de coloração de margem. A pergunta desta matéria é atrito.",
        "LIPCOF prediz sintoma e não diagnostica CCh. Pult e Bandlitz (2018; n = 148, três centros, idade média 37 anos) viram LIPCOF temporal, nasal e Soma correlacionar com OSDI e NIKBUT. AUC da Soma: 0,771 para sintomático (OSDI ≥ 15) e 0,798 para o compósito OSDI ≥ 15 mais NIKBUT ≤ 9 s. Sinal útil de atrito e sicca. Não é diagnóstico de CCh. A escala original dos anos 1990 não tem DOI resolvível e não entra como fonte.",
        "LIPCOF e CCh são entidades distintas. Ballesteros-Sánchez e colaboradores (2024), em revisão de 26 estudos (2009–2023), pedem lâmpada de fenda para distinguir. Ambos associam-se a sintomas de DED em usuários e não-usuários de lente. Lubrificante reduz LIPCOF em não-usuários. Hipóteses de terapia de margem em usuários de lente ficam no outro artigo. Cirurgia é o que elimina a CCh quando o tratamento clínico falha. Não há critério operacional único validado: altura, número de pregas, invasão do menisco, OCT. A distinção é clínica.",
        "O modelo que liga os sinais à força, não à glândula, é o de Pult e colaboradores (2015). No sujeito saudável, o coeficiente de atrito da superfície se comporta como brushes poliméricos hidrofílicos em baixa velocidade; em alta velocidade, um filme fluido protege. No olho seco, falha o regime de filme completo: cisalhamento, deformação, wear do par pálpebra–globo. Liga LWE e LIPCOF a mecânica. Modelo. Não ensaio. Coeficiente de atrito de pálpebra humana não se mede no consultório.",
        "O piscar é completo? McMonnies (2007) associa piscar incompleto a ceratopatia de exposição, inclusive pós-LASIK, e a LWE. Na córnea ou lente inferior, um piscar incompleto aproximadamente dobra o intervalo interpiscar e o tempo de evaporação. Piora em computador e leitura, quando a taxa de piscar cai. Distribuição inadequada de aquoso, muco e lipídio. Osmolaridade sobe com evaporação. O autor propõe exercício de eficiência de piscar mais lubrificante. Review, não RCT. Suficiente para mapear o fenótipo de tela e exposição. Não abre VII par, EMG nem capítulo de paralisia.",
        "Floppy eyelid é fenocópia. Salinas e colaboradores (2020) descrevem hiperlaxidade palpebral com conjuntivite papilar reativa, eversão fácil, irritação crônica; associações com ceratocone e apneia obstrutiva. Conservador: lubrificação agressiva, proteção noturna, não dormir sobre o olho afetado. CPAP prolongado pode melhorar sinais se houver AOS. Isso é associação de review, não indicação desta matéria para diagnosticar apneia nem prescrever CPAP como terapia de olho seco. Cirurgia de encurtamento se refratário. O leitor deve everter a pálpebra e perguntar sono. Sem atlas de blefaroplastia.",
        "A coexistência com DGM está em Vu e colaboradores (2018; n = 449, DECS-J, 86% mulheres). FRD, friction-related disease, é SLK + CCh + LWE. DGM encurtou TBUT (1,97 versus 2,94 s) em ADDE e em short-TBUT. ADDE com FRD: TBUT 2,08 versus 2,92 s sem FRD. Atrito e DGM coexistem e ambos encurtam TBUT. Não é “ou DGM ou mecânico”. Transversal, maioria mulher japonesa. Associação, não causalidade. Sem biologia da glândula.",
        "O lubrificante adianta? A cirurgia, quando? O algoritmo de manejo é o de Marmalidou e colaboradores (2019). CCh assintomática: observar. Sintomática: primeiro lubrificação e, se houver outro eixo inflamatório, anti-inflamatório. Refratário: cirurgia. As vias mais usadas: cauterização e excisão com ou sem membrana amniótica. Há ainda fixação escleral, ligadura, laser, radiofrequência. Taxas variáveis, sem RCT comparativo grande com desfecho funcional padronizado. Uma linha cada. Sem atlas. Sem nome de técnica proprietária.",
        "O lastro do lubrificante viscoso é fraco e precisa ser dito assim. Kiss e Németh (2015; n = 20, aberto, autocontrolado) usaram lágrima com glicerol isotônico e hialuronato 0,015%. LIPCOF médio 2,9 para 1,4 em três meses. TFBUT ganhou cerca de 1 segundo. Oxford 1,3–1,4 para 0,2–0,3. OSDI 36 para 16. Lubrificante viscoso pode reduzir grau de prega e sintoma o bastante para adiar cirurgia. Sem máscara, sem controle, n pequeno, produto nomeado no título do paper. A marca não entra aqui. O desfecho é LIPCOF, não CCh volumétrica de Meller. Extrapolar “lágrima desincha CCh grau 3” é overclaim.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Se o filme não explica a queixa, ou se a instabilidade é só inferior, olhar pálpebra (piscar, fechamento) e superfície (desalinhamento). Não repetir a bateria das pp. 33–36. Não reabrir os cinco eixos das pp. 23–28.",
        "CCh: ver e graduar, não só “tem prega”. Três sítios: nasal, médio, temporal. Altura versus menisco. Mudança ao olhar para baixo e à pressão digital. Temporal costuma ser pior. Prega no menisco mais epífora: pensar obstáculo ao outflow, não lacrimejamento emocional. Prega etária é comum. A pergunta é se esta prega, neste sítio, com esta dinâmica, explica este sintoma.",
        "CCh e DED podem coexistir. Irritação ou epífora com prega óbvia e filme já tratado é CCh sintomática, não “DED refratária”. Inflamação da prega é desprezível no lastro que se tem. Não escalar imunomodulador por causa da CCh. Anti-inflamatório só se outro eixo pedir.",
        "LWE. Fluoresceína mais lisamina ou rosa bengala na margem posterior da pálpebra superior, e inferior se quiser. Grau ≥ 2 com filme “normal” aponta atrito. Não relatar só a córnea. Não vender LWE como ouro.",
        "LIPCOF não é CCh. LIPCOF: prega lid-paralela temporal e nasal, escala 0–3, preditor de sintoma. CCh: redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir na lâmpada. Não tratar LIPCOF com higiene de margem nesta matéria. Higiene palpebral trata margem. Não trata redundância conjuntival.",
        "Snap-back e laxidade. Puxar a pálpebra inferior e ver o retorno. Manobra de consultório. Sem paper âncora com DOI nesta lista: descrever como exame, não como escala validada, sem cutoff inventado. Laxidade extrema mais eversão fácil: pensar FES. Perguntar sono. Everter.",
        "Piscar. Observar completeza, não só taxa. Tela e leitura: intervalo inferior dobrado se o piscar for incompleto. Lagoftalmo noturno e FES: fenocópia de exposição. Uma pergunta de sono e um relógio de piscar. Sem EMG. Sem capítulo de VII par.",
        "Tratamento clínico primeiro. Lubrificante viscoso: glicerol e hialuronato como classe, não marca. Pode reduzir grau de prega e sintoma o bastante para adiar cirurgia. A evidência é n = 20, aberta, e mede LIPCOF. Higiene palpebral não é o tratamento da CCh. Anti-inflamatório só se houver outro eixo.",
        "Cirurgia quando o sintoma e a topografia batem e o tratamento clínico falhou. Prega no menisco, exposição, epífora mecânica, depois de lubrificante viscoso. Cauterização no volume menor. Ressecção com ou sem amniótica no volume maior. Uma linha cada. Sem atlas. Sem técnica proprietária. Sem operar imagem.",
        "Se houver DGM e doença de atrito, o TBUT fica mais curto. Tratar os dois eixos. Não absorver a matéria molecular da glândula.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Não há ensaio que teste “fenótipo mecânico versus escalada por filme” com desfecho de paciente. Não há RCT grande de cauterização versus ressecção versus amniótica versus lubrificante viscoso com desfecho funcional padronizado. Não há prevalência brasileira de CCh, LWE ou LIPCOF até 15 de agosto de 2026. Mimura é hospitalar japonês. Pult 2018 é europeu e relativamente jovem.",
        "Yokoi 2005 é série cirúrgica sem controle. A imunohistoquímica tem n de um dígito. Meller e Tseng 1998 é review mais hipótese, não validação prospectiva da escala. A escala original de LIPCOF dos anos 1990 e o paper japonês de 2003 sobre junção mucocutânea existem no PubMed e não são citáveis: DOI Crossref irresolvível. Snap-back não tem paper âncora com DOI nesta lista.",
        "Kiss 2015: n = 20, sem máscara, sem controle, produto nomeado; mede LIPCOF, não CCh volumétrica. Marmalidou 2018 e 2019 são reviews. Pult 2015 é modelo tribológico. McMonnies 2007 é review. Exercício de piscar não tem RCT de desfecho nesta lista. Vu 2018 é transversal. Salinas 2020 é review de FES: a matéria não diagnostica AOS nem indica CPAP como terapia de olho seco.",
        "A distinção LIPCOF versus CCh é pedida e não tem critério operacional único validado. Atribuição causal CCh → sintoma continua clínica: topografia, dinâmica, falha do filme. Prega etária é comum. Operar por imagem é overtreatment. O corpo completo do DEWS III Diagnostic não está em PMC: a subclassificação desta matéria limita-se ao que o abstract deposita. LWE não é ouro em toda a literatura.",
      ],
    },
  ],
  references: [
    {
      label:
        "Meller D, Tseng SCG. Conjunctivochalasis: literature review and possible pathophysiology. Survey of Ophthalmology. 1998;43(3):225-232.",
      url: "https://doi.org/10.1016/s0039-6257(98)00037-x",
      doi: "10.1016/s0039-6257(98)00037-x",
    },
    {
      label:
        "Mimura T, Yamagami S, Usui T, et al. Changes of conjunctivochalasis with age in a hospital-based study. American Journal of Ophthalmology. 2009;147(1):171-177.e1.",
      url: "https://doi.org/10.1016/j.ajo.2008.07.010",
      doi: "10.1016/j.ajo.2008.07.010",
    },
    {
      label:
        "Yokoi N, Komuro A, Nishii M, et al. Clinical impact of conjunctivochalasis on the ocular surface. Cornea. 2005;24(8 Suppl):S24-S31.",
      url: "https://doi.org/10.1097/01.ico.0000178740.14212.1a",
      doi: "10.1097/01.ico.0000178740.14212.1a",
    },
    {
      label:
        "Korb DR, Herman JP, Greiner JV, et al. Lid wiper epitheliopathy and dry eye symptoms. Eye & Contact Lens. 2005;31(1):2-8.",
      url: "https://doi.org/10.1097/01.icl.0000140910.03095.fa",
      doi: "10.1097/01.icl.0000140910.03095.fa",
    },
    {
      label:
        "Pult H, Bandlitz S. Lid-Parallel Conjunctival Folds and Their Ability to Predict Dry Eye. Eye & Contact Lens. 2018;44 Suppl 2:S113-S119.",
      url: "https://doi.org/10.1097/ICL.0000000000000435",
      doi: "10.1097/ICL.0000000000000435",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. American Journal of Ophthalmology. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "McMonnies CW. Incomplete blinking: exposure keratopathy, lid wiper epitheliopathy, dry eye, refractive surgery, and dry contact lenses. Contact Lens and Anterior Eye. 2007;30(1):37-51.",
      url: "https://doi.org/10.1016/j.clae.2006.12.002",
      doi: "10.1016/j.clae.2006.12.002",
    },
    {
      label:
        "Marmalidou A, Kheirkhah A, Dana R. Conjunctivochalasis: a systematic review. Survey of Ophthalmology. 2018;63(4):554-564.",
      url: "https://doi.org/10.1016/j.survophthal.2017.10.010",
      doi: "10.1016/j.survophthal.2017.10.010",
    },
    {
      label:
        "Marmalidou A, Palioura S, Dana R, Kheirkhah A. Medical and surgical management of conjunctivochalasis. The Ocular Surface. 2019;17(3):393-399.",
      url: "https://doi.org/10.1016/j.jtos.2019.04.008",
      doi: "10.1016/j.jtos.2019.04.008",
    },
    {
      label:
        "Salinas R, Puig M, Fry CL, Johnson DA, Kheirkhah A. Floppy eyelid syndrome: A comprehensive review. The Ocular Surface. 2020;18(1):31-39.",
      url: "https://doi.org/10.1016/j.jtos.2019.10.002",
      doi: "10.1016/j.jtos.2019.10.002",
    },
    {
      label:
        "Vu CHV, Kawashima M, Yamada M, et al. Influence of Meibomian Gland Dysfunction and Friction-Related Disease on the Severity of Dry Eye. Ophthalmology. 2018;125(8):1181-1188.",
      url: "https://doi.org/10.1016/j.ophtha.2018.01.025",
      doi: "10.1016/j.ophtha.2018.01.025",
    },
    {
      label:
        "Kiss HJ, Németh J. Isotonic Glycerol and Sodium Hyaluronate Containing Artificial Tear Decreases Conjunctivochalasis after One and Three Months: A Self-Controlled, Unmasked Study. PLoS One. 2015;10(7):e0132656.",
      url: "https://doi.org/10.1371/journal.pone.0132656",
      doi: "10.1371/journal.pone.0132656",
    },
    {
      label:
        "Pult H, Tosatti SG, Spencer ND, Asfour JM, Ebenhoch M, Murphy PJ. Spontaneous Blinking from a Tribological Viewpoint. The Ocular Surface. 2015;13(3):236-249.",
      url: "https://doi.org/10.1016/j.jtos.2014.12.004",
      doi: "10.1016/j.jtos.2014.12.004",
    },
    {
      label:
        "Ballesteros-Sánchez A, Sánchez-González JM, Borrone MA, Borroni D, Rocha-de-Lossada C. The Influence of Lid-Parallel Conjunctival Folds and Conjunctivochalasis on Dry Eye Symptoms with and Without Contact Lens Wear: A Review of the Literature. Ophthalmology and Therapy. 2024;13(3):651-670.",
      url: "https://doi.org/10.1007/s40123-023-00877-9",
      doi: "10.1007/s40123-023-00877-9",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "Sem financiamento externo." },
    {
      label: "Conflitos de interesse",
      text: "O autor declara não possuir vínculo com fabricantes de dispositivos, fármacos ou tecnologias citados neste artigo.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: ["Conjuntivocálase", "LWE", "LIPCOF", "olho seco mecânico", "atrito"],
  seo: {
    title: "A prega, o atrito e o piscar | SUPERFÍCIE",
    description:
      "Conjuntivocálase mimetiza doença do olho seco e coexiste com ela, mas não é ela: irritação e epífora pedem olhar o atrito e o piscar.",
    canonical: "/superficie/artigos/a-prega-o-atrito-e-o-piscar",
  },
};

const iaNaSuperficieOcular: MagazineArticle = {
  slug: "ia-na-superficie-ocular",
  title: "IA na superfície ocular: onde ajuda, onde erra e como validar",
  subtitle:
    "Onde a imagem já lê com alguma segurança, o que ainda não generaliza, e que pergunta fazer antes de deixar o software entrar na conduta.",
  excerpt:
    "O olho seco continua sendo um diagnóstico montado por pedaços. Sintoma, sinal e biomarcador discordam. A IA entrou para automatizar a leitura de uma imagem ou juntar imagem e ficha. O apelo é objetividade e velocidade.",
  category: "Tecnologia",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-17",
  modifiedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O olho seco continua sendo um diagnóstico montado por pedaços. Sintoma, sinal e biomarcador discordam. A IA entrou para automatizar a leitura de uma imagem ou juntar imagem e ficha. O apelo é objetividade e velocidade.",
        "O risco é tratar o número automático como diagnóstico. Um AUC alto no conjunto que treinou o modelo não é instrumento de consultório. A pergunta desta matéria é outra: o que já lê uma imagem com alguma segurança, o que ainda não generaliza, e o que perguntar antes de deixar o software entrar na conduta.",
        "A literatura cresceu depressa e ainda é, na maior parte, unimodal: uma foto, um vídeo, um escore. Poucos trabalhos juntam de verdade meibografia, filme lacrimal e sintomas. Menos ainda testam o modelo em outro aparelho, outro centro, outra população.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Uma revisão sistemática de 70 estudos únicos (71 registros; um preprint e seu artigo de revista contados uma vez) — síntese sem DOI próprio, não tratada aqui como artigo publicado e fora da lista de referências — mapeou modelos de aprendizado de máquina e profundo aplicados a olho seco e superfície ocular, com ênfase em abordagens que usam mais de uma fonte de dados. A busca inicial foi em março de 2025. Registros com data de 2026 entraram na atualização do manuscrito. O grosso da literatura ainda é imagem única. Meibografia é o canal mais frequente.",
        "O número interno pode parecer decisivo. Redes que segmentam pálpebra e atrofia chegaram a 95,6% de acerto no meiboscore no conjunto de avaliação (209 imagens; 497 no treino e ajuste) e superaram o investigador clínico de referência em 16 pontos percentuais. Coloração de fluoresceína já tem modelo com teste externo em 2.376 imagens de 23 hospitais na China (r interno 0,898 e AUC 0,881; r externo 0,844 a 0,899 e AUC 0,804 a 0,883).",
        "O achado que importa para a clínica é outro. Saha e colaboradores (2022) relataram 73,01% de acerto no meiboscore no conjunto de validação e caíram para 59,17% num centro independente. Os especialistas em disfunção de glândula de Meibômio, no conjunto de validação, ficaram em 53,44%. A queda é o cartão de visita: o número interno não viaja. Aparelho, recorte étnico e protocolo de captura mudam o resultado até prova em contrário.",
        "Há sinais de que a imagem pode dizer mais do que o escore. Aprendizado não supervisionado em 82.236 meibografias de 20.559 pessoas agrupou seis subtipos com perfis distintos de ruptura, menisco, atrofia e coloração. Outro modelo leu sinais, sintomas e diagnósticos a partir só da meibografia (562 imagens, 363 pessoas), com acurácias de 65% a 99%, e 74% a 85% para disfunção glandular, deficiência aquosa e blefarite. Isso não valida o uso isolado da foto como diagnóstico. Mostra que a glândula carrega informação que o meiboscore joga fora.",
        "A via sem imagem também existe. Modelos tabulares, em 175 candidatos a lentes, explicaram cerca de 32% da variância da osmolaridade e acertaram cerca de 80% nas faixas baixa, média e alta. Preditores: NIKBUT, menisco, hiperemia, cobertura glandular e DEQ-5. Fatores de estilo de vida (tempo de perto, álcool, exercício, tempo ao ar livre) entram com peso em vários desfechos. Cabine de avião e dirigir predisseram sintoma, não sinal. São hipóteses de triagem, não substitutos da meibografia.",
        'Grandes modelos de linguagem, alimentados com texto clínico e sintomas de 338 pacientes com suspeita de olho seco, concordaram com o clínico no "é DED" (sensibilidade 93 a 99%; kappa 0,81 a 0,86). A especificidade ficou entre 0% e 16%. A acurácia balanceada caiu para 48 a 56%. No subtipo (aquoso, evaporativo, misto) o acordo foi ao acaso. O modelo reproduz o viés de superdiagnóstico. Um pipeline multimodal (Insight / MDPipe) que traduz meibografia em morfologia e pede raciocínio ao modelo de linguagem superou o GPT-4 em benchmarks de superfície ocular. Ainda é prova de conceito, não ferramenta de consultório.',
        "A fusão de verdade (imagem mais clínica, no mesmo modelo, validada fora de casa) continua rara. Dinâmica temporal do filme lacrimal, o que o clínico já filma no NIBUT, quase não entra. Ensaio prospectivo medindo sintoma, adesão ou qualidade de vida depois da IA assistida não apareceu no corpus.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Três usos cabem hoje, se o clínico souber o que está comprando.",
        "Primeiro: segunda leitura de meibografia e de coloração, não diagnóstico. Um modelo que marca glândula, atrofia e reflexo especular reduz fadiga e padroniza o arquivo. Ele não decide evaporativo versus aquoso. Se o software não declara aparelho, recorte de pálpebra e conjunto externo, trate o número como rascunho.",
        "Segundo: recusar o AUC interno como argumento de compra. A pergunta mínima é: testaram em outro centro, outro aparelho, outra etnia? Qual foi a queda? Sem essa resposta, o modelo descreve o laboratório que o treinou.",
        "Terceiro: triagem, não atalho. Onde não há meibógrafo, um modelo tabular que estima instabilidade ou dropout a partir de coloração, expressibilidade e sintomas pode decidir quem precisa do exame extra. O teto desses modelos é baixo o bastante para não substituir o exame. É alto o bastante para ordenar a fila.",
        "O que ainda não cabe: fechar subtipo de olho seco com chatbot; usar modelo de linguagem no prontuário como laudo; tratar cluster de meibografia como fenótipo terapêutico sem reprodução. A telemedicina com foto dirigida é outro capítulo. No Brasil, passa por regra do CFM, não por paper de visão computacional.",
        "No fluxo do consultório, a ordem honesta é: fenótipo clínico primeiro, imagem depois, software por último. A IA entra para repetir com menos ruído o que o exame já pediu, não para inventar um mecanismo.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta matéria assenta numa revisão sistemática em inglês, com heterogeneidade grande de tarefa, aparelho e n. Meta-análise não foi possível. Dois papers de método ficaram no corpus apesar de n humano baixo (um voluntário com 89.033 recortes de interferometria por smartphone; dez sadios em OCT de menisco), porque a unidade de análise era o quadro, não a coorte diagnóstica. Um item de 2026 em repositório aberto não foi recuperado no PubMed nem no Crossref e não sustenta claim.",
        'A revisão não cobre registro na ANVISA, software como dispositivo médico, nem a regra brasileira de telemedicina. Também não mede desfecho de paciente. "Acurácia de segmentação" não é alívio de sintoma.',
        "O selo desta versão é checagem editorial, não revisão por pares. Claims clínicos abaixo têm fonte. O que não tem DOI resolvido no Crossref não entra. A revisão de 70 estudos únicos e os modelos sem nome de autor no texto ficam de fora desta lista.",
      ],
    },
  ],
  references: [
    {
      label:
        "Craig JP, Nichols KK, Akpek EK, et al. TFOS DEWS II Definition and Classification Report. Ocul Surf. 2017;15(3):276-283.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.008",
      doi: "10.1016/j.jtos.2017.05.008",
    },
    {
      label:
        "Wolffsohn JS, Arita R, Chalmers R, et al. TFOS DEWS II Diagnostic Methodology report. Ocul Surf. 2017;15(3):539-574.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.001",
      doi: "10.1016/j.jtos.2017.05.001",
    },
    {
      label:
        "Wang J, Yeh TN, Chakraborty R, Yu SX, Lin MC. A Deep Learning Approach for Meibomian Gland Atrophy Evaluation in Meibography Images. Transl Vis Sci Technol. 2019;8(6):37.",
      url: "https://doi.org/10.1167/tvst.8.6.37",
      doi: "10.1167/tvst.8.6.37",
    },
    {
      label:
        "Saha RK, Chowdhury AMM, Na KS, et al. Automated quantification of meibomian gland dropout in infrared meibography using deep learning. Ocul Surf. 2022;26:283-294.",
      url: "https://doi.org/10.1016/j.jtos.2022.06.006",
      doi: "10.1016/j.jtos.2022.06.006",
    },
    {
      label:
        "Deng Y, Cheng P, Xu R, et al. Advanced and interpretable corneal staining assessment through fine grained knowledge distillation. NPJ Digit Med. 2025;8(1):303.",
      url: "https://doi.org/10.1038/s41746-025-01706-y",
      doi: "10.1038/s41746-025-01706-y",
    },
    {
      label:
        "Li S, Wang Y, Yu C, et al. Unsupervised Learning Based on Meibography Enables Subtyping of Dry Eye Disease and Reveals Ocular Surface Features. Invest Ophthalmol Vis Sci. 2023;64(13):43.",
      url: "https://doi.org/10.1167/iovs.64.13.43",
      doi: "10.1167/iovs.64.13.43",
    },
    {
      label:
        "Graham AD, Kothapalli T, Wang J, et al. A machine learning approach to predicting dry eye-related signs, symptoms and diagnoses from meibography images. Heliyon. 2024;10(17):e36021.",
      url: "https://doi.org/10.1016/j.heliyon.2024.e36021",
      doi: "10.1016/j.heliyon.2024.e36021",
    },
    {
      label:
        "Garaszczuk IK, Romanos-Ibanez M, Consejo A. Machine learning-based prediction of tear osmolarity for contact lens practice. Ophthalmic Physiol Opt. 2024;44(4):727-736.",
      url: "https://doi.org/10.1111/opo.13302",
      doi: "10.1111/opo.13302",
    },
    {
      label:
        "Graham AD, Wang J, Kothapalli T, et al. Artificial intelligence models utilize lifestyle factors to predict dry eye related outcomes. Sci Rep. 2025;15(1):13378.",
      url: "https://doi.org/10.1038/s41598-025-96778-x",
      doi: "10.1038/s41598-025-96778-x",
    },
    {
      label:
        "Mejía-Salgado G, Rojas-Carabali W, Cifuentes-González C, et al. Diagnostic accuracy in dry eye: Insights into clinical and artificial intelligence limitations. Cont Lens Anterior Eye. 2026.",
      url: "https://doi.org/10.1016/j.clae.2025.102509",
      doi: "10.1016/j.clae.2025.102509",
    },
    {
      label:
        "Yeh CH, Wang J, Graham AD, et al. Insight: A Multi-Modal Diagnostic Pipeline using LLMs for Ocular Surface Disease Diagnosis. Med Image Comput Comput Assist Interv. 2024;15001:711-721.",
      url: "https://doi.org/10.1007/978-3-031-72378-0_66",
      doi: "10.1007/978-3-031-72378-0_66",
    },
    {
      label:
        "Fineide FA, Storås AM, Riegler MA, Utheim TP. Predicting Meibomian Gland Dropout and Feature Importance Analysis with Explainable Artificial Intelligence. 2023 IEEE 36th CBMS.",
      url: "https://doi.org/10.1109/cbms58004.2023.00245",
      doi: "10.1109/cbms58004.2023.00245",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "A declarar pelo autor." },
    {
      label: "Conflitos de interesse",
      text: "A declarar pelo autor. Sem catálogo de marcas.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "Inteligência artificial",
    "Meibografia",
    "Olho seco",
    "Validação externa",
    "Superfície ocular",
  ],
  seo: {
    title: "IA na superfície ocular: o que valida um modelo | SUPERFÍCIE",
    description:
      "Meibografia e coloração já têm modelo, mas o AUC interno não viaja e o LLM superdiagnostica. Sem validação externa, o software descreve o próprio treino.",
    canonical: "/superficie/artigos/ia-na-superficie-ocular",
  },
};

const antiDemodex: MagazineArticle = {
  slug: "anti-demodex",
  title: "Quando a higiene não basta",
  subtitle:
    "Anti-Demodex: caspa cilíndrica, carga e o que realmente reduz ácaro",
  excerpt:
    "A higiene palpebral virou default para qualquer margem suja. Em infestação documentada, o default não erradica o ácaro. Tratar só com conforto é o mecanismo errado. Tratar toda blefarite como Demodex também é.",
  category: "Terapêutica",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "A higiene palpebral virou default para qualquer margem suja. Em infestação documentada, o default não erradica o ácaro. Tratar só com conforto é o mecanismo errado. Tratar toda blefarite como Demodex também é. A pergunta desta matéria é outra: quando a caspa cilíndrica, a carga e o sintoma fecham o diagnóstico, o que reduz ácaro e o que só reduz queixa.",
        "No consultório, shampoo, lenço e hipocloroso entram na mesma gaveta de “tratar a margem”. Gao e colaboradores (2005) já haviam mostrado o furo: higiene diária com shampoo reduz a contagem de Demodex e não elimina. Koo e colaboradores (2012) repetiram o padrão em ensaio: o braço sem óleo de melaleuca melhorou o OSDI e não mexeu no ácaro. Conforto não é causal.",
        "Caspa cilíndrica — o colarete na base do cílio — é o sinal de lâmpada mais específico. Gao encontrou Demodex em 100% dos pacientes com caspa cilíndrica (n = 32) versus 22% sem caspa (n = 23). Rhee e colaboradores (2023) repetem: colaretes são patognomônicos. Zhang e colaboradores (2020), em revisão de 87 estudos, recusam gold standard. As duas frases cabem juntas. Sem caspa — e sem amostragem ou microscopia confocal — a higiene é higiene.",
        "Lotilaner 0,25% duas vezes ao dia por seis semanas é o único regime com ensaios fase 3, mascarados, veículo-controlados, e erradicação de ácaro como desfecho (Yeu e colaboradores, 2023; Gaddie e colaboradores, 2023). Isso muda o que “causal” significa. Não está assumido disponível no Brasil. Até 15 de agosto de 2026 não há registro oftalmológico ANVISA citável. Pipeline. Não vitrine.",
        "Óleo de melaleuca e terpinen-4-ol matam ácaro in vitro e reduzem carga em alguns ensaios. A Cochrane (Savla e colaboradores, 2020) classifica a evidência clínica como incerta e alerta para irritação em concentrações altas. Hipocloroso reduz carga bacteriana e pode melhorar sintoma de blefarite; in vitro não é acaricida comparável ao T4O (Kabat, 2019). Confundi-lo com tratamento causal de Demodex é o overclaim mais comum da página clínica.",
        "Ivermectina tópica 1% (Choi e colaboradores, 2022) e oral 200 μg/kg (Holzchuh e colaboradores, 2011, série brasileira) reduzem sinais ou carga em desenhos fracos. Não são aprovação oftalmológica Demodex. Carga correlaciona com desconforto (Lee e colaboradores, 2010). Não há limiar consensual de ácaros por cílio que separe comensal de doença.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Gao e colaboradores (2005) são a âncora. Em 55 pacientes, Demodex estava em 100% dos que tinham caspa cilíndrica (n = 32) versus 22% sem caspa (n = 23). A contagem foi 4,1 ± 1,0 e 2,0 ± 1,2 versus 0,2. A higiene reduz a contagem e não erradica. O colarete é o sinal mais específico — patognomônico na leitura posterior. O desenho é de centro único.",
        "Kheirkhah e colaboradores (2007), em 10 pacientes e 80 cílios, mostraram que a fluoresceína sobe a contagem de 14,9 para 20,2. Quatro cílios que pareciam zero passaram a ter ácaro.",
        "Randon e colaboradores (2015) compararam microscopia confocal in vivo com depilação: 100/60/12 versus 100/50/0. Doze por cento dos sadios foram positivos na confocal. O exame vê D. brevis e larva. Não é rotina no Brasil.",
        "Lee e colaboradores (2010), em 170 pessoas, acharam Demodex em 70% dos pacientes e em 54% dos cílios. A carga correlaciona com idade, desconforto e 1/BUT. Não correlaciona com Schirmer. Não há limiar.",
        "Zhang e colaboradores (2020) revisaram 87 estudos de 1990 a 2019 e recusam gold standard.",
        "Tighe e colaboradores (2013): terpinen-4-ol é o ingrediente mais potente do óleo de melaleuca para matar o ácaro, já em 1%, in vitro.",
        "Koo e colaboradores (2012) randomizaram 335 pacientes; Demodex em 84%. Óleo de melaleuca n = 141 versus scrub n = 140; completaram 106 versus 54. A contagem caiu de 4,0 para 3,2 no TTO e de 4,3 para 4,2 no scrub. O OSDI caiu nos dois braços.",
        "A Cochrane de Savla e colaboradores (2020) reuniu 6 ensaios e 562 participantes. A metanálise de 3 ensaios deu diferença média de 0,70 (IC 0,24–1,16), certeza muito baixa. A busca para em 2019, sem Saturn.",
        "Kabat (2019): hipocloroso 0,01% — tempo médio de morte 87,9 min; 79% vivos aos 90 min, igual ao óleo mineral. T4O 4% mata em 40 min.",
        "Choi e colaboradores (2022), n = 102, ivermectina tópica 1% semanal por 15 minutos. Sem contagem de ácaro.",
        "Holzchuh e colaboradores (2011), série do HC-FMUSP, 12 pacientes / 24 olhos, ivermectina oral 200 μg/kg no D0 e no D7.",
        "Saturn-1 (Yeu e colaboradores, 2023): n = 421, lotilaner 0,25% duas vezes ao dia por 43 dias. Erradicação 67,9% versus 17,6%; cura de colarete 44,0% versus 7,4%; grau 0–1 em 81,3% versus 23,0%.",
        "Saturn-2 (Gaddie e colaboradores, 2023): n = 412, 21 centros, seis semanas. Cura de colarete 56,0% versus 12,5%; ≤10 colaretes 89,1% versus 33,0%; erradicação 51,8% versus 14,6%; eritema 31,1% versus 9,0%; cura composta 19,2% versus 4,0%.",
        "Rhee e colaboradores (2023) mapeiam a doença, o manejo e as terapias emergentes no momento pré-FDA.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Não tratar toda margem suja como Demodex. A suspeita sobe quando há colaretes, prurido ou falha da higiene em reduzir queixa.",
        "Confirmar na lâmpada de fenda, com epilação e fluoresceína. Microscopia confocal in vivo entra se o aparelho existir. Não há corte consensual de ≥3 ácaros por cílio que separe comensal de doença.",
        "Higiene reduz conforto. Não é tratamento causal. Óleo de melaleuca e terpinen-4-ol têm evidência clínica frágil. Ivermectina tópica ou oral é off-label, ou série. Lotilaner é causal no ensaio e pipeline no Brasil — sem nome comercial nesta matéria.",
        "Doença do olho seco por infestação só depois de caspa cilíndrica, amostra ou confocal, e sintoma. Sem esse fechamento, a higiene continua higiene.",
      ],
      bullets: [
        "Nem toda blefarite é Demodex. Nem todo Demodex é doença.",
        "Caspa cilíndrica marca infestação. Não é gold standard.",
        "Higiene reduz queixa. Não erradica.",
        "HOCl não é acaricida.",
        "T4O: evidência clínica incerta.",
        "Lotilaner: causal no ensaio. Pipeline no Brasil.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Gao e colaboradores (2005) são n = 55, centro único. Zhang recusa gold standard. Lee é transversal. Randon tem n pequeno. A Cochrane para em 2019. Koo mostrou redução pequena de carga. Kabat e Tighe são in vitro. Choi não contou ácaro. Holzchuh é n = 12.",
        "Saturn-1 e Saturn-2 são indústria, seis semanas, Estados Unidos, controle com veículo. A cura composta ficou em 14–19%. Não há head-to-head de acaricidas. Até 15 de agosto de 2026 não há registro ANVISA de lotilaner oftalmológico citável. Fora Holzchuh, não há validação brasileira nesta lista. IPL não entra nesta matéria.",
      ],
      bullets: [
        "Sem limiar consensual de carga.",
        "Sem gold standard diagnóstico.",
        "Sem head-to-head de acaricidas.",
        "HOCl sem RCT de ácaro.",
        "Lotilaner: não assumir ANVISA.",
        "Sem IPL nesta matéria.",
      ],
    },
  ],
  references: [
    {
      label:
        "Gao YY, Di Pascuale MA, Li W, et al. High Prevalence of Demodex in Eyelashes with Cylindrical Dandruff. Invest Ophthalmol Vis Sci. 2005;46(9):3089-3094.",
      url: "https://doi.org/10.1167/iovs.05-0275",
      doi: "10.1167/iovs.05-0275",
    },
    {
      label:
        "Kheirkhah A, Blanco G, Casas V, et al. Fluorescein Dye Improves Microscopic Evaluation and Counting of Demodex in Blepharitis With Cylindrical Dandruff. Cornea. 2007;26(6):697-700.",
      url: "https://doi.org/10.1097/ICO.0b013e31805b7eaf",
      doi: "10.1097/ICO.0b013e31805b7eaf",
    },
    {
      label:
        "Randon M, Liang H, El Hamdaoui M, et al. In vivo confocal microscopy as a novel and reliable tool for the diagnosis of Demodex eyelid infestation. Br J Ophthalmol. 2015;99(3):336-341.",
      url: "https://doi.org/10.1136/bjophthalmol-2014-305671",
      doi: "10.1136/bjophthalmol-2014-305671",
    },
    {
      label:
        "Lee SH, Chun YS, Kim JH, et al. The Relationship between Demodex and Ocular Discomfort. Invest Ophthalmol Vis Sci. 2010;51(6):2906.",
      url: "https://doi.org/10.1167/iovs.09-4850",
      doi: "10.1167/iovs.09-4850",
    },
    {
      label:
        "Zhang AC, Muntz A, Wang MTM, et al. Ocular Demodex: a systematic review of the clinical literature. Ophthalmic Physiol Opt. 2020;40(4):389-432.",
      url: "https://doi.org/10.1111/opo.12691",
      doi: "10.1111/opo.12691",
    },
    {
      label:
        "Tighe S, Gao Y, Tseng SCG. Terpinen-4-ol is the Most Active Ingredient of Tea Tree Oil to Kill Demodex Mites. Transl Vis Sci Technol. 2013;2(7):2.",
      url: "https://doi.org/10.1167/tvst.2.7.2",
      doi: "10.1167/tvst.2.7.2",
    },
    {
      label:
        "Koo H, Kim TH, Kim KW, et al. Ocular Surface Discomfort and Demodex: Effect of Tea Tree Oil Eyelid Scrub in Demodex Blepharitis. J Korean Med Sci. 2012;27(12):1574.",
      url: "https://doi.org/10.3346/jkms.2012.27.12.1574",
      doi: "10.3346/jkms.2012.27.12.1574",
    },
    {
      label:
        "Savla K, Le JT, Pucker AD. Tea tree oil for Demodex blepharitis. Cochrane Database Syst Rev. 2020;6:CD013333.",
      url: "https://doi.org/10.1002/14651858.CD013333.pub2",
      doi: "10.1002/14651858.CD013333.pub2",
    },
    {
      label:
        "Kabat AG. In vitro demodicidal activity of commercial lid hygiene products. Clin Ophthalmol. 2019;13:1493-1497.",
      url: "https://doi.org/10.2147/OPTH.S209067",
      doi: "10.2147/OPTH.S209067",
    },
    {
      label:
        "Choi Y, Eom Y, Yoon EG, et al. Efficacy of Topical Ivermectin 1% in the Treatment of Demodex Blepharitis. Cornea. 2022;41(4):427-434.",
      url: "https://doi.org/10.1097/ICO.0000000000002802",
      doi: "10.1097/ICO.0000000000002802",
    },
    {
      label:
        "Holzchuh FG, Hida RY, Moscovici BK, et al. Clinical Treatment of Ocular Demodex folliculorum by Systemic Ivermectin. Am J Ophthalmol. 2011;151(6):1030-1034.e1.",
      url: "https://doi.org/10.1016/j.ajo.2010.11.024",
      doi: "10.1016/j.ajo.2010.11.024",
    },
    {
      label:
        "Yeu E, Wirta DL, Karpecki P, et al. Lotilaner Ophthalmic Solution, 0.25%, for the Treatment of Demodex Blepharitis: Results of a Prospective, Randomized, Vehicle-Controlled, Double-Masked, Pivotal Trial (Saturn-1). Cornea. 2023;42(4):435-443.",
      url: "https://doi.org/10.1097/ICO.0000000000003097",
      doi: "10.1097/ICO.0000000000003097",
    },
    {
      label:
        "Gaddie IB, Donnenfeld ED, Karpecki P, et al. Lotilaner Ophthalmic Solution 0.25% for Demodex Blepharitis: Randomized, Vehicle-Controlled, Multicenter, Phase 3 Trial (Saturn-2). Ophthalmology. 2023;130(10):1015-1023.",
      url: "https://doi.org/10.1016/j.ophtha.2023.05.030",
      doi: "10.1016/j.ophtha.2023.05.030",
    },
    {
      label:
        "Rhee MK, Yeu E, Barnett M, et al. Demodex Blepharitis: A Comprehensive Review of the Disease, Current Management, and Emerging Therapies. Eye Contact Lens. 2023;49(8):311-318.",
      url: "https://doi.org/10.1097/ICL.0000000000001003",
      doi: "10.1097/ICL.0000000000001003",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "A declarar pelo autor." },
    {
      label: "Conflitos de interesse",
      text: "A declarar pelo autor. Sem catálogo de marcas.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: ["Demodex", "Blefarite", "Higiene palpebral", "Lotilaner", "Olho seco"],
  seo: {
    title: "Quando a higiene não basta | SUPERFÍCIE",
    description:
      "Em infestação documentada por Demodex, a higiene palpebral padrão não erradica o ácaro. Tratar toda blefarite como Demodex erra na outra direção.",
    canonical: "/superficie/artigos/anti-demodex",
  },
};

const terapiasDirigidasPorMecanismo: MagazineArticle = {
  slug: "terapias-dirigidas-por-mecanismo",
  title: "O mecanismo da visita, não o degrau",
  subtitle:
    "Terapias dirigidas: escolher, escalar e parar quando a evidência para",
  excerpt:
    "O consultório ainda escala por gravidade: lágrima, anti-inflamatório, plug, aparelho. O mapa das pp. 23–28 já disse que o driver da visita importa mais que o escore. Não há ensaio que teste tratamento dirigido por mecanismo contra escalada por gravidade.",
  category: "Terapêutica",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O consultório ainda escala por gravidade: lágrima, anti-inflamatório, plug, aparelho. O mapa das pp. 23–28 já disse que o driver da visita importa mais que o escore. Esta matéria traduz isso em primeira linha e em critério de falha. Não recapitulamos o workshop. Não há ensaio que teste tratamento dirigido por mecanismo contra escalada por gravidade. O que se pode fazer é escolher com o mapa na mão — e parar quando a evidência para.",
        "Kim e colaboradores (2021) deslocam a falha: re-fenotipar, não subir o degrau. Ciclosporina, lifitegrast e corticoide chegam com certeza baixa a moderada. McCann e colaboradores (2024) não acharam nenhuma intervenção conclusiva. A Cochrane de ciclosporina de 2026 não vira conclusiva.",
        "Secretagogos entram como classe. Registro ANVISA não foi verificado nesta lista. No eixo neural, soro é fraco em doença do olho seco e observacional em dor corneana neuropática; oral e escleral são extrapolação.",
        "No evaporativo, o que cabe é calor, expressão e lipídio. Aparelhos ficam nas pp. 57–60. Jones e colaboradores (2025) entram só com claims pontuais. O recap do TFOS live já fechou.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Wolffsohn e colaboradores (2025) reentram pelos três blocos do mapa diagnóstico — filme, pálpebra e superfície.",
        "Priyadarshini e colaboradores (2026) reuniram 58 ensaios e 10.225 participantes. Ciclosporina 0,05%: SMD de sintomas −0,33 (I² 86%; 13 estudos, 1.396; certeza baixa); coloração −0,20 (7 estudos, 1.355); descontinuação RR 1,99, certeza moderada. A 0,1%: coloração SMD −0,16 / −0,20; RR 1,58. O horizonte é cerca de três meses. Não é disease-modifying.",
        "Holland e colaboradores (2017), OPUS-3, n = 711: ΔEDS no dia 84, TE 7,16 (IC 3,04–11,28). ODS sem diferença. Inclusão: Schirmer 1–10 e coloração ≥ 2. A Cochrane de lifitegrast é só protocolo.",
        "Liu e colaboradores (2022), 22 ensaios, 4.169 participantes. Versus lágrima: sintomas SMD 0,29; coloração 0,40; TBUT +0,70 s. Versus ciclosporina: −0,33. PIO RR 5,96. Duração 1–8 semanas.",
        "Ervin e colaboradores (2017), 18 ensaios, 711 participantes: sintomas inconclusivos. A busca para em 2016.",
        "McCann e colaboradores (2024): 71 revisões sistemáticas; 26 confiáveis (37%). Nenhuma conclusiva.",
        "Betz e Galor (2025) oferecem um mapa narrativo das peças terapêuticas.",
        "Quan e colaboradores (2023), 6 ensaios, 116 participantes: MD −12 num braço de n = 20 em 2 semanas. Sinais inconclusivos.",
        "Kim e colaboradores (2021) descrevem o stepping: a falha pede re-fenotipagem, não o próximo degrau de gravidade.",
        "Sun e colaboradores (2023), 9 ensaios, 1.295 participantes: diquafosol 3% versus ácido hialurônico 0,1%. OSDI −3,59; Schirmer +1,08; TBUT +0,60; coloração −0,20; OR de eventos 1,71.",
        "Anam e colaboradores (2024) revisam soro e derivados do sangue na dor corneana neuropática — observacional.",
        "Watson e Le (2024) separam dor periférica e central. A lente escleral entra como proteção, não como ensaio de dor.",
        "Jones e colaboradores (2025) cabem em três frases e param. Aparelhos ficam na porta das pp. 57–60.",
        "Lee e Tong (2012), 7 ensaios de lubrificante com lipídio, são revisão sistemática antiga.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "A prescrição começa pelo driver da visita, não pelo degrau de gravidade.",
        "Aquoso: repor. Secretagogo entra como classe. Plug não é automático. Soro é incerto.",
        "Evaporativo: calor, higiene e expressão como conceito; lipídio. Sem aparelho nesta matéria.",
        "Inflamatório: ciclosporina no horizonte de cerca de três meses, certeza baixa. Lifitegrast move EDS entre os dias 14 e 84; ODS é negativo. Corticoide, 1–8 semanas.",
        "Neural: não escalar filme. Soro é observacional. Oral e escleral são extrapolação.",
        "Falha é re-fenotipar, com prazos honestos. No misto, trata-se o driver de hoje. Esta matéria não recicla o workshop TFOS, lotilaner, conjuntivocálase nem aparelhos.",
      ],
      bullets: [
        "Aquoso. Repor. Secretagogo como classe. Plug não é automático. Soro incerto.",
        "Evaporativo. Calor e expressão como conceito. Lipídio. Sem aparelho.",
        "Inflamatório. CsA certeza baixa. Lifitegrast: EDS, não ODS. Corticoide curto.",
        "Neural. Não escalar filme. Soro observacional. Oral e escleral: extrapolação.",
        "Falha. Re-fenotipar. Sem degrau de gravidade.",
        "Limite. Nenhuma intervenção conclusiva até a overview de 2024. CsA 2026 não vira conclusiva.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Não há ensaio que teste tratamento dirigido por mecanismo contra escalada por gravidade. Jones é consenso com indústria. Priyadarshini tem I² alta. OPUS-3 é indústria. Liu relata de forma seletiva. Ervin para em 2016. McCann cobre até 2022. Quan tem n = 20. Sun compara com ácido hialurônico. Anam e Watson são revisões. Lee e Tong (2012) são antigos. Catálogo ANVISA não foi verificado.",
      ],
      bullets: [
        "Sem RCT de implementação deste mapa.",
        "Sem evidência conclusiva para nenhuma intervenção.",
        "Sem Cochrane concluído de lifitegrast.",
        "Sem catálogo ANVISA.",
        "Sem aparelho. Sem atlas de CCh. Sem deep-dive de lotilaner.",
      ],
    },
  ],
  references: [
    {
      label:
        "Jones L, Craig JP, Markoulli M, et al. TFOS DEWS III: Management and Therapy. Am J Ophthalmol. 2025;279:289-386.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.039",
      doi: "10.1016/j.ajo.2025.05.039",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. Am J Ophthalmol. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "Priyadarshini SR, Sadhu S, Tzang C, et al. Topical cyclosporine A therapy for dry eye disease. Cochrane Database Syst Rev. 2026;7:CD010051.pub3.",
      url: "https://doi.org/10.1002/14651858.CD010051.pub3",
      doi: "10.1002/14651858.CD010051.pub3",
    },
    {
      label:
        "Holland EJ, Luchs J, Karpecki PM, et al. Lifitegrast for the Treatment of Dry Eye Disease: Results of a Phase III, Randomized, Double-Masked, Placebo-Controlled Trial (OPUS-3). Ophthalmology. 2017;124(1):53-60.",
      url: "https://doi.org/10.1016/j.ophtha.2016.09.025",
      doi: "10.1016/j.ophtha.2016.09.025",
    },
    {
      label:
        "Liu S, Saldanha IJ, Abraham AG, et al. Topical corticosteroids for dry eye. Cochrane Database Syst Rev. 2022;10:CD015070.",
      url: "https://doi.org/10.1002/14651858.CD015070.pub2",
      doi: "10.1002/14651858.CD015070.pub2",
    },
    {
      label:
        "Ervin AM, Law A, Pucker AD. Punctal occlusion for dry eye syndrome. Cochrane Database Syst Rev. 2017;6:CD006775.",
      url: "https://doi.org/10.1002/14651858.CD006775.pub3",
      doi: "10.1002/14651858.CD006775.pub3",
    },
    {
      label:
        "McCann P, Kruoch Z, Lopez S, et al. Interventions for Dry Eye: An Overview of Systematic Reviews. JAMA Ophthalmol. 2024;142(1):58.",
      url: "https://doi.org/10.1001/jamaophthalmol.2023.5751",
      doi: "10.1001/jamaophthalmol.2023.5751",
    },
    {
      label:
        "Betz J, Galor A. Navigating the Dry Eye Therapeutic Puzzle: A Mechanism-Based Overview of Current Treatments. Pharmaceuticals (Basel). 2025;18(7):994.",
      url: "https://doi.org/10.3390/ph18070994",
      doi: "10.3390/ph18070994",
    },
    {
      label:
        "Quan NG, Leslie L, Li T. Autologous Serum Eye Drops for Dry Eye: Systematic Review. Optom Vis Sci. 2023;100(8):564-571.",
      url: "https://doi.org/10.1097/OPX.0000000000002042",
      doi: "10.1097/OPX.0000000000002042",
    },
    {
      label:
        "Kim M, Lee Y, Mehra D, et al. Dry eye: why artificial tears are not always the answer. BMJ Open Ophthalmol. 2021;6(1):e000697.",
      url: "https://doi.org/10.1136/bmjophth-2020-000697",
      doi: "10.1136/bmjophth-2020-000697",
    },
    {
      label:
        "Sun X, Liu L, Liu C. Topical diquafosol versus hyaluronic acid for the treatment of dry eye disease: a meta-analysis of randomized controlled trials. Graefes Arch Clin Exp Ophthalmol. 2023;261(12):3355-3367.",
      url: "https://doi.org/10.1007/s00417-023-06083-4",
      doi: "10.1007/s00417-023-06083-4",
    },
    {
      label:
        "Anam A, Liu C, Tong L, et al. Blood-Derived Eye Drops for the Treatment of Corneal Neuropathic Pain. J Ocul Pharmacol Ther. 2024;40(5):281-292.",
      url: "https://doi.org/10.1089/jop.2023.0155",
      doi: "10.1089/jop.2023.0155",
    },
    {
      label:
        "Watson SL, Le DT. Corneal neuropathic pain: a review to inform clinical practice. Eye (Lond). 2024;38(12):2350-2358.",
      url: "https://doi.org/10.1038/s41433-024-03060-x",
      doi: "10.1038/s41433-024-03060-x",
    },
    {
      label:
        "Lee SY, Tong L. Lipid-Containing Lubricants for Dry Eye. Optom Vis Sci. 2012;89(11):1654-1661.",
      url: "https://doi.org/10.1097/OPX.0b013e31826f32e0",
      doi: "10.1097/OPX.0b013e31826f32e0",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "A declarar pelo autor." },
    {
      label: "Conflitos de interesse",
      text: "A declarar pelo autor. Sem catálogo de marcas.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: ["Terapêutica", "Ciclosporina", "Fenótipo", "Olho seco", "Mecanismo"],
  seo: {
    title: "O mecanismo da visita, não o degrau | SUPERFÍCIE",
    description:
      "O driver da visita importa mais que o escore de gravidade. Ainda não há ensaio testando tratamento dirigido por mecanismo contra escalada por gravidade.",
    canonical: "/superficie/artigos/terapias-dirigidas-por-mecanismo",
  },
};

const prehabOcular: MagazineArticle = {
  slug: "prehab-ocular",
  title: "Tratar antes de medir",
  subtitle: "Prehab ocular: a superfície que muda a LIO e a satisfação",
  excerpt:
    "A fila da catarata e da refrativa ainda opera no filme instável. “Dói o olho?” não identifica quem vai errar a ceratometria. Duas semanas de lágrima não têm âncora de acurácia de LIO nesta lista.",
  category: "Clínica",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "A fila da catarata e da refrativa ainda opera no filme instável. “Dói o olho?” não identifica quem vai errar a ceratometria. Duas semanas de lágrima não têm âncora de acurácia de LIO nesta lista. Prehab é tratar a superfície visualmente significativa, re-medir quando o K repetir, e avisar o que a cirurgia também cria. Não é vitrine de aparelho. Não é lista de colírio.",
        "Gupta e colaboradores (2018): 80% com pelo menos um teste anormal; 85% dos assintomáticos também anormais. O PHACO de Trattler e colaboradores (2017): coloração em 77%; TBUT ≤ 5 s em 63%; cerca de 60% nunca relataram corpo estranho. Cochener e colaboradores (2018): DGM em 52%, metade assintomática.",
        "Epitropoulos e colaboradores (2015), hiperosmolaridade > 316 versus < 308: mais variação de K, astigmatismo ≥ 1 D, troca de LIO > 0,5 D. O autorrelato não separa. Os cortes 316/308 são do estudo — não são os 308 / Δ8 do DEWS III.",
        "Woodward e colaboradores (2009): DED em 15% do embaçamento em LIO premium; PCO e ametropia lideram. Donnenfeld e colaboradores (2010): ciclosporina perioperatória e acuidade/contraste. Gomes e colaboradores (2017) mapeiam o iatrogênico. Hovanesian e colaboradores (2020) medem 28 dias. SMILE menor que LASIK não é zero (Denoyer; Kobashi).",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Starr e colaboradores (2019) organizam o mapa ASCRS — look, listen, lock. É consenso, não ensaio.",
        "Epitropoulos e colaboradores (2015), n = 75: p = 0,05 / 0,02 / 0,02 para variação de K, astigmatismo ≥ 1 D e troca de LIO > 0,5 D. Há conflito com o osmômetro.",
        "Gupta e colaboradores (2018), 120 pacientes: osmolaridade 56,7%; MMP-9 63,3%; coloração 39,2%; 80% com pelo menos um teste anormal e 40% assintomáticos no recorte do exame.",
        "Trattler e colaboradores (2017), 136 pacientes: coloração central 50%; Schirmer ≤ 5 em 18%.",
        "Hovanesian e colaboradores (2020), 100 olhos, 28 dias de lifitegrast 5% duas vezes ao dia: erro esférico ≤ 0,25 de 47 para 50; ≤ 0,50 de 71 para 79; ≤ 0,75 de 81 para 91; p < 0,04. Aberto, sem controle.",
        "Donnenfeld e colaboradores (2010), n = 14 / 28, ReZoom, ciclosporina versus lágrima de 1 mês antes a 2 meses depois: preferência 57% versus 14%.",
        "Woodward e colaboradores (2009), 43 olhos: PCO 54%; ametropia 29%; DED 15%. Conduta conservadora em 81%; troca em 7%.",
        "Cochener e colaboradores (2018), 342 pacientes / 180 no recorte de imagem: DGM 52%; atrofia 56%.",
        "Gomes e colaboradores (2017) descrevem o olho seco iatrogênico do DEWS II.",
        "De Paiva e colaboradores (2006), n = 35, LASIK com microcerátomo: cerca de 50% na primeira semana; 12–35% aos 6 meses.",
        "Toda (2018) revisa o olho seco após LASIK.",
        "Chao e colaboradores (2014): quase metade após LASIK; o eixo é neural.",
        "Denoyer e colaboradores (2015), 30 versus 30, aos 6 meses: escore 1,2 ± 1,1 versus 0,2 ± 0,4.",
        "Kobashi e colaboradores (2017), metanálise de 5 ensaios: TBUT, OSDI e sensibilidade melhores no SMILE; Schirmer e osmolaridade sem diferença. Sem pódio com PRK. IPL como prehab: só protocolo até 15 de agosto de 2026.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Não operar o filme instável. Adiar a biometria. Quem entra no prehab é a superfície ocular visualmente significativa.",
        "Cerca de quatro semanas e re-medir. Filme sem conservante. Inflamação: lifitegrast quando o alvo é acurácia; ciclosporina quando o alvo é qualidade. Margem: higiene e expressão. IPL cabe numa linha. Re-medir quando o K repetir.",
        "Em LIO premium, DED tratável não é a causa mais comum de insatisfação. Na refrativa, selecionar e avisar. SMILE menor que LASIK; não é zero. PRK sem ranking. Dor desproporcional pode ser neural. No pós-operatório, reduzir conservante.",
      ],
      bullets: [
        "Não perguntar só. Testar. Autorrelato não prediz K instável.",
        "Não operar no filme que não repete.",
        "Quatro semanas e re-medir. Duas semanas de lágrima não têm âncora.",
        "Premium: tratar superfície. PCO e residual lideram a insatisfação.",
        "SMILE < LASIK. Não é zero. Sem pódio com PRK.",
        "IPL como prehab: sem desfecho. pp. 57–60.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Starr é consenso. Epitropoulos é n = 75. As coortes são dos Estados Unidos e da França. Hovanesian é aberto. Donnenfeld é n = 14, com LIO antiga. Woodward é série. De Paiva é n = 35. Denoyer não é ensaio. Kobashi é heterogêneo. Não há ensaio de 2 versus 4 versus 8 semanas. Não há head-to-head de classe com desfecho de LIO. O mapa ASCRS não foi validado no Brasil. Não há prevalência brasileira nesta lista. IPL como prehab é só protocolo.",
      ],
      bullets: [
        "Sem RCT de implementação do mapa ASCRS.",
        "Sem âncora para duas semanas de lágrima.",
        "Sem pódio PRK–LASIK–SMILE.",
        "Sem catálogo de aparelho. Sem lista ANVISA.",
        "Sem recap DEWS III. Sem escada terapêutica.",
      ],
    },
  ],
  references: [
    {
      label:
        "Starr CE, Gupta PK, Farid M, et al. An algorithm for the preoperative diagnosis and treatment of ocular surface disorders. J Cataract Refract Surg. 2019;45(5):669-684.",
      url: "https://doi.org/10.1016/j.jcrs.2019.03.023",
      doi: "10.1016/j.jcrs.2019.03.023",
    },
    {
      label:
        "Epitropoulos AT, Matossian C, Berdy GJ, et al. Effect of tear osmolarity on repeatability of keratometry for cataract surgery planning. J Cataract Refract Surg. 2015;41(8):1672-1677.",
      url: "https://doi.org/10.1016/j.jcrs.2015.01.016",
      doi: "10.1016/j.jcrs.2015.01.016",
    },
    {
      label:
        "Gupta PK, Drinkwater OJ, VanDusen KW, et al. Prevalence of ocular surface dysfunction in patients presenting for cataract surgery evaluation. J Cataract Refract Surg. 2018;44(9):1090-1096.",
      url: "https://doi.org/10.1016/j.jcrs.2018.06.026",
      doi: "10.1016/j.jcrs.2018.06.026",
    },
    {
      label:
        "Trattler WB, Majmudar PA, Donnenfeld ED, et al. The Prospective Health Assessment of Cataract Patients’ Ocular Surface (PHACO) study: the effect of dry eye. Clin Ophthalmol. 2017;11:1423-1430.",
      url: "https://doi.org/10.2147/OPTH.S120159",
      doi: "10.2147/OPTH.S120159",
    },
    {
      label:
        "Hovanesian JA, Epitropoulos A, Donnenfeld ED, et al. The Effect of Lifitegrast on Refractive Accuracy and Symptoms in Dry Eye Patients Undergoing Cataract Surgery. Clin Ophthalmol. 2020;14:2709-2716.",
      url: "https://doi.org/10.2147/OPTH.S264520",
      doi: "10.2147/OPTH.S264520",
    },
    {
      label:
        "Donnenfeld ED, Solomon R, Roberts CW, et al. Cyclosporine 0.05% to improve visual outcomes after multifocal intraocular lens implantation. J Cataract Refract Surg. 2010;36(7):1095-1100.",
      url: "https://doi.org/10.1016/j.jcrs.2009.12.049",
      doi: "10.1016/j.jcrs.2009.12.049",
    },
    {
      label:
        "Woodward MA, Randleman BJ, Stulting DR. Dissatisfaction after multifocal intraocular lens implantation. J Cataract Refract Surg. 2009;35(6):992-997.",
      url: "https://doi.org/10.1016/j.jcrs.2009.01.031",
      doi: "10.1016/j.jcrs.2009.01.031",
    },
    {
      label:
        "Cochener B, Cassan A, Omiel L. Prevalence of meibomian gland dysfunction at the time of cataract surgery. J Cataract Refract Surg. 2018;44(2):144-148.",
      url: "https://doi.org/10.1016/j.jcrs.2017.10.050",
      doi: "10.1016/j.jcrs.2017.10.050",
    },
    {
      label:
        "Gomes JAP, Azar DT, Baudouin C, et al. TFOS DEWS II iatrogenic report. Ocul Surf. 2017;15(3):511-538.",
      url: "https://doi.org/10.1016/j.jtos.2017.05.004",
      doi: "10.1016/j.jtos.2017.05.004",
    },
    {
      label:
        "De Paiva CS, Chen Z, Koch DD, et al. The Incidence and Risk Factors for Developing Dry Eye After Myopic LASIK. Am J Ophthalmol. 2006;141(3):438-445.",
      url: "https://doi.org/10.1016/j.ajo.2005.10.006",
      doi: "10.1016/j.ajo.2005.10.006",
    },
    {
      label:
        "Toda I. Dry Eye After LASIK. Invest Ophthalmol Vis Sci. 2018;59(14):DES109.",
      url: "https://doi.org/10.1167/iovs.17-23538",
      doi: "10.1167/iovs.17-23538",
    },
    {
      label:
        "Chao C, Golebiowski B, Stapleton F. The Role of Corneal Innervation in LASIK-Induced Neuropathic Dry Eye. Ocul Surf. 2014;12(1):32-45.",
      url: "https://doi.org/10.1016/j.jtos.2013.09.001",
      doi: "10.1016/j.jtos.2013.09.001",
    },
    {
      label:
        "Denoyer A, Landman E, Trinh L, et al. Dry Eye Disease after Refractive Surgery: Comparative Outcomes of Small Incision Lenticule Extraction versus LASIK. Ophthalmology. 2015;122(4):669-676.",
      url: "https://doi.org/10.1016/j.ophtha.2014.10.004",
      doi: "10.1016/j.ophtha.2014.10.004",
    },
    {
      label:
        "Kobashi H, Kamiya K, Shimizu K. Dry Eye After Small Incision Lenticule Extraction and Femtosecond Laser-Assisted LASIK: Meta-Analysis. Cornea. 2017;36(1):85-91.",
      url: "https://doi.org/10.1097/ICO.0000000000000999",
      doi: "10.1097/ICO.0000000000000999",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "A declarar pelo autor." },
    {
      label: "Conflitos de interesse",
      text: "A declarar pelo autor. Sem catálogo de marcas.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: [
    "Prehab",
    "Catarata",
    "Cirurgia refrativa",
    "Superfície ocular",
    "LIO",
  ],
  seo: {
    title: "Tratar antes de medir | SUPERFÍCIE",
    description:
      "A fila da catarata e da refrativa ainda opera no filme instável. Duas semanas de lágrima não têm âncora de acurácia de LIO nesta literatura.",
    canonical: "/superficie/artigos/prehab-ocular",
  },
};

const anatomiaDryEyeCenter: MagazineArticle = {
  slug: "anatomia-dry-eye-center",
  title: "Quem entra, quem some",
  subtitle: "Jornada, indicadores, custo e acesso de um Dry Eye Center",
  excerpt:
    "O center que só recebe quem já tem o rótulo perde a maior parte da demanda. Inomata e colaboradores (2020): 72,7% dos sintomáticos num aplicativo japonês estavam sem diagnóstico. Yeo e colaboradores (2014): 47,5% somem de uma clínica dedicada em dois anos.",
  category: "Gestão",
  author: {
    name: "Dr. Philipe Saraiva Cruz",
    slug: "philipe-saraiva-cruz",
    specialty: "Oftalmologia — CRM-MG 69.870 · RQE 71.903",
    affiliation: "Saraiva Vision, Caratinga/MG",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "published",
  issue: "edicao-00",
  publishedAt: "2026-08-17",
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O center que só recebe quem já tem o rótulo perde a maior parte da demanda. Inomata e colaboradores (2020): 72,7% dos sintomáticos num aplicativo japonês estavam sem diagnóstico. Yeo e colaboradores (2014): 47,5% somem de uma clínica dedicada em dois anos. O cartaz de Yu e colaboradores (2011), US$ 55,4 bilhões, é carga societal americana em dólar de 2008. O salto é produtividade, não o frasco. Não é o custo do paciente brasileiro. Anatomia aqui é funil: quem entra, quem some, o que se mede, a quem o sistema chega.",
        "A edição fecha em implementação. Os furos são de entrada — Inomata — e de retenção — Yeo. O indicador que cabe é lost to follow-up em 12–24 meses.",
        "Prevalências não se somam. Farrand: 6,8% diagnosticada nos Estados Unidos. Chen (2024): 13% no Brasil, que é Castro (2018), 12,8%, n = 3.107. Pereira (2025): 38,1% urbano versus 20% rural em ≥ 40 anos. Na clínica de oftalmologia, 83%. Yu é recitado. McDonald: o indireto domina. Schiffman é utility, não QALY brasileiro.",
        "Nau: out-of-pocket mediano US$ 500; 22% gastam ≥ 1 h/dia; 48% têm o clínico como fonte primária. Scheffer (2025) é oferta e faco — não é paper de DED. Não há ensaio de implementação. Não há custo de doença brasileiro.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Dezessete de dezessete DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Inomata e colaboradores (2020), 4.454 usuários, 66,7% mulheres, média 27,9 anos. Entre os sintomáticos, 899 (27,3%) tinham diagnóstico e 2.395 (72,7%) não.",
        "Yeo e colaboradores (2014), Singapura, 505 pacientes: lost to follow-up 47,5%. Homem, não-chinês e < 30 anos somem mais. No inquérito, 77,9% responderam: 47% estabilizou, 25% por razão social, 28% por falha percebida, 1,1% por falha de manejo.",
        "Farrand e colaboradores (2017), NHWS, cerca de 75.000 adultos: 6,8% diagnosticados, cerca de 16,4 milhões. Mulher 8,8 versus 4,5. De 18–34 anos, 2,7%; ≥ 75 anos, 18,6% (OR 2,00 e 4,95). Seguro OR 2,12. Financiamento Shire.",
        "Chen e colaboradores (2024), 14 estudos, 11.594 participantes, busca até 16 de agosto de 2021. Castro 12,8%. México 41%. Indoor 70% (I² 82%); estudante 71% (I² 92%); clínica 83% (I² 88%). DGM 23–68%. Pereira e colaboradores (2025), n = 600: urbano 38,1% (n = 480) e rural 20% (n = 120). Marculino e colaboradores (2022), São Paulo, 24,4%. Não somar.",
        "Schiffman e colaboradores (2003), n = 56: time trade-off 0,78 / 0,72 versus angina 0,71; ρ = 0,32. Financiamento Allergan.",
        "Greco e colaboradores (2021), DREAM, n = 535: 52% empregados; absenteísmo 2%; presenteísmo 18%; global 19,6%; atividade 24,5%. Cada +10 no OSDI: +4,3% / +4,8%; no longitudinal, +2,0 / +3,1.",
        "Uchino e colaboradores (2014), Osaka, 553: 3,56% → 4,06% → 4,82%. US$ 6.160 de produção / 1.178 de salário. A escala é WLQ, não WPAI.",
        "Yu e colaboradores (2011), 2.171, dólar de 2008: pagador 783 (757–809); sistema 3,84 bilhões; societal 11.302 por paciente / 55,4 bilhões.",
        "McDonald e colaboradores (2016), 8 países, 12 estudos de custo e 20 de HRQoL. A busca fecha em 2013.",
        "Waduthantri e colaboradores (2012), SNEC: 54.052 / 132.758 visitas; US$ 1,51–1,52 milhão; 22,11–23,59 por episódio; 99,2% farmácia; 79,3% lágrima.",
        "Scheffer e colaboradores (2025): 16.784 oftalmologistas; 8,96 / 100 mil. Municípios > 500 mil: 18,75; < 50 mil: < 1. DF 19,18; Maranhão 4,22. Catarata: Sudeste 1.012,61; Norte 435. SUS 736,30; privado 1.276,79.",
        "Nau e colaboradores (2024), 639, 86% mulheres, 55 ± 14 anos. Out-of-pocket mediano 500 (IQR 200–1.320; n = 506). Tempo: 55% de 5–20 min; 22% ≥ 1 h. Oftalmologista 67% do cuidado; 48% como fonte.",
        "Cui e colaboradores (2023), Wilmer, 465. Prescrição pré-visita: 61,8% White versus 30,6 Black, 43,5 Asian, 43,9 Hispanic. A coloração pior no baseline some no final.",
        "Wolffsohn e colaboradores (2021), 1.139 clínicos, 51 países: conselho 87%; lágrima sem conservante em baixa/alta gravidade 85 / 80; higiene 81%.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "A jornada do center é entrada mais retenção. O KPI é lost to follow-up em 12–24 meses.",
        "Indicadores não fundem Farrand, Castro, Pereira, Marculino e a clínica de 83%. OSDI é proxy. Utility é analogia.",
        "Investimento separa direto — Yu 783, Waduthantri cerca de 23 — de societal. Sem conversão de dólar. Acesso lê Scheffer, Cui, Nau e o OR 2,12 de Farrand. O menu de Wolffsohn não recapitulamos como algoritmo nem como aparelho.",
      ],
      bullets: [
        "Entrada e retenção. 72,7% sem rótulo. 47,5% LTFU. KPI = quem some.",
        "Não fundir Farrand, Castro/Chen, Pereira, Marculino e a clínica de 83%. São perguntas diferentes.",
        "OSDI acompanha o trabalho. Signo separa pessoas, não a mudança intra-sujeito.",
        "US$ 55,4 bilhões é societal americano de 2008. Não é a conta do paciente daqui.",
        "Acesso: oferta, subtratamento na chegada, tempo e bolso. Não só CRM.",
        "Menu por gravidade e país. Sem RCT de implementação. Sem microcusteio brasileiro.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Yu e Waduthantri estão em dólar de 2008 e não são brasileiros. McDonald fecha em 2013. Schiffman é n = 56. Uchino é Japão e WLQ. Greco é DREAM. Farrand é Shire. Chen tem I² alto e assenta em Castro 2018. Pereira e Marculino ficam fora da revisão sistemática. Inomata é aplicativo, média 28 anos. Yeo é um centro. Wolffsohn é inquérito. Scheffer não é DED. Cui é Wilmer. Nau é newsletter. Não há ensaio de implementação. Não há custo de doença brasileiro.",
      ],
      bullets: [
        "Sem microcusteio brasileiro. Sem conversão de dólar velho.",
        "Sem ensaio de implementação com desfecho de sintoma, retenção ou custo.",
        "Sem fundir diagnosticado, populacional e de clínica.",
        "Scheffer é oferta e faco. Não é epidemiologia de DED.",
        "LTFU de Yeo não foi replicado no Brasil.",
        "Sem catálogo de aparelho. Sem recap de algoritmo.",
      ],
    },
  ],
  references: [
    {
      label:
        "Yu J, Asche CV, Fairchild CJ. The Economic Burden of Dry Eye Disease in the United States: A Decision Tree Analysis. Cornea. 2011;30(4):379-387.",
      url: "https://doi.org/10.1097/ICO.0b013e3181f7f363",
      doi: "10.1097/ICO.0b013e3181f7f363",
    },
    {
      label:
        "McDonald M, Patel DA, Keith MS, et al. Economic and Humanistic Burden of Dry Eye Disease in Europe, North America, and Asia: A Systematic Literature Review. Ocul Surf. 2016;14(2):144-167.",
      url: "https://doi.org/10.1016/j.jtos.2015.11.002",
      doi: "10.1016/j.jtos.2015.11.002",
    },
    {
      label:
        "Schiffman RM, Walt JG, Jacobsen G, et al. Utility assessment among patients with dry eye disease. Ophthalmology. 2003;110(7):1412-1419.",
      url: "https://doi.org/10.1016/S0161-6420(03)00462-7",
      doi: "10.1016/S0161-6420(03)00462-7",
    },
    {
      label:
        "Uchino M, Uchino Y, Dogru M, et al. Dry Eye Disease and Work Productivity Loss in Visual Display Users: The Osaka Study. Am J Ophthalmol. 2014;157(2):294-300.",
      url: "https://doi.org/10.1016/j.ajo.2013.10.014",
      doi: "10.1016/j.ajo.2013.10.014",
    },
    {
      label:
        "Greco G, Pistilli M, Asbell PA, et al. Association of Severity of Dry Eye Disease with Work Productivity and Activity Impairment in the Dry Eye Assessment and Management Study. Ophthalmology. 2021;128(6):850-856.",
      url: "https://doi.org/10.1016/j.ophtha.2020.10.015",
      doi: "10.1016/j.ophtha.2020.10.015",
    },
    {
      label:
        "Farrand KF, Fridman M, Stillman IÖ, et al. Prevalence of Diagnosed Dry Eye Disease in the United States Among Adults Aged 18 Years and Older. Am J Ophthalmol. 2017;182:90-98.",
      url: "https://doi.org/10.1016/j.ajo.2017.06.033",
      doi: "10.1016/j.ajo.2017.06.033",
    },
    {
      label:
        "Chen H, McCann P, Lien T, et al. Prevalence of dry eye and Meibomian gland dysfunction in Central and South America: a systematic review and meta-analysis. BMC Ophthalmol. 2024;24:50.",
      url: "https://doi.org/10.1186/s12886-023-03249-w",
      doi: "10.1186/s12886-023-03249-w",
    },
    {
      label:
        "Inomata T, Iwagami M, Nakamura M, et al. Characteristics and Risk Factors Associated With Diagnosed and Undiagnosed Symptomatic Dry Eye Using a Smartphone Application. JAMA Ophthalmol. 2020;138(1):58.",
      url: "https://doi.org/10.1001/jamaophthalmol.2019.4815",
      doi: "10.1001/jamaophthalmol.2019.4815",
    },
    {
      label:
        "Yeo S, Poon KH, Tong L. Lost to follow-up for appointments in a dedicated dry eye clinic. Patient Prefer Adherence. 2014;8:1409.",
      url: "https://doi.org/10.2147/PPA.S68147",
      doi: "10.2147/PPA.S68147",
    },
    {
      label:
        "Wolffsohn JS, Travé Huarte S, Jones L, et al. Clinical practice patterns in the management of dry eye disease: A TFOS international survey. Ocul Surf. 2021;21:78-86.",
      url: "https://doi.org/10.1016/j.jtos.2021.04.011",
      doi: "10.1016/j.jtos.2021.04.011",
    },
    {
      label:
        "Waduthantri S, Yong SS, Tan CH, et al. Cost of Dry Eye Treatment in an Asian Clinic Setting. PLoS One. 2012;7(6):e37711.",
      url: "https://doi.org/10.1371/journal.pone.0037711",
      doi: "10.1371/journal.pone.0037711",
    },
    {
      label:
        "Scheffer M, Moreira JPL, Bahia L, et al. Regional inequalities in the supply of ophthalmologists and the volume of cataract surgeries between the public and private health sectors in Brazil. Arq Bras Oftalmol. 2025;89(1):e20250218.",
      url: "https://doi.org/10.5935/0004-2749.2025-0218",
      doi: "10.5935/0004-2749.2025-0218",
    },
    {
      label:
        "Nau CB, Nau AC, Fogt JS, et al. Patient-Reported Dry Eye Treatment and Burden of Care. Eye Contact Lens. 2024;50(6):259-264.",
      url: "https://doi.org/10.1097/ICL.0000000000001086",
      doi: "10.1097/ICL.0000000000001086",
    },
    {
      label:
        "Cui D, Mathews PM, Li G, et al. Racial and Ethnic Disparities in Dry Eye Diagnosis and Care. Ophthalmic Epidemiol. 2023;30(5):484-491.",
      url: "https://doi.org/10.1080/09286586.2022.2131834",
      doi: "10.1080/09286586.2022.2131834",
    },
    {
      label:
        "Castro JS, Selegatto IB, Castro RS, et al. Prevalence and Risk Factors of self-reported dry eye in Brazil using a short symptom questionnaire. Sci Rep. 2018;8:2076.",
      url: "https://doi.org/10.1038/s41598-018-20273-9",
      doi: "10.1038/s41598-018-20273-9",
    },
    {
      label:
        "Pereira LA, Arantes LB, Persona ELS, et al. Prevalence of dry eye in Brazil: Home survey reveals differences in urban and rural regions. Clinics. 2025;80:100578.",
      url: "https://doi.org/10.1016/j.clinsp.2025.100578",
      doi: "10.1016/j.clinsp.2025.100578",
    },
    {
      label:
        "Marculino LGC, Hazarbassanov RM, Hazarbassanov NGTQ, et al. Prevalence and risk factors for dry eye disease: the Sao Paulo dry eye study. Arq Bras Oftalmol. 2022;85(6):549-557.",
      url: "https://doi.org/10.5935/0004-2749.202200100",
      doi: "10.5935/0004-2749.202200100",
    },
  ],
  disclosures: [
    { label: "Financiamento", text: "A declarar pelo autor." },
    {
      label: "Conflitos de interesse",
      text: "A declarar pelo autor. Sem catálogo de marcas.",
    },
    {
      label: "Uso de inteligência artificial",
      text: "Houve assistência de IA na reorganização editorial, na revisão linguística e na conferência bibliográfica das referências contra Crossref e PubMed. A IA não foi tratada como fonte; as afirmações e referências foram verificadas pelo autor.",
    },
    {
      label: "Revisão",
      text: "Este artigo não passou por revisão independente por pares. Ver o selo editorial no topo da página.",
    },
    {
      label: "Aprovação ética",
      text: "Não se aplica: revisão narrativa sem dados individuais ou imagens identificáveis.",
    },
  ],
  sponsored: false,
  tags: ["Dry Eye Center", "Gestão", "Acesso", "Custo", "Olho seco"],
  seo: {
    title: "Quem entra, quem some | SUPERFÍCIE",
    description:
      "O center que só recebe quem já tem o rótulo perde a maior parte da demanda: 72,7% dos sintomáticos estavam sem diagnóstico (Inomata, 2020).",
    canonical: "/superficie/artigos/anatomia-dry-eye-center",
  },
};

export const publishedArticles: MagazineArticle[] = [
  dgmBiologiaMolecular,
  tfosDewsIiiNaPratica,
  fenotipagemIntegrada,
  tresMesesNaoSaoDoze,
  alemDoMeiboscore,
  cincoTestesCincoPerguntas,
  aPregaOAtritoEOpiscar,
  iaNaSuperficieOcular,
  antiDemodex,
  terapiasDirigidasPorMecanismo,
  prehabOcular,
  anatomiaDryEyeCenter,
];

export interface MagazineIssue {
  number: string;
  slug: string;
  title: string;
  subtitle: string;
  cover: {
    avif600: string;
    avifLarge: string;
    webp600: string;
    webpLarge: string;
    fallback: string;
    alt: string;
    /**
     * Largura real do arquivo grande. Alimenta o descritor do srcset, que
     * antes era 1054w fixo no componente — a cada troca de capa a arte muda
     * de tamanho, e um descritor mentiroso faz o navegador escolher errado.
     */
    largeWidth: number;
    /** Dimensões intrínsecas, usadas para reservar espaço e evitar CLS. */
    width: number;
    height: number;
  };
  status: MagazineIssueStatus;
  plannedPublication: string;
  publicationDate?: string;
  editorial?: string;
  topics: string[];
  articles: MagazineArticle[];
  pdf?: string;
  sponsors: string[];
  seo: {
    title: string;
    description: string;
    canonical: string;
  };
}

export const magazineDescription =
  "SUPERFÍCIE é uma revista dedicada a olho seco, córnea, diagnóstico, tecnologia, terapias e inovação em superfície ocular.";

export const getMagazineIssuePath = (issue: MagazineIssue) =>
  `/superficie/${issue.slug}`;

export const founderIssue: MagazineIssue = {
  number: "00",
  slug: "edicao-00",
  title: "A nova era da superfície ocular",
  subtitle:
    "Do sintoma ao fenótipo: diagnóstico multimodal e terapias dirigidas por mecanismo.",
  cover: {
    avif600: "/images/superficie/capa-edicao-00-600.avif",
    avifLarge: "/images/superficie/capa-edicao-00-1024.avif",
    webp600: "/images/superficie/capa-edicao-00-600.webp",
    webpLarge: "/images/superficie/capa-edicao-00-1024.webp",
    fallback: "/images/superficie/capa-edicao-00.jpg",
    alt: "Capa da Edição Fundadora nº 0 da revista SUPERFÍCIE: A nova era da superfície ocular — do sintoma ao fenótipo, diagnóstico multimodal e terapias dirigidas por mecanismo",
    largeWidth: 1024,
    width: 1024,
    height: 1536,
  },
  status: "in_production",
  plannedPublication: "novembro de 2026",
  topics: [
    "Fenotipagem do olho seco",
    "Meibografia",
    "NIBUT",
    "Interferometria",
    "Osmolaridade",
    "Conjuntivocálase",
    "DGM",
    "Tecnologias baseadas em energia",
    "Farmacologia",
    "Superfície ocular perioperatória",
    "Inteligência artificial",
    "Futuro do diagnóstico",
  ],
  /**
   * Os doze artigos saem antes da edição fechar: cada um é publicado assim que
   * fica pronto, e a edição impressa se monta em novembro. Enquanto esta lista
   * ficou vazia, /superficie/edicao-00 mostrava o estado de espera dizendo que
   * "as matérias serão liberadas no lançamento" — com as doze já no ar, linkadas
   * de /superficie e de /superficie/artigos.
   *
   * O filtro é por `issue` em vez de uma lista escrita à mão para que o próximo
   * artigo entre na edição pelo campo que já declara a qual edição ele pertence.
   */
  articles: publishedArticles.filter(({ issue }) => issue === "edicao-00"),
  sponsors: [],
  seo: {
    title: "Edição Fundadora nº 0 | SUPERFÍCIE",
    description:
      "Conheça a Edição Fundadora da SUPERFÍCIE, dedicada ao diagnóstico multimodal e às terapias dirigidas por mecanismo na superfície ocular.",
    canonical: "/superficie/edicao-00",
  },
};

export const publishedIssues: MagazineIssue[] = [founderIssue];

export const technologyTopics = [
  { label: "Meibografia", href: "/superficie/artigos/alem-do-meiboscore" },
  // Interferometria, osmolaridade e biomarcadores são recortes do mesmo
  // artigo; o hub repete o URL com o rótulo de cada eixo.
  {
    label: "Interferometria",
    href: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
  {
    label: "Osmolaridade",
    href: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
  {
    label: "Biomarcadores",
    href: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
  {
    label: "Tecnologias baseadas em energia",
    href: "/superficie/artigos/tres-meses-nao-sao-doze",
  },
  {
    label: "Inteligência artificial",
    href: "/superficie/artigos/ia-na-superficie-ocular",
  },
] as const;

export const evidenceFields = [
  "Referência",
  "Pergunta clínica",
  "O que o estudo encontrou",
  "Por que importa",
  "Limitações",
  "Aplicação prática",
] as const;
