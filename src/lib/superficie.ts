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

const alemDoMeiboscore: MagazineArticle = {
  slug: "alem-do-meiboscore",
  title: "Além do meiboscore",
  subtitle: "Como adquirir, ler e não superinterpretar a meibografia",
  excerpt:
    "O meiboscore quantifica perda de área visível. Não mede expressibilidade. Não diagnostica doença do olho seco.",
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
        "O meiboscore virou atalho. A imagem sai do aparelho, o software pinta um número de 0 a 3 por pálpebra, a soma vai a 6, e o consultório trata o escore como se fosse diagnóstico de disfunção das glândulas de Meibomius — ou, pior, de doença do olho seco. Não é. O meiboscore quantifica perda de área visível. Não mede expressibilidade. Não diagnostica doença do olho seco.",
        "A meibografia mostra estrutura. Não fecha, sozinha, o diagnóstico nem a conduta. O recorte desta matéria é como adquirir a imagem, como ler o que ela mostra, e onde o meiboscore deixa de bastar.",
        "Arita e colaboradores (2008) descreveram a meibografia por infravermelho sem contato e o meiboscore: 0 a 3 por pálpebra — sem perda, perda menor que um terço, de um terço a dois terços, maior que dois terços — e soma 0 a 6 das duas pálpebras. O trabalho documentou mudança com a idade numa população sem doença. Não propôs o escore como teste diagnóstico de olho seco. Arita e colaboradores (2009) associaram o uso de lentes de contato à diminuição das glândulas. Outro artigo do mesmo grupo, no mesmo ano, propôs critérios para disfunção obstrutiva. Nenhum desses desenhos autoriza tratar o meiboscore como critério de doença do olho seco.",
        "O diagnóstico DEWS III fecha com OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24), não no índice 0–100 do OSDI-12, mais um signo de homeostase. A meibografia, no máximo, subclassifica o eixo lipídio ou pálpebra. Não entra na porta de entrada. Quem usa o escore para “confirmar olho seco” está lendo um mapa que o consenso não desenhou.",
        "Estrutura não é função. Superior não é inferior. A escala de Arita, 0 a 3, não é a meiboscale de Pult, 0 a 4. Misturar as duas, ou somar pálpebras de aparelhos diferentes, fabrica um número que nenhum dos dois trabalhos mediu. Fora de foco, com reflexo, com dedo no campo, com eversão incompleta ou excessiva: não se lauda. Pede-se nova aquisição.",
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
        "O meiboscore de Arita (2008) é uma escala de perda de área visível por pálpebra. A soma 0–6 descreve as duas pálpebras do mesmo olho no mesmo protocolo. Normas de idade vêm dessa amostra sem doença; normas de lente de contato vêm de Arita e colaboradores (2009). Nenhuma das duas séries é corte diagnóstico brasileiro de DGM, e nenhuma fecha doença do olho seco.",
        "Pult e Nichols (2012) revisaram a evolução da meibografia e das escalas. Pult, Riede-Pult e Nichols (2012) mostraram que perda e ângulo de curvatura se correlacionam entre pálpebras, mas a espessura não; a pálpebra superior perde menos área, é mais fina e menos curvada que a inferior. Superior não é inferior. Pult e Riede-Pult (2013) compararam graduação subjetiva e avaliação objetiva: o olho do examinador e o algoritmo não são o mesmo instrumento. A meiboscale de Pult, 0 a 4, não se soma ao meiboscore de Arita.",
        "Powell, Nichols e Nichols (2012) mediram a confiabilidade interexaminador da avaliação de DGM. Dogan e colaboradores (2018) perguntaram se a reprodutibilidade da meibografia é a mesma na pálpebra superior e na inferior — não é seguro tratar as duas como um único escore. Kim, Eom e Song (2018) examinaram a relação entre morfologia e função: a imagem não prevê, sozinha, o que a expressão entrega. Korb e Blackie (2008) já tinham mostrado que a expressibilidade se correlaciona com sintomas e com a localização da glândula — o terço nasal não é o temporal. Sempre acoplar função: expressibilidade ao longo da pálpebra, não só no terço temporal.",
        "Arita e colaboradores (2014) propuseram análise objetiva da área glandular. É método, não atalho diagnóstico. O relatório de metodologia diagnóstica do DEWS III (Wolffsohn e colaboradores, 2025) — lido aqui pelo resumo, sem recuperar o corpo integral das afirmações sobre meibografia — organiza a subclassificação em filme, pálpebra e superfície. A meibografia cabe, no máximo, no eixo lipídio ou pálpebra. Não é signo de homeostase. Não substitui OSDI-6 nem NIBUT, osmolaridade ou coloração.",
        "O relatório do subcomitê de diagnóstico do workshop internacional de DGM (Tomlinson e colaboradores, 2011) está na lista porque é o landmark da classificação. O corpo do workshop não foi recuperado nesta checagem. Esta matéria não inventa cortes daquele documento.",
        "Wang e colaboradores (2025) compararam métodos qualitativos e quantitativos de dropout num cruzamento randomizado com mascaramento do investigador. O diagnóstico de olho seco no desenho é DEWS II, não DEWS III. A estatística C ficou em torno de 0,63. O índice de Youden apontou perda maior que 20% ou meiboscale maior que 1. Esse corte não é corte brasileiro de DGM. O financiador inclui Johnson & Johnson. Swiderska e colaboradores (2024) avaliaram estrutura e aparência depois de expressão terapêutica em 15 participantes, também com financiamento Johnson & Johnson. Quinze olhos não autorizam celebrar “atrofia imediata” pós-expressão como achado clínico estável.",
        "Uma eversão boa expõe o tarso sem dobrar a glândula, sem unha no campo e sem reflexo no plano das glândulas. Uma eversão má fabrica dropout, encurtamento e distorção que a pálpebra não tem. Dropout, encurtamento, distorção, dilatação e contraste são achados distintos; o meiboscore resume só a área perdida. Meiboscore não é função.",
      ],
    },
    {
      id: "pratica",
      title: "Na prática",
      kind: "practice",
      paragraphs: [
        "O protocolo mínimo: infravermelho sem contato; eversão reproduzível das duas pálpebras de ambos os olhos; iluminação sem reflexo no tarso; foco no plano das glândulas; registrar pré- ou pós-expressão; follow-up no mesmo aparelho, mesma pálpebra, mesma eversão. Esta matéria não cataloga marcas.",
        "O que ler além do meiboscore: dropout, encurtamento, distorção, dilatação, contraste, assimetria superior–inferior. Onde a imagem decide: documentar baseline; acompanhar no mesmo sistema; subclassificar o eixo lipídio ou pálpebra. Onde não decide: diagnosticar doença do olho seco; diagnosticar DGM sozinha.",
      ],
      bullets: [
        "Não laudar imagem fora de foco, com reflexo, com dedo no campo ou com eversão incompleta ou excessiva. Pedir nova aquisição.",
        "Adquirir as quatro pálpebras no mesmo protocolo e anotar se a imagem é pré- ou pós-expressão.",
        "Usar uma escala e não misturar Arita 0–3 com Pult 0–4. Não somar superior com inferior como se fossem o mesmo território.",
        "Acoplar expressibilidade ao longo da pálpebra. Estrutura não é função.",
        "Usar a imagem para baseline, seguimento no mesmo sistema e subclassificação lipídio/pálpebra — não para fechar doença do olho seco.",
        "O meiboscore não é teste diagnóstico de DED. DEWS III fecha com OSDI-6 ≥ 4 (soma bruta 0–24) mais um signo de homeostase.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "O corpo do workshop de Tomlinson e colaboradores (2011) não foi recuperado. Cortes daquele documento não entram aqui.",
        "As afirmações do DEWS III sobre meibografia nesta matéria vêm do resumo de Wolffsohn e colaboradores (2025), não da leitura integral do relatório.",
        "Wang e colaboradores (2025) usam DEWS II, não DEWS III; a estatística C em torno de 0,63 e o Youden (>20% ou meiboscale >1) não são corte brasileiro de DGM. Há financiamento Johnson & Johnson.",
        "Swiderska e colaboradores (2024) têm n = 15 e financiamento Johnson & Johnson. Não se celebra atrofia imediatamente após expressão.",
        "Não há corte de meiboscore validado no consultório brasileiro. Não há catálogo de aparelhos nesta matéria. A escala de Lemp/NEI de 1995 não é pertinente a este recorte e não é citada.",
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
      "O meiboscore quantifica perda de área visível. Não mede expressibilidade. Não diagnostica doença do olho seco.",
    canonical: "/superficie/artigos/alem-do-meiboscore",
  },
};

const cincoTestesCincoPerguntas: MagazineArticle = {
  slug: "cinco-testes-cinco-perguntas",
  title: "Cinco testes, cinco perguntas",
  subtitle:
    "NIBUT, osmolaridade, coloração, interferometria e MMP-9 — o que cada um mede, e o que não mede",
  excerpt:
    "Cada teste responde a uma pergunta. A discórdia entre eles é dado, não falha do exame.",
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
        "NIBUT mede estabilidade do filme. Osmolaridade mede homeostase e estresse hiperosmolar. Coloração localiza onde o epitélio falhou. Interferometria descreve a camada lipídica. MMP-9 ponto-de-cuidado é bandeira de inflamação. Nenhum deles é escala de gravidade. Nenhum substitui o outro.",
        "O mapa que o DEWS II ensinou (Wolffsohn e colaboradores, 2017) ainda organiza fichas: triagem, depois estabilidade, osmolaridade e coloração, depois subclassificação. O mapa operacional desta matéria é o DEWS III (Wolffsohn e colaboradores, 2025). O screening é OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24), não no índice 0–100 do OSDI-12. O diagnóstico fecha com screening positivo mais um signo de homeostase: NIBUT menor que 10 segundos, ou osmolaridade ≥ 308 mOsm/L ou diferença interocular maior que 8, ou coloração — córnea > 5, conjuntiva > 9, ou margem ≥ 2 mm e ≥ 25% da largura. Interferometria e MMP-9 não são critérios diagnósticos.",
        "NIBUT não é FBUT. As plataformas discordam. Uma leitura de osmolaridade no cinza 300–320 não decide. Somar escalas de coloração fabrica um número que nenhuma delas mediu. A camada lipídica fina não diagnostica DGM. MMP-9 positivo não é fenótipo inflamatório; negativo não exclui doença do olho seco.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026. A escala NEI de 1995 não tem DOI Crossref e não é citada.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "NIBUT: o filme é estável? O DEWS III opera com corte menor que 10 segundos no método não invasivo. Preferir não invasivo. Não converter FBUT em NIBUT nem o inverso. Lim e colaboradores (2021) compararam duas técnicas automatizadas de estabilidade não invasiva: o Youden de uma ficou em ≤ 8 segundos e o da outra em ≤ 14. As plataformas discordam. Szczesna-Iskander e Llorens-Quintana (2024) mediram concordância entre ruptura invasiva e não invasiva em 33 participantes. Trinta e três olhos não harmonizam aparelhos.",
        "Osmolaridade: há estresse hiperosmolar? Lemp e colaboradores (2011) ancoraram o corte ≥ 308 mOsm/L como signo sensível — o mesmo número que o DEWS III usa, com a diferença interocular maior que 8. Tomlinson e colaboradores (2006) tinham proposto 316 mOsm/L como referente. Trezentos e oito não é trezentos e dezesseis. O trabalho de Lemp foi financiado pela indústria; esta matéria não endossa a frase “melhor métrica única”. Bunya e colaboradores (2015), num desenho independente, documentaram a variabilidade da leitura. Uma medida isolada na zona cinza 300–320 não decide.",
        "Colorações: onde o epitélio falhou? Fluoresceína, córnea. Lisamina, conjuntiva e margem. Bron, Evans e Smith (2003) e Bron e colaboradores (2015) descrevem o que a cor mostra e o que ela não soma. Não somar escalas. Os cortes DEWS III — córnea > 5, conjuntiva > 9, margem ≥ 2 mm e ≥ 25% da largura — são signos de homeostase, não gravidade. Korb e colaboradores (2010) mostraram que a epiteliopatia do lid wiper é prevalente em quem tem sinais e sintomas: é coloração de atrito, outra pergunta, não um sexto teste de gravidade.",
        "Interferometria: a camada lipídica é fina ou pobre? Finis e colaboradores (2013) testaram a espessura da camada lipídica como ferramenta diagnóstica de DGM: sensibilidade e especificidade modestas. Interferometria não diagnostica DGM.",
        "MMP-9: há bandeira de inflamação agora? Sambursky e colaboradores (2013) descreveram o imunoensaio ponto-de-cuidado. Lanza e colaboradores (2016) situaram o teste no olho seco. Sambursky (2016) relatou que a conduta guiada pela presença ou ausência de inflamação coincidiu com a impressão clínica em 85% versus 86%. Esse número não mostra que o teste muda desfecho. MMP-9 é bandeira, não fenótipo. Negativo não exclui DED.",
        "Cinco perguntas. Uma caixa de custo. O custo só se justifica se a decisão muda. Não se justifica como screening universal nem como “confirma DED”. Não há avaliação de custo-efetividade brasileira nesta lista. Esta matéria não cataloga aparelhos.",
      ],
    },
    {
      id: "pratica",
      title: "Na prática",
      kind: "practice",
      paragraphs: [
        "Pergunte o que o teste responde antes de pedir o teste. Se a resposta não muda a conduta daquela visita, o custo não se justifica.",
      ],
      bullets: [
        "NIBUT: o filme é estável? Preferir não invasivo. Não converter FBUT em NIBUT. Corte operacional DEWS III: menor que 10 segundos.",
        "Osmolaridade: há estresse hiperosmolar? ≥ 308 ou Δ > 8 é signo DEWS III, não gravidade. Uma leitura isolada no cinza 300–320 não decide. 308 não é 316.",
        "Colorações: onde o epitélio falhou? Fluoresceína, córnea. Lisamina, conjuntiva e margem. Não somar escalas.",
        "Interferometria: a camada lipídica é fina ou pobre? Não diagnostica DGM.",
        "MMP-9: há bandeira de inflamação agora? Não define fenótipo. Não exclui DED se negativo.",
        "O custo só se justifica se a decisão muda. Não se justifica como screening universal nem como “confirma DED”.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "O pacote de cortes do DEWS III — OSDI-6, NIBUT, osmolaridade, coloração — não foi testado prospectivamente como conjunto no consultório brasileiro.",
        "Lim e colaboradores (2021) mostram que duas plataformas de NIBUT não compartilham o mesmo Youden. Szczesna-Iskander e Llorens-Quintana (2024) têm n = 33. Esta matéria não harmoniza aparelhos.",
        "Lemp e colaboradores (2011) têm financiamento industrial. Tomlinson e colaboradores (2006) usam referente 316, não 308. Bunya e colaboradores (2015) mostram ruído independente na zona cinza.",
        "Finis e colaboradores (2013) não autorizam diagnosticar DGM por interferometria. Sambursky (2016) — 85% versus 86% — não demonstra que MMP-9 muda desfecho.",
        "Não há custo-efetividade brasileira. Não há catálogo de dispositivos. A escala NEI de 1995 não tem DOI Crossref e não entra.",
      ],
    },
  ],
  references: [
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
        "Lemp MA, Bron AJ, Baudouin C, et al. Tear Osmolarity in the Diagnosis and Management of Dry Eye Disease. Am J Ophthalmol. 2011;151(5):792-798.e1.",
      url: "https://doi.org/10.1016/j.ajo.2010.10.032",
      doi: "10.1016/j.ajo.2010.10.032",
    },
    {
      label:
        "Tomlinson A, Khanal S, Ramaesh K, et al. Tear Film Osmolarity: Determination of a Referent for Dry Eye Diagnosis. Invest Ophthalmol Vis Sci. 2006;47(10):4309.",
      url: "https://doi.org/10.1167/iovs.05-1504",
      doi: "10.1167/iovs.05-1504",
    },
    {
      label:
        "Bunya VY, Fuerst NM, Pistilli M, et al. Variability of Tear Osmolarity in Patients With Dry Eye. JAMA Ophthalmol. 2015;133(6):662.",
      url: "https://doi.org/10.1001/jamaophthalmol.2015.0429",
      doi: "10.1001/jamaophthalmol.2015.0429",
    },
    {
      label:
        "Bron AJ, Evans VE, Smith JA. Grading Of Corneal and Conjunctival Staining in the Context of Other Dry Eye Tests. Cornea. 2003;22(7):640-650.",
      url: "https://doi.org/10.1097/00003226-200310000-00008",
      doi: "10.1097/00003226-200310000-00008",
    },
    {
      label:
        "Bron AJ, Argüeso P, Irkec M, et al. Clinical staining of the ocular surface: Mechanisms and interpretations. Prog Retin Eye Res. 2015;44:36-61.",
      url: "https://doi.org/10.1016/j.preteyeres.2014.10.001",
      doi: "10.1016/j.preteyeres.2014.10.001",
    },
    {
      label:
        "Korb DR, Herman JP, Blackie CA, et al. Prevalence of Lid Wiper Epitheliopathy in Subjects With Dry Eye Signs and Symptoms. Cornea. 2010;29(4):377-383.",
      url: "https://doi.org/10.1097/ICO.0b013e3181ba0cb2",
      doi: "10.1097/ICO.0b013e3181ba0cb2",
    },
    {
      label:
        "Lim J, Wang MTM, Craig JP. Evaluating the diagnostic ability of two automated non-invasive tear film stability measurement techniques. Cont Lens Anterior Eye. 2021;44(4):101362.",
      url: "https://doi.org/10.1016/j.clae.2020.08.006",
      doi: "10.1016/j.clae.2020.08.006",
    },
    {
      label:
        "Szczesna-Iskander DH, Llorens-Quintana C. Agreement between invasive and noninvasive measurement of tear film breakup time. Sci Rep. 2024;14(1).",
      url: "https://doi.org/10.1038/s41598-024-54219-1",
      doi: "10.1038/s41598-024-54219-1",
    },
    {
      label:
        "Finis D, Pischel N, Schrader S, et al. Evaluation of Lipid Layer Thickness Measurement of the Tear Film as a Diagnostic Tool for Meibomian Gland Dysfunction. Cornea. 2013;32(12):1549-1553.",
      url: "https://doi.org/10.1097/ICO.0b013e3182a7f3e1",
      doi: "10.1097/ICO.0b013e3182a7f3e1",
    },
    {
      label:
        "Sambursky R, Davitt WF, Latkany R, et al. Sensitivity and Specificity of a Point-of-Care Matrix Metalloproteinase 9 Immunoassay for Diagnosing Inflammation Related to Dry Eye. JAMA Ophthalmol. 2013;131(1):24.",
      url: "https://doi.org/10.1001/jamaophthalmol.2013.561",
      doi: "10.1001/jamaophthalmol.2013.561",
    },
    {
      label:
        "Lanza NL, Valenzuela F, Perez VL, et al. The Matrix Metalloproteinase 9 Point-of-Care Test in Dry Eye. Ocul Surf. 2016;14(2):189-195.",
      url: "https://doi.org/10.1016/j.jtos.2015.10.004",
      doi: "10.1016/j.jtos.2015.10.004",
    },
    {
      label:
        "Sambursky R. Presence or absence of ocular surface inflammation directs clinical and therapeutic management of dry eye. Clin Ophthalmol. 2016;10:2337-2343.",
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
  tags: [
    "NIBUT",
    "osmolaridade",
    "coloração",
    "interferometria",
    "MMP-9",
  ],
  seo: {
    title: "Cinco testes, cinco perguntas | SUPERFÍCIE",
    description:
      "Cada teste responde a uma pergunta. A discórdia entre eles é dado, não falha do exame.",
    canonical: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
};

const aPregaOAtritoEOpiscar: MagazineArticle = {
  slug: "a-prega-o-atrito-e-o-piscar",
  title: "A prega, o atrito e o piscar",
  subtitle: "Olho seco mecânico: CCh mimetiza DED, não é DED",
  excerpt:
    "Conjuntivocálase mimetiza doença do olho seco. Coexiste com ela. Não é ela.",
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
        "O consultório ainda escala o paciente que não responde à lágrima como se o filme fosse o único endereço. Irritação, epífora, tempo de ruptura curto na córnea inferior: o reflexo é trocar o lubrificante, acrescentar anti-inflamatório, chamar de “olho seco refratário”.",
        "Uma parte desses pacientes tem desalinhamento, atrito ou dinâmica palpebral. A conjuntivocálase é o achado mais comum e o mais ignorado. Mimetiza doença do olho seco. Coexiste com ela. Não é ela.",
        "Meller e Tseng (1998) organizaram a entidade. Mimura e colaboradores (2009), numa série hospitalar, viram a prevalência subir de 6,8% nas faixas mais jovens para 90,2% nas mais velhas. Achado comum não é causalidade. Yokoi e colaboradores (2005) descreveram o impacto clínico da prega — atraso de depuração em 88% e coloração em 78% no recorte daquela série — e, na imuno-histoquímica, inflamação desprezível. Não se escala imunomodulador porque “a prega está inflamada”.",
        "LWE não é LIPCOF. LIPCOF não é CCh. Korb e colaboradores (2005) acharam epiteliopatia do lid wiper em 76% dos sintomáticos e em 12% dos assintomáticos: marca de atrito quando o filme pode parecer “normal”. Pult e Bandlitz (2018) mostraram que as pregas lid-paralelas predizem sintoma e não são conjuntivocálase volumétrica. Distinguir os três na lâmpada é o gesto.",
        "O DEWS III (Wolffsohn e colaboradores, 2025) — lido aqui pelo resumo no que toca à subclassificação — coloca desalinhamento anatômico e piscar/fechamento em territórios próprios. Não transforma a prega em doença do olho seco. Higiene palpebral trata margem e Demodex. Não trata CCh.",
      ],
    },
    {
      id: "metodo",
      title: "Método e recorte",
      kind: "body",
      paragraphs: [
        "Este artigo é uma revisão narrativa. Não constitui diretriz nacional nem prescrição individual.",
        "As referências foram conferidas no Crossref em 15 de agosto de 2026. Autor e título precisaram bater com o registro persistente antes de entrar na lista. Quatorze de quatorze DOIs resolvidos.",
        "Data de corte da busca: 15 de agosto de 2026. Höh (1995) e Hirotani (2003) não têm DOI Crossref e não são citados.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "CCh é redundância em volume que invade o menisco, com sítio e dinâmica. Meller e Tseng (1998) e as revisões de Marmalidou, Kheirkhah e Dana (2018) e de Marmalidou e colaboradores (2019) separam o achado incidental do quadro sintomático e descrevem o manejo médico e cirúrgico. Mimura e colaboradores (2009) documentam o gradiente etário hospitalar — 6,8% a 90,2%. Não há prevalência brasileira nesta lista.",
        "Yokoi e colaboradores (2005) ligaram a prega a atraso de depuração (88%) e a coloração (78%) naquela série, com inflamação imuno-histoquímica desprezível. Irritação ou epífora com prega óbvia e filme já tratado é CCh sintomática, não “DED refratária”.",
        "LWE — epiteliopatia do lid wiper — marca atrito. Korb e colaboradores (2005): 76% versus 12%. Esta matéria usa Korb 2005 para atrito; não reutiliza Korb 2010. LIPCOF — pregas lid-paralelas — prediz sintoma (Pult e Bandlitz, 2018) e não é CCh. Ballesteros-Sánchez e colaboradores (2024) revisaram LIPCOF e CCh com e sem lente de contato: os dois achados convivem na literatura e continuam distintos no biomicroscópio.",
        "McMonnies (2007) descreveu o piscar incompleto como exposição, lid wiper e filme. Pult e colaboradores (2015) leram o piscar pelo ângulo da tribologia. Vu e colaboradores (2018) associaram DGM e doença relacionada a atrito à gravidade do olho seco: coexistência, não identidade. O snap-back é manobra. Não é escala validada. Esta matéria não inventa corte.",
        "Kiss e Németh (2015) acompanharam 20 participantes num estudo aberto, sem mascaramento, e mediram LIPCOF — não CCh volumétrica — sob lágrima da classe glicerol isotônico com hialuronato de sódio. Classe, não marca. Lubrificante viscoso pode reduzir grau de prega e sintoma o bastante para adiar cirurgia. Cirurgia quando o sintoma e a topografia batem e o médico falhou.",
        "Salinas e colaboradores (2020) revisaram a síndrome da pálpebra flácida. Esta matéria não diagnostica apneia obstrutiva do sono a partir do olho seco e não prescreve CPAP como terapia de olho seco.",
        "Três sinais que o consultório mistura: LWE marca atrito quando o filme é “normal”; LIPCOF prediz sintoma e não é CCh; CCh é redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir os três na lâmpada é o gesto.",
      ],
    },
    {
      id: "pratica",
      title: "Na prática",
      kind: "practice",
      paragraphs: [
        "Médico primeiro. A prega óbvia com filme já tratado não pede o próximo degrau da escada de olho seco. Pede nomear o achado e testar o alvo mecânico.",
      ],
      bullets: [
        "Na lâmpada, nomear LWE, LIPCOF e CCh como três achados. Não trocar um pelo outro.",
        "CCh mimetiza e coexiste. Não é DED. Irritação ou epífora com prega óbvia e filme já tratado é CCh sintomática, não “olho seco refratário”.",
        "Não escalar imunomodulador porque “a prega está inflamada”. A imuno-histoquímica de Yokoi mostrou inflamação desprezível.",
        "Higiene palpebral trata margem e Demodex. Não trata CCh.",
        "Começar pelo médico: lubrificante viscoso da classe pode reduzir grau e sintoma o bastante para adiar cirurgia.",
        "Cirurgia quando o sintoma e a topografia batem e o tratamento médico falhou.",
        "Snap-back é manobra, não escala validada. Não inventar corte.",
        "Não diagnosticar apneia do sono nem prescrever CPAP como terapia de olho seco a partir desta revisão.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Não há prevalência brasileira de CCh nesta lista. Mimura e colaboradores (2009) são série hospitalar.",
        "Não há ensaio randomizado que teste o fenótipo mecânico contra a escalada pelo filme.",
        "Kiss e Németh (2015) têm n = 20, desenho aberto, e medem LIPCOF, não CCh volumétrica.",
        "A subclassificação DEWS III de desalinhamento e piscar entra pelo resumo de Wolffsohn e colaboradores (2025), não pela leitura integral do relatório.",
        "Höh (1995) e Hirotani (2003) não têm DOI Crossref e não são citados. Snap-back não tem corte validado nesta matéria. Salinas e colaboradores (2020) não autorizam diagnosticar apneia nem prescrever CPAP como tratamento de olho seco.",
      ],
    },
  ],
  references: [
    {
      label:
        "Meller D, Tseng SCG. Conjunctivochalasis. Surv Ophthalmol. 1998;43(3):225-232.",
      url: "https://doi.org/10.1016/s0039-6257(98)00037-x",
      doi: "10.1016/s0039-6257(98)00037-x",
    },
    {
      label:
        "Mimura T, Yamagami S, Usui T, et al. Changes of Conjunctivochalasis with Age in a Hospital-based Study. Am J Ophthalmol. 2009;147(1):171-177.e1.",
      url: "https://doi.org/10.1016/j.ajo.2008.07.010",
      doi: "10.1016/j.ajo.2008.07.010",
    },
    {
      label:
        "Yokoi N, Komuro A, Nishii M, et al. Clinical Impact of Conjunctivochalasis on the Ocular Surface. Cornea. 2005;24(8):S24-S31.",
      url: "https://doi.org/10.1097/01.ico.0000178740.14212.1a",
      doi: "10.1097/01.ico.0000178740.14212.1a",
    },
    {
      label:
        "Korb DR, Herman JP, Greiner JV, et al. Lid Wiper Epitheliopathy and Dry Eye Symptoms. Eye Contact Lens. 2005;31(1):2-8.",
      url: "https://doi.org/10.1097/01.icl.0000140910.03095.fa",
      doi: "10.1097/01.icl.0000140910.03095.fa",
    },
    {
      label:
        "Pult H, Bandlitz S. Lid-Parallel Conjunctival Folds and Their Ability to Predict Dry Eye. Eye Contact Lens. 2018;44(2):S113-S119.",
      url: "https://doi.org/10.1097/ICL.0000000000000435",
      doi: "10.1097/ICL.0000000000000435",
    },
    {
      label:
        "Wolffsohn JS, Benítez-Del-Castillo JM, Loya-Garcia D, et al. TFOS DEWS III: Diagnostic Methodology. Am J Ophthalmol. 2025;279:387-450.",
      url: "https://doi.org/10.1016/j.ajo.2025.05.033",
      doi: "10.1016/j.ajo.2025.05.033",
    },
    {
      label:
        "McMonnies CW. Incomplete blinking: Exposure keratopathy, lid wiper epitheliopathy, dry eye, refractive surgery, and dry contact lenses. Cont Lens Anterior Eye. 2007;30(1):37-51.",
      url: "https://doi.org/10.1016/j.clae.2006.12.002",
      doi: "10.1016/j.clae.2006.12.002",
    },
    {
      label:
        "Marmalidou A, Kheirkhah A, Dana R. Conjunctivochalasis: a systematic review. Surv Ophthalmol. 2018;63(4):554-564.",
      url: "https://doi.org/10.1016/j.survophthal.2017.10.010",
      doi: "10.1016/j.survophthal.2017.10.010",
    },
    {
      label:
        "Marmalidou A, Palioura S, Dana R, et al. Medical and surgical management of conjunctivochalasis. Ocul Surf. 2019;17(3):393-399.",
      url: "https://doi.org/10.1016/j.jtos.2019.04.008",
      doi: "10.1016/j.jtos.2019.04.008",
    },
    {
      label:
        "Salinas R, Puig M, Fry CL, et al. Floppy eyelid syndrome: A comprehensive review. Ocul Surf. 2020;18(1):31-39.",
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
        "Pult H, Tosatti SGP, Spencer ND, et al. Spontaneous Blinking from a Tribological Viewpoint. Ocul Surf. 2015;13(3):236-249.",
      url: "https://doi.org/10.1016/j.jtos.2014.12.004",
      doi: "10.1016/j.jtos.2014.12.004",
    },
    {
      label:
        "Ballesteros-Sánchez A, Sánchez-González JM, Borrone MA, et al. The Influence of Lid-Parallel Conjunctival Folds and Conjunctivochalasis on Dry Eye Symptoms with and Without Contact Lens Wear: A Review of the Literature. Ophthalmol Ther. 2024;13(3):651-670.",
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
  tags: [
    "Conjuntivocálase",
    "LWE",
    "LIPCOF",
    "olho seco mecânico",
    "atrito",
  ],
  seo: {
    title: "A prega, o atrito e o piscar | SUPERFÍCIE",
    description:
      "Conjuntivocálase mimetiza doença do olho seco. Coexiste com ela. Não é ela.",
    canonical: "/superficie/artigos/a-prega-o-atrito-e-o-piscar",
  },
};

export const publishedArticles: MagazineArticle[] = [
  dgmBiologiaMolecular,
  tfosDewsIiiNaPratica,
  alemDoMeiboscore,
  cincoTestesCincoPerguntas,
  aPregaOAtritoEOpiscar,
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
