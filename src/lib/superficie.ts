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
    "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção. O DEWS III troca a escada por gravidade por tratamento dirigido por mecanismo — a pergunta no consultório muda; o ranking de gravidade não é o mapa.",
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
    "O meiboscore quantifica perda de área visível. Não mede expressibilidade. Não distingue atrofia de oclusão. Não diagnostica doença do olho seco — e uma foto granulada não autoriza laudar DGM.",
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
        "O meiboscore virou atalho de consultório: a pálpebra é evertida, o software devolve um número, o laudo sai “DGM grau 2”. A pergunta útil é outra — como adquirir, ler e não superinterpretar a imagem: o que o escore de perda de área não diz, quais eixos morfológicos existem além da porcentagem visível, e quais armadilhas de eversão, idade, lente, observador e um frame só impedem de chamar DGM a partir de uma foto granulada.",
        "Na prática, é tentador tratar a meibografia como teste de DGM. A primeira reação é numérica — gravar o meiboscore e escalar o tratamento como se perda de área visível fosse função, obstrução, qualidade do meibum e doença do olho seco. Esse gesto pressupõe que o escore deveria fechar o diagnóstico. Não deveria. O meiboscore de Arita — 0 a 3 por pálpebra, soma 0 a 6 — quantifica perda de área glandular visível. Não mede expressibilidade. Não distingue atrofia de oclusão. Não diagnostica doença do olho seco.",
        "O critério diagnóstico do TFOS DEWS III (Wolffsohn e colaboradores, 2025) fecha doença do olho seco com screening — OSDI-6 ≥ 4 na soma bruta dos 6 itens, escala 0–24, não o índice 0–100 do OSDI-12 — mais um signo de homeostase: tempo de ruptura não invasivo, ou osmolaridade, ou coloração. A meibografia não entra nesse critério. Entra, no máximo, na subclassificação de filme — o eixo lipídio — e de pálpebra. Usá-la como “teste de DGM” isolado é overclaim.",
        "A aquisição muda o laudo. Eversão excessiva inclui tarso além da zona glandular; o software não distingue isso de dropout. Reflexo forte é tomado por glândula. Fora de foco, dedo no campo e imagem granulada são critérios de exclusão, não “grau 3”. Superior e inferior não são intercambiáveis. Estrutura não é função. Uma imagem não é fenótipo estável. Lente de contato e idade deslocam o meiboscore “normal”. Sem essas âncoras, o leitor superdiagnostica DGM em usuário de lente de 30 anos ou em septuagenário assintomático.",
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
        "O marco de aquisição é a meibografia infravermelha sem contato de Arita, Itoh, Inoue e Amano (2008). Lâmpada de fenda, CCD infravermelho e filtro transmissor; sem sonda de transiluminação. Eversão de superior e inferior. Meiboscore por pálpebra: 0 = sem perda; 1 = perda menor que um terço da área; 2 = um terço a dois terços; 3 = mais de dois terços. Soma das duas pálpebras = 0 a 6. Em 236 “normais” de 4 a 98 anos, a correlação idade–meiboscore foi R = 0,428. Isso é norma etária e protocolo de captura. Não é teste diagnóstico de DGM.",
        "A técnica clássica de contato — silhueta por retroiluminação transcutânea com sonda — cobre mal a pálpebra superior e incomoda. A revisão de Pult e Nichols (2012) descreve quatro décadas de técnicas, escalas e relevância diagnóstica. O princípio que cabe é infravermelho de contato versus sem contato, campo e eversão. Não é vitrine de aparelho.",
        "Os critérios de qualidade estão no fulltext de Arita e colaboradores (2014). Excluir fora de foco e campo com dedo. Reflexo forte o software toma por glândula. Área escura em perda extensa exige correção manual. Eversão excessiva faz a área de análise incluir tarso além da zona glandular — indistinguível de dropout ou encurtamento. Dilatação ductal precoce pode aumentar a área medida: a porcentagem isolada subestima o início, não o denuncia. O recorte automático ainda precisa de correção humana; o sistema não é totalmente automático. ImageJ clássico exige o examinador desenhar a região. Software reduz ruído. Não substitui critério de qualidade.",
        "O meiboscore não diagnostica DGM sozinho. Em disfunção obstrutiva versus controle — ambos em torno de 71 anos — Arita e colaboradores (2009) acharam o escore de sintomas com o maior AUC como parâmetro isolado, seguido de margem, meibo-score e tempo de ruptura. A proposta: suspeitar DGM obstrutiva se dois de três (sintomas, margem, meibo-score) forem anormais; “muito provável” se os três. A imagem é um dos três. Não é o ouro.",
        "O relatório da subcomissão de diagnóstico do workshop internacional de DGM (Tomlinson e colaboradores, 2011) é a âncora de que o padrão TFOS nunca foi meiboscore isolado. O corpo do workshop não foi recuperado em fulltext nesta busca. Não se cita cut-off nem frase específica do relatório.",
        "O DEWS III (Wolffsohn e colaboradores, 2025), lido no abstract, confirma o outro lado: a doença do olho seco é sempre sintomática; a meibografia não está no critério diagnóstico. O abstract descreve subclassificação em filme, pálpebra e superfície. É o endereço da imagem, se tanto. Não é recap.",
        "Superior e inferior diferem. Pult, Riede-Pult e Nichols (2012), em 20 participantes, acharam correlação de perda e de ângulo de curvatura entre as pálpebras; a espessura não correlacionou. Perda menor na superior (26,9% versus 32,3%); inferior mais espessa e mais curva. A perda correlacionou com camada lipídica e tempo de ruptura não invasivo. Combinar as duas pálpebras deu melhor AUC para OSDI positivo ou negativo (0,929). É piloto. Não é norma. Continua sendo o argumento para não laudar só a inferior.",
        "A concordância interexaminador do dropout é, no máximo, moderada. Powell, Nichols e Nichols (2012), em 410 mulheres pós-menopausa, acharam acordo observado de 42,8% e kappa ponderado de 0,50 entre exame em tempo real e fotografia; ácinos e debris foram piores (kappa ponderado em torno de 0,23). Dogan e colaboradores (2018), em 30 casos lidos por três clínicos, acharam kappa ponderado moderado a bom na superior (0,52–0,65) e apenas regular a moderado na inferior (0,21–0,53); o tempo de ruptura com fluoresceína correlacionou com perda só na superior. Pult e Riede-Pult (2013) compararam escalas subjetivas de 4 e 5 graus com ImageJ (0–100): o acordo intra e inter foi melhor na escala computadorizada; mesmo assim a variação intra-observador objetiva foi ±17 a 18 pontos percentuais. Meiboscore ordinal é ruidoso. Porcentagem contínua é menos ruidosa. Não é ouro.",
        "Wang e colaboradores (2025) cruzaram, em 227 participantes, um desenho crossover mascarado de dois aparelhos infravermelhos de consultório, meiboscale versus porcentagem por ImageJ. A porcentagem de dropout (C-stat 0,63–0,65) superou a meiboscale (0,55–0,56) para detectar doença do olho seco pelo critério DEWS II — não DEWS III. O corte de Youden foi porcentagem maior que 20% ou meiboscale maior que 1. Kappa inter-aparelho 0,68–0,73; limites de concordância da porcentagem de cerca de −28 a +26 pontos. Não trocar de aparelho no follow-up e chamar de “progressão”. Não adotar esse corte Youden como diagnóstico de DGM no Brasil: o C-stat em torno de 0,63 diz que a imagem é fraca como teste de doença do olho seco — e esse é o ponto, não um defeito a esconder. ImageJ, aqui, é quantificação humana assistida. Não substitui o examinador.",
        "A escala importa. O meiboscore de Arita é 0 a 3 por pálpebra. A meiboscale de Pult é 0 a 4. Misturá-las sem dizer qual é o erro de ficha. Se for ordinal, a escala de 5 graus concordou mais que a de 4. Se for pesquisa ou follow-up, a porcentagem contínua reduz ruído — e ainda oscila.",
        "Função e estrutura. Korb e Blackie (2008) mostraram que o número de glândulas que rendem secreção líquida no cílio inferior correlaciona com sintomas. A distribuição não é uniforme: nasal 3,10 ± 0,15, central 2,14 ± 0,13, temporal 0,27 ± 0,06; 86% dos terços temporais tinham zero glândulas expressáveis versus 6% dos nasais. Amostragem só no terço temporal subestima a função. Kim, Eom e Song (2018) lembram que a classificação de baixo versus alto delivery assume correlação morfologia–função que a clínica não confirma: muitos casos são mistos. Dropout na meibografia não é obstrução. Obstrução não é atrofia.",
        "Uma imagem mente. Swiderska e colaboradores (2024), em 15 participantes, mostraram que após expressão terapêutica o contraste e a razão de comprimento caem e, em 24 horas, voltam ao baseline. A interpretação dos autores: a meibografia captura também atividade acinar — lipídio hiper-reflexivo —, não só “estrutura morta”. Não laudar encurtamento ou atrofia em imagem imediatamente pós-expressão. Não tratar mudança de contraste como ganho ou perda anatômica permanente. Perda de contraste, glândula pouco visível, pode ser artefato, esvaziamento transitório ou aquisição ruim. Não é grau validado.",
        "Lente de contato e idade são normas, não diagnósticos. Arita e colaboradores (2009) compararam 121 usuários de lente com 137 controles, idade em torno de 32 anos. Meiboscore médio 1,72 versus 0,96; o dos usuários aproximava a faixa etária 60–69 anos da população “normal” de 2008. Houve correlação positiva entre duração de uso e meiboscore. Associação transversal não é causalidade: a lente se associa a mais perda visível; o desenho não prova que a lente causa DGM. A perda glandular visível aumenta com a idade em “normais” (Arita e colaboradores, 2008). Um meiboscore 2 em octogenário não é, sozinho, DGM. Não há nomograma etário brasileiro nesta lista. Distorção e dilatação entram na leitura além da área (Arita e colaboradores, 2014; Pult e Nichols, 2012); não se afirma prevalência — o paper clássico não está neste arquivo de quinze.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "A mudança imediata é de recusa. Imagem fora de foco, com reflexo, com dedo no campo, com eversão incompleta ou excessiva: não se lauda. Pede-se nova aquisição. Não chutar meiboscore 2 ou 3 em frame granulado.",
        "Eversão boa versus má: eversão excessiva inclui tarso além da zona glandular, indistinguível de dropout. O atlas mínimo lê dropout, encurtamento, distorção, dilatação e baixo contraste. Meiboscore não é função.",
        "O protocolo mínimo: infravermelho sem contato; eversão reproduzível das duas pálpebras de ambos os olhos; iluminação sem reflexo no tarso; foco no plano das glândulas; registrar pré- ou pós-expressão; follow-up no mesmo aparelho, mesma pálpebra, mesma eversão.",
        "O que ler além do meiboscore: porcentagem de área ou dropout; encurtamento ou truncamento; tortuosidade ou distorção; dilatação — a área pode aumentar no início; contraste ou apagamento, que pode ser esvaziamento, não atrofia; assimetria superior–inferior. Sempre acoplar função: expressibilidade padronizada — não amostrar só o terço temporal — mais qualidade do meibum e margem. Imagem sem expressão é laudo incompleto.",
        "Normas antes de “DGM”: idade; lente de contato e tempo de uso; não comparar aparelhos diferentes. Se a escala for ordinal, preferir 5 graus a 4 e dizer se é Arita 0–3 por pálpebra ou Pult 0–4. Se for pesquisa ou follow-up, porcentagem contínua. Onde a imagem decide: documentar baseline; acompanhar no mesmo sistema; subclassificar o eixo lipídio ou pálpebra. Onde não decide: diagnosticar doença do olho seco; diagnosticar DGM sozinha; “provar” resposta terapêutica em 24 horas.",
      ],
      bullets: [
        "Passo 0. Fora de foco, reflexo, dedo, eversão incompleta ou excessiva: não laudar; repetir a aquisição.",
        "Protocolo. Infravermelho sem contato; duas pálpebras, ambos os olhos; registrar pré- ou pós-expressão.",
        "Além do escore. Dropout, encurtamento, distorção, dilatação, contraste, assimetria superior–inferior.",
        "Função. Expressibilidade ao longo da pálpebra inferior, não só no terço temporal; meibum; margem.",
        "Normas. Idade; lente e tempo de uso; mesmo aparelho no follow-up. Não misturar Arita 0–3 com Pult 0–4.",
        "Onde decide / onde não. Baseline e subclassificação de filme ou pálpebra. Não diagnostica doença do olho seco nem DGM sozinha.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Esta matéria ensina método. Não vende desfecho. Não há ensaio randomizado que teste laudo padronizado contra meiboscore isolado.",
        "Arita 2008 e 2009 são cohorts japonesas de um grupo. Normas etárias e de lente não foram revalidadas no Brasil. Não há nomograma brasileiro nesta lista. Pult 2012 é n = 20; Dogan 2018 é n = 30; Swiderska 2024 é n = 15 — pilotos, não normas. Powell 2012 é só mulheres pós-menopausa; o acordo é foto versus tempo real, não dois clínicos no mesmo exame ao vivo.",
        "Wang e colaboradores (2025) usam critério DEWS II de doença do olho seco, não DEWS III. O C-stat da meibografia é só cerca de 0,63. O corte Youden — porcentagem maior que 20% ou meiboscale maior que 1 — não se adota como corte brasileiro de DGM. O corpo do Tomlinson 2011 não foi recuperado: o PMC devolveu só front matter. Não se inventam frases do workshop. Wolffsohn e colaboradores (2025): claims de meibografia extraídas só do abstract. Não se afirma cut-off de imagem DEWS III.",
        "Perda de contraste como grau, laterality sistemática em olho sem doença unilateral e nomograma etário brasileiro não têm fonte âncora nesta lista. Não há protocolo de aquisição brasileiro validado — eversão, iluminação, qual pálpebra, pré versus pós-expressão — com concordância interobservador em consultório real. Wang e colaboradores (2025) e Swiderska e colaboradores (2024) declaram financiamento de Johnson & Johnson Vision; o caveat de conflito cabe nesta frase, sem transformar o achado em ataque.",
      ],
      bullets: [
        "Não há ensaio randomizado de laudo padronizado versus meiboscore isolado.",
        "Normas etárias e de lente são japonesas; sem nomograma brasileiro.",
        "Pult n = 20; Dogan n = 30; Swiderska n = 15 — pilotos. Powell: só pós-menopausa; foto versus ao vivo.",
        "Wang: DEWS II, C-stat ~0,63; corte Youden não é corte brasileiro de DGM.",
        "Tomlinson: corpo não recuperado. DEWS III: abstract only; meibografia fora do critério diagnóstico.",
        "Sem âncora para perda de contraste como grau, para laterality interocular, para nomograma brasileiro.",
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
      "O meiboscore quantifica perda de área visível. Não mede expressibilidade. Não distingue atrofia de oclusão. Não diagnostica doença do olho seco — e uma foto granulada não autoriza laudar DGM.",
    canonical: "/superficie/artigos/alem-do-meiboscore",
  },
};

const cincoTestesCincoPerguntas: MagazineArticle = {
  slug: "cinco-testes-cinco-perguntas",
  title: "Cinco testes, cinco perguntas",
  subtitle:
    "NIBUT, osmolaridade, coloração, interferometria e MMP-9 — o que cada um mede, e o que não mede",
  excerpt:
    "Cada teste responde a uma pergunta. NIBUT, osmolaridade, coloração, interferometria e MMP-9 não são proxies intercambiáveis de gravidade. A discórdia entre eles é dado, não falha do exame.",
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
        "O consultório ainda trata tempo de ruptura, osmolaridade, coloração, interferometria e MMP-9 como se fossem proxies intercambiáveis de gravidade. Cada um responde a uma pergunta. A discórdia entre eles é dado, não falha do exame. O que se pede aqui é o cardápio: qual constructo, qual corte, quando o custo muda a decisão — sem recap de fenótipo e sem catálogo de aparelho.",
        "Na prática, é tentador somar os números e chamar o maior de “mais grave”. NIBUT mede estabilidade do filme. Osmolaridade mede homeostase e estresse hiperosmolar. Coloração localiza onde o epitélio falhou. Interferometria descreve a camada lipídica. MMP-9 ponto-de-cuidado é bandeira de inflamação. Nenhum deles é escala de gravidade. Nenhum substitui o outro.",
        "O DEWS III (Wolffsohn e colaboradores, 2025) fixou cortes operacionais depois de OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24): NIBUT menor que 10 segundos, ou hiperosmolaridade — ≥ 308 mOsm/L ou diferença interocular maior que 8 —, ou coloração (córnea > 5, ou conjuntiva > 9, ou margem ≥ 2 mm e ≥ 25% da largura). Esses números não validam o teste como escala. Não foram validados como pacote no Brasil. Interferometria e MMP-9 não entram no critério diagnóstico.",
        "NIBUT e FBUT não são intercambiáveis. A fluoresceína desestabiliza o filme. Plataformas automatizadas discordam entre si e têm cortes de Youden diferentes. Osmolaridade não é “DED sim ou não” numa única leitura: Lemp e colaboradores (2011) — estudo financiado pelo fabricante — venderam a “melhor métrica única”; Bunya e colaboradores (2015), independentes, mostraram ruído de sessão que atravessa o intervalo normal–anormal. Coloração não é “quanto inflamado”. Interferometria não diagnostica DGM. MMP-9 não é fenótipo.",
        "O Banco pergunta quando o custo de osmolaridade e MMP-9 se justifica. A literatura não fecha custo-efetividade. O que se pode dizer: o teste justifica-se quando a decisão muda. Não se justifica como screening universal nem como “confirma DED”.",
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
        "A escala NEI de 1995 não tem DOI Crossref e não é citada.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O mapa clássico é o do DEWS II (Wolffsohn e colaboradores, 2017): depois da triagem, tempo de ruptura — de preferência não invasivo —, osmolaridade e coloração de córnea, conjuntiva e margem. Cada teste foi desenhado para um constructo. A subclassificação evaporativo versus aquoso informa manejo; não é o tema desta matéria.",
        "O dicionário de limiares é o DEWS III (Wolffsohn e colaboradores, 2025). NIBUT menor que 10 segundos, ou 308 / Δ 8, ou coloração nos três sítios, após OSDI-6 ≥ 4 na soma 0–24. Interferometria e MMP-9 ficam em subclassificação ou bandeira. Não se reabre aqui o mapa de eixos das pp. 23–28.",
        "NIBUT não é FBUT. Szczesna-Iskander e Llorens-Quintana (2024; n = 33) compararam dois videoceratóscopos automatizados com o tempo de ruptura por fluoresceína, com piscar padronizado. Um NIBUT ficou 0,6 ± 2,6 s mais curto que o FBUT; o outro, 3,3 ± 2,4 s mais longo. Limites de concordância de 26 a 31 segundos. Concordância melhor nos tempos curtos. Não são intercambiáveis.",
        "NIBUT de uma plataforma não é NIBUT de outra. Lim, Wang e Craig (2021; n = 134, critério DEWS II) acharam correlação positiva entre dois sistemas automatizados, mas um deu tempos mais longos e maior variabilidade. Cortes de Youden: ≤ 8 s numa plataforma, ≤ 14 s na outra. AUC comparáveis, acima de 0,65. O corte DEWS III menor que 10 segundos é compromisso operacional, não o Youden de cada aparelho. Não se “corrige” o consenso no texto; o caveat cabe em uma linha.",
        "Osmolaridade: dois números que não se fundem. Tomlinson e colaboradores (2006), em meta-análise, propuseram o referente 316 mOsm/L — sensibilidade 59%, especificidade 94%, acurácia global 89% naquelas amostras. Lemp e colaboradores (2011; n = 314, dez centros, financiamento de fabricante) acharam o corte mais sensível em 308, o mais específico em 315; em 312, sensibilidade 73% e especificidade 92%; AUC 0,89 contra coloração, TBUT, Schirmer e meibômio. A diferença interocular correlacionou com gravidade (r² = 0,32). O 308 do DEWS III é o limiar sensível de Lemp, não o referente de Tomlinson. A frase do estudo de 2011 — “melhor métrica única para diagnosticar e classificar” — é claim do paper, não conclusão desta matéria.",
        "O contrapeso independente é Bunya e colaboradores (2015; n = 37: 18 Sjögren, 11 blefarite, 8 controles). Três medidas por sessão, até três sessões no mesmo dia. Médias 307, 304 e 301 — sem diferença entre grupos. Erro intra-sessão: controles 10,5; blefarite 14,6; Sjögren 15,8 mOsm/L. O intervalo de confiança de uma leitura atravessa o cinza 305–316. A diferença entre sessões em controles chegou a ±34 mOsm/L. Uma leitura no cinza 300–320 não tranquiliza e não condena. Delta visita a visita, se não for de dezenas de mOsm, costuma ser ruído.",
        "Coloração localiza dano. Bron, Evans e Smith (2003) descrevem a escala de Oxford, painéis A–E, com incremento logarítmico de pontos. Fluoresceína para córnea, lisamina para conjuntiva, com filtros; rosa bengala aceitável, não preferido em ensaios. A escala localiza e gradua dano. Não mede gravidade global da doença. Escalas de uso clínico com nomes diferentes — entre elas a chamada escala NEI — não são equivalentes e não se somam. A escala NEI original de 1995 não tem DOI resolvível e não entra como fonte.",
        "O mecanismo importa. Bron e colaboradores (2015) descrevem corantes hidrossolúveis excluídos por tight junctions, membrana e glicocálice. “Erosão pontuada” é, provavelmente, misnomer: entrada transcelular, não micropool. Fluoresceína, de peso molecular menor, espalha; lisamina e rosa bengala ficam mais confinados. Padrão e corante mudam a pergunta. Córnea sem mancha não exclui dano conjuntival ou de margem.",
        "A margem é um sítio. Korb e colaboradores (2010) acharam epiteliopatia do lid wiper em 88% dos sintomáticos versus 16% dos assintomáticos; grau ≥ 2 em 66% versus 2%. O DEWS III inclui coloração de margem no critério. É este o lastro. Não é um “extra” da córnea.",
        "Interferometria mede camada lipídica, não DGM. Finis e colaboradores (2013; 199 olhos) viram correlação entre espessura da camada lipídica e glândulas expressíveis (r = 0,36). Corte ≤ 75 nm: sensibilidade 65,8%, especificidade 63,4% para DGM; ≤ 60 nm: 47,9% e 90,2%. Screening possível. Diagnóstico de DGM, não. Os autores pedem estudos prospectivos. Camada lipídica normal não exclui DGM obstrutiva.",
        "MMP-9 ponto-de-cuidado é bandeira, não fenótipo. Sambursky e colaboradores (2013; n = 206) reportaram sensibilidade 85% e especificidade 94% contra avaliação clínica — OSDI, Schirmer, TBUT, coloração — não contra gold standard independente. Ensaio com apoio da fabricante. O limiar operacional do teste é da ordem de 40 ng/mL. Lanza, Valenzuela, Perez e Galor (2016) lembram que inflamação é componente, mas nem todo olho seco tem inflamação mensurável e nem todo positivo responde a anti-inflamatório. Nenhum teste de screening prediz curso ou resposta. MMP-9 pode ajudar a escolher terapia quando a clínica é ambígua. Não define fenótipo inflamatório “puro”.",
        "O único paper que tenta “quando muda a conduta” é Sambursky (2016; n = 100, retrospectivo, mesmo autor do teste). Positivos receberam anti-inflamatório mais ômega-3 e lágrima; negativos, só ômega-3 e lágrima. Melhora de pelo menos 50% em 85% versus 86%. Os braços andam iguais. Conversão de positivo para negativo em 54%. Não demonstra que o teste muda desfecho. Evidência fraca para “o custo se justifica”.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Cinco perguntas. Uma caixa de custo. Sem escada prescritiva.",
        "NIBUT: o filme é estável? Não “quão grave”. Preferir não invasivo. Reportar a plataforma e se é a primeira ruptura ou a média. Não converter FBUT em NIBUT nem o inverso. Se só houver FBUT: volume mínimo de fluoresceína, cronometrar, não chamar de NIBUT. Corte operacional DEWS III: menor que 10 segundos. Duas plataformas automatizadas no mesmo recorte de literatura têm Youden em ≤ 8 s e ≤ 14 s — caveat, não correção do consenso.",
        "Osmolaridade: há estresse hiperosmolar, perda de homeostase? Ler o pior olho e o delta interocular. ≥ 308 ou Δ > 8 é signo DEWS III, não gravidade. Uma leitura isolada no cinza 300–320 não decide. Repetir na mesma sessão se a decisão depende do número. Não usar para “monitorar terapia” visita a visita sem delta grande.",
        "Colorações: onde o epitélio falhou? Fluoresceína, córnea. Lisamina, conjuntiva e margem. Rosa bengala: histórico, sicca, irrita; não é primeira linha. Oxford para documentar evolução. Não somar escalas. Margem ≥ 2 mm e ≥ 25% e lid wiper são o sítio que o leitor esquece.",
        "Interferometria: a camada lipídica é fina ou pobre? Não “é DGM”. Camada baixa mais poucas glândulas expressíveis aumenta probabilidade. Camada normal não exclui obstrução. Sem atlas de marcas. Sem ponte para meibografia.",
        "MMP-9: há bandeira de inflamação agora? Positivo: considera anti-inflamatório, adia plug, cuida o timing pré-cirurgia se isso muda a data. Negativo: não é “sem DED” e não proíbe anti-inflamatório se a clínica pedir. Não repetir como follow-up de gravidade.",
        "Cinco perguntas — estabilidade, homeostase, sítio de dano, camada lipídica, bandeira inflamatória — e uma caixa: o custo só se justifica se a decisão muda.",
        "Quando o custo se justifica — evidência fraca a moderada, lógica de decisão. Justifica: discórdia sintomas/sinais e a pergunta é homeostase (osmolaridade, Δ interocular); decisão de iniciar ou escalar anti-inflamatório versus só lágrima quando a clínica é ambígua (MMP-9 como bandeira); pré-cirurgia de superfície se o resultado muda o timing. Não justifica: screening de todo sintomático; “confirmar DED” quando NIBUT ou coloração já fecham DEWS III; monitorar visita a visita; substituir o exame clínico. Não há estudo de custo-efetividade brasileiro até 15 de agosto de 2026.",
      ],
      bullets: [
        "NIBUT. Estabilidade. < 10 s é compromisso. Não converter em FBUT.",
        "Osmolaridade. Homeostase. 308 ou Δ > 8; 316 é outro referente. Uma leitura no cinza não decide.",
        "Coloração. Sítio. Fluoresceína ≠ lisamina ≠ margem. Oxford, uma escala.",
        "Interferometria. Camada lipídica. Não diagnostica DGM.",
        "MMP-9. Bandeira. Não fenótipo. Não exclui DED se negativo.",
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
        "A escala NEI de 1995 não é citável — sem DOI no Crossref. van Bijsterveld 1969 não foi numerado e não é gold standard paralelo ao Oxford. Preço, registro e disponibilidade ficam de fora: esta matéria não é catálogo.",
      ],
      bullets: [
        "Não há RCT de cardápio versus exame usual.",
        "Não há custo-efetividade brasileira.",
        "308 não é 316.",
        "“Melhor métrica única” é claim de estudo financiado, não desta revista.",
        "MMP-9 não muda desfecho no único paper que tentou mostrar isso.",
        "Cortes DEWS III não validados no Brasil.",
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
  tags: ["NIBUT", "osmolaridade", "coloração", "interferometria", "MMP-9"],
  seo: {
    title: "Cinco testes, cinco perguntas | SUPERFÍCIE",
    description:
      "Cada teste responde a uma pergunta. NIBUT, osmolaridade, coloração, interferometria e MMP-9 não são proxies intercambiáveis de gravidade. A discórdia entre eles é dado, não falha do exame.",
    canonical: "/superficie/artigos/cinco-testes-cinco-perguntas",
  },
};

const aPregaOAtritoEOpiscar: MagazineArticle = {
  slug: "a-prega-o-atrito-e-o-piscar",
  title: "A prega, o atrito e o piscar",
  subtitle: "Olho seco mecânico: CCh mimetiza DED, não é DED",
  excerpt:
    "Conjuntivocálase mimetiza doença do olho seco. Coexiste com ela. Não é ela. Irritação, epífora e tempo de ruptura curto na córnea inferior pedem desalinhamento e piscar — não só outra lágrima.",
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
        "O work-up filme-cêntrico — tempo de ruptura, osmolaridade, coloração corneana — organiza a ficha. Não fecha o paciente cuja prega invade o menisco, cujo lid wiper está marcado e cujo filme “normal” não explica a queixa. O DEWS III (Wolffsohn e colaboradores, 2025) já formalizou o endereço: desalinhamento anatômico no bloco superfície, piscar e fechamento no bloco pálpebra. O eixo mecânico não é opinião editorial. É subclasse.",
        "Conjuntivocálase é comum, etária e frequentemente lida como “senil normal”. Meller e Tseng (1998) descreviam o espectro: no leve, irritação e instabilidade; no moderado, obstáculo ao outflow; no grave, exposição. Mimura e colaboradores (2009), em série hospitalar de 1.416 pessoas, viram prevalência subir de 6,8% na primeira década para 90,2% entre 41 e 50 anos e quase universal depois dos 60. O achado é frequente. A atribuição causal — esta prega, neste sítio, explica este sintoma — é que é rara. Operar imagem não é tratar.",
        "CCh mimetiza e coexiste. Irritação, epífora, TBUT curto. Yokoi e colaboradores (2005) operaram 168 olhos com CCh proeminente no menisco, sintoma não controlado por colírio: 50 tinham DED, 118 não. A cirurgia melhorou o sintoma-chefe em 88% sem DED e 78% com DED. Inflamação da prega, na imunohistoquímica daquele n pequeno, era desprezível frente a úlcera de Mooren ou penfigoide. O driver é mecânico. Escalar ciclosporina porque “a prega está inflamada” é o eixo errado.",
        "Há três sinais que o consultório mistura. LWE — epiteliopatia do lid wiper — marca atrito quando o filme é “normal”. LIPCOF — pregas lid-paralelas — prediz sintoma e não é CCh. CCh é redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir os três na lâmpada é o gesto. Tratar LIPCOF com higiene de margem é outro artigo. Higiene palpebral não trata CCh.",
        "Piscar incompleto em tela aproximadamente dobra o intervalo interpiscar na córnea inferior (McMonnies, 2007). Floppy eyelid e lagoftalmo noturno são fenocópias de exposição. Mapear. Não abrir neuro-oftalmo.",
        "A sobreposição com DGM cabe em uma frase. Vu e colaboradores (2018) mostraram que doença relacionada a atrito — SLK, CCh, LWE — encurta TBUT independentemente do subtipo aquoso ou short-TBUT, e que DGM faz o mesmo. Os eixos convivem. Não se absorve aqui a biologia da glândula.",
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
        "Höh (1995) e Hirotani (2003) não têm DOI Crossref e não são citados.",
      ],
    },
    {
      id: "evidencia",
      title: "Evidência",
      kind: "evidence",
      paragraphs: [
        "O gancho é o DEWS III. Wolffsohn e colaboradores (2025) definem DED como doença multifatorial sempre sintomática: screening OSDI-6 ≥ 4 na soma bruta dos 6 itens (escala 0–24) mais um signo de homeostase. A subclassificação tem três blocos. Filme: lipídio, aquoso, mucina. Pálpebra: piscar e fechamento, margem. Superfície: desalinhamento anatômico, neural, dano celular, inflamação primária. Desalinhamento e dinâmica palpebral já estão no mapa. Não se reabre o recap do workshop. Não se refaz a bateria de testes das pp. 33–36.",
        "A definição clássica é de Meller e Tseng (1998). CCh é conjuntiva redundante, tipicamente entre o globo e a pálpebra inferior, frequentemente ignorada como mudança senil. Espectro: agrava olho seco no leve; perturba o outflow no moderado; exposição no grave. Lubrificantes tópicos podem ser tentados e frequentemente falham; excisão pode ser necessária. Os autores propõem um sistema de gradação e uma fisiopatologia hipotética centrada na dinâmica lacrimal. Marco de classificação. Não prova de que toda prega é doença.",
        "Mimura e colaboradores (2009) aplicaram essa gradação em nasal, médio e temporal, n = 1.416, 1 a 94 anos, prospectivo hospitalar. Prevalência sobe com a idade. Grau médio maior em mulheres. Temporal pior que nasal. Mudança ao olhar para baixo e à pressão digital, e ceratite pontuada, aumentam com a idade e correlacionam com gravidade, sobretudo da conjuntiva média. CCh é etária e assimétrica por sítio. Temporal não é nasal. Série hospitalar japonesa: não é prevalência populacional brasileira. “Quase universal após 60” não autoriza operar todo idoso.",
        "Yokoi e colaboradores (2005) dão o impacto clínico. Cento e sessenta e oito olhos, 131 pacientes, CCh proeminente no menisco inferior, sintoma não controlado por colírio. Cinquenta olhos com DED, 118 sem. Sintoma-chefe: irritação (51,7% sem DED; 80% com DED) e lacrimejamento (31,4% sem DED). Melhora do sintoma-chefe em 88,2% sem DED e 78,0% com DED após cirurgia. No grupo com DED, escores de fluoresceína caíram. Imunohistoquímica em n pequeno: CCh e conjuntiva normal com inflamação desprezível frente a conjuntiva inflamada. Claim: CCh causa sintomas e dano de superfície mesmo sem DED clássica. Coexistir com DED não a torna “só DED”. Inflamação da prega não é o driver. Série sem braço controle. A técnica “nova” dos autores não entra aqui; entra o desfecho.",
        "Marmalidou, Kheirkhah e Dana (2018) sintetizam a doença. Pregas redundantes, tipicamente conjuntiva bulbar inferior bilateral. Causa comum de irritação no idoso, frequentemente ignorada. Fator de risco principal: envelhecimento. Sintomas via instabilidade do filme e/ou clearance tardio. Patogênese em aberto: conjuntiva envelhecida, filme instável, atrito mecânico, inflamação de superfície, clearance tardio. Histologia contraditória — alguns estudos com estrutura microscópica normal. Tratamento médico: lubrificação e anti-inflamatório. Refratário: cirurgia. CCh é entidade própria que se associa a DED. Não é sinônimo.",
        "LWE é o marcador de atrito quando o filme “não explica”. Korb e colaboradores (2005) compararam 50 sintomáticos e 50 assintomáticos, todos com FBUT ≥ 10 s, Schirmer ≥ 10 mm, sem coloração corneana. Lid wiper: a conjuntiva marginal da pálpebra superior que varre a superfície no piscar. LWE — fluoresceína mais rosa bengala, grau 0–3 — em 76% dos sintomáticos (44% grau 1, 22% grau 2, 10% grau 3) versus 12% dos assintomáticos (8% grau 1, 4% grau 2, nenhum grau 3). LWE explica sintomas com work-up filme-cêntrico “normal”. Não é ouro: nem todos os estudos replicam a associação com a mesma força. Não se reusa aqui o paper de 2010, que já entrou nas pp. 33–36 como sítio de coloração de margem. A pergunta desta matéria é atrito.",
        "LIPCOF prediz sintoma e não diagnostica CCh. Pult e Bandlitz (2018; n = 148, três centros, idade média 37 anos) viram LIPCOF temporal, nasal e Soma correlacionar com OSDI e NIKBUT. AUC da Soma: 0,771 para sintomático (OSDI ≥ 15) e 0,798 para o compósito OSDI ≥ 15 mais NIKBUT ≤ 9 s. Sinal útil de atrito e sicca. Não é diagnóstico de CCh. A escala original dos anos 1990 não tem DOI resolvível e não entra como fonte.",
        "LIPCOF e CCh são entidades distintas. Ballesteros-Sánchez e colaboradores (2024), em revisão de 26 estudos (2009–2023), pedem lâmpada de fenda para distinguir. Ambos associam-se a sintomas de DED em usuários e não-usuários de lente. Lubrificante reduz LIPCOF em não-usuários. Hipóteses de terapia de margem em usuários de lente ficam no outro artigo — higiene, Demodex, procedimentos de margem. Cirurgia é o que elimina CCh quando o médico falha. Não há critério operacional único validado — altura, número de pregas, invasão do menisco, OCT. A distinção é clínica.",
        "O modelo que liga os sinais à força, não à glândula, é o de Pult e colaboradores (2015). No sujeito saudável, o coeficiente de atrito da superfície se comporta como brushes poliméricos hidrofílicos em baixa velocidade; em alta velocidade, um filme fluido protege. No olho seco, falha o regime de filme completo: cisalhamento, deformação, wear do par pálpebra–globo. Liga LWE e LIPCOF a mecânica. Modelo. Não ensaio. Coeficiente de atrito de pálpebra humana não se mede no consultório.",
        "Piscar incompleto muda a exposição. McMonnies (2007) associa piscar incompleto a ceratopatia de exposição — inclusive pós-LASIK — e a LWE. Na córnea ou lente inferior, um piscar incompleto aproximadamente dobra o intervalo interpiscar e o tempo de evaporação. Piora em computador e leitura, quando a taxa de piscar cai. Distribuição inadequada de aquoso, muco e lipídio. Osmolaridade sobe com evaporação. O autor propõe exercício de eficiência de piscar mais lubrificante. Review, não RCT. Suficiente para mapear o fenótipo de tela e exposição. Não abre VII par, EMG nem capítulo de paralisia.",
        "O algoritmo de manejo é o de Marmalidou e colaboradores (2019). CCh assintomática: observar. Sintomática: primeiro lubrificação e, se houver outro eixo inflamatório, anti-inflamatório. Refratário: cirurgia. As vias mais usadas: cauterização e excisão com ou sem membrana amniótica. Há ainda fixação escleral, ligadura, laser, radiofrequência — taxas variáveis, sem RCT comparativo grande com desfecho funcional padronizado. Uma linha cada. Sem atlas. Sem nome de técnica proprietária.",
        "O lastro do lubrificante viscoso é fraco e precisa ser dito assim. Kiss e Németh (2015; n = 20, aberto, autocontrolado) usaram lágrima com glicerol isotônico e hialuronato 0,015%. LIPCOF médio 2,9 para 1,4 em três meses; TFBUT ganhou cerca de 1 segundo; Oxford 1,3–1,4 para 0,2–0,3; OSDI 36 para 16. Lubrificante viscoso pode reduzir grau de prega e sintoma o bastante para adiar cirurgia. Sem máscara, sem controle, n pequeno, produto nomeado no título do paper — a marca não entra aqui. E o desfecho é LIPCOF, não CCh volumétrica de Meller. Extrapolar “lágrima desincha CCh grau 3” é overclaim.",
        "A coexistência com DGM está em Vu e colaboradores (2018; n = 449, DECS-J, 86% mulheres). FRD — friction-related disease — = SLK + CCh + LWE. DGM encurtou TBUT (1,97 versus 2,94 s) em ADDE e em short-TBUT. ADDE com FRD: TBUT 2,08 versus 2,92 s sem FRD. Atrito e DGM coexistem e ambos encurtam TBUT. Não é “ou DGM ou mecânico”. Transversal, maioria mulher japonesa. Associação, não causalidade. Sem biologia da glândula.",
        "Floppy eyelid é fenocópia. Salinas e colaboradores (2020) descrevem hiperlaxidade palpebral com conjuntivite papilar reativa, eversão fácil, irritação crônica; associações com ceratocone e apneia obstrutiva. Conservador: lubrificação agressiva, proteção noturna, não dormir sobre o olho afetado. CPAP prolongado pode melhorar sinais se houver AOS — associação de review, não indicação desta matéria para diagnosticar apneia nem prescrever CPAP como terapia de olho seco. Cirurgia de encurtamento se refratário. O leitor deve everter a pálpebra e perguntar sono. Sem atlas de blefaroplastia.",
      ],
    },
    {
      id: "pratica",
      title: "Prática",
      kind: "practice",
      paragraphs: [
        "Começar do gancho DEWS III, não do filme. Se o OSDI-6 fecha DED e o filme não explica — ou o filme é instável só inferior —, olhar pálpebra (piscar, fechamento) e superfície (desalinhamento). Não repetir a bateria das pp. 33–36. Não reabrir os cinco eixos das pp. 23–28.",
        "CCh: ver e graduar, não só “tem prega”. Três sítios — nasal, médio, temporal. Altura versus menisco. Mudança ao olhar para baixo e à pressão digital. Temporal costuma ser pior. Prega no menisco mais epífora: pensar obstáculo ao outflow, não lacrimejamento emocional. Prega etária é comum; a pergunta é se esta prega, neste sítio, com esta dinâmica, explica este sintoma.",
        "CCh versus DED. Podem coexistir. Irritação ou epífora com prega óbvia e filme já tratado é CCh sintomática, não “DED refratária”. Inflamação da prega é desprezível no lastro que se tem. Não escalar imunomodulador por causa da CCh. Anti-inflamatório só se outro eixo pedir.",
        "LWE. Fluoresceína mais lisamina ou rosa bengala na margem posterior da pálpebra superior — e inferior se quiser. Grau ≥ 2 com filme “normal” aponta atrito. Não relatar só a córnea. Não vender LWE como ouro.",
        "LIPCOF não é CCh. LIPCOF: prega lid-paralela temporal e nasal, escala 0–3, preditor de sintoma. CCh: redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir na lâmpada. Não tratar LIPCOF com higiene de margem nesta matéria. Higiene palpebral trata margem e Demodex — pp. 45–48. Não trata redundância conjuntival.",
        "Snap-back e laxidade. Puxar a pálpebra inferior e ver o retorno. Manobra de consultório. Sem paper âncora com DOI nesta lista: descrever como exame, não como escala validada, sem cutoff inventado. Laxidade extrema mais eversão fácil: pensar FES. Perguntar sono. Everter.",
        "Piscar. Observar completeza, não só taxa. Tela e leitura: intervalo inferior dobrado se o piscar for incompleto. Lagoftalmo noturno e FES: fenocópia de exposição. Uma pergunta de sono e um relógio de piscar. Sem EMG. Sem capítulo de VII par.",
        "Médico primeiro. Lubrificante viscoso — glicerol e hialuronato como classe, não marca. Pode reduzir grau de prega e sintoma o bastante para adiar cirurgia; a evidência é n = 20, aberta, e mede LIPCOF. Higiene palpebral não é o tratamento da CCh. Anti-inflamatório só se houver outro eixo.",
        "Cirurgia quando o sintoma e a topografia batem e o médico falhou. Prega no menisco, exposição, epífora mecânica, depois de lubrificante viscoso. Cauterização no volume menor; ressecção com ou sem amniótica no volume maior. Uma linha cada. Sem atlas. Sem técnica proprietária. Sem operar imagem.",
        "Coexistência com DGM. Se houver DGM e doença de atrito, o TBUT fica mais curto. Tratar os dois eixos. Não absorver a matéria molecular da glândula.",
        "Três blocos DEWS III — filme, pálpebra (piscar e fechamento) e superfície (desalinhamento) — alimentam CCh (sítio e grau), LWE, LIPCOF e dinâmica (piscar incompleto, FES, lagoftalmo). Médico primeiro; cirurgia se o sintoma concordar e o tratamento médico falhar.",
      ],
      bullets: [
        "Gancho. OSDI-6 fecha e o filme não explica: olhar desalinhamento e piscar.",
        "CCh. Nasal, médio, temporal. Dinâmica. Atribuição causal, não prevalência.",
        "CCh ≠ DED. Mimetiza e coexiste. Não escalar imunomodulador pela prega.",
        "LWE. Margem superior. Atrito quando o filme é “normal”.",
        "LIPCOF ≠ CCh. Lâmpada de fenda. Sem higiene como tratamento de CCh.",
        "Piscar e FES. Completeza. Sono. Exposição. Mapear, não neuro-oftalmo.",
        "Médico. Lubrificante viscoso. Higiene não trata CCh.",
        "Cirurgia. Sintoma + topografia + falha médica. Sem atlas.",
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações",
      kind: "limitations",
      paragraphs: [
        "Não há ensaio que teste “fenótipo mecânico versus escalada por filme” com desfecho de paciente. Não há RCT grande de cauterização versus ressecção versus amniótica versus lubrificante viscoso com desfecho funcional padronizado. Não há prevalência brasileira de CCh, LWE ou LIPCOF até 15 de agosto de 2026. Mimura é hospitalar japonês. Pult 2018 é europeu e relativamente jovem.",
        "Yokoi 2005 é série cirúrgica sem controle; a imunohistoquímica tem n de um dígito. Meller e Tseng 1998 é review mais hipótese, não validação prospectiva da escala. A escala original de LIPCOF dos anos 1990 e o paper japonês de 2003 sobre junção mucocutânea existem no PubMed e não são citáveis — DOI Crossref irresolvível. Snap-back não tem paper âncora com DOI nesta lista.",
        "Kiss 2015: n = 20, sem máscara, sem controle, produto nomeado; mede LIPCOF, não CCh volumétrica. Marmalidou 2018 e 2019 são reviews. Pult 2015 é modelo tribológico. McMonnies 2007 é review; exercício de piscar não tem RCT de desfecho nesta lista. Vu 2018 é transversal. Salinas 2020 é review de FES: a matéria não diagnostica AOS nem indica CPAP como terapia de olho seco.",
        "A distinção LIPCOF versus CCh é pedida e não tem critério operacional único validado. Atribuição causal CCh → sintoma continua clínica: topografia, dinâmica, falha do filme. Prega etária é comum; operar por imagem é overtreatment. O corpo completo do DEWS III Diagnostic não está em PMC: a subclassificação desta matéria limita-se ao que o abstract deposita. LWE não é ouro em toda a literatura.",
      ],
      bullets: [
        "Sem RCT de fenótipo mecânico versus filme.",
        "Sem prevalência brasileira.",
        "Sem DOI para a escala original de LIPCOF nem para o paper de 2003 da junção mucocutânea — não citados.",
        "Snap-back é manobra, não escala.",
        "Lubrificante viscoso: evidência fraca, e o paper mede LIPCOF.",
        "Sem atlas. Sem higiene como tratamento de CCh.",
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
  tags: ["Conjuntivocálase", "LWE", "LIPCOF", "olho seco mecânico", "atrito"],
  seo: {
    title: "A prega, o atrito e o piscar | SUPERFÍCIE",
    description:
      "Conjuntivocálase mimetiza doença do olho seco. Coexiste com ela. Não é ela. Irritação, epífora e tempo de ruptura curto na córnea inferior pedem desalinhamento e piscar — não só outra lágrima.",
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
