/**
 * Marca o item de navegação da SUPERFÍCIE. Links só com hash
 * (`/superficie#entrevistas`) não podem vencer em `/superficie/artigos/*`
 * só porque compartilham o prefixo `/superficie`.
 */
export const isSurfaceNavCurrent = (
  href: string,
  pathname: string,
): boolean => {
  const [path] = href.split("#");
  if (!path || path === "/superficie") return false;
  if (path === "/superficie/edicoes") {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      /^\/superficie\/edicao-[^/]+$/u.test(pathname)
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};
