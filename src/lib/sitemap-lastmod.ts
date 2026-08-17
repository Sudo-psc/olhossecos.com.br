import { guides } from "./guides.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { getMagazineArticlePath, publishedArticles } from "./superficie.ts";

/**
 * Origem do `lastmod` do sitemap.
 *
 * Antes isto era uma escada de conjuntos escritos à mão em astro.config.mjs
 * (`revisedOnJuly26`, `revisedOnAugust5`, `revisedOnAugust7`…) com um fallback
 * silencioso na data mais antiga do site. Quem publicasse um conteúdo sem
 * lembrar de editar a escada anunciava a página como velha ao rastreador.
 *
 * Aconteceu com quatro artigos da SUPERFÍCIE: publicados em 17/08, saíam no
 * sitemap como 25/07 — vinte e três dias ANTES de existirem, contradizendo o
 * datePublished do próprio JSON-LD da página.
 *
 * Guia, artigo e relatório já carregam a data no registro. Aqui a data é lida
 * de lá; a tabela manual sobrou só para as páginas institucionais, que não têm
 * módulo de conteúdo por trás.
 */

/** Data em que o portal foi ao ar; piso para página sem revisão registrada. */
const LAUNCHED_ON = "2026-07-25";

/**
 * Páginas sem registro de conteúdo. Editar à mão aqui é aceitável porque a
 * lista é fechada e muda com a estrutura do site, não a cada publicação.
 */
const staticPages: Record<string, string> = {
  "/": "2026-08-07",
  "/app": "2026-07-26",
  "/autocuidado": "2026-07-26",
  "/autor/philipe-saraiva-cruz": "2026-08-07",
  "/causas": "2026-07-26",
  "/diagnostico": "2026-07-26",
  "/fontes": "2026-08-05",
  "/glossario": "2026-07-26",
  "/guias": "2026-07-26",
  "/livros": "2026-08-07",
  "/livros/conjuntivocalase-diagnostico-fisiopatologia-abordagem-clinica":
    "2026-08-07",
  "/livros/o-custo-invisivel-do-olho-seco": "2026-08-07",
  "/newsletter": "2026-08-08",
  "/olho-seco": "2026-08-05",
  "/politica-editorial": "2026-08-07",
  "/privacidade": "2026-08-08",
  "/profissionais": "2026-08-07",
  "/sinais-de-alerta": "2026-07-26",
  "/sintomas": "2026-07-26",
  "/superficie": "2026-08-08",
  "/superficie/artigos": "2026-08-15",
  "/superficie/edicao-00": "2026-08-07",
  "/superficie/edicoes": "2026-08-15",
  "/superficie/parceiros": "2026-08-08",
  "/superficie/radar": "2026-08-09",
  "/tratamentos": "2026-07-26",
};

const contentPages = new Map<string, string>();

for (const guide of guides) {
  contentPages.set(
    `/guias/${guide.slug}`,
    guide.dateModified ?? guide.datePublished ?? LAUNCHED_ON,
  );
}

for (const article of publishedArticles) {
  contentPages.set(
    getMagazineArticlePath(article),
    article.modifiedAt ?? article.publishedAt ?? LAUNCHED_ON,
  );
}

for (const report of radarReports) {
  contentPages.set(getRadarReportPath(report), report.publishedAt);
}

/** Rotas cuja data vem de um módulo de conteúdo, não da tabela manual. */
export const dataBackedPaths = () => [...contentPages.keys()];

export const lastmodForPath = (path: string) => {
  const normalized = path.replace(/\/$/u, "") || "/";
  return contentPages.get(normalized) ?? staticPages[normalized] ?? LAUNCHED_ON;
};
