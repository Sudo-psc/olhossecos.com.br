/**
 * Blocos das duas homes de portal. A raiz não consome nada daqui: ela é só a
 * pré-página que separa os públicos.
 */

export interface HomeLink {
  label: string;
  href: string;
}

export interface StarterCard extends HomeLink {
  description: string;
}

/** Os primeiros passos do portal do paciente, na ordem da dúvida real. */
export const patientStarters: StarterCard[] = [
  {
    label: "O que é olho seco",
    href: "/olho-seco",
    description:
      "O que caracteriza a doença, por que ela envolve mecanismos diferentes e o que isso muda no cuidado.",
  },
  {
    label: "Sintomas",
    href: "/sintomas",
    description:
      "Ardência, sensação de areia, lacrimejamento e visão que oscila — e o que cada padrão costuma sugerir.",
  },
  {
    label: "Causas",
    href: "/causas",
    description:
      "Evaporação, produção insuficiente, inflamação, ambiente e medicamentos: quase nunca há uma causa só.",
  },
  {
    label: "Diagnóstico",
    href: "/diagnostico",
    description:
      "Como história, exame e testes se somam — e por que nenhum número isolado fecha o diagnóstico.",
  },
  {
    label: "Tratamentos",
    href: "/tratamentos",
    description:
      "O que cada opção pretende, para quem costuma fazer sentido e o que ainda é incerto.",
  },
  {
    label: "Autocuidado",
    href: "/autocuidado",
    description:
      "Práticas de baixo risco para telas, ambiente e higiene palpebral, sem promessa de resultado.",
  },
];

export interface ProfessionalTrack extends HomeLink {
  id: string;
  title: string;
  text: string;
}

/**
 * Eixos editoriais do portal profissional. Cada um leva ao texto que sustenta
 * a afirmação — eixo sem destino é rótulo, não conteúdo.
 */
export const professionalTracks: ProfessionalTrack[] = [
  {
    id: "diagnostico",
    title: "Diagnóstico multimodal",
    text: "História clínica, sinais da superfície, estabilidade lacrimal, colorações e imagem lidas em conjunto.",
    href: "/superficie/artigos/cinco-testes-cinco-perguntas",
    label: "Cinco testes, cinco perguntas",
  },
  {
    id: "fenotipagem",
    title: "Fenotipagem",
    text: "Organizar o mecanismo predominante para apoiar raciocínio, comunicação e acompanhamento.",
    href: "/superficie/artigos/quando-sintomas-e-sinais-nao-batem",
    label: "Quando sintomas e sinais não batem",
  },
  {
    id: "imagem",
    title: "Imagem e interferometria",
    text: "Meibografia e camada lipídica como parte da leitura, não como veredito isolado.",
    href: "/superficie/artigos/alem-do-meiboscore",
    label: "Além do meiboscore",
  },
  {
    id: "biomarcadores",
    title: "Biomarcadores",
    text: "NIBUT e osmolaridade respondem perguntas específicas — e há perguntas que eles não respondem.",
    href: "/superficie/artigos/cinco-testes-cinco-perguntas",
    label: "O que a osmolaridade responde",
  },
  {
    id: "terapias",
    title: "Terapias por mecanismo",
    text: "Escolher a intervenção pelo mecanismo predominante, declarando o que a evidência sustenta.",
    href: "/superficie/artigos/terapias-dirigidas-por-mecanismo",
    label: "Terapias dirigidas por mecanismo",
  },
  {
    id: "evidencias",
    title: "Evidências",
    text: "Curadoria periódica com fonte verificável, resumo e por que o achado importa na prática.",
    href: "/superficie/radar",
    label: "RADAR Científico",
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
