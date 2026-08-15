import type { MagazineArticle } from "@/lib/superficie";

export const articleTemplatePreview: MagazineArticle = {
  slug: "modelo-editorial",
  title: "Como a SUPERFÍCIE estrutura uma matéria profissional",
  subtitle:
    "Uma prévia técnica do template — sem publicação clínica ou autoria convidada.",
  excerpt:
    "Conheça a arquitetura editorial preparada para separar contexto, evidência, aplicação prática e limitações.",
  category: "Perspectiva",
  author: {
    name: "Equipe editorial SUPERFÍCIE",
  },
  reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  status: "draft",
  issue: "00",
  content: [
    {
      id: "por-que-importa",
      title: "Por que isso importa?",
      kind: "why-it-matters",
      paragraphs: [
        "A experiência de leitura foi desenhada para que a relevância clínica seja apresentada antes dos detalhes, sem confundir interpretação editorial com resultado científico.",
      ],
    },
    {
      id: "evidencia",
      title: "Qual é a evidência?",
      kind: "evidence",
      paragraphs: [
        "Toda afirmação clínica deverá ser vinculada a uma fonte adequada. Referências, achados e interpretação permanecerão visualmente distinguíveis no artigo.",
      ],
      bullets: [
        "Referência identificável e acessível quando possível.",
        "Descrição proporcional ao desenho do estudo.",
        "Separação entre resultado publicado e leitura editorial.",
      ],
    },
    {
      id: "aplicacao-pratica",
      title: "Como muda a prática?",
      kind: "practice",
      paragraphs: [
        "A aplicação prática será apresentada como interpretação contextualizada, com linguagem direta e sem extrapolar o que as fontes permitem concluir.",
      ],
    },
    {
      id: "limitacoes",
      title: "Quais são as limitações?",
      kind: "limitations",
      paragraphs: [
        "Incertezas, conflitos de interesse e limites de generalização terão espaço próprio. O template exige disclosures mesmo quando nenhum conflito for declarado.",
      ],
    },
  ],
  references: [
    {
      label: "Política editorial do ecossistema Olhos Secos",
      url: "/politica-editorial",
    },
  ],
  disclosure: "Prévia técnica sem autoria clínica ou patrocínio.",
  sponsored: false,
  tags: ["evidência", "transparência", "política editorial"],
  seo: {
    title: "Prévia do template editorial | SUPERFÍCIE",
    description:
      "Prévia técnica, não publicada, do template HTML de artigos da SUPERFÍCIE.",
    canonical: "/superficie/artigos/modelo-editorial",
  },
};
