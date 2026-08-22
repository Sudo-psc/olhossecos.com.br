import { getGuide, type Guide } from "./guides.ts";

/**
 * Ponte dos hubs curtos do portal para os guias longos.
 *
 * Os hubs explicam o mapa; os guias carregam o detalhe. Sem esta lista,
 * /tratamentos não apontava para nenhum guia e o paciente parava no resumo.
 * A curadoria é explícita por caminho — o mesmo espírito de
 * `related-content.ts` na revista.
 */
const hubGuideSlugs: Record<string, readonly string[]> = {
  "/olho-seco": [
    "olho-seco-guia-essencial",
    "organizar-seus-sintomas",
    "qualidade-de-vida-e-olho-seco",
  ],
  "/sintomas": [
    "organizar-seus-sintomas",
    "epifora-olho-seco-vias-lacrimais",
    "olho-seco-persistente-depressao-apneia",
  ],
  "/causas": [
    "conjuntivocalase-olho-seco-mecanico",
    "telas-piscadas-desconforto",
    "olho-seco-lentes-de-contato",
  ],
  "/diagnostico": [
    "epifora-olho-seco-vias-lacrimais",
    "olho-seco-guia-essencial",
    "organizar-seus-sintomas",
  ],
  "/tratamentos": [
    "lubrificantes-perguntas-uteis",
    "higiene-palpebral-com-seguranca",
    "tratamento-com-colirios-diferencas-e-tipos",
  ],
  "/autocuidado": [
    "telas-piscadas-desconforto",
    "higiene-palpebral-com-seguranca",
    "olho-seco-lentes-de-contato",
  ],
  "/sinais-de-alerta": ["organizar-seus-sintomas", "olho-seco-guia-essencial"],
};

const normalizeHubPath = (path: string) => path.replace(/\/$/u, "") || "/";

export const selectRelatedHubGuides = (path: string, limit = 3): Guide[] => {
  const slugs = hubGuideSlugs[normalizeHubPath(path)] ?? [];
  return slugs
    .map((slug) => getGuide(slug))
    .filter((guide): guide is Guide => Boolean(guide))
    .slice(0, limit);
};

export const relatedHubPaths = () => Object.keys(hubGuideSlugs);
