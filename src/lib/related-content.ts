import { guides, type Guide } from "./guides.ts";
import {
  getMagazineArticlePath,
  publishedArticles,
  selectRelatedArticles,
  type MagazineArticle,
} from "./superficie.ts";

export type RelatedContentType = "article" | "guide" | "page";

export interface RelatedContent {
  type: RelatedContentType;
  href: string;
  label: string;
  title: string;
  description: string;
}

interface PortalContent extends RelatedContent {
  type: "page";
}

type RelatedContentRef =
  `article:${string}` | `guide:${string}` | `page:${string}`;

const portalContent: Record<string, PortalContent> = {
  "/olho-seco": {
    type: "page",
    href: "/olho-seco",
    label: "Portal · Fundamento",
    title: "Olho seco: o que é e por onde começar",
    description:
      "A visão geral do portal sobre a doença multifatorial da superfície ocular e seus principais mecanismos.",
  },
  "/sintomas": {
    type: "page",
    href: "/sintomas",
    label: "Portal · Sintomas",
    title: "Sintomas de olho seco",
    description:
      "Padrões de ardor, sensação de areia, visão oscilante, lacrimejamento e desconforto que merecem contexto.",
  },
  "/causas": {
    type: "page",
    href: "/causas",
    label: "Portal · Causas",
    title: "Causas e mecanismos do olho seco",
    description:
      "Como evaporação, produção aquosa, pálpebras, inflamação e outros fatores podem participar do quadro.",
  },
  "/causas#evaporacao": {
    type: "page",
    href: "/causas#evaporacao",
    label: "Portal · Mecanismo",
    title: "Glândulas de Meibomius e evaporação",
    description:
      "O papel da camada lipídica, das glândulas palpebrais e da evaporação na estabilidade do filme lacrimal.",
  },
  "/diagnostico": {
    type: "page",
    href: "/diagnostico",
    label: "Portal · Diagnóstico",
    title: "Como o olho seco é investigado",
    description:
      "História, exame e testes se complementam; nenhum resultado isolado explica todos os fenótipos.",
  },
  "/tratamentos": {
    type: "page",
    href: "/tratamentos",
    label: "Portal · Tratamentos",
    title: "Tratamentos organizados por objetivos",
    description:
      "Possibilidades de cuidado apresentadas pelos mecanismos predominantes e pelos objetivos de cada etapa.",
  },
  "/profissional": {
    type: "page",
    href: "/profissional",
    label: "Portal profissional",
    title: "Superfície ocular, com a limitação declarada",
    description:
      "Home do portal profissional: revista SUPERFÍCIE, RADAR Científico e os eixos técnicos do site.",
  },
  "/profissional#diagnostico": {
    type: "page",
    href: "/profissional#diagnostico",
    label: "Portal · Diagnóstico",
    title: "Diagnóstico multimodal",
    description:
      "Integração entre história clínica, sinais, estabilidade lacrimal, colorações, imagem e contexto.",
  },
  "/profissional#evidencias": {
    type: "page",
    href: "/profissional#evidencias",
    label: "Portal · Evidências",
    title: "Evidências para a prática profissional",
    description:
      "Um ponto de entrada para organizar resultados, limitações e interpretação clínica das evidências.",
  },
};

const relatedContentByArticle: Record<string, readonly RelatedContentRef[]> = {
  "biologia-molecular-da-dgm": [
    "article:alem-do-meiboscore",
    "article:terapias-dirigidas-por-mecanismo",
    "guide:higiene-palpebral-com-seguranca",
    "page:/causas#evaporacao",
  ],
  "tfos-dews-iii-na-pratica": [
    "article:quando-sintomas-e-sinais-nao-batem",
    "article:cinco-testes-cinco-perguntas",
    "article:terapias-dirigidas-por-mecanismo",
    "page:/diagnostico",
  ],
  "quando-sintomas-e-sinais-nao-batem": [
    "article:tfos-dews-iii-na-pratica",
    "article:cinco-testes-cinco-perguntas",
    "guide:organizar-seus-sintomas",
    "page:/diagnostico",
  ],
  "tres-meses-nao-sao-doze": [
    "article:prehab-ocular",
    "article:terapias-dirigidas-por-mecanismo",
    "page:/tratamentos",
    "page:/profissional#evidencias",
  ],
  "alem-do-meiboscore": [
    "article:biologia-molecular-da-dgm",
    "article:cinco-testes-cinco-perguntas",
    "article:ia-na-superficie-ocular",
    "page:/diagnostico",
  ],
  "cinco-testes-cinco-perguntas": [
    "article:tfos-dews-iii-na-pratica",
    "article:quando-sintomas-e-sinais-nao-batem",
    "article:alem-do-meiboscore",
    "page:/profissional#diagnostico",
  ],
  "a-prega-o-atrito-e-o-piscar": [
    "guide:conjuntivocalase-olho-seco-mecanico",
    "article:quando-sintomas-e-sinais-nao-batem",
    "page:/causas",
    "page:/sintomas",
  ],
  "ia-na-superficie-ocular": [
    "article:alem-do-meiboscore",
    "article:cinco-testes-cinco-perguntas",
    "article:quando-sintomas-e-sinais-nao-batem",
    "page:/profissional#diagnostico",
  ],
  "anti-demodex": [
    "article:biologia-molecular-da-dgm",
    "article:terapias-dirigidas-por-mecanismo",
    "guide:higiene-palpebral-com-seguranca",
    "page:/tratamentos",
  ],
  "terapias-dirigidas-por-mecanismo": [
    "article:tfos-dews-iii-na-pratica",
    "article:biologia-molecular-da-dgm",
    "article:anti-demodex",
    "page:/tratamentos",
  ],
  "prehab-ocular": [
    "article:tres-meses-nao-sao-doze",
    "guide:olho-seco-apos-cirurgia-ocular",
    "page:/diagnostico",
    "page:/tratamentos",
  ],
  "anatomia-dry-eye-center": [
    "article:terapias-dirigidas-por-mecanismo",
    "article:tres-meses-nao-sao-doze",
    "article:ia-na-superficie-ocular",
    "page:/profissional",
  ],
  "olho-seco-oct-rnfl": [
    "article:cinco-testes-cinco-perguntas",
    "article:quando-sintomas-e-sinais-nao-batem",
    "article:tfos-dews-iii-na-pratica",
    "page:/diagnostico",
  ],
};

const articleBySlug = new Map(
  publishedArticles.map((article) => [article.slug, article]),
);
const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

const articleLink = (article: MagazineArticle): RelatedContent => ({
  type: "article",
  href: getMagazineArticlePath(article),
  label: `SUPERFÍCIE · ${article.category}`,
  title: article.title,
  description: article.excerpt,
});

const guideLink = (guide: Guide): RelatedContent => ({
  type: "guide",
  href: `/guias/${guide.slug}`,
  label: `Guia · ${guide.category}`,
  title: guide.title,
  description: guide.description,
});

const resolveReference = (reference: RelatedContentRef) => {
  const [type, ...valueParts] = reference.split(":");
  const value = valueParts.join(":");

  if (type === "article") {
    const article = articleBySlug.get(value);
    return article?.status === "published" ? articleLink(article) : undefined;
  }

  if (type === "guide") {
    const guide = guideBySlug.get(value);
    return guide ? guideLink(guide) : undefined;
  }

  return portalContent[value];
};

/**
 * Curadoria editorial explícita para o fim de cada matéria.
 *
 * Afinidade automática é útil como fallback, mas não conhece a diferença
 * entre uma página-pilar do portal, um guia para pacientes e uma matéria de
 * revista. A lista por slug deixa o contexto e a ponte de autoridade
 * revisáveis junto do conteúdo, sem esconder a decisão num ranking opaco.
 */
export const selectRelatedContent = (
  current: MagazineArticle,
  limit = 4,
): RelatedContent[] => {
  const curated = (relatedContentByArticle[current.slug] ?? [])
    .map(resolveReference)
    .filter((content): content is RelatedContent => Boolean(content));

  if (curated.length >= limit || relatedContentByArticle[current.slug]) {
    return curated.slice(0, Math.max(0, limit));
  }

  const fallback = selectRelatedArticles(current, publishedArticles, limit)
    .map(articleLink)
    .filter((content) => !curated.some(({ href }) => href === content.href));

  return [...curated, ...fallback].slice(0, Math.max(0, limit));
};

export const relatedContentArticleSlugs = Object.keys(relatedContentByArticle);
