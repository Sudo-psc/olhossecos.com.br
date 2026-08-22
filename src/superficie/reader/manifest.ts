import type {
  IssueArticle,
  IssueManifest,
  IssueTocEntry,
  MagazinePage,
} from "./types.ts";

type ValidationResult =
  | { success: true; data: IssueManifest; errors: [] }
  | { success: false; data: null; errors: string[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasString = (record: Record<string, unknown>, key: string) =>
  typeof record[key] === "string" &&
  record[key].length > 0 &&
  record[key].length <= 500;

const stripBasePath = (value: string, basePath: string) => {
  if (!basePath) return value;
  if (value === basePath) return "/";
  return value.startsWith(`${basePath}/`)
    ? value.slice(basePath.length)
    : value;
};

const issueAssetRoot = (value: unknown, basePath = ""): string | null => {
  const logicalValue =
    typeof value === "string" ? stripBasePath(value, basePath) : value;
  if (
    typeof logicalValue !== "string" ||
    logicalValue.length > 500 ||
    !logicalValue.startsWith("/superficie/issues/") ||
    /[\u0000-\u001f\u007f]/u.test(logicalValue)
  ) {
    return null;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(logicalValue);
  } catch {
    return null;
  }
  if (
    decoded.includes("\\") ||
    decoded.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }
  const url = new URL(logicalValue, "https://reader.invalid");
  if (url.origin !== "https://reader.invalid" || url.search || url.hash) {
    return null;
  }
  const match = /^\/superficie\/issues\/([^/]+)\//u.exec(url.pathname);
  return match?.[1] ? `/superficie/issues/${match[1]}/` : null;
};

const isSafeIssueAsset = (value: unknown, basePath = ""): value is string =>
  issueAssetRoot(value, basePath) !== null;

const isPage = (value: unknown, basePath = ""): value is MagazinePage => {
  if (!isRecord(value) || !isRecord(value.image)) return false;
  return (
    Number.isInteger(value.number) &&
    isSafeIssueAsset(value.image.small, basePath) &&
    isSafeIssueAsset(value.image.medium, basePath) &&
    isSafeIssueAsset(value.image.large, basePath) &&
    isSafeIssueAsset(value.thumbnail, basePath) &&
    isSafeIssueAsset(value.textLayer, basePath)
  );
};

const isTocEntry = (value: unknown): value is IssueTocEntry =>
  isRecord(value) && hasString(value, "title") && Number.isInteger(value.page);

const isArticle = (value: unknown, basePath = ""): value is IssueArticle =>
  isRecord(value) &&
  hasString(value, "id") &&
  hasString(value, "title") &&
  Array.isArray(value.pages) &&
  value.pages.length > 0 &&
  value.pages.length <= 500 &&
  value.pages.every(Number.isInteger) &&
  (value.htmlPath === undefined || isSafeIssueAsset(value.htmlPath, basePath));

export const validateIssueManifest = (
  value: unknown,
  basePath = "",
): ValidationResult => {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return {
      success: false,
      data: null,
      errors: ["Manifest deve ser um objeto."],
    };
  }

  for (const key of ["id", "number", "title", "searchIndex", "pdfFallback"]) {
    if (!hasString(value, key)) errors.push(`${key} deve ser uma string.`);
  }

  if (
    !Number.isInteger(value.pageCount) ||
    Number(value.pageCount) < 1 ||
    Number(value.pageCount) > 500
  ) {
    errors.push("pageCount deve ser um inteiro entre 1 e 500.");
  }
  if (
    !Array.isArray(value.pages) ||
    !value.pages.every((page) => isPage(page, basePath))
  ) {
    errors.push("pages contém uma página inválida.");
  }
  if (!Array.isArray(value.toc) || !value.toc.every(isTocEntry)) {
    errors.push("toc contém uma entrada inválida.");
  }
  if (
    !Array.isArray(value.articles) ||
    !value.articles.every((article) => isArticle(article, basePath))
  ) {
    errors.push("articles contém uma entrada inválida.");
  }
  if (
    !Array.isArray(value.audioSources) ||
    value.audioSources.length < 2 ||
    value.audioSources.length > 3 ||
    !value.audioSources.every((source) => isSafeIssueAsset(source, basePath))
  ) {
    errors.push("audioSources deve conter entre duas e três URLs.");
  }
  if (!isSafeIssueAsset(value.searchIndex, basePath)) {
    errors.push("searchIndex deve apontar para um asset local da edição.");
  }
  if (!isSafeIssueAsset(value.pdfFallback, basePath)) {
    errors.push("pdfFallback deve apontar para um asset local da edição.");
  }

  const assetValues: unknown[] = [
    value.searchIndex,
    value.pdfFallback,
    ...(Array.isArray(value.audioSources) ? value.audioSources : []),
    ...(Array.isArray(value.pages)
      ? value.pages.flatMap((page) =>
          isRecord(page) && isRecord(page.image)
            ? [
                page.image.small,
                page.image.medium,
                page.image.large,
                page.thumbnail,
                page.textLayer,
              ]
            : [],
        )
      : []),
    ...(Array.isArray(value.articles)
      ? value.articles.flatMap((article) =>
          isRecord(article) && article.htmlPath !== undefined
            ? [article.htmlPath]
            : [],
        )
      : []),
  ];
  const assetRoots = assetValues
    .map((asset) => issueAssetRoot(asset, basePath))
    .filter(Boolean);
  if (new Set(assetRoots).size > 1) {
    errors.push(
      "Todos os assets devem pertencer ao diretório da mesma edição.",
    );
  }

  if (
    Array.isArray(value.pages) &&
    Number.isInteger(value.pageCount) &&
    value.pages.length !== value.pageCount
  ) {
    errors.push("pageCount deve corresponder ao total de pages.");
  }

  if (Array.isArray(value.pages)) {
    value.pages.forEach((page, index) => {
      if (isPage(page, basePath) && page.number !== index + 1) {
        errors.push("pages devem usar numeração sequencial iniciada em 1.");
      }
    });
  }

  const pageCount = Number.isInteger(value.pageCount)
    ? Number(value.pageCount)
    : 0;
  if (
    Array.isArray(value.toc) &&
    value.toc.some(
      (entry) =>
        isTocEntry(entry) && (entry.page < 1 || entry.page > pageCount),
    )
  ) {
    errors.push("toc contém referência fora do intervalo da edição.");
  }
  if (Array.isArray(value.articles)) {
    const validArticles = value.articles.filter((article) =>
      isArticle(article, basePath),
    );
    const articleIds = validArticles.map((article) => article.id);
    const invalidReferences = validArticles.some((article) =>
      article.pages.some((page) => page < 1 || page > pageCount),
    );
    if (
      invalidReferences ||
      new Set(articleIds).size !== articleIds.length ||
      validArticles.length > 100
    ) {
      errors.push("articles contém IDs duplicados ou páginas inválidas.");
    }
    if (
      Array.isArray(value.pages) &&
      value.pages.some(
        (page) =>
          isPage(page, basePath) &&
          typeof page.articleId === "string" &&
          !articleIds.includes(page.articleId),
      )
    ) {
      errors.push("pages referencia articleId inexistente.");
    }
  }

  if (errors.length > 0) return { success: false, data: null, errors };
  return { success: true, data: value as unknown as IssueManifest, errors: [] };
};
