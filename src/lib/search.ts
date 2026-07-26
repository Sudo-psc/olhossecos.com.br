export interface PortalSearchEntry {
  href: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
}

export const portalPages: PortalSearchEntry[] = [
  {
    href: "/olho-seco",
    category: "Fundamentos",
    title: "O que é olho seco?",
    description:
      "Entenda o filme lacrimal, os mecanismos da doença e os tipos mais comuns.",
    tags: ["começar", "definição", "filme lacrimal", "evaporativo", "aquoso"],
  },
  {
    href: "/sintomas",
    category: "Sintomas",
    title: "Sintomas de olho seco",
    description:
      "Ardor, areia, lacrimejamento, visão oscilante e padrões que ajudam a contar a história.",
    tags: [
      "ardência",
      "queimação",
      "vermelhidão",
      "lacrimejamento",
      "visão embaçada",
    ],
  },
  {
    href: "/causas",
    category: "Entenda",
    title: "Causas e fatores associados",
    description:
      "Ambiente, pálpebras, baixa produção de lágrimas, medicamentos e condições sistêmicas.",
    tags: [
      "meibomius",
      "sjögren",
      "rosácea",
      "medicamentos",
      "lentes de contato",
    ],
  },
  {
    href: "/diagnostico",
    category: "Investigação",
    title: "Como o olho seco é investigado",
    description:
      "História dos sintomas, observação das pálpebras, lágrimas e testes possíveis.",
    tags: ["diagnóstico", "exames", "testes", "osmolaridade", "meibografia"],
  },
  {
    href: "/autocuidado",
    category: "Vida diária",
    title: "Autocuidado no dia a dia",
    description:
      "Mudanças de baixo risco para ambiente, telas, piscadas, pálpebras e produtos oculares.",
    tags: ["telas", "pausas", "ambiente", "higiene", "piscadas"],
  },
  {
    href: "/tratamentos",
    category: "Tratamentos",
    title: "Entendendo os tratamentos",
    description:
      "Um mapa educativo das opções, organizado por objetivo e mecanismo.",
    tags: [
      "lubrificantes",
      "gotas",
      "inflamação",
      "lentes esclerais",
      "tratamento",
    ],
  },
  {
    href: "/sinais-de-alerta",
    category: "Segurança",
    title: "Sinais de alerta",
    description:
      "Dor intensa, mudança visual, trauma, produto químico e outros sinais que não devem esperar.",
    tags: ["urgência", "dor", "trauma", "visão", "produto químico"],
  },
  {
    href: "/glossario",
    category: "Referência",
    title: "Glossário do olho seco",
    description:
      "Explicações simples para os termos usados em conteúdos e avaliações.",
    tags: ["termos", "dicionário", "significado", "definições"],
  },
  {
    href: "/fontes",
    category: "Transparência",
    title: "Fontes e revisão",
    description:
      "Consensos, instituições públicas e associações de pacientes usados pelo portal.",
    tags: ["referências", "evidências", "TFOS", "DEWS III", "revisão"],
  },
  {
    href: "/app",
    category: "Ferramenta",
    title: "Dry Eye Widget",
    description:
      "Lembretes ajustáveis para pausas, olhar para longe e perceber as piscadas durante o uso de telas.",
    tags: ["aplicativo", "widget", "telas", "pausas", "piscadas", "20-20-20"],
  },
];
