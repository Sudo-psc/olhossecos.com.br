/**
 * URLs do funil antigo da clínica e do blog local.
 *
 * O domínio deixou de ser landing de agendamento. Quem chega por Search ou
 * bookmark antigo precisa cair no guia ou na página educativa equivalente,
 * não em 404. Destinos são conteúdo — nunca cupom, quiz-lead ou WhatsApp
 * automático.
 */

export const exactRedirects = new Map<string, string>([
  ["/blog", "/guias"],
  ["/videos", "/guias"],
  ["/exames", "/diagnostico"],
  ["/profissionais", "/profissional"],
  ["/politica-de-privacidade", "/privacidade"],
  ["/sobre", "/autor/philipe-saraiva-cruz"],
  ["/faq", "/olho-seco"],
  ["/quiz", "/ferramentas/deq-5"],
  ["/testerapido", "/ferramentas/deq-5"],
  ["/calculadora-olho-seco", "/ferramentas"],
  ["/irpl-olho-seco-caratinga", "/tratamentos"],
  ["/higiene-palpebral", "/guias/higiene-palpebral-com-seguranca"],
  ["/medicamentos", "/guias/tratamento-com-colirios-diferencas-e-tipos"],
  ["/lentes-esclerais", "/guias/olho-seco-lentes-de-contato"],
  ["/tratamentos/luz-pulsada-irpl", "/tratamentos"],
  ["/tratamentos/higiene-palpebral", "/guias/higiene-palpebral-com-seguranca"],
  [
    "/tratamentos/medicamentos",
    "/guias/tratamento-com-colirios-diferencas-e-tipos",
  ],
  ["/tratamentos/lentes-esclerais", "/guias/olho-seco-lentes-de-contato"],
]);

const blogRedirects = new Map<string, string>([
  ["sintomas-olho-seco-caratinga", "/sintomas"],
  ["olho-seco-tratamento-caratinga", "/tratamentos"],
  ["meibografia-caratinga", "/guias/meibografia-o-que-a-imagem-mostra"],
  [
    "meibografia-olho-seco-caratinga-mg",
    "/guias/meibografia-o-que-a-imagem-mostra",
  ],
  ["mitos-e-verdades", "/guias/olho-seco-guia-essencial"],
  ["luz-pulsada-olho-seco-caratinga", "/tratamentos"],
  [
    "olho-seco-rosacea-ocular-tratamento-irpl-e-eye-caratinga-mg",
    "/tratamentos",
  ],
  ["caratinga-olho-seco-irpl-e-eye-custo-beneficio", "/tratamentos"],
  ["disfuncao-glandulas-meibomius-dgm", "/olho-seco"],
  ["olho-seco-evaporativo-vs-inflamatorio", "/olho-seco"],
  ["telas-e-olho-seco", "/guias/telas-piscadas-desconforto"],
  [
    "importancia-seguimento-olho-seco-cronico",
    "/guias/olho-seco-persistente-depressao-apneia",
  ],
]);

const normalizePath = (pathname: string) =>
  pathname.replace(/\/+$/u, "") || "/";

export const resolveLegacyRedirect = (pathname: string): string | null => {
  const path = normalizePath(pathname);
  const exact = exactRedirects.get(path);
  if (exact) return exact;

  if (path === "/blog" || !path.startsWith("/blog/")) return null;

  const slug = path.slice("/blog/".length);
  if (!slug || slug.includes("/")) return "/guias";
  return blogRedirects.get(slug) ?? "/guias";
};
