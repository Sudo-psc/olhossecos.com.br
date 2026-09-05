import { cleanAuthorName } from "./citations.ts";
import type { MagazineArticle } from "./superficie.ts";

export const SUPERFICIE_JOURNAL_TITLE =
  "SUPERFÍCIE — Revista de Olho Seco e Superfície Ocular";

export interface HighwireTag {
  name: string;
  content: string;
}

const toHighwireDate = (iso?: string) =>
  iso ? iso.replaceAll("-", "/") : undefined;

/**
 * Metas Highwire Press — o que o Google Scholar lê.
 * DOI e PDF só entram quando o frontmatter os tiver; o depósito
 * no Zenodo é ação do responsável técnico, não deste pipeline.
 */
export const highwireTagsForArticle = (
  article: MagazineArticle,
): HighwireTag[] => {
  const tags: HighwireTag[] = [
    { name: "citation_title", content: article.title },
    {
      name: "citation_author",
      content: cleanAuthorName(article.author.name),
    },
    { name: "citation_journal_title", content: SUPERFICIE_JOURNAL_TITLE },
  ];

  const publicationDate = toHighwireDate(article.publishedAt);
  if (publicationDate) {
    tags.push({
      name: "citation_publication_date",
      content: publicationDate,
    });
  }

  if (article.doi) {
    tags.push({ name: "citation_doi", content: article.doi });
  }

  if (article.pdfUrl) {
    tags.push({ name: "citation_pdf_url", content: article.pdfUrl });
  }

  return tags;
};
