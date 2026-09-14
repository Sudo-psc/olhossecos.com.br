import type {
  IssueArticle,
  IssueManifest,
  IssueTocEntry,
  MagazinePage,
  SearchIndexEntry,
} from "./types.ts";

const isAdPage = (page: MagazinePage): boolean => page.type === "ad";

const PAGE_ASSET = /page-(\d+)\.(?:json|webp)$/u;

const remapAlt = (alt: string | undefined, pageNumber: number) =>
  alt ? alt.replace(/^Página \d+:/u, `Página ${pageNumber}:`) : alt;

/** Folio impresso: `sourcePage`, senão o NN de `text/page-NN.json`. */
export function printFolio(page: MagazinePage): number {
  if (
    typeof page.sourcePage === "number" &&
    Number.isInteger(page.sourcePage) &&
    page.sourcePage > 0
  ) {
    return page.sourcePage;
  }
  const fromLayer = PAGE_ASSET.exec(page.textLayer)?.[1];
  if (fromLayer) return Number(fromLayer);
  return page.number;
}

export function buildEditorialPageMap(
  pages: MagazinePage[],
): Map<number, number> {
  const pageMap = new Map<number, number>();
  let nextNumber = 1;
  for (const page of pages) {
    if (isAdPage(page)) continue;
    pageMap.set(page.number, nextNumber);
    nextNumber += 1;
  }
  return pageMap;
}

export function withoutAdPages(manifest: IssueManifest): IssueManifest {
  const pageMap = buildEditorialPageMap(manifest.pages);
  const pages = manifest.pages
    .filter((page) => !isAdPage(page))
    .map((page) => {
      const number = pageMap.get(page.number);
      if (number === undefined) {
        throw new Error(`Página editorial sem mapeamento: ${page.number}`);
      }
      return {
        ...page,
        sourcePage: printFolio(page),
        number,
        alt: remapAlt(page.alt, number),
      };
    });

  if (pages.length === 0) {
    throw new Error(
      "A edição ficaria sem páginas editoriais após remover ads.",
    );
  }

  pages.forEach((page, index) => {
    if (page.number !== index + 1) {
      throw new Error("Paginação editorial ficou com lacuna.");
    }
  });

  const toc = manifest.toc.flatMap((entry): IssueTocEntry[] => {
    const page = pageMap.get(entry.page);
    return page === undefined ? [] : [{ ...entry, page }];
  });

  const articles = manifest.articles.map((article): IssueArticle => ({
    ...article,
    pages: article.pages.flatMap((page) => {
      const mapped = pageMap.get(page);
      return mapped === undefined ? [] : [mapped];
    }),
  }));

  if (articles.some((article) => article.pages.length === 0)) {
    throw new Error("Artigo perdeu todas as páginas ao remover ads.");
  }

  return {
    ...manifest,
    pageCount: pages.length,
    pages,
    toc,
    articles,
  };
}

export function remapSearchIndex(
  index: SearchIndexEntry[],
  pageMap: Map<number, number>,
): SearchIndexEntry[] {
  return index.flatMap((entry) => {
    const page = pageMap.get(entry.page);
    if (page === undefined) return [];
    return [{ ...entry, page }];
  });
}
