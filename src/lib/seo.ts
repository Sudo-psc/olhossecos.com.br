import { author, books } from "./books.ts";
import { responsibleDoctor } from "./doctor.ts";
import { guides } from "./guides.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { getMagazineArticlePath, publishedArticles } from "./superficie.ts";

export const siteOrigin = "https://olhossecos.com.br";
export const siteName = "Olhos Secos";
export const defaultOgImage = "/images/og/og-home.png";
export const brandLogoPath = "/icon-512.png";

export const physician = {
  name: responsibleDoctor.name,
  honorificPrefix: "Dr.",
  jobTitle: responsibleDoctor.role,
  slug: author.slug,
  description: author.description,
  crm: responsibleDoctor.crm,
  rqe: responsibleDoctor.rqe,
  affiliation: "Saraiva Vision",
  affiliationLocality: "Caratinga",
  affiliationRegion: "MG",
  sameAs: [
    "https://www.amazon.com/author/drphilipesaraiva",
    responsibleDoctor.orcid,
    responsibleDoctor.lattes,
    responsibleDoctor.linkedin,
    responsibleDoctor.website,
  ],
} as const;

export const portalMedicalConditions = [
  {
    "@type": "MedicalCondition",
    name: "Síndrome do olho seco",
    alternateName: ["Olho seco", "Dry eye disease"],
  },
  {
    "@type": "MedicalCondition",
    name: "Disfunção das glândulas de Meibômio",
    alternateName: ["DGM", "Meibomian gland dysfunction"],
  },
  {
    "@type": "MedicalCondition",
    name: "Blefarite",
  },
] as const;

export const physicianCredentials = [
  {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "MedicalLicense",
    name: physician.crm,
    recognizedBy: {
      "@type": "Organization",
      name: "Conselho Regional de Medicina do Estado de Minas Gerais",
    },
  },
  {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "board certification",
    name: physician.rqe,
    competencyRequired: "Oftalmologia",
  },
] as const;

const sitemapExcludedExact = new Set([
  "/blog",
  "/videos",
  "/exames",
  "/profissionais",
  "/newsletter/descadastrar",
  "/newsletter/confirmar",
  "/404",
  "/search-index.json",
  "/rss.xml",
  "/feed.json",
  "/llms.txt",
  "/llms-full.txt",
  "/manifest.webmanifest",
  "/manifest.json",
  "/.well-known/security.txt",
  "/superficie/rss.xml",
  "/superficie/feed.json",
  "/superficie/radar/rss.xml",
  "/superficie/radar/feed.json",
]);

const sitemapExcludedPrefixes = ["/superficie/lab", "/superficie/issues"];

/** lastmod mínimo conhecido das páginas estáticas do portal e da revista. */
const pageLastmods: Record<string, string> = {
  "/": "2026-08-24",
  "/app": "2026-07-26",
  "/autocuidado": "2026-07-26",
  "/autor/philipe-saraiva-cruz": "2026-08-07",
  "/causas": "2026-07-26",
  "/diagnostico": "2026-08-25",
  "/ferramentas": "2026-08-25",
  "/ferramentas/deq-5": "2026-08-25",
  "/ferramentas/diario": "2026-08-25",
  "/fontes": "2026-08-25",
  "/glossario": "2026-08-25",
  "/guias": "2026-08-25",
  "/livros": "2026-08-07",
  "/newsletter": "2026-08-08",
  "/olho-seco": "2026-08-21",
  "/paciente": "2026-08-25",
  "/politica-editorial": "2026-08-25",
  "/politica-de-correcao": "2026-08-25",
  "/privacidade": "2026-08-08",
  "/profissional": "2026-08-24",
  "/sinais-de-alerta": "2026-07-26",
  "/sintomas": "2026-07-26",
  "/superficie": "2026-08-08",
  "/superficie/artigos": "2026-08-15",
  "/superficie/edicao-00": "2026-08-07",
  "/superficie/edicoes": "2026-08-15",
  "/superficie/parceiros": "2026-08-08",
  "/superficie/radar": "2026-08-22",
  "/tratamentos": "2026-07-26",
};

export const normalizeSitemapPath = (value: string) => {
  const path = value.startsWith("http")
    ? new URL(value).pathname
    : (value.split("?")[0] ?? value);
  return path.replace(/\/$/, "") || "/";
};

export const isIndexableSitemapPath = (value: string) => {
  const path = normalizeSitemapPath(value);
  if (sitemapExcludedExact.has(path)) return false;
  return !sitemapExcludedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

const laterDay = (...dates: Array<string | undefined>) =>
  dates
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

const contentLastmods = (): Map<string, string> => {
  const lastmods = new Map<string, string>();
  const remember = (path: string, date?: string) => {
    if (!date) return;
    lastmods.set(path, laterDay(lastmods.get(path), date) ?? date);
  };

  for (const article of publishedArticles) {
    remember(
      getMagazineArticlePath(article),
      article.modifiedAt ?? article.publishedAt,
    );
  }

  for (const report of radarReports) {
    remember(getRadarReportPath(report), report.publishedAt);
  }

  for (const guide of guides) {
    remember(`/guias/${guide.slug}`, guide.dateModified ?? guide.datePublished);
  }

  for (const book of books) {
    remember(
      `/livros/${book.slug}`,
      book.year ? `${book.year}-08-07` : undefined,
    );
  }

  const latestArticle = laterDay(
    ...publishedArticles.map(
      (article) => article.modifiedAt ?? article.publishedAt,
    ),
  );
  const latestRadar = laterDay(
    ...radarReports.map((report) => report.publishedAt),
  );
  const latestGuide = laterDay(
    ...guides.map((guide) => guide.dateModified ?? guide.datePublished),
  );

  remember("/superficie", latestArticle);
  remember("/superficie/artigos", latestArticle);
  remember("/superficie/edicao-00", latestArticle);
  remember("/superficie/radar", latestRadar);
  remember("/guias", latestGuide);
  // A raiz deixou de herdar data de conteúdo: virou pré-página e não lista
  // mais nem guia nem artigo. Quem herda agora é a home de cada portal, que é
  // onde a publicação nova de fato aparece.
  remember("/paciente", latestGuide);
  remember("/profissional", laterDay(latestArticle, latestRadar));

  return lastmods;
};

let cachedContentLastmods: Map<string, string> | undefined;

const contentLastmodMap = () => {
  cachedContentLastmods ??= contentLastmods();
  return cachedContentLastmods;
};

export const lastmodForSitemapPath = (value: string) => {
  const path = normalizeSitemapPath(value);
  return (
    laterDay(pageLastmods[path], contentLastmodMap().get(path)) ?? "2026-07-25"
  );
};

export const organizationId = (siteUrl: URL) =>
  new URL("/#organization", siteUrl).href;

export const physicianId = (siteUrl: URL) =>
  new URL(`/autor/${physician.slug}#person`, siteUrl).href;

export const organizationSchema = (siteUrl: URL) => ({
  "@type": "Organization",
  "@id": organizationId(siteUrl),
  name: siteName,
  alternateName: ["Olho Seco — Portal do paciente", "olhossecos.com.br"],
  url: siteUrl.href,
  logo: {
    "@type": "ImageObject",
    url: new URL(brandLogoPath, siteUrl).href,
    width: 512,
    height: 512,
  },
  founder: { "@id": physicianId(siteUrl) },
  sameAs: ["https://drphilipesaraiva.com.br/"],
});

export const physicianSchema = (siteUrl: URL) => ({
  "@type": ["Person", "Physician"],
  "@id": physicianId(siteUrl),
  name: physician.name,
  honorificPrefix: physician.honorificPrefix,
  jobTitle: physician.jobTitle,
  description: physician.description,
  url: new URL(`/autor/${physician.slug}`, siteUrl).href,
  identifier: [
    {
      "@type": "PropertyValue",
      name: "CRM",
      value: physician.crm,
    },
    {
      "@type": "PropertyValue",
      name: "RQE",
      value: physician.rqe,
    },
  ],
  medicalSpecialty: {
    "@type": "MedicalSpecialty",
    name: "Ophthalmology",
  },
  worksFor: { "@id": organizationId(siteUrl) },
  affiliation: {
    "@type": "Organization",
    name: physician.affiliation,
    address: {
      "@type": "PostalAddress",
      addressLocality: physician.affiliationLocality,
      addressRegion: physician.affiliationRegion,
      addressCountry: "BR",
    },
  },
  sameAs: [...physician.sameAs],
  hasCredential: [...physicianCredentials],
});

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqPageSchema = (items: FaqItem[]) => ({
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export interface DefinedTermItem {
  term: string;
  definition: string;
}

export const definedTermSetSchema = (
  name: string,
  url: string,
  items: DefinedTermItem[],
) => ({
  "@type": "DefinedTermSet",
  name,
  url,
  inLanguage: "pt-BR",
  hasDefinedTerm: items.map((item) => ({
    "@type": "DefinedTerm",
    name: item.term,
    description: item.definition,
  })),
});
