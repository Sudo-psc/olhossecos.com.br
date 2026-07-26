export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  alert?: string;
}

export interface Guide {
  slug: string;
  category: string;
  title: string;
  description: string;
  readingTime: string;
  updated: string;
  datePublished?: string;
  dateModified?: string;
  sourcesVerified?: string;
  tags: string[];
  sections: GuideSection[];
  sources: { label: string; url: string }[];
}

export const guides: Guide[] = [
  {
    slug: "olho-seco-guia-essencial",
    category: "Guia essencial",
    title: "Olho seco: o que é, por que acontece e por onde começar",
    description:
      "Uma visão geral para quem recebeu o diagnóstico ou ainda está tentando entender os sintomas.",
    readingTime: "8 min",
    updated: "25 de julho de 2026",
    tags: ["começar", "sintomas", "diagnóstico", "tratamentos"],
    sections: [
      {
        heading: "Comece pela ideia central",
        paragraphs: [
          "A superfície do olho depende de uma película de lágrimas estável. O TFOS DEWS III define olho seco como uma doença multifatorial e sintomática, marcada pela perda de equilíbrio do filme lacrimal e/ou da superfície ocular.",
          "A condição é multifatorial: evaporação, baixa produção de lágrimas, inflamação, pálpebras, ambiente e percepção nervosa podem participar em proporções diferentes.",
        ],
        note: "Não existe um único teste, produto ou procedimento que explique e resolva todos os casos.",
      },
      {
        heading: "Sintomas que podem aparecer",
        bullets: [
          "ardor, queimação ou sensação de areia;",
          "visão que oscila e melhora ao piscar;",
          "olhos cansados, vermelhos ou sensíveis à luz;",
          "lacrimejamento, especialmente diante de vento ou irritação;",
          "dificuldade com lentes de contato.",
        ],
        paragraphs: [
          "Esses sintomas não são exclusivos de olho seco. Alergia, infecção, alterações das pálpebras e outras condições podem se parecer com ele.",
        ],
      },
      {
        heading: "Por que as causas importam",
        paragraphs: [
          "Quando predomina evaporação, o cuidado pode se concentrar em pálpebras, glândulas e ambiente. Quando há baixa produção aquosa, lubrificação e proteção da superfície ganham outro peso. Formas mistas são frequentes.",
          "Medicamentos, doenças autoimunes, rosácea, alterações da tireoide, lentes de contato e procedimentos oculares anteriores também podem fazer parte do contexto.",
        ],
      },
      {
        heading: "O que você pode fazer agora",
        bullets: [
          "observe horários, atividades e ambientes relacionados aos sintomas;",
          "reduza vento ou ar direto no rosto;",
          "faça pausas em tarefas de muita concentração e pisque suavemente;",
          "liste medicamentos e produtos oculares em uso;",
          "evite receitas caseiras e produtos destinados apenas a disfarçar vermelhidão.",
        ],
        alert:
          "Dor intensa, trauma, produto químico ou mudança súbita da visão não devem ser tratados como simples olho seco.",
      },
      {
        heading: "Como participar das decisões",
        paragraphs: [
          "Pergunte qual mecanismo parece predominar, o objetivo de cada opção, quanto tempo é necessário para avaliar resposta e quais sinais indicam ajuste.",
          "Um plano útil precisa ser compreensível e possível de seguir. Preferências, rotina, tolerância, acesso e custo fazem parte da decisão.",
        ],
      },
    ],
    sources: [
      {
        label: "National Eye Institute — Dry Eye",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye",
      },
      {
        label: "TFOS DEWS III — resumo executivo",
        url: "https://pubmed.ncbi.nlm.nih.gov/41005521/",
      },
      {
        label: "NHS — Dry eyes",
        url: "https://www.nhs.uk/symptoms/dry-eyes/",
      },
    ],
  },
  {
    slug: "telas-piscadas-desconforto",
    category: "Vida diária",
    title: "Telas, piscadas e desconforto",
    description:
      "Como atenção prolongada, posição da tela e ambiente podem mexer com o filme lacrimal.",
    readingTime: "6 min",
    updated: "25 de julho de 2026",
    tags: ["telas", "trabalho", "piscadas", "ambiente"],
    sections: [
      {
        heading: "O problema não é apenas a luz da tela",
        paragraphs: [
          "Ao ler, jogar ou trabalhar com atenção, tendemos a piscar menos e, em algumas pessoas, a piscar de forma incompleta. Cada piscada ajuda a redistribuir as lágrimas; intervalos maiores deixam mais tempo para evaporação.",
          "Ar-condicionado, ventiladores, baixa umidade e uma tela posicionada muito alta podem aumentar a área do olho exposta e piorar o desconforto.",
        ],
      },
      {
        heading: "Pausas que cabem na rotina",
        bullets: [
          "interrompa brevemente tarefas longas em intervalos regulares;",
          "olhe para uma distância maior e relaxe o foco;",
          "faça algumas piscadas lentas e completas, sem apertar;",
          "aumente texto e contraste para evitar tensão desnecessária;",
          "intercale atividades digitais e não digitais quando possível.",
        ],
        note: "A regra 20-20-20 é uma forma simples de lembrar pausas, não uma dose médica rígida. Adapte o lembrete à sua rotina.",
      },
      {
        heading: "Ajustes do posto de trabalho",
        paragraphs: [
          "Mantenha a tela ligeiramente abaixo da linha dos olhos, evite reflexos e direcione saídas de ar para longe do rosto. Se usa mais de uma tela, coloque a principal à frente para reduzir posições sustentadas.",
          "Óculos adequados à distância de trabalho também podem reduzir esforço visual, embora não tratem diretamente a instabilidade das lágrimas.",
        ],
      },
      {
        heading: "Quando investigar além da tela",
        paragraphs: [
          "Se os sintomas aparecem ao acordar, persistem longe de telas, afetam muito um olho ou vêm com dor, secreção ou sensibilidade à luz, a tela provavelmente não conta toda a história.",
        ],
      },
    ],
    sources: [
      {
        label: "National Eye Institute — Dry Eye",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye",
      },
      {
        label: "NHS — Dry eyes",
        url: "https://www.nhs.uk/symptoms/dry-eyes/",
      },
    ],
  },
  {
    slug: "organizar-seus-sintomas",
    category: "Preparação",
    title: "Como organizar uma conversa sobre seus sintomas",
    description:
      "Um roteiro curto para lembrar padrões, tratamentos já tentados e perguntas que realmente ajudam.",
    readingTime: "5 min",
    updated: "25 de julho de 2026",
    tags: ["sintomas", "registro", "decisão compartilhada"],
    sections: [
      {
        heading: "Conte a linha do tempo",
        bullets: [
          "quando começou e se foi súbito ou gradual;",
          "se um olho é mais afetado;",
          "como mudou desde o início;",
          "em quais horários e ambientes piora;",
          "se há alteração visual ou apenas desconforto.",
        ],
      },
      {
        heading: "Liste o contexto",
        paragraphs: [
          "Inclua lentes de contato, cirurgias oculares anteriores, mudanças hormonais, alergias, doenças de pele, condições autoimunes e sintomas como boca seca. Leve uma lista de medicamentos, suplementos, gotas e cosméticos próximos aos olhos.",
        ],
      },
      {
        heading: "Registre o que já tentou",
        paragraphs: [
          "Para cada produto ou mudança, anote por quanto tempo usou, com que frequência, se trouxe alívio e se causou irritação. Fotos dos rótulos ajudam quando os nomes são parecidos.",
        ],
      },
      {
        heading: "Perguntas que esclarecem o plano",
        bullets: [
          "Qual mecanismo parece mais provável?",
          "O que estamos tentando melhorar primeiro?",
          "Como e quando vamos medir a resposta?",
          "Que efeitos indesejados devo observar?",
          "O que fazer se os sintomas piorarem?",
        ],
        note: "Você não precisa chegar com uma teoria pronta. Um relato organizado é mais útil do que tentar adivinhar o diagnóstico.",
      },
    ],
    sources: [
      {
        label: "National Eye Institute — Dry Eye",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye",
      },
      {
        label: "Dry Eye Association — Patient resources",
        url: "https://dry-eye-association.com/",
      },
    ],
  },
  {
    slug: "lubrificantes-perguntas-uteis",
    category: "Tratamentos",
    title: "Lubrificantes, géis e pomadas: perguntas úteis",
    description:
      "Entenda diferenças gerais de viscosidade, conservantes e uso sem comparar marcas.",
    readingTime: "7 min",
    updated: "25 de julho de 2026",
    tags: ["lubrificantes", "gotas", "conservantes", "segurança"],
    sections: [
      {
        heading: "O que muda entre as formulações",
        paragraphs: [
          "Lubrificantes podem variar em viscosidade, tempo de permanência, componentes lipídicos, osmolaridade e sistema de conservação. Um produto mais espesso pode durar mais, mas também embaçar temporariamente a visão.",
          "Géis e pomadas costumam permanecer por mais tempo e, por isso, podem ser usados em contextos diferentes das gotas mais fluidas.",
        ],
      },
      {
        heading: "Por que os conservantes importam",
        paragraphs: [
          "Conservantes ajudam a reduzir contaminação em frascos multidose, mas algumas pessoas apresentam irritação, especialmente com uso frequente ou superfície ocular mais sensível. Existem sistemas de conservação diferentes e apresentações sem conservantes.",
        ],
      },
      {
        heading: "Cuidados de segurança",
        bullets: [
          "lave as mãos antes de usar;",
          "não encoste a ponta do frasco nos cílios ou no olho;",
          "não compartilhe produtos;",
          "observe validade e prazo após abertura;",
          "se houver dor, secreção, inchaço ou piora visual, interrompa e procure orientação.",
        ],
      },
      {
        heading: "Perguntas para escolher com critério",
        bullets: [
          "Qual problema esta formulação pretende aliviar?",
          "A viscosidade combina com minhas atividades?",
          "Há conservante e isso importa para minha frequência de uso?",
          "Como combinar com outros produtos oculares?",
          "Que sinais indicam que devo trocar de estratégia?",
        ],
        alert:
          "Não use gotas de outra pessoa, produtos vencidos ou soluções caseiras. Gotas para reduzir vermelhidão não substituem lubrificação nem investigação da causa.",
      },
    ],
    sources: [
      {
        label: "TFOS DEWS III — manejo e tratamento",
        url: "https://pubmed.ncbi.nlm.nih.gov/40467022/",
      },
      {
        label: "National Eye Institute — Dry Eye",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye",
      },
    ],
  },
  {
    slug: "higiene-palpebral-com-seguranca",
    category: "Autocuidado",
    title: "Higiene palpebral com segurança",
    description:
      "O que essa prática pretende fazer, quais cuidados tomar e por que intensidade não é sinônimo de eficácia.",
    readingTime: "6 min",
    updated: "25 de julho de 2026",
    tags: ["pálpebras", "higiene", "blefarite", "glândulas"],
    sections: [
      {
        heading: "Qual é o objetivo",
        paragraphs: [
          "A higiene palpebral busca remover resíduos das bordas das pálpebras e pode fazer parte do cuidado quando há blefarite ou disfunção das glândulas de Meibomius. Técnica e frequência dependem do quadro e da sensibilidade da pele.",
        ],
      },
      {
        heading: "Calor não deve machucar",
        paragraphs: [
          "Quando calor local é recomendado, ele deve ser confortável e controlado. Temperaturas excessivas podem irritar a pele e a superfície ocular. Não use recipientes improvisados que possam vazar ou causar queimadura.",
        ],
      },
      {
        heading: "Limpeza gentil",
        bullets: [
          "lave as mãos antes de tocar a região;",
          "use material limpo e destinado a esse fim;",
          "evite esfregar com força ou pressionar o globo ocular;",
          "não aplique óleos essenciais, ácidos ou misturas caseiras;",
          "interrompa se houver dor, inchaço ou piora persistente.",
        ],
      },
      {
        heading: "Quando a rotina precisa ser revista",
        paragraphs: [
          "Se a higiene irrita mais do que ajuda, se há lesões de pele, secreção ou sintomas predominantemente em um olho, a estratégia deve ser reavaliada. Mais frequência e mais força não significam melhor resultado.",
        ],
      },
    ],
    sources: [
      {
        label: "NHS — Dry eyes",
        url: "https://www.nhs.uk/symptoms/dry-eyes/",
      },
      {
        label: "Dry Eye Association — Resources",
        url: "https://dry-eye-association.com/",
      },
    ],
  },
  {
    slug: "qualidade-de-vida-e-olho-seco",
    category: "Viver com olho seco",
    title: "Qualidade de vida e olho seco",
    description:
      "Estratégias para lidar com uma condição flutuante sem reduzir a experiência a uma pontuação.",
    readingTime: "7 min",
    updated: "25 de julho de 2026",
    tags: ["qualidade de vida", "dor", "rotina", "trabalho"],
    sections: [
      {
        heading: "Sintomas invisíveis ainda são reais",
        paragraphs: [
          "Olho seco pode interferir em leitura, direção, sono, trabalho e lazer. Como a aparência do olho nem sempre acompanha a intensidade do sintoma, pessoas ao redor podem não perceber o impacto.",
          "Registrar limitações concretas — tempo de tela tolerado, interrupções no trabalho, dificuldade para dirigir — ajuda a mostrar o efeito na vida diária.",
        ],
      },
      {
        heading: "Planeje para a flutuação",
        bullets: [
          "identifique ambientes e horários mais difíceis;",
          "leve os recursos que você já sabe que são seguros para você;",
          "combine pausas antes que o desconforto fique intenso;",
          "adapte iluminação, fluxo de ar e posição de trabalho;",
          "reveja expectativas em períodos de piora.",
        ],
      },
      {
        heading: "Dor persistente merece uma visão ampla",
        paragraphs: [
          "Em algumas pessoas, dor e sensibilidade permanecem desproporcionais aos sinais da superfície ocular. Isso pode envolver processamento nervoso e não significa que o sofrimento seja imaginário.",
          "Sono, humor, enxaqueca e outras condições de dor podem interagir. Uma abordagem ampla pode ser necessária quando estratégias locais não explicam o quadro.",
        ],
      },
      {
        heading: "Apoio e informação de qualidade",
        paragraphs: [
          "Comunidades de pacientes podem reduzir isolamento e oferecer estratégias práticas. Experiências individuais, porém, não substituem evidência nem garantem que um tratamento funcione para outra pessoa.",
        ],
        note: "Use relatos como perguntas para investigar, não como prescrições. Desconfie de promessas de cura, protocolos secretos e pressão para comprar rapidamente.",
      },
    ],
    sources: [
      {
        label: "Dry Eye Association — Patient support",
        url: "https://dry-eye-association.com/",
      },
      {
        label: "Sjögren’s Foundation — Dry Eye",
        url: "https://sjogrens.org/understanding-sjogrens/symptoms/dry-eye",
      },
      {
        label: "TFOS DEWS III — atualização interdisciplinar",
        url: "https://pubmed.ncbi.nlm.nih.gov/40472874/",
      },
    ],
  },
  {
    slug: "conjuntivocalase-olho-seco-mecanico",
    category: "Mecanismos",
    title: "Conjuntivocálase e atrito: o componente mecânico do olho seco",
    description:
      "Entenda como dobras da conjuntiva podem alterar o caminho das lágrimas, aumentar o atrito e produzir sintomas parecidos com olho seco.",
    readingTime: "7 min",
    updated: "26 de julho de 2026",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    sourcesVerified: "26 de julho de 2026",
    tags: [
      "conjuntivocálase",
      "conjunctivochalasis",
      "olho seco mecânico",
      "atrito",
      "conjuntiva",
      "menisco lacrimal",
      "lacrimejamento",
    ],
    sections: [
      {
        heading: "O que é conjuntivocálase",
        paragraphs: [
          "Conjuntivocálase é a presença de pregas frouxas e redundantes na conjuntiva, a membrana transparente que recobre a parte branca do olho. Elas aparecem com mais frequência entre o globo ocular e a pálpebra inferior e se tornam mais comuns com o envelhecimento.",
          "Muitas pessoas não apresentam sintomas. O que importa não é apenas existir uma dobra, mas sua localização, seu volume e a forma como ela interage com as pálpebras, as lágrimas e os pontos de drenagem.",
        ],
      },
      {
        heading: "Por que pode haver um componente mecânico",
        paragraphs: [
          "A cada piscada, as pálpebras espalham as lágrimas e ajudam a levá-las do reservatório da conjuntiva para o menisco lacrimal. Uma prega pode ocupar esse espaço, dificultar a reposição ou a eliminação das lágrimas e aumentar o contato entre pálpebra e superfície ocular.",
          "Neste guia, “olho seco mecânico” descreve esse componente de atrito e alteração do fluxo lacrimal; não é apresentado como uma categoria diagnóstica isolada. Conjuntivocálase pode coexistir com baixa produção aquosa, disfunção das glândulas de Meibomius, instabilidade das lágrimas e inflamação.",
        ],
      },
      {
        heading: "Padrões que merecem ser relatados",
        bullets: [
          "sensação de areia, ardor, queimação ou dor localizada;",
          "visão que oscila e pode melhorar ao piscar;",
          "lacrimejamento apesar da sensação de secura;",
          "piora durante leitura, ao olhar para baixo ou após piscar com força;",
          "desconforto mais intenso em um olho ou em uma região específica.",
        ],
        note: "Esses padrões não confirmam conjuntivocálase. Alergia, blefarite, alterações palpebrais e outras doenças da superfície ocular podem causar sintomas semelhantes.",
      },
      {
        heading: "Como é investigada",
        paragraphs: [
          "A avaliação costuma observar a conjuntiva com ampliação, inclusive durante as piscadas e em diferentes posições do olhar. A relação das pregas com o menisco lacrimal e os pontos de drenagem pode ser mais informativa do que a presença de uma dobra isolada.",
          "Corantes, estabilidade e volume das lágrimas, condição das pálpebras e das glândulas de Meibomius e sinais de inflamação ajudam a verificar quais mecanismos realmente participam. Em alguns contextos, imagens do segmento anterior podem documentar a anatomia.",
        ],
      },
      {
        heading: "Como o cuidado é decidido",
        paragraphs: [
          "Quando não há sintomas ou repercussão relevante, pode não ser necessário tratar a conjuntivocálase. Nos casos sintomáticos, o cuidado pode começar por lubrificação e pelo controle de fatores coexistentes da superfície ocular.",
          "Se os sintomas persistem e a avaliação mostra relação clara com as pregas, um especialista pode discutir procedimentos para reposicionar ou reduzir o tecido redundante. A indicação depende da anatomia, dos demais mecanismos e da resposta às medidas conservadoras.",
        ],
        alert:
          "Procedimentos na conjuntiva não são autocuidado. Dor intensa, mudança súbita da visão, trauma ou produto químico no olho exigem avaliação rápida.",
      },
    ],
    sources: [
      {
        label: "Marmalidou et al. — Conjunctivochalasis: a systematic review",
        url: "https://pubmed.ncbi.nlm.nih.gov/29128574/",
      },
      {
        label:
          "Huang et al. — Conjunctivochalasis interferes with tear flow from fornix to tear meniscus",
        url: "https://pubmed.ncbi.nlm.nih.gov/23583167/",
      },
      {
        label:
          "Di Pascuale et al. — Clinical characteristics of conjunctivochalasis",
        url: "https://pubmed.ncbi.nlm.nih.gov/14977775/",
      },
      {
        label:
          "Ahn et al. — Effects of tear-film mechanisms on friction-related disease",
        url: "https://pubmed.ncbi.nlm.nih.gov/35219899/",
      },
    ],
  },
];

export const getGuide = (slug: string) =>
  guides.find((guide) => guide.slug === slug);
