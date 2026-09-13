import type { MagazineArticle } from "./superficie.ts";

const PORTAL_BASE_URL = "https://olhossecos.com.br";

const PT_MONTH_ABBR: Record<number, string> = {
  0: "jan.",
  1: "fev.",
  2: "mar.",
  3: "abr.",
  4: "maio",
  5: "jun.",
  6: "jul.",
  7: "ago.",
  8: "set.",
  9: "out.",
  10: "nov.",
  11: "dez.",
};

const EN_MONTH_ABBR: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

const BIBTEX_MONTH: Record<number, string> = {
  0: "jan",
  1: "feb",
  2: "mar",
  3: "apr",
  4: "may",
  5: "jun",
  6: "jul",
  7: "aug",
  8: "sep",
  9: "oct",
  10: "nov",
  11: "dec",
};

/**
 * Normaliza o nome do autor removendo prefixos honoríficos como Dr. / Dra.
 */
export const cleanAuthorName = (name: string): string => {
  return name.replace(/^Dr\.\s+|^Dra\.\s+/iu, "").trim();
};

/**
 * Converte nome para formato ABNT: "SOBRENOME, Prenomes"
 * Exemplo: "Philipe Saraiva Cruz" -> "CRUZ, Philipe Saraiva"
 */
export const formatAuthorAbnt = (name: string): string => {
  const clean = cleanAuthorName(name);
  const parts = clean.split(/\s+/u).filter(Boolean);
  if (parts.length <= 1) return clean.toUpperCase();
  const lastName = parts[parts.length - 1].toUpperCase();
  const givenNames = parts.slice(0, -1).join(" ");
  return `${lastName}, ${givenNames}`;
};

/**
 * Converte nome para formato Vancouver: "Sobrenome Iniciais"
 * Exemplo: "Philipe Saraiva Cruz" -> "Cruz PS"
 */
export const formatAuthorVancouver = (name: string): string => {
  const clean = cleanAuthorName(name);
  const parts = clean.split(/\s+/u).filter(Boolean);
  if (parts.length <= 1) return clean;
  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .join("");
  return `${lastName} ${initials}`;
};

export const getArticleUrl = (article: MagazineArticle): string => {
  return `${PORTAL_BASE_URL}/superficie/artigos/${article.slug}`;
};

const extractIssueNumber = (issue?: string): string => {
  if (!issue) return "0";
  const match = issue.match(/\d+/);
  return match ? String(Number.parseInt(match[0], 10)) : issue;
};

/**
 * Gera citação no padrão ABNT (NBR 6023).
 */
export const generateAbntCitation = (
  article: MagazineArticle,
  accessDate: Date = new Date(),
): string => {
  const author = formatAuthorAbnt(article.author.name);
  const issueNum = extractIssueNumber(article.issue);
  const pubDate = article.publishedAt
    ? new Date(`${article.publishedAt}T00:00:00Z`)
    : new Date();
  const day = pubDate.getUTCDate();
  const month = PT_MONTH_ABBR[pubDate.getUTCMonth()];
  const year = pubDate.getUTCFullYear();

  const accessDay = accessDate.getDate();
  const accessMonth = PT_MONTH_ABBR[accessDate.getMonth()];
  const accessYear = accessDate.getFullYear();

  const url = getArticleUrl(article);
  const doi = article.doi ? ` DOI: https://doi.org/${article.doi}.` : "";

  return `${author}. ${article.title}. SUPERFÍCIE — Revista de Olho Seco e Superfície Ocular, Caratinga/MG, ed. ${issueNum}, ${day} ${month} ${year}.${doi} Disponível em: <${url}>. Acesso em: ${accessDay} ${accessMonth} ${accessYear}.`;
};

/**
 * Gera citação no padrão Vancouver (ICMJE).
 */
export const generateVancouverCitation = (article: MagazineArticle): string => {
  const author = formatAuthorVancouver(article.author.name);
  const issueNum = extractIssueNumber(article.issue);
  const pubDate = article.publishedAt
    ? new Date(`${article.publishedAt}T00:00:00Z`)
    : new Date();
  const day = pubDate.getUTCDate();
  const month = EN_MONTH_ABBR[pubDate.getUTCMonth()];
  const year = pubDate.getUTCFullYear();
  const url = getArticleUrl(article);

  const doi = article.doi ? ` doi: ${article.doi}` : "";
  return `${author}. ${article.title}. SUPERFÍCIE. ${year} ${month} ${day};${issueNum}.${doi} Available from: ${url}`;
};

/**
 * Gera citação no formato BibTeX.
 */
export const generateBibtexCitation = (article: MagazineArticle): string => {
  const clean = cleanAuthorName(article.author.name);
  const parts = clean.split(/\s+/u).filter(Boolean);
  const lastName = (parts[parts.length - 1] || "autor").toLowerCase();
  const pubDate = article.publishedAt
    ? new Date(`${article.publishedAt}T00:00:00Z`)
    : new Date();
  const year = pubDate.getUTCFullYear();
  const month = BIBTEX_MONTH[pubDate.getUTCMonth()];
  const issueNum = extractIssueNumber(article.issue);
  const citeKey = `${lastName}${year}_${article.slug.replace(/-/g, "_")}`;
  const url = getArticleUrl(article);

  const doiLine = article.doi ? `\n  doi = {${article.doi}},` : "";
  return `@article{${citeKey},
  author = {${clean}},
  title = {${article.title}},
  journal = {SUPERFÍCIE --- Revista de Olho Seco e Superfície Ocular},
  year = {${year}},
  month = {${month}},
  number = {${issueNum}},${doiLine}
  url = {${url}}
}`;
};

/**
 * RIS gerado no cliente. Sem rede: o arquivo é um Blob local.
 */
export const generateRisCitation = (article: MagazineArticle): string => {
  const clean = cleanAuthorName(article.author.name);
  const parts = clean.split(/\s+/u).filter(Boolean);
  const lastName = parts.at(-1) ?? clean;
  const given = parts.slice(0, -1).join(" ");
  const pubDate = article.publishedAt
    ? new Date(`${article.publishedAt}T00:00:00Z`)
    : new Date();
  const year = pubDate.getUTCFullYear();
  const month = String(pubDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(pubDate.getUTCDate()).padStart(2, "0");
  const issueNum = extractIssueNumber(article.issue);
  const lines = [
    "TY  - JOUR",
    `T1  - ${article.title}`,
    `AU  - ${lastName}, ${given}`.trim(),
    "JO  - SUPERFÍCIE — Revista de Olho Seco e Superfície Ocular",
    `PY  - ${year}`,
    `DA  - ${year}/${month}/${day}`,
    `IS  - ${issueNum}`,
    `UR  - ${getArticleUrl(article)}`,
  ];
  if (article.doi) lines.push(`DO  - ${article.doi}`);
  lines.push("ER  - ");
  return lines.join("\r\n");
};

export const generateAllCitations = (
  article: MagazineArticle,
  accessDate?: Date,
): { abnt: string; vancouver: string; bibtex: string; ris: string } => {
  return {
    abnt: generateAbntCitation(article, accessDate),
    vancouver: generateVancouverCitation(article),
    bibtex: generateBibtexCitation(article),
    ris: generateRisCitation(article),
  };
};
