export interface HomeLink {
  label: string;
  href: string;
}

export interface HomeJourney {
  audience: "patient" | "professional";
  eyebrow: string;
  title: string;
  description: string;
  links: HomeLink[];
  cta: HomeLink;
}

export interface EssentialContent extends HomeLink {
  description: string;
}

export const homeJourneys: HomeJourney[] = [
  {
    audience: "patient",
    eyebrow: "Para pacientes",
    title: "Entenda seus sintomas",
    description:
      "Ardência, sensação de areia, visão oscilante, lacrimejamento, desconforto com telas e sensibilidade ocular podem ter diferentes causas. Entenda como o olho seco se manifesta, como é investigado e quais são as possibilidades de cuidado.",
    links: [
      { label: "Sintomas", href: "/sintomas" },
      { label: "Causas", href: "/causas" },
      { label: "Diagnóstico", href: "/diagnostico" },
      { label: "Tratamento", href: "/tratamentos" },
      { label: "Glândulas de Meibomius", href: "/causas#evaporacao" },
      {
        label: "Olho seco e telas",
        href: "/guias/telas-piscadas-desconforto",
      },
      {
        label: "Conjuntivocálase",
        href: "/guias/conjuntivocalase-olho-seco-mecanico",
      },
      { label: "Perguntas frequentes", href: "/olho-seco#proximos-passos" },
    ],
    cta: { label: "Explorar olho seco", href: "/olho-seco" },
  },
  {
    audience: "professional",
    eyebrow: "Para profissionais",
    title: "Superfície ocular em profundidade",
    description:
      "Conteúdo técnico sobre diagnóstico multimodal, fenotipagem, imagem, tecnologias, terapias e evidências contemporâneas em doença do olho seco e superfície ocular.",
    links: [
      {
        label: "Diagnóstico multimodal",
        href: "/profissionais#diagnostico",
      },
      { label: "Meibografia", href: "/diagnostico#imagem" },
      { label: "NIBUT", href: "/profissionais#nibut" },
      { label: "Interferometria", href: "/profissionais#interferometria" },
      { label: "Osmolaridade", href: "/profissionais#osmolaridade" },
      { label: "Fenotipagem", href: "/profissionais#fenotipagem" },
      { label: "Terapias", href: "/tratamentos" },
      { label: "Evidências", href: "/profissionais#evidencias" },
    ],
    cta: {
      label: "Acessar área profissional",
      href: "/profissionais",
    },
  },
];

export const essentialContents: EssentialContent[] = [
  {
    label: "O que é doença do olho seco?",
    href: "/olho-seco",
    description:
      "Entenda o que caracteriza a doença e por que ela pode envolver diferentes mecanismos.",
  },
  {
    label: "Sintomas de olho seco",
    href: "/sintomas",
    description:
      "Reconheça padrões como ardência, sensação de areia, lacrimejamento e visão oscilante.",
  },
  {
    label: "Como é feito o diagnóstico?",
    href: "/diagnostico",
    description:
      "Veja como história, exame e testes se complementam na investigação da superfície ocular.",
  },
  {
    label: "Tratamentos disponíveis",
    href: "/tratamentos",
    description:
      "Conheça possibilidades de cuidado organizadas pelos mecanismos e objetivos do tratamento.",
  },
  {
    label: "Doença das glândulas de Meibomius",
    href: "/causas#evaporacao",
    description:
      "Compreenda a relação entre a camada lipídica, a evaporação e a estabilidade das lágrimas.",
  },
  {
    label: "Olho seco e uso de telas",
    href: "/guias/telas-piscadas-desconforto",
    description:
      "Entenda o papel das piscadas, do ambiente e dos hábitos durante o uso prolongado de telas.",
  },
];

export const superficieTopics = [
  "Fenotipagem",
  "Meibografia",
  "Diagnóstico multimodal",
  "Conjuntivocálase",
  "Tecnologias",
  "Terapias",
  "IA",
  "Superfície perioperatória",
];
