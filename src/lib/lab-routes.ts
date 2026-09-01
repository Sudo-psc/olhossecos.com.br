/**
 * Rotas do caderno de laboratório da SUPERFÍCIE. Não entram no sitemap;
 * o índice só redireciona para a edição canônica — sem vitrine pública.
 */
export const LAB_EDICAO_00_PATH = "/superficie/lab/edicao-00";

export const isLabIndexPath = (pathname: string): boolean => {
  const normalized = pathname.replace(/\/+$/u, "") || "/";
  return normalized === "/superficie/lab";
};
