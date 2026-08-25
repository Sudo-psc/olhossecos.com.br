import { books } from "./books.ts";
import { glossaryTerms } from "./glossary.ts";
import { guides } from "./guides.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { publishedArticles } from "./superficie.ts";

export interface PortalSearchEntry {
  href: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
}

export type UnifiedSearchType =
  "portal" | "guia" | "artigo" | "radar" | "livro" | "glossario";

export interface UnifiedSearchItem {
  type: UnifiedSearchType;
  typeLabel: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
  tags: string[];
}

export const portalPages: PortalSearchEntry[] = [
  {
    href: "/olho-seco",
    category: "Fundamentos",
    title: "O que é olho seco?",
    description:
      "Entenda o filme lacrimal, os mecanismos da doença e os tipos mais comuns.",
    tags: ["começar", "definição", "filme lacrimal", "evaporativo", "aquoso"],
  },
  {
    href: "/sintomas",
    category: "Sintomas",
    title: "Sintomas de olho seco",
    description:
      "Ardor, areia, lacrimejamento, visão oscilante e padrões que ajudam a contar a história.",
    tags: [
      "ardência",
      "queimação",
      "vermelhidão",
      "lacrimejamento",
      "epífora",
      "olhos aguados",
      "lacrimejamento reflexo",
      "vias lacrimais",
      "visão embaçada",
    ],
  },
  {
    href: "/causas",
    category: "Entenda",
    title: "Causas e fatores associados",
    description:
      "Ambiente, pálpebras, baixa produção de lágrimas, medicamentos e condições sistêmicas.",
    tags: [
      "meibomius",
      "sjögren",
      "rosácea",
      "medicamentos",
      "lentes de contato",
      "conjuntivocálase",
      "conjunctivochalasis",
      "olho seco mecânico",
      "atrito",
    ],
  },
  {
    href: "/diagnostico",
    category: "Investigação",
    title: "Como o olho seco é investigado",
    description:
      "História dos sintomas, observação das pálpebras, lágrimas e testes possíveis.",
    tags: [
      "diagnóstico",
      "exames",
      "testes",
      "osmolaridade",
      "meibografia",
      "AS-OCT",
      "OCT do segmento anterior",
      "menisco lacrimal",
      "epífora",
      "vias lacrimais",
      "ponto lacrimal",
      "canalículos",
      "saco lacrimal",
      "ducto nasolacrimal",
      "irrigação lacrimal",
      "sondagem",
      "teste de desaparecimento da fluoresceína",
      "dacriocistografia",
      "dacriocintilografia",
      "glândulas de Meibomius",
      "conjuntivocálase",
      "olho seco mecânico",
    ],
  },
  {
    href: "/autocuidado",
    category: "Vida diária",
    title: "Autocuidado no dia a dia",
    description:
      "Mudanças de baixo risco para ambiente, telas, piscadas, pálpebras e produtos oculares.",
    tags: ["telas", "pausas", "ambiente", "higiene", "piscadas", "20-20-20"],
  },
  {
    href: "/tratamentos",
    category: "Tratamentos",
    title: "Entendendo os tratamentos",
    description:
      "Um mapa educativo das opções, organizado por objetivo e mecanismo.",
    tags: [
      "lubrificantes",
      "gotas",
      "inflamação",
      "lentes esclerais",
      "tratamento",
      "luz intensa pulsada",
      "IPL",
      "disfunção das glândulas de Meibomius",
    ],
  },
  {
    href: "/sinais-de-alerta",
    category: "Segurança",
    title: "Sinais de alerta",
    description:
      "Dor intensa, mudança visual, trauma, produto químico e outros sinais que não devem esperar.",
    tags: ["urgência", "dor", "trauma", "visão", "produto químico"],
  },
  {
    href: "/glossario",
    category: "Referência",
    title: "Glossário do olho seco",
    description:
      "Explicações simples para os termos usados em conteúdos e avaliações.",
    tags: [
      "termos",
      "dicionário",
      "significado",
      "definições",
      "meibografia",
      "AS-OCT",
      "luz intensa pulsada",
      "IPL",
      "epífora",
      "vias lacrimais",
      "canalículos",
      "ducto nasolacrimal",
      "irrigação lacrimal",
      "conjuntivocálase",
      "olho seco mecânico",
    ],
  },
  {
    href: "/politica-de-correcao",
    category: "Transparência",
    title: "Correção e retratação no olho seco",
    description:
      "Como o portal corrige, atualiza ou retrata conteúdo, com data visível e sem apagar o contexto.",
    tags: ["correção", "retratação", "política", "transparência"],
  },
  {
    href: "/fontes",
    category: "Transparência",
    title: "Fontes e revisão",
    description:
      "Consensos, instituições públicas e associações de pacientes usados pelo portal.",
    tags: ["referências", "evidências", "TFOS", "DEWS III", "revisão"],
  },
  {
    href: "/profissionais",
    category: "Profissional",
    title: "Área para profissionais",
    description:
      "Diagnóstico multimodal, fenotipagem, imagem, tecnologias e evidências contemporâneas.",
    tags: ["profissionais", "médicos", "oftalmologia", "nibut", "osmolaridade"],
  },
  {
    href: "/app",
    category: "Ferramenta",
    title: "Dry Eye Widget",
    description:
      "Lembretes ajustáveis para pausas, olhar para longe e perceber as piscadas durante o uso de telas.",
    tags: ["aplicativo", "widget", "telas", "pausas", "piscadas", "20-20-20"],
  },
  {
    href: "/ferramentas",
    category: "Ferramenta",
    title: "Ferramentas de olho seco",
    description:
      "DEQ-5 e diário de sintomas no navegador, sem cadastro e sem envio de dados.",
    tags: ["deq-5", "diário", "questionário", "sintomas", "ferramentas"],
  },
  {
    href: "/ferramentas/deq-5",
    category: "Ferramenta",
    title: "DEQ-5: sintomas de olho seco",
    description:
      "Cinco perguntas do DEQ-5 só neste navegador, com escore e PDF para a consulta.",
    tags: ["deq-5", "questionário", "sintomas", "escore"],
  },
  {
    href: "/ferramentas/diario",
    category: "Ferramenta",
    title: "Diário de 14 dias do olho seco",
    description:
      "Registro diário neste navegador, exportável em PDF e CSV, com botão para apagar tudo.",
    tags: ["diário", "sintomas", "registro", "14 dias"],
  },
  {
    href: "/paciente",
    category: "Ferramenta",
    title: "Paciente: ferramentas de olho seco",
    description:
      "Atalhos para o DEQ-5, o diário de 14 dias e o Dry Eye Widget.",
    tags: ["paciente", "ferramentas", "deq-5", "diário", "widget"],
  },
];

export const normalizeSearchText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const getUnifiedSearchIndex = (): UnifiedSearchItem[] => {
  const portalItems: UnifiedSearchItem[] = portalPages.map((page) => ({
    type: "portal",
    typeLabel: "Portal",
    title: page.title,
    description: page.description,
    href: page.href,
    meta: page.category,
    tags: page.tags,
  }));

  const guideItems: UnifiedSearchItem[] = guides.map((guide) => ({
    type: "guia",
    typeLabel: "Guia",
    title: guide.title,
    description: guide.description,
    href: `/guias/${guide.slug}`,
    meta: `${guide.category} • ${guide.readingTime}`,
    tags: guide.tags,
  }));

  const articleItems: UnifiedSearchItem[] = publishedArticles.map(
    (article) => ({
      type: "artigo",
      typeLabel: "SUPERFÍCIE",
      title: article.title,
      description: article.excerpt,
      href: `/superficie/artigos/${article.slug}`,
      meta: `Revista • ${article.category}`,
      tags: article.tags,
    }),
  );

  const bookItems: UnifiedSearchItem[] = books.map((book) => ({
    type: "livro",
    typeLabel: "Livro",
    title: book.title,
    description: book.subtitle || book.description,
    href: `/livros/${book.slug}`,
    meta: `Livro • ${book.year}`,
    tags: book.topics,
  }));

  const glossaryItems: UnifiedSearchItem[] = glossaryTerms.map((term) => ({
    type: "glossario",
    typeLabel: "Glossário",
    title: term.term,
    description: term.shortDefinition,
    href: `/glossario#${term.slug}`,
    meta: term.category || "Termo",
    tags: term.aliases || [],
  }));

  const radarItems: UnifiedSearchItem[] = radarReports.map((report) => ({
    type: "radar",
    typeLabel: "RADAR",
    title: report.title,
    description: report.executiveSummary,
    href: getRadarReportPath(report),
    meta: `RADAR Científico • ${report.label}`,
    tags: [
      "radar",
      "evidência",
      report.label,
      ...report.findings.map((finding) => finding.section),
    ],
  }));

  return [
    ...portalItems,
    ...guideItems,
    ...articleItems,
    ...radarItems,
    ...glossaryItems,
    ...bookItems,
  ];
};

const calculateSearchScore = (
  item: UnifiedSearchItem,
  queryNorm: string,
  tokens: string[],
): number => {
  const titleNorm = normalizeSearchText(item.title);
  const descNorm = normalizeSearchText(item.description);
  const tagsNorm = item.tags.map((t) => normalizeSearchText(t)).join(" ");
  const metaNorm = normalizeSearchText(item.meta || "");

  let score = 0;

  if (titleNorm === queryNorm) score += 100;
  else if (titleNorm.startsWith(queryNorm)) score += 60;
  else if (titleNorm.includes(queryNorm)) score += 40;

  if (tagsNorm.includes(queryNorm)) score += 30;
  if (descNorm.includes(queryNorm)) score += 20;
  if (metaNorm.includes(queryNorm)) score += 10;

  const allTokensMatch = tokens.every(
    (tok) =>
      titleNorm.includes(tok) ||
      descNorm.includes(tok) ||
      tagsNorm.includes(tok) ||
      metaNorm.includes(tok),
  );

  if (
    !allTokensMatch &&
    !titleNorm.includes(queryNorm) &&
    !tagsNorm.includes(queryNorm)
  ) {
    return 0;
  }

  for (const tok of tokens) {
    if (titleNorm.includes(tok)) score += 15;
    if (tagsNorm.includes(tok)) score += 10;
    if (descNorm.includes(tok)) score += 5;
  }

  return score;
};

export const searchUnified = (
  query: string,
  limit = 20,
): UnifiedSearchItem[] => {
  const queryNorm = normalizeSearchText(query);
  if (!queryNorm) return [];

  const tokens = queryNorm.split(/\s+/u).filter((t) => t.length > 1);
  const index = getUnifiedSearchIndex();

  const scored = index
    .map((item) => ({
      item,
      score: calculateSearchScore(
        item,
        queryNorm,
        tokens.length ? tokens : [queryNorm],
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title),
    );

  return scored.slice(0, limit).map(({ item }) => item);
};
