/**
 * Os dois portais do site e o que cada um mostra na navegação.
 *
 * A raiz é uma pré-página que só separa os dois caminhos. Depois dela, o
 * visitante fica dentro de um portal e a navegação para de oferecer o que não
 * é dele: o paciente não vê "Parceiros" nem "RADAR", e o profissional não vê
 * "Autocuidado". A troca continua a um clique — separar públicos não pode
 * virar porta trancada.
 *
 * Header e Footer resolvem o portal pelo pathname, e não por prop, para que
 * uma página nova entre no portal certo sem precisar declarar nada.
 */

export type PortalId = "paciente" | "profissional";

export interface PortalLink {
  label: string;
  href: string;
}

export interface PortalFooterColumn {
  title: string;
  links: PortalLink[];
}

export interface Portal {
  id: PortalId;
  /** Home do portal — destino do logotipo dentro dele. */
  home: string;
  brandTitle: string;
  brandSubtitle: string;
  nav: PortalLink[];
  /** Link de fuga para o outro portal, presente em todas as páginas. */
  crossLink: PortalLink;
  footerColumns: PortalFooterColumn[];
}

/** Colunas de rodapé que os dois portais compartilham. */
const sharedFooterColumn: PortalFooterColumn = {
  title: "Sobre o portal",
  links: [
    { label: "Newsletter", href: "/newsletter" },
    { label: "Fontes", href: "/fontes" },
    { label: "Política editorial", href: "/politica-editorial" },
    { label: "Glossário", href: "/glossario" },
    { label: "Privacidade", href: "/privacidade" },
  ],
};

export const portals: Record<PortalId, Portal> = {
  paciente: {
    id: "paciente",
    home: "/paciente",
    brandTitle: "Olhos Secos",
    brandSubtitle: "Portal do paciente",
    nav: [
      { label: "O que é", href: "/olho-seco" },
      { label: "Sintomas", href: "/sintomas" },
      { label: "Diagnóstico", href: "/diagnostico" },
      { label: "Tratamentos", href: "/tratamentos" },
      { label: "Autocuidado", href: "/autocuidado" },
      { label: "Guias", href: "/guias" },
    ],
    crossLink: { label: "Sou profissional", href: "/profissional" },
    footerColumns: [
      {
        title: "Entenda",
        links: [
          { label: "O que é olho seco", href: "/olho-seco" },
          { label: "Sintomas", href: "/sintomas" },
          { label: "Causas", href: "/causas" },
          { label: "Como é investigado", href: "/diagnostico" },
        ],
      },
      {
        title: "Cuide-se",
        links: [
          { label: "Tratamentos", href: "/tratamentos" },
          { label: "Autocuidado", href: "/autocuidado" },
          { label: "Sinais de alerta", href: "/sinais-de-alerta" },
          { label: "Guias", href: "/guias" },
          { label: "Dry Eye Widget", href: "/app" },
        ],
      },
      sharedFooterColumn,
    ],
  },
  profissional: {
    id: "profissional",
    home: "/profissional",
    brandTitle: "Olhos Secos",
    brandSubtitle: "Portal profissional",
    nav: [
      { label: "SUPERFÍCIE", href: "/superficie" },
      { label: "Artigos", href: "/superficie/artigos" },
      { label: "RADAR", href: "/superficie/radar" },
      { label: "Livros", href: "/livros" },
      { label: "Parceiros", href: "/superficie/parceiros" },
    ],
    crossLink: { label: "Sou paciente", href: "/paciente" },
    footerColumns: [
      {
        title: "SUPERFÍCIE",
        links: [
          { label: "A revista", href: "/superficie" },
          { label: "Edições", href: "/superficie/edicoes" },
          { label: "Artigos", href: "/superficie/artigos" },
          { label: "RADAR Científico", href: "/superficie/radar" },
          { label: "Parceiros", href: "/superficie/parceiros" },
        ],
      },
      {
        title: "Referência",
        links: [
          { label: "Livros do autor", href: "/livros" },
          { label: "Eixos editoriais", href: "/profissional#eixos" },
          { label: "Diagnóstico", href: "/diagnostico" },
          { label: "Tratamentos", href: "/tratamentos" },
          { label: "Glossário", href: "/glossario" },
        ],
      },
      sharedFooterColumn,
    ],
  },
};

/**
 * Prefixos que pertencem ao portal profissional. Tudo o que não estiver aqui
 * — e não for a raiz — é conteúdo de paciente: o portal do paciente é o
 * padrão porque é onde cai quem chega por busca em página avulsa.
 */
const professionalPrefixes = ["/profissional", "/superficie", "/livros"];

const normalize = (pathname: string) => pathname.replace(/\/+$/u, "") || "/";

/**
 * `null` só na raiz: a pré-página não pertence a portal nenhum e por isso não
 * exibe navegação de portal — exibir uma delas já seria escolher pelo leitor.
 */
export const resolvePortal = (pathname: string): PortalId | null => {
  const path = normalize(pathname);
  if (path === "/") return null;
  return professionalPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
    ? "profissional"
    : "paciente";
};

export const portalFor = (pathname: string): Portal | null => {
  const id = resolvePortal(pathname);
  return id ? portals[id] : null;
};

/** Marca o item da navegação sem deixar um prefixo curto capturar rota irmã. */
export const isPortalNavCurrent = (href: string, pathname: string): boolean => {
  const [path] = href.split("#");
  if (!path) return false;
  const current = normalize(pathname);
  const target = normalize(path);
  if (target === "/superficie") {
    // A revista inteira mora sob /superficie; marcar só a home dela evitaria
    // deixar o item apagado nas rotas internas, mas acenderia junto com
    // "Artigos" e "RADAR". Aqui ela só acende no que não é de outro item.
    return (
      current === target ||
      (current.startsWith("/superficie/") &&
        !current.startsWith("/superficie/artigos") &&
        !current.startsWith("/superficie/radar") &&
        !current.startsWith("/superficie/parceiros"))
    );
  }
  return current === target || current.startsWith(`${target}/`);
};
