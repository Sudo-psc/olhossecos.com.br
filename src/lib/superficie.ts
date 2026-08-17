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
        "Não toda blefarite é Demodex. Não todo Demodex é doença.",
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
      "A higiene palpebral virou default para qualquer margem suja. Em infestação documentada, o default não erradica o ácaro. Tratar só com conforto é o mecanismo errado. Tratar toda blefarite como Demodex também é.",
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
      "O consultório ainda escala por gravidade: lágrima, anti-inflamatório, plug, aparelho. O mapa das pp. 23–28 já disse que o driver da visita importa mais que o escore. Não há ensaio que teste tratamento dirigido por mecanismo contra escalada por gravidade.",
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
      "A fila da catarata e da refrativa ainda opera no filme instável. “Dói o olho?” não identifica quem vai errar a ceratometria. Duas semanas de lágrima não têm âncora de acurácia de LIO nesta lista.",
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
      "O center que só recebe quem já tem o rótulo perde a maior parte da demanda. Inomata e colaboradores (2020): 72,7% dos sintomáticos num aplicativo japonês estavam sem diagnóstico. Yeo e colaboradores (2014): 47,5% somem de uma clínica dedicada em dois anos.",
    canonical: "/superficie/artigos/anatomia-dry-eye-center",
  },
};

export const publishedArticles: MagazineArticle[] = [
  dgmBiologiaMolecular,
  tfosDewsIiiNaPratica,
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
