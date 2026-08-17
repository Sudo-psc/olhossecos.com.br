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

export interface MagazineArticleSection {
  id: string;
  title: string;
  kind: MagazineArticleSectionKind;
  paragraphs: string[];
  bullets?: string[];
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
    "A disfunção das glândulas de Meibomius não é apenas uma doença de glândulas obstruídas. Alterações na diferenciação dos meibócitos, na sinalização androgênica e na renovação do compartimento progenitor podem preceder a atrofia — mas a evidência permanece majoritariamente pré-clínica.",
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
        "Na prática, é tentador reduzir a DGM a uma sequência simples: meibum espesso, obstrução, instabilidade lacrimal e sintomas. Esse modelo é útil, mas incompleto. A glândula de Meibomius é um tecido de renovação contínua. Cada meibócito amadurece, acumula lipídios e é eliminado pela secreção holócrina; para que a glândula continue funcionando, outra célula precisa completar o mesmo programa.",
        "Quando essa transição falha, a perda funcional pode começar antes que a meibografia mostre atrofia avançada. Isso oferece uma explicação biologicamente plausível para a resposta desigual a intervenções exclusivamente mecânicas: pacientes com apresentações morfológicas semelhantes podem não compartilhar o mesmo mecanismo predominante.",
        "Essa hipótese não permite identificar a via molecular de um paciente no consultório. Ela muda a pergunta clínica — de “onde está a obstrução?” para “quais componentes obstrutivos, inflamatórios, hormonais, metabólicos e degenerativos podem coexistir neste fenótipo?”.",
      ],
      bullets: [
        "A obstrução é apenas parte da história: a DGM também pode envolver falha na produção e na renovação de meibócitos funcionais.",
        "Três eixos convergem: redução de PPARγ, menor suporte androgênico e disfunção do nicho progenitor.",
        "A implicação clínica atual é fenotipar melhor, não prescrever vias moleculares.",
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
        "O receptor gama ativado por proliferadores de peroxissoma (PPARγ) ocupa posição central na diferenciação meibocitária. Sua expressão acompanha o início da maturação celular e da síntese lipídica durante o desenvolvimento glandular. Em células humanas, a ativação dessa via promove saída do ciclo celular e aumenta a expressão de genes lipogênicos, entre eles ADFP, ELOVL4 e FABP4.",
        "Modelos genéticos reforçam a centralidade da via, ainda que por caminho indireto: a deleção condicional de Fgfr2 ou de Hdac3 no epitélio meibomiano produz atrofia acinar e maturação meibocitária defeituosa, acompanhada de queda de PPARγ e de seus alvos lipogênicos. Vale a distinção: nesses modelos o PPARγ cai junto com o fenótipo — não há, até aqui, demonstração de que sua deleção isolada seja a causa da atrofia.",
        "Estudos de envelhecimento descrevem menor atividade da via e perda de eficiência da diferenciação, com deslocamento da localização de PPARγ do citoplasma para o núcleo em glândulas de camundongos e humanos mais velhos. Em termos simples, o PPARγ não atua apenas na quantidade de lipídios; participa da definição da identidade funcional do meibócito.",
      ],
    },
    {
      id: "androgenos",
      title: "Andrógenos: suporte metabólico e imunomodulador",
      kind: "evidence",
      paragraphs: [
        "A glândula de Meibomius expressa receptor androgênico e as enzimas necessárias à síntese e ao metabolismo local de esteroides. Em camundongo castrado, a testosterona eleva o RNA mensageiro de enzimas lipogênicas e das proteínas SREBP 1 e 2, além de enzimas da via de biossíntese do colesterol; em células meibomianas humanas imortalizadas, a di-hidrotestosterona altera a expressão de milhares de genes, com efeito sobre vias que incluem a sinalização PPAR.",
        "Há também sinal anti-inflamatório em modelos experimentais: a di-hidrotestosterona reduz mediadores como IL-6, IL-1β e VEGF-A em células meibomianas.",
        "Em humanos, a disfunção do receptor androgênico na síndrome de insensibilidade androgênica completa associa-se a alterações meibomianas e a mais sinais e sintomas de olho seco, e o uso de antiandrogênicos altera o perfil de lipídios neutros da secreção. Esses dados dão plausibilidade biológica ao papel dos andrógenos na função glandular. Não demonstram que a reposição hormonal beneficie a DGM — e a morfologia glandular bruta não se mostrou consistentemente dependente de andrógenos nos modelos animais disponíveis.",
      ],
    },
    {
      id: "nicho-progenitor",
      title: "Renovação celular: o nicho progenitor também pode falhar",
      kind: "evidence",
      paragraphs: [
        "Como a secreção é holócrina, a manutenção da glândula depende de reposição celular contínua. Estudos de rastreamento de linhagem identificaram populações progenitoras envolvidas nesse processo. Células KROX20+ contribuem para a manutenção glandular; sua perda experimental produz atrofia e sinais de doença do olho seco. A sinalização Notch1 participa desse controle, e a superexpressão de Notch1 resgata parcialmente a atrofia causada pela perda de Krox20 — configurando um eixo Krox20–Notch1 relevante para a homeostase.",
        "A via Hedgehog participa do mesmo circuito, porém de forma menos linear do que “mais sinalização, glândula melhor”. Em células epiteliais meibomianas de rato, o receptor Smoothened e os fatores Gli são expressos in vivo e in vitro, e sua expressão diminui à medida que a célula se diferencia. O bloqueio farmacológico de Smoothened reduziu a proliferação, mas aumentou a expressão de SREBP1 e o acúmulo lipídico. O agonista (SAG) inibiu SREBP1 e o acúmulo lipídico, sem aumento significativo do número celular ou de Ki67. A leitura mais provável é que o Hedgehog sustente o compartimento proliferativo e precise ser atenuado para que a diferenciação meibocitária se complete.",
        "Estudos de rastreamento de linhagem e sequenciamento de núcleos em camundongo reforçam o Hedgehog como regulador da proliferação das células-tronco meibomianas e mostram que a glândula envelhecida apresenta menor sinalização Hedgehog e EGF, inervação deficiente e perda de colágeno I nos fibroblastos do nicho. A degeneração associada à idade, portanto, não está apenas no epitélio: envolve também o microambiente que o sustenta.",
        "O conjunto sugere que a DGM pode ser, em parte, uma doença da transição entre célula progenitora e meibócito maduro.",
      ],
    },
    {
      id: "envelhecimento-inflamacao",
      title: "Envelhecimento e inflamação fecham o circuito",
      kind: "evidence",
      paragraphs: [
        "“Exaustão” não deve ser entendida apenas como desaparecimento das células progenitoras. A capacidade clonogênica diminui com a idade: em análise clonal de glândulas de camundongo e humanas, holoclones e meroclones ficaram menores e menos frequentes em modelos de DGM associada à idade, com queda de K14, K6a e PPARγ nos clones. Some-se a isso a redução de Hedgehog e EGF e a deterioração do nicho fibroblástico descritas na glândula envelhecida. A questão relevante não é somente quantas células progenitoras restam, mas se elas ainda encontram o ambiente e os sinais necessários para completar o programa de maturação.",
        "A IL-1β ativa p38 MAPK, reduz PPARγ, prejudica a diferenciação meibocitária e favorece hiperqueratinização. Em modelos organoides, o bloqueio de p38 com SB203580 ou a restauração da atividade de PPARγ com rosiglitazona reverteu parte dessas alterações.",
        "O estresse oxidativo acrescenta outra camada. A ferroptose — morte celular dependente de ferro e peroxidação lipídica — foi identificada em células progenitoras Lrig1+ em modelos experimentais de DGM, e inibidores de ferroptose atenuaram as manifestações nesses modelos. Assim, inflamação, dano oxidativo e falha de diferenciação podem formar um circuito de retroalimentação: a piora da função glandular altera o meibum, favorece obstrução e inflamação e, por sua vez, agride ainda mais o nicho responsável pela renovação.",
      ],
    },
    {
      id: "na-pratica",
      title: "O que muda na prática",
      kind: "practice",
      paragraphs: [
        "A mudança imediata é de raciocínio, não de prescrição. A meibografia mostra estrutura; a expressão glandular e o exame da margem palpebral mostram parte da função; sintomas e estabilidade lacrimal mostram repercussão. Nenhuma dessas medidas revela diretamente a atividade de PPARγ, receptor androgênico, Notch, Hedgehog ou ferroptose em um paciente.",
        "Por isso, um fenótipo aparentemente obstrutivo não deve ser interpretado como mecanismo único. A avaliação pode integrar morfologia glandular, qualidade e expressibilidade da secreção, sinais inflamatórios, estabilidade do filme lacrimal, doenças concomitantes da superfície ocular, exposições ambientais, medicamentos e contexto hormonal.",
        "No contexto brasileiro, a principal utilidade deste modelo é permitir fenotipagem progressiva sem tornar uma tecnologia isolada requisito para o cuidado. Onde meibografia, interferometria ou outros recursos avançados não estiverem disponíveis, biomicroscopia sistemática, avaliação da margem palpebral, expressão glandular, caracterização do meibum e documentação clínica seriada ainda podem organizar a decisão. Esta aplicação é uma inferência clínica e editorial: o conjunto de referências não apresenta estudo brasileiro comparativo de implementação, análise de custo-efetividade ou validação de biomarcadores moleculares para uso rotineiro.",
      ],
      bullets: [
        "Descreva o fenótipo antes de nomear o mecanismo: margem palpebral, orifícios, expressibilidade, qualidade do meibum, sinais inflamatórios e morfologia glandular quando disponível.",
        "Procure fatores que modulam a glândula — idade, doenças da superfície ocular, medicamentos, exposição ambiental e contexto hormonal — sem atribuir causalidade a uma associação isolada.",
        "Defina um alvo clínico observável: melhorar expressibilidade, reduzir inflamação, estabilizar o filme lacrimal ou controlar um fator associado.",
        "Reavalie resposta e coerência diagnóstica: se a evolução não for a esperada, reveja adesão, diagnósticos diferenciais e componentes coexistentes antes de intensificar procedimentos.",
        "Não transforme alvos experimentais em prescrição: modulação de PPARγ, Hedgehog, andrógenos ou nicho progenitor exige evidência clínica, avaliação regulatória e protocolos apropriados.",
      ],
    },
    {
      id: "limitacoes",
      title: "O que ainda não sabemos",
      kind: "limitations",
      paragraphs: [
        "A maior parte da evidência que sustenta este modelo vem de culturas celulares, organoides, rastreamento de linhagem e animais. Esses estudos são valiosos para demonstrar plausibilidade e mecanismos, mas não estabelecem, sozinhos, causalidade clínica, acurácia diagnóstica ou eficácia terapêutica em pessoas com DGM.",
        "Agonistas de PPARγ, moduladores de Hedgehog, terapias androgênicas e estratégias de rejuvenescimento do nicho progenitor são hipóteses translacionais promissoras. Neste estágio, não devem ser apresentados como tratamento estabelecido.",
        "A glândula de Meibomius não falha apenas porque seu conteúdo não consegue sair. Ela também pode falhar porque perde, progressivamente, a capacidade de produzir novos meibócitos funcionais.",
      ],
      bullets: [
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
      url: "https://pubmed.ncbi.nlm.nih.gov/20664693/",
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
        "Zhu X, Xu M, Millar SE, et al. HDAC1/2 and HDAC3 play distinct roles in controlling adult Meibomian gland homeostasis. Ocul Surf. 2024;34:317-31.",
      url: "https://doi.org/10.1016/j.jtos.2024.09.006",
      doi: "10.1016/j.jtos.2024.09.006",
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
      url: "https://pubmed.ncbi.nlm.nih.gov/22605918/",
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
      url: "https://pubmed.ncbi.nlm.nih.gov/11053270/",
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
  featuredImage: {
    src: "/images/superficie/artigos/biologia-molecular-da-dgm/cover.jpg",
    avif: "/images/superficie/artigos/biologia-molecular-da-dgm/cover.avif",
    webp: "/images/superficie/artigos/biologia-molecular-da-dgm/cover.webp",
    alt: "Filme lipídico iridescente e glândulas de Meibômio em escala molecular",
    width: 900,
    height: 1200,
  },
  heroBackground: {
    src: "/images/superficie/artigos/biologia-molecular-da-dgm/bg.jpg",
    avif: "/images/superficie/artigos/biologia-molecular-da-dgm/bg.avif",
    webp: "/images/superficie/artigos/biologia-molecular-da-dgm/bg.webp",
    width: 1920,
    height: 1080,
  },
  ogImage: {
    src: "/images/superficie/artigos/biologia-molecular-da-dgm/og.jpg",
    alt: "Filme lipídico iridescente e glândulas de Meibômio em escala molecular",
    width: 1200,
    height: 630,
    type: "image/jpeg",
  },
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
      "PPARγ, sinalização androgênica e renovação do nicho progenitor na disfunção das glândulas de Meibomius — o que a evidência pré-clínica mostra e o que ainda não sustenta prescrição.",
    canonical: "/superficie/artigos/biologia-molecular-da-dgm",
  },
};

const tfosDewsIiiNaPratica: MagazineArticle = {
  slug: "tfos-dews-iii-na-pratica",
  title: "TFOS DEWS III na prática",
  subtitle:
    "De escalada por gravidade para tratamento dirigido por mecanismo — o que muda no consultório brasileiro",
  excerpt:
    "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção.",
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
      title: "A pergunta que muda a consulta",
      kind: "why-it-matters",
      paragraphs: [
        "O TFOS DEWS III não aposenta a gravidade; muda sua função. Em vez de determinar, sozinha, uma sequência universal de tratamentos, ela passa a modular urgência, intensidade e proteção da superfície. A escolha terapêutica começa pelos mecanismos que sustentam a doença naquele paciente — e isso pode ser feito, em grande parte, com história dirigida, lâmpada de fenda e poucos testes bem escolhidos.",
        "Durante anos, a doença do olho seco foi ensinada como uma escada. O caso “leve” começava com educação e lubrificante; o “moderado” recebia anti-inflamatório ou tratamento palpebral; o “grave” avançava para lágrimas biológicas, lentes terapêuticas ou cirurgia. A estrutura era didática. Também era perigosa: podia fazer o clínico tratar a intensidade da manifestação antes de identificar o que a produz.",
        "O TFOS DEWS III — terceiro workshop da Tear Film & Ocular Surface Society, publicado em 2025 no American Journal of Ophthalmology — desloca o centro dessa lógica. Sistemas que agrupam pacientes apenas como leve, moderado ou grave, ou somente como aquodeficiente versus evaporativo, são descritos como uma arquitetura insuficiente quando escondem a coexistência e a variação temporal dos mecanismos. A pergunta operacional deixa de ser apenas “quão grave é?” e passa a ser: quais fatores etiológicos são clinicamente relevantes neste olho, hoje?",
        "A resposta não é uma lista de marcas. É um mapa. O relatório de manejo propõe três territórios — deficiências do filme lacrimal, anormalidades palpebrais e alterações da superfície ocular — e, dentro deles, drivers que podem ser identificados no consultório e pareados a intervenções com mecanismo de ação compatível. Mais de um alvo pode ser tratado desde o início. A gravidade continua indispensável, mas muda de função: deixa de ser o roteiro e passa a ser o eixo de urgência, intensidade e proteção.",
        "Essa mudança é especialmente útil no Brasil. Em um país em que o acesso a osmolarímetro, meibógrafo, IPL ou hemoderivados varia radicalmente entre o consultório de médio porte, o centro de superfície e o SUS, um algoritmo que depende de plataforma tecnológica seria excludente. O DEWS III, lido com rigor, não exige isso. Exige hipótese explícita.",
        "A mudança não é “gravidade versus mecanismo”. É um sistema de duas coordenadas. O eixo horizontal — o mecanismo — indica o que tratar. O eixo vertical — gravidade e risco — indica quanto, quão rápido e com quanta proteção tratar. Uma paciente com sintomas moderados e lagoftalmo não deve esperar fracassar em vários lubrificantes para que a exposição seja tratada. Outro, com dor intensa e poucos sinais, não deve receber indefinidamente mais colírios sem investigação neurossensorial.",
      ],
      bullets: [
        "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção.",
        "A pergunta operacional deixa de ser apenas “quão grave é?” e passa a ser quais fatores etiológicos são clinicamente relevantes neste olho, hoje.",
        "Mais de um alvo pode ser tratado desde o início; a gravidade deixa de ser o roteiro e passa a ser o eixo de urgência, intensidade e proteção.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa e uma interpretação prática dos relatórios oficiais do TFOS DEWS III publicados em 2025, do resumo executivo publicado em 2026 e de estudos complementares citados. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. O relatório Digest tem corrigendum publicado em 2026. Disponibilidade, registro sanitário, indicação, contraindicações e condições de uso de fármacos e dispositivos devem ser conferidos em fontes regulatórias brasileiras atualizadas.",
        "Data de corte da busca: 14 de agosto de 2026.",
      ],
    },
    {
      id: "definicao",
      title: "O que mudou de verdade na definição",
      kind: "evidence",
      paragraphs: [
        "O consenso define o olho seco como doença multifatorial e sintomática, marcada pela perda de homeostase do filme lacrimal e/ou da superfície ocular, na qual instabilidade e hiperosmolaridade, inflamação e dano, e anormalidades neurossensoriais atuam como fatores etiológicos.",
        "A redação parece próxima à de 2017. Três escolhas, porém, têm consequência clínica imediata. Primeiro, o olho seco é doença, não síndrome. Isso não é semântica de congresso: uma síndrome é um agrupamento de queixas; uma doença tem fisiopatologia, drivers identificáveis e razão para terapia dirigida. O rótulo “síndrome do olho seco” ainda circula em prontuários e laudos. Vale abandoná-lo.",
        "Segundo, a superfície ocular passa a dividir explicitamente com o filme lacrimal o núcleo da homeostase. Isso acomoda melhor situações em que fricção, dano epitelial, anatomia, inflamação primária ou disfunção neural sustentam sintomas, mesmo quando a produção aquosa não é a história principal.",
        "Terceiro, a doença é, por definição, sintomática. Sinais isolados — disfunção de glândula meibomiana, blefarite, coloração puntiforme — exigem acompanhamento e busca de doença associada, mas não preenchem, sozinhos, a definição de doença do olho seco. Da mesma forma, sintomas sem evidência objetiva de perda de homeostase obrigam a ampliar o diagnóstico diferencial. A discordância entre queixa e sinal não é “falta de organicidade”: é informação biológica.",
        "Essa formulação protege contra dois excessos comuns no consultório brasileiro. O primeiro é converter qualquer alteração palpebral ou coloração em “olho seco” sem demonstrar sintomas. O segundo é negar o sofrimento de quem tem dor desproporcional aos achados e responder com mais um lubrificante.",
        "O que não mudou: o diagnóstico continua clínico. O exame precisa excluir mascaradores. A evidência varia entre intervenções. Disponibilidade, registro sanitário, contraindicações, custo e preferência do paciente permanecem parte da decisão compartilhada. “Dirigido por mecanismo” frequentemente significa dirigido por um mecanismo provável, inferido de história, sinais e resposta longitudinal. Biomarcadores que predizem resposta individual ainda são limitados.",
      ],
    },
    {
      id: "diagnostico",
      title: "Diagnóstico em duas etapas",
      kind: "evidence",
      paragraphs: [
        "O algoritmo do DEWS III separa duas tarefas que frequentemente se confundem na mesma consulta: confirmar a doença e, depois, explicá-la.",
        "Para confirmar, o rastreamento recomendado é o OSDI-6, com ponto de corte ≥ 4 na soma bruta dos 6 itens (escala 0–24), não no índice 0–100 do OSDI-12, seguido da demonstração de ao menos um marcador de perda de homeostase. O instrumento não deve ser reproduzido ou incorporado a prontuário, site ou aplicativo sem verificar as condições de uso e licenciamento aplicáveis. Até que haja validação brasileira específica da versão curta, o escore integra — e não substitui — a entrevista clínica. A versão completa do OSDI já foi traduzida e validada para o português; isso não autoriza tratar o OSDI-6 como equivalente automático.",
        "Depois de confirmar o diagnóstico, o exame deve localizar os fatores etiológicos relevantes. O DEWS III organiza nove componentes em três territórios: filme (lipídico, aquoso, mucina/glicocálix); pálpebras (piscar/fechamento, margem); superfície (desalinhamento anatômico, disfunção neural, dano/ruptura celular, inflamação primária/estresse oxidativo).",
        "Essa segunda etapa é o salto conceitual. “Evaporativo” e “aquodeficiente” continuam úteis como descrição ampla, mas perdem poder se forem o ponto final. Dois pacientes evaporativos podem exigir condutas radicalmente diferentes: um apresenta meibo obstruído e telangiectasia; outro, piscar incompleto por trabalho prolongado em tela. Da mesma forma, a baixa altura do menisco pode coexistir com inflamação, toxicidade medicamentosa, conjuntivocálase e déficit neurossensorial.",
        "Para não perder o diagnóstico, é desejável avaliar mais de um grupo de sinais; um único marcador positivo confirma a doença em paciente sintomático. Em 1.427 participantes, o uso de um único marcador teria deixado sem diagnóstico entre 12,3% e 36,2% dos casos que preencheriam o protocolo completo. Limitar-se à fluoresceína só corneana reduz a sensibilidade a 44,6%; a avaliação ampla — córnea, conjuntiva e margem palpebral — é especialmente informativa.",
        "Antes de confirmar, exclua o que muda a prioridade. Dor verdadeira, assimetria importante, secreção, edema, trauma, início abrupto, inflamação intraocular, defeito epitelial, infecção, queda visual não explicada ou suspeita sistêmica não são “olho seco grave”: são outro problema, ou um problema que convive com o olho seco e o ultrapassa. Revise alergia, medicamentos, cosméticos, cirurgia, lente de contato e doenças da superfície que podem mascarar ou coexistir.",
      ],
      bullets: [
        "Estabilidade: NIBUT < 10 s; se o método não invasivo não estiver disponível, TBUT com volume mínimo de fluoresceína e corte < 5 s.",
        "Osmolaridade: ≥ 308 mOsm/L em qualquer olho ou diferença interocular > 8 mOsm/L — cortes estabelecidos com o sistema TearLab, não automaticamente transferíveis a qualquer equipamento.",
        "Coloração: > 5 pontos corneanos com fluoresceína; > 9 pontos conjuntivais com lisamina verde; e/ou margem palpebral com ≥ 2 mm de extensão e ≥ 25% de largura.",
      ],
    },
    {
      id: "nove-drivers",
      title: "O mapa dos nove drivers",
      kind: "evidence",
      paragraphs: [
        "Os drivers não são mutuamente exclusivos. Em doença multifatorial, tratamento combinado pode ser a estratégia inicial mais coerente — desde que cada item tenha alvo, segurança e desfecho definidos.",
        "No filme lacrimal, a pergunta é se há DGM funcional que sustente instabilidade, produção aquosa insuficiente, perda ou retenção inadequada, ou superfície que perdeu a capacidade de manter o filme uniformemente distribuído. Procure meibo, expressibilidade, orifícios, padrão lipídico, menisco, Schirmer quando indicado, padrão de ruptura, coloração conjuntival e sinais de toxicidade.",
        "Nas pálpebras, a distribuição e a proteção falham por dinâmica palpebral? A margem gera inflamação, obstrução, fricção ou contaminação? Observe frequência e completude do piscar, vedação, lagoftalmo, exposição noturna, cílios, debris, Demodex, telangiectasias e queratinização.",
        "Na superfície ocular, anatomia ou fricção perpetua a perda de homeostase? Há comprometimento trófico ou sensibilização além do filme? A prioridade imediata é proteger e regenerar tecido? A inflamação é driver primário clinicamente sustentado? Procure conjuntivocálase, pterígio, irregularidade, malposição palpebral, sensibilidade, alodinia, fotofobia, discordância sintoma–sinal, filamentos, hiperemia e pistas de doença sistêmica.",
        "A pergunta prática, para cada item da receita, é uma frase incompleta: estou indicando isto para modificar aquilo e vou reavaliar por meio de um desfecho definido. Se médico e paciente não conseguem preenchê-la, o item provavelmente não pertence ao plano.",
      ],
      bullets: [
        "Filme lacrimal: lipídico, aquoso e mucina/glicocálix.",
        "Pálpebras: piscar/fechamento e margem palpebral.",
        "Superfície ocular: desalinhamento anatômico, disfunção neural, dano/ruptura celular e inflamação primária/estresse oxidativo.",
      ],
    },
    {
      id: "na-pratica",
      title: "O que muda no consultório",
      kind: "practice",
      paragraphs: [
        "O DEWS III não exige que toda consulta se transforme em um laboratório de superfície ocular. Osmolaridade, interferometria, meibografia, MMP-9, estesiometria e microscopia confocal podem aumentar a precisão em casos selecionados. O algoritmo, porém, pode ser iniciado com recursos presentes em grande parte dos consultórios oftalmológicos brasileiros.",
        "Além de secura, ardor e flutuação visual, pergunte quando o sintoma aparece, o que o interrompe e qual exposição o antecede. Tela, ar-condicionado, vento, cosméticos, lente de contato, colírios crônicos, cirurgia recente, alergia, rosácea, dor sistêmica, sono e medicamentos deixam de ser uma lista protocolar e passam a gerar hipóteses testáveis. No Brasil, essa atenção não é detalhe epidemiológico: levantamentos identificaram associação com sexo feminino, idade, uso de telas, cirurgia ocular e medicamentos, e um inquérito domiciliar encontrou sintomas mais frequentes em área urbana que rural. O TFOS Lifestyle Report (2023) já havia tornado formal o que o consultório brasileiro vê todos os dias — telas, ambiente, cosméticos e iatrogenia como drivers, não como apêndice.",
        "Antes de instilar fluoresceína, observe piscar, fechamento, posição palpebral, menisco, debris, espuma e padrão de ruptura não invasivo, quando disponível. Muitos topógrafos e tomógrafos já instalados no país medem NIBUT; o gargalo costuma ser usá-los de forma padronizada, não comprá-los. Examine margem, orifícios, vascularização e expressão do meibo. Depois, use os corantes para mapear córnea, conjuntiva e margem palpebral. Lisamina verde é barata e subutilizada. Altura do menisco e Schirmer ganham valor quando há suspeita aquodeficiente. Sensibilidade corneana e pistas de dor neuropática tornam-se prioritárias quando sintomas e sinais divergem.",
        "Tecnologia entra como modificadora de probabilidade. Meibografia documenta perda glandular, mas não substitui a expressão, não mede sozinha a função atual e não diagnostica doença do olho seco isoladamente. Osmolaridade pode confirmar perda de homeostase, mas não localiza o mecanismo. MMP-9 sugere atividade inflamatória dentro das limitações do teste, mas não autoriza concluir que toda queixa decorre de inflamação. O investimento em equipamento deve responder a uma pergunta clínica concreta e alterar uma decisão.",
        "Na escada, os três casos abaixo poderiam receber o mesmo rótulo e o mesmo lubrificante. No mapa mecanístico, a intensidade pode ser parecida; o alvo inicial não. Caso 1 — tela, instabilidade e piscar: arquiteta, 38 anos, ardor e visão flutuante ao fim do expediente; piscar incompleto, NIBUT reduzido, meibo expressível, pouca coloração. O driver dominante é piscar/exposição; deficiência lipídica não está demonstrada como alvo principal. A primeira decisão é reorganizar piscar, pausas e ambiente, e escolher suplemento compatível com a instabilidade. Procedimento palpebral agressivo não decorre apenas de NIBUT baixo.",
        "Caso 2 — aquodeficiência e risco epitelial: mulher, 62 anos, boca seca, menisco muito baixo, coloração corneoconjuntival e piora após cirurgia de catarata. O mapa combina deficiência aquosa e dano celular; a suspeita sistêmica aumenta risco e urgência. Reposição compatível, redução de toxicidade, proteção da superfície e investigação de Sjögren podem caminhar em paralelo. Não é racional esperar falhas sequenciais de lubrificante.",
        "Caso 3 — dor 9/10, poucos sinais: homem, 46 anos, fotofobia e alodinia ao vento, sem marcador objetivo de perda de homeostase; usa cinco colírios. A doença do olho seco ainda não está confirmada. Toxicidade e disfunção neural entram no diferencial. O passo seguinte não é o sexto colírio. É revisar superfície, sensibilidade, cirurgia prévia, enxaqueca e dor crônica, e estruturar avaliação neurossensorial. Olho seco discreto e dor neuropática podem coexistir, mas exigem planos paralelos.",
        "Traduzir o DEWS III não é importar uma lista de moléculas aprovadas no exterior. É montar, para cada mecanismo, uma cesta de opções disponíveis, regulatoramente sustentáveis e executáveis por aquele paciente. A lista do consenso não é formulário nacional. Moléculas e dispositivos devem ser conferidos, no dia da decisão, nas bases da Anvisa; uma denominação comum não prova que exista produto registrado. Para IPL, luz de baixa intensidade e sistemas térmicos, a regularização é específica do produto, do modelo e das instruções de uso — um aparelho dermatológico não deve ser presumido como indicado para aplicação periocular. Lágrimas de soro autólogo exigem serviço licenciado, rastreabilidade e controle de qualidade, nos termos da Nota Técnica nº 03/2018 da Anvisa.",
        "Até a data de corte desta matéria, não havia protocolo clínico e diretriz terapêutica nacional específico para doença do olho seco na lista da Conitec. Procedimentos básicos como Schirmer e oclusão de ponto lacrimal têm mais clareza de nomenclatura do que NIBUT, osmolaridade, meibografia, MMP-9 e terapias instrumentais. Ausência de denominação específica não significa negativa automática, mas ajuda a explicar a heterogeneidade e o desembolso direto. O efeito prático é direto: o protocolo precisa funcionar em camadas.",
        "Abandonar a escada rígida não equivale a tratar todos com a mesma intensidade. O próprio consenso não oferece um escore ponderado de gravidade validado: a associação fraca entre sinais e sintomas inviabilizou esse atalho. Gravidade permanece julgamento clínico, indispensável para urgência, proteção, carga terapêutica e intervalo de seguimento. A melhor imagem não é demolir a escada, mas girá-la: ela deixa de ser a rota universal de escolha e se torna o eixo vertical de intensidade dentro de um mapa horizontal de mecanismos.",
        "Em síntese: o mecanismo decide a direção; a gravidade decide a velocidade e a proteção; a realidade do paciente decide se o plano será possível.",
      ],
      bullets: [
        "0–1 min — Sintomas e impacto: aplique instrumento autorizado e registre frequência, gatilhos, flutuação visual, dor e limitação funcional.",
        "1–2 min — Mascaradores: alergia predominante, infecção, toxicidade, erosão recorrente, alteração palpebral aguda, neuralgia e sinais de doença sistêmica ou urgência.",
        "2–3 min — Filme sem corante: piscar, fechamento, menisco, debris e estabilidade; NIBUT se disponível.",
        "3–4 min — Pálpebras e meibo: margem, Demodex, orifícios, vascularização, posição palpebral e qualidade/expressibilidade da secreção.",
        "4–5 min — Superfície com corantes: mapeie córnea, conjuntiva e margem. Evite reduzir o exame à fluoresceína central.",
        "5–6 min — Plano testável: nomeie os drivers dominantes, pareie cada conduta a um alvo e defina o que deverá ter mudado no retorno.",
        "Separe diagnóstico de subclassificação: primeiro confirme sintomas mais perda de homeostase; depois localize os drivers.",
        "Não pare em evaporativo versus aquodeficiente: registre filme, pálpebra, anatomia, células, inflamação e nervos.",
        "Dê um alvo a cada item da receita. Use gravidade para intensidade e proteção, não como portão que adia a correção de uma causa evidente. Refenotipe no retorno.",
      ],
    },
    {
      id: "limitacoes",
      title: "O que o DEWS III ainda não resolve",
      kind: "limitations",
      paragraphs: [
        "Consenso não é ensaio clínico, e um algoritmo abrangente não iguala a força da evidência entre intervenções. Há heterogeneidade em definições, dispositivos, parâmetros, comparadores e desfechos. Muitas terapias melhoram um sinal sem efeito proporcional nos sintomas; outras têm estudos curtos, amostras pequenas ou forte dependência de tecnologia proprietária.",
        "O relatório de manejo declara apoio por doações irrestritas de múltiplas empresas e apresenta conflitos individuais dos autores. Transparência exige considerar esse contexto junto com método, consistência e qualidade dos estudos — não rejeição automática.",
        "“Tratamento dirigido por mecanismo” ainda é, muitas vezes, fenótipo dirigido por mecanismo provável. A honestidade clínica consiste em explicitar a hipótese, escolher uma intervenção coerente e usar a resposta longitudinal como parte da inferência.",
        "Este texto é uma interpretação editorial dos relatórios TFOS DEWS III, não uma reprodução integral do consenso e não uma diretriz brasileira. Não substitui leitura das fontes, bula, registro sanitário, julgamento clínico nem decisão compartilhada. Data de corte: 14 de agosto de 2026.",
      ],
      bullets: [
        "Não há escore ponderado de gravidade validado pelo consenso; gravidade permanece julgamento clínico.",
        "A força da evidência não é homogênea entre as intervenções organizadas no algoritmo.",
        "A lista internacional de classes e dispositivos não é formulário brasileiro.",
        "Biomarcadores que predizem resposta individual ainda são limitados.",
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
        "Stapleton F, Argüeso P, Asbell P, et al. Corrigendum to “TFOS DEWS III: Digest” Am J Ophthalmol. 2025;279:451-553. Am J Ophthalmol. 2026;288:350-351.",
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
      // Crossref omite páginas; PubMed PMID 35417509 lista 549-557.
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
      accessedAt: "2026-08-14",
    },
    {
      label: "Anvisa. Consulta de medicamentos e produtos para saúde.",
      url: "https://consultas.anvisa.gov.br/",
      accessedAt: "2026-08-14",
    },
    {
      label:
        "Anvisa. Nota Técnica nº 03/2018 — produção de colírio de soro autólogo.",
      url: "https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/sangue-tecidos-celulas-e-orgaos/notas-tecnicas/vigentes/nota-tecnica-no-03-de-2018/view",
      accessedAt: "2026-08-14",
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
  featuredImage: {
    src: "/images/superficie/artigos/tfos-dews-iii-na-pratica/cover.jpg",
    avif: "/images/superficie/artigos/tfos-dews-iii-na-pratica/cover.avif",
    webp: "/images/superficie/artigos/tfos-dews-iii-na-pratica/cover.webp",
    alt: "Composição tipográfica da SUPERFÍCIE: eixos de mecanismo e gravidade sobre geometria abstrata do filme lacrimal",
    width: 900,
    height: 1200,
  },
  heroBackground: {
    src: "/images/superficie/artigos/tfos-dews-iii-na-pratica/bg.jpg",
    avif: "/images/superficie/artigos/tfos-dews-iii-na-pratica/bg.avif",
    webp: "/images/superficie/artigos/tfos-dews-iii-na-pratica/bg.webp",
    width: 1920,
    height: 1080,
  },
  ogImage: {
    src: "/images/superficie/artigos/tfos-dews-iii-na-pratica/og.jpg",
    alt: "Composição tipográfica da SUPERFÍCIE: eixos de mecanismo e gravidade sobre geometria abstrata do filme lacrimal",
    width: 1200,
    height: 630,
    type: "image/jpeg",
  },
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

const iaNaSuperficieOcular: MagazineArticle = {
  slug: "ia-na-superficie-ocular",
  title: "IA na superfície ocular: onde ajuda, onde erra e como validar",
  subtitle:
    "Onde a imagem já lê com alguma segurança, o que ainda não generaliza, e que pergunta fazer antes de deixar o software entrar na conduta.",
  excerpt:
    "A pergunta útil não é se uma rede consegue segmentar uma glândula. É se o número que ela devolve muda uma decisão no consultório. Meibografia e coloração já têm modelo; o AUC interno não viaja, e o LLM superdiagnostica — sem validação externa, o software descreve o laboratório que o treinou.",
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
  content: [
    {
      id: "por-que-importa",
      title: "Por que importa",
      kind: "why-it-matters",
      paragraphs: [
        "O olho seco continua sendo um diagnóstico montado por pedaços. Sintoma, sinal e biomarcador discordam com frequência. O paciente pode chegar com OSDI alto e córnea quase limpa, ou o contrário. Cada teste — questionário, tempo de ruptura, coloração, osmolaridade, meibografia, interferometria — vê uma fatia. Nenhum fecha o fenótipo sozinho.",
        "Isso já era o problema clínico antes da inteligência artificial. A IA entrou exatamente nesse ponto: automatizar a leitura de uma imagem, ou juntar imagens com a ficha. O apelo é óbvio. Meiboscore, camada lipídica e coloração ainda dependem do olho de quem examina. Um modelo treinado promete objetividade e velocidade.",
        "O risco também é óbvio. Um AUC alto no conjunto que treinou o modelo não é um instrumento de consultório. A literatura de IA em olho seco cresceu depressa e ainda é, na maior parte, unimodal: uma foto, um vídeo, um escore. Poucos trabalhos juntam de verdade meibografia, filme lacrimal e sintomas. Menos ainda testam o modelo em outro aparelho, outro centro, outra população.",
        "Para a SUPERFÍCIE, o ponto não é celebrar a ferramenta. É dizer ao clínico o que já lê uma imagem com alguma segurança, o que ainda não generaliza, e que pergunta fazer antes de deixar o software entrar na conduta.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "Uma revisão sistemática de 70 estudos únicos (71 registros; um preprint e seu artigo de revista contados uma vez) mapeou modelos de aprendizado de máquina e profundo aplicados a olho seco e superfície ocular, com ênfase em abordagens que usam mais de uma fonte de dados. A busca inicial foi em março de 2025; registros com data de 2026 entraram na atualização do manuscrito.",
        "O grosso da literatura ainda é imagem única. Meibografia é o canal mais frequente. Redes que segmentam pálpebra e atrofia chegaram a 95,6% de acerto no meiboscore no conjunto de avaliação (209 imagens; 497 no treino e ajuste) e superaram o investigador clínico de referência em 16 pontos percentuais. Coloração de fluoresceína já tem modelo com teste externo em 2.376 imagens de 23 hospitais na China (r interno 0,898 e AUC 0,881; r externo 0,844–0,899 e AUC 0,804–0,883).",
        "O achado que importa para a clínica é outro. O mesmo grupo que relatou 73,01% de acerto no meiboscore no conjunto de validação caiu para 59,17% num centro independente (1.600 imagens). Os especialistas em disfunção de glândula de Meibômio, no conjunto de validação, ficaram em 53,44%. A queda do modelo é o cartão de visita: o número interno não viaja. Aparelho, recorte étnico e protocolo de captura mudam o resultado até prova em contrário.",
        "Há sinais de que a imagem pode dizer mais do que o escore. Aprendizado não supervisionado em 82.236 meibografias de 20.559 pessoas agrupou seis subtipos com perfis distintos de ruptura, menisco, atrofia e coloração. Outro modelo leu sinais, sintomas e diagnósticos a partir só da meibografia (562 imagens, 363 pessoas), com acurácias de 65% a 99% — 74% a 85% para disfunção glandular, deficiência aquosa e blefarite. Isso não valida o uso isolado da foto como diagnóstico. Mostra que a glândula carrega informação que o meiboscore joga fora.",
        "A via sem imagem também existe. Modelos tabulares, em 175 candidatos a lentes, explicaram cerca de 32% da variância da osmolaridade e acertaram cerca de 80% nas faixas baixa, média e alta. Preditores: NIKBUT, menisco, hiperemia, cobertura glandular e DEQ-5. Fatores de estilo de vida — tempo de perto, álcool, exercício, tempo ao ar livre — entram com peso em vários desfechos; cabine de avião e dirigir predisseram sintoma, não sinal. São hipóteses de triagem, não substitutos da meibografia.",
        "Grandes modelos de linguagem, alimentados com texto clínico e sintomas de 338 pacientes com suspeita de olho seco, concordaram com o clínico no “é DED” (sensibilidade 93–99%; kappa 0,81–0,86). A especificidade ficou entre 0% e 16%. A acurácia balanceada caiu para 48–56%. No subtipo (aquoso, evaporativo, misto) o acordo foi ao acaso. O modelo reproduz o viés de superdiagnóstico. Um pipeline multimodal (Insight / MDPipe) que traduz meibografia em morfologia e pede raciocínio ao LLM superou o GPT-4 em benchmarks de superfície ocular; ainda é prova de conceito, não ferramenta de consultório.",
        "A fusão de verdade — imagem mais clínica, no mesmo modelo, validada fora de casa — continua rara. Dinâmica temporal do filme lacrimal, o que o clínico já filma no NIBUT, quase não entra. Ensaio prospectivo medindo sintoma, adesão ou qualidade de vida depois da IA assistida não apareceu no corpus.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Três usos cabem hoje, se o clínico souber o que está comprando.",
        "Primeiro: segunda leitura de meibografia e de coloração, não diagnóstico. Um modelo que marca glândula, atrofia e reflexo especular reduz fadiga e padroniza o arquivo. Ele não decide evaporativo versus aquoso. Se o software não declara aparelho, recorte de pálpebra e conjunto externo, trate o número como rascunho.",
        "Segundo: recusar o AUC interno como argumento de compra. A pergunta mínima é: testaram em outro centro, outro aparelho, outra etnia? Qual foi a queda? O caso Saha é o cartão dessa pergunta. Sem essa resposta, o modelo descreve o laboratório que o treinou.",
        "Terceiro: triagem, não atalho. Onde não há meibógrafo, um modelo tabular que estima instabilidade ou dropout a partir de coloração, expressibilidade e sintomas pode decidir quem precisa do exame extra. O teto desses modelos é baixo o bastante para não substituir o exame. É alto o bastante para ordenar a fila.",
        "O que ainda não cabe: fechar subtipo de olho seco com chatbot; usar LLM no prontuário como laudo; tratar cluster de meibografia como fenótipo terapêutico sem reprodução. A telemedicina com foto dirigida é outro capítulo — e no Brasil passa por regra do CFM, não por paper de visão computacional.",
        "No fluxo do consultório, a ordem honesta é: fenótipo clínico primeiro, imagem depois, software por último. A IA entra para repetir com menos ruído o que o exame já pediu, não para inventar um mecanismo.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta matéria assenta numa revisão sistemática em inglês, com heterogeneidade grande de tarefa, aparelho e n. Meta-análise não foi possível. Dois papers de método ficaram no corpus apesar de n humano baixo (um voluntário com 89.033 recortes de interferometria por smartphone; dez sadios em OCT de menisco), porque a unidade de análise era o quadro, não a coorte diagnóstica. Um item de 2026 em repositório aberto não foi recuperado no PubMed nem no Crossref e não sustenta claim.",
        "A revisão não cobre registro na ANVISA, software como dispositivo médico, nem a regra brasileira de telemedicina. Também não mede desfecho de paciente. “Acurácia de segmentação” não é alívio de sintoma.",
        "O selo desta versão é checagem editorial, não revisão por pares. Claims clínicos abaixo têm fonte. O que não tem DOI resolvido no Crossref não entra.",
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
    title:
      "IA na superfície ocular: onde ajuda, onde erra e como validar | SUPERFÍCIE",
    description:
      "A pergunta útil não é se uma rede consegue segmentar uma glândula. É se o número que ela devolve muda uma decisão no consultório. Meibografia e coloração já têm modelo; o AUC interno não viaja, e o LLM superdiagnostica — sem validação externa, o software descreve o laboratório que o treinou.",
    canonical: "/superficie/artigos/ia-na-superficie-ocular",
  },
};

export const publishedArticles: MagazineArticle[] = [
  dgmBiologiaMolecular,
  tfosDewsIiiNaPratica,
  iaNaSuperficieOcular,
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
    fallback: "/images/superficie/capa-edicao-00.png",
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
  articles: [],
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
  "Meibografia",
  "Interferometria",
  "Osmolaridade",
  "Biomarcadores",
  "Tecnologias baseadas em energia",
  "Inteligência artificial",
] as const;

export const evidenceFields = [
  "Referência",
  "Pergunta clínica",
  "O que o estudo encontrou",
  "Por que importa",
  "Limitações",
  "Aplicação prática",
] as const;
