import { figures, type FigureAsset } from "./figures.ts";

/**
 * Resultado quantitativo de um estudo citado na seção. `caveat` carrega a
 * limitação que anda junto do número — evidência curta, amostra pequena, efeito
 * que não se sustenta depois de interromper. Sem ela o bloco vira propaganda.
 */
export interface GuideEvidence {
  design: string;
  effect: string;
  outcome: string;
  stats?: string[];
  level?: 1 | 2 | 3 | 4 | 5;
  levelLabel?: string;
  caveat?: string;
  reference?: { label: string; url: string };
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  alert?: string;
  evidence?: GuideEvidence;
  figure?: FigureAsset;
}

/**
 * Abertura do guia em três frases: o que se sabe, o que isso muda na prática e
 * o que ainda não está resolvido. A limitação é campo obrigatório da estrutura
 * justamente para não existir resumo que só entregue a boa notícia.
 */
export interface GuideSummary {
  finding: string;
  implication: string;
  limits: string;
}

export interface Guide {
  slug: string;
  category: string;
  title: string;
  /**
   * Título só para <title> e SERP, quando a manchete editorial passa dos ~60
   * caracteres que o Google exibe. O H1 continua sendo `title`: encurtar a
   * manchete para caber no buscador seria deixar o buscador escrever a pauta.
   */
  seoTitle?: string;
  description: string;
  summary?: GuideSummary;
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
    summary: {
      finding:
        "Olho seco é uma doença multifatorial da superfície ocular: evaporação, baixa produção aquosa, inflamação, pálpebras, ambiente e percepção nervosa participam em proporções diferentes em cada pessoa.",
      implication:
        "Saber qual mecanismo predomina muda o foco do cuidado — pálpebras e ambiente quando a evaporação lidera, lubrificação e proteção quando falta produção aquosa. Formas mistas são frequentes.",
      limits:
        "Nenhum teste, produto ou procedimento isolado explica e resolve todos os casos, e os sintomas se confundem com os de alergia, infecção e alterações palpebrais.",
    },
    readingTime: "8 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
    tags: ["começar", "sintomas", "diagnóstico", "tratamentos"],
    sections: [
      {
        heading: "Comece pela ideia central",
        figure: figures.tearFilmEducation,
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
        heading: "Quem tem mais chance de desenvolver",
        paragraphs: [
          "Uma metanálise que reuniu 48 estudos e cerca de 493 mil pessoas estimou o peso de vários fatores. Ter mais idade e ser mulher apareceram entre os mais consistentes. Também pesaram uso de telas, uso de lentes de contato, cirurgia de catarata e outras cirurgias oculares.",
          "Entram na lista ainda condições que muita gente não associa aos olhos: rosácea, doenças da tireoide, depressão, apneia do sono, enxaqueca, artrite, alergia e asma.",
        ],
        note: "Fator de risco não é causa nem destino. Ter vários não significa que você terá a doença, e não ter nenhum não a descarta. Serve para orientar o que investigar.",
        evidence: {
          design: "Revisão sistemática e metanálise",
          effect: "48 estudos",
          outcome:
            "fatores associados à síndrome do olho seco em ~493 mil pessoas",
          stats: ["idade e sexo feminino entre os mais consistentes"],
          level: 2,
          levelLabel: "Moderado",
          caveat:
            "Metanálise de estudos observacionais: associação, não prova de causa individual.",
          reference: {
            label:
              "Qian e Wei. Identified risk factors for dry eye syndrome, 2022",
            url: "https://doi.org/10.1371/journal.pone.0271267",
          },
        },
      },
      {
        heading: "Como isso aparece no Brasil",
        paragraphs: [
          "Um estudo com 2.140 universitários brasileiros encontrou 34,4% com escore de sintomas acima do ponto de corte do OSDI. Entre os fatores associados estavam sexo feminino, lentes de contato, mais de 6 horas diárias de tela, dormir menos de 6 horas e alguns medicamentos.",
          "Uma revisão sistemática de 16 estudos sul-americanos encontrou prevalência média de sintomas em torno de 39%, com variação grande entre populações e métodos.",
        ],
        note: "São estudos de sintomas relatados, não de diagnóstico confirmado em consulta — por isso os números costumam ser mais altos do que a prevalência clínica.",
        evidence: {
          design: "Inquérito transversal com 2.140 universitários brasileiros",
          effect: "34,4%",
          outcome: "escore OSDI acima do ponto de corte de sintomas",
          stats: [
            "idade média 23,4 anos",
            "sinais clínicos leves apesar dos sintomas",
          ],
          level: 3,
          levelLabel: "Baixo a moderado",
          caveat:
            "Amostra jovem e universitária; o número descreve sintomas relatados, não diagnóstico clínico confirmado.",
          reference: {
            label:
              "Yang et al. Prevalence and associated risk factors among Brazilian undergraduate students, 2021",
            url: "https://doi.org/10.1371/journal.pone.0259399",
          },
        },
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
        label:
          "Qian et al. Identified risk factors for dry eye syndrome: a systematic review and meta-analysis. PLOS ONE, 2022.",
        url: "https://doi.org/10.1371/journal.pone.0271267",
      },
      {
        label:
          "Yang et al. Prevalence and associated risk factors for dry eye disease among Brazilian undergraduate students. PLOS ONE, 2021.",
        url: "https://doi.org/10.1371/journal.pone.0259399",
      },
      {
        label:
          "Loaiza-Guevara et al. Understanding the dry eye disease-related symptoms in South America: prevalence and associated factors. J Clin Med, 2024.",
        url: "https://doi.org/10.3390/jcm13206060",
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
      "Como o uso prolongado de telas, a redução das piscadas e o ambiente desestabilizam o filme lacrimal — e o que a regra 20-20-20 faz e não faz.",
    summary: {
      finding:
        "Ler reduz a frequência de piscadas em qualquer suporte, mas o aumento de piscadas incompletas apareceu só nos formatos eletrônicos. Exercícios de piscada reduziram a proporção de piscadas incompletas de 54% para 34% em quatro semanas.",
      implication:
        "Pausas regulares, ajuste do posto de trabalho, fonte maior e piscadas lentas e completas são medidas de baixo custo para quem passa horas diante de telas.",
      limits:
        "Os ganhos dos exercícios voltaram ao ponto de partida semanas depois da interrupção, e a regra 20-20-20 melhorou sintomas sem alterar nenhuma medida objetiva do filme lacrimal — a melhora não se manteve uma semana após desligar os lembretes.",
    },
    readingTime: "6 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
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
        heading: "Exercícios de piscada: o que já foi testado",
        figure: figures.blinkCompletenessEducation,
        paragraphs: [
          "Piscar de forma incompleta é comum diante de telas, e alguns estudos testaram exercícios simples para corrigir esse padrão. Um ensaio de 2025 comparou rotinas diferentes e encontrou como mais eficaz o ciclo fechar, apertar suavemente e abrir, repetido 15 vezes, três vezes ao dia.",
          "Em um estudo anterior, quatro semanas de exercícios reduziram a proporção de piscadas incompletas de 54% para 34%, com melhora nos questionários de sintomas.",
        ],
        note: "Nos dois estudos, os ganhos tenderam a voltar ao ponto de partida algumas semanas depois que os exercícios foram interrompidos. É uma prática de manutenção, não algo que se faz uma vez e resolve.",
        evidence: {
          design: "Ensaio clínico de exercícios de piscada",
          effect: "54% → 34%",
          outcome: "proporção de piscadas incompletas após quatro semanas",
          stats: [
            "4 semanas de treino",
            "melhora nos questionários de sintomas",
          ],
          level: 2,
          levelLabel: "Baixo",
          caveat:
            "Ensaio de curta duração: o desfecho foi medido ao fim das quatro semanas de treino.",
          reference: {
            label:
              "Kim et al. Therapeutic benefits of blinking exercises in dry eye disease, 2021",
            url: "https://doi.org/10.1016/j.clae.2020.04.014",
          },
        },
      },
      {
        heading: "O que a regra 20-20-20 faz e o que ela não faz",
        paragraphs: [
          "Um estudo instalou lembretes automáticos da regra em computadores de pessoas com sintomas e acompanhou o efeito por duas semanas. Os sintomas de desconforto digital e de olho seco diminuíram, mas nenhuma medida objetiva do filme lacrimal ou da superfície ocular mudou de forma significativa.",
          "Uma semana depois que os lembretes foram desligados, a melhora dos sintomas não se manteve.",
        ],
        note: "Isso não desqualifica a regra — alívio de sintoma tem valor próprio. Só ajuda a calibrar a expectativa: é um hábito de conforto, não uma correção da causa.",
      },
      {
        heading: "Papel e tela não afetam a piscada do mesmo jeito",
        paragraphs: [
          "Ler reduz a frequência de piscadas em qualquer suporte, provavelmente pela demanda de atenção. Mas um estudo que comparou seis condições de leitura observou aumento das piscadas incompletas apenas nos formatos eletrônicos.",
          "Entre as condições testadas, ampliar bastante o texto na tela foi a que menos reduziu a frequência de piscadas — o que conversa com a orientação prática de aumentar fonte e contraste.",
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
      {
        label:
          "Wolffsohn et al. Optimisation of blinking exercises for dry eye disease. Contact Lens Anterior Eye, 2025.",
        url: "https://doi.org/10.1016/j.clae.2025.102453",
      },
      {
        label:
          "Kim et al. Therapeutic benefits of blinking exercises in dry eye disease. Contact Lens Anterior Eye, 2021.",
        url: "https://doi.org/10.1016/j.clae.2020.04.014",
      },
      {
        label:
          "Talens-Estarelles et al. The effects of breaks on digital eye strain, dry eye and binocular vision: testing the 20-20-20 rule. Contact Lens Anterior Eye, 2023.",
        url: "https://doi.org/10.1016/j.clae.2022.101744",
      },
      {
        label:
          "Argilés et al. Blink rate and incomplete blinks in six different controlled hard-copy and electronic reading conditions. IOVS, 2015.",
        url: "https://doi.org/10.1167/iovs.15-16967",
      },
    ],
  },
  {
    slug: "organizar-seus-sintomas",
    category: "Preparação",
    title: "Como organizar uma conversa sobre seus sintomas",
    description:
      "Um roteiro curto para lembrar padrões, tratamentos já tentados e perguntas que realmente ajudam.",
    summary: {
      finding:
        "Questionários padronizados como o OSDI e o DEQ-5 transformam a queixa em número e permitem comparar a mesma pessoa ao longo do tempo. Papel e aplicativo produziram resultados equivalentes.",
      implication:
        "Levar linha do tempo, lista de medicamentos, o que já foi tentado e notas de 0 a 10 registradas em dias fixos torna a consulta mais objetiva do que descrever de memória.",
      limits:
        "São medidas de sintoma, não exames: escore alto não fecha diagnóstico, escore baixo não descarta doença, e variação pequena entre consultas pode ser apenas oscilação natural.",
    },
    readingTime: "5 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
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
        heading: "Os questionários que a consulta costuma usar",
        paragraphs: [
          "Existem questionários padronizados de sintomas. Os mais citados são o OSDI, com 12 perguntas, e o DEQ-5, com 5. Eles transformam queixas em um número, o que permite comparar você com você mesmo ao longo do tempo.",
          "São medidas de sintoma, não exames. Um escore alto não fecha diagnóstico e um escore baixo não descarta doença — inclusive porque sintoma e sinal frequentemente não andam juntos no olho seco.",
        ],
        note: "Vale saber que existe uma diferença mínima considerada clinicamente relevante para esses escores. Uma variação pequena entre duas consultas pode ser apenas variação natural, não piora ou melhora real.",
      },
      {
        heading: "Leve números, não só adjetivos",
        figure: figures.symptomDiaryEducation,
        paragraphs: [
          '"Melhorou um pouco" é difícil de interpretar meses depois. Um registro simples resolve boa parte disso e não exige aplicativo nenhum.',
        ],
        bullets: [
          "dê uma nota de 0 a 10 ao desconforto, no mesmo horário, alguns dias por semana;",
          "anote quantas vezes ao dia precisou pingar lubrificante;",
          "marque os dias em que os sintomas atrapalharam algo concreto — dirigir à noite, ler, trabalhar;",
          "registre a data em que começou cada tratamento novo.",
        ],
        note: "Um estudo comparou a versão em papel e a versão em aplicativo do OSDI e encontrou resultados equivalentes. O suporte importa menos do que a constância do registro.",
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
      {
        label:
          "Nagino et al. Smartphone app-based and paper-based patient-reported outcomes using a disease-specific questionnaire for dry eye disease: randomized crossover equivalence study. J Med Internet Res, 2023.",
        url: "https://doi.org/10.2196/42638",
      },
    ],
  },
  {
    slug: "lubrificantes-perguntas-uteis",
    category: "Tratamentos",
    title: "Lubrificantes, géis e pomadas: perguntas úteis",
    description:
      "Entenda diferenças gerais de viscosidade, conservantes e uso sem comparar marcas.",
    summary: {
      finding:
        "Lubrificantes diferem em viscosidade, componentes lipídicos, eletrólitos, osmoprotetores e sistema de conservação; cada grupo de ingrediente responde a um problema distinto da superfície.",
      implication:
        "A escolha acompanha o mecanismo predominante e a frequência de uso. Com muitas aplicações diárias, outros colírios contínuos ou lentes de contato, consensos recomendam evitar formulações com BAK.",
      limits:
        "Nenhuma revisão elege um produto superior aos demais: dois lubrificantes igualmente bons podem render experiências opostas porque não foram desenhados para o mesmo problema.",
    },
    readingTime: "7 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
    tags: ["lubrificantes", "gotas", "conservantes", "segurança"],
    sections: [
      {
        heading: "O que muda entre as formulações",
        figure: figures.tearSubstituteViscosityEducation,
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
        heading: "O que cada tipo de ingrediente costuma fazer",
        paragraphs: [
          "Uma revisão sobre a composição dos lubrificantes descreve grupos de ingredientes com papéis distintos. Agentes de viscosidade aumentam o tempo de permanência na superfície. Componentes lipídicos atuam sobre a camada mais externa do filme e interessam mais quando o problema é evaporativo.",
          "Eletrólitos e osmoprotetores buscam se aproximar da composição natural da lágrima e amortecer o efeito de uma lágrima concentrada demais. Já os surfactantes ajudam a espalhar a fórmula.",
        ],
        note: "Isso explica por que dois produtos igualmente bons podem render experiências diferentes: eles não foram desenhados para o mesmo problema.",
      },
      {
        heading: "Conservantes e frequência de uso",
        paragraphs: [
          "O conservante mais estudado é o cloreto de benzalcônio (BAK). Estudos laboratoriais e de modelo animal mostram que ele desestabiliza o filme lacrimal e reduz as células caliciformes da conjuntiva, e há descrição de acúmulo nos tecidos com uso prolongado.",
          "Por isso, consensos internacionais recomendam evitar lubrificantes com BAK em quem precisa pingar muitas vezes ao dia ou usa outros colírios de forma contínua, como no glaucoma. Para uso ocasional, a questão pesa menos.",
        ],
        alert:
          "Isso não significa que todo colírio com conservante seja inadequado. Significa que frequência e tempo de uso mudam o cálculo — e são justamente o que você deve informar em consulta.",
      },
      {
        heading: "Se você usa lentes de contato",
        paragraphs: [
          "Uma revisão sobre compatibilidade entre lubrificantes e lentes de contato conclui que gotas sem conservantes são a escolha preferencial para pingar com as lentes nos olhos. Quando houver conservante, formulações com BAK e timerosal são as que a revisão recomenda evitar.",
          "Nem todo lubrificante é feito para ser usado com a lente colocada. A bula informa isso, e vale conferir antes.",
        ],
      },
      {
        heading: "Perguntas para escolher com critério",
        bullets: [
          "Qual problema esta formulação pretende aliviar?",
          "A viscosidade combina com minhas atividades?",
          "Há conservante e isso importa para minha frequência de uso?",
          "Posso pingar com a lente de contato nos olhos?",
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
      {
        label:
          "Labetoulle et al. Artificial tears: biological role of their ingredients in the management of dry eye disease. Int J Mol Sci, 2022.",
        url: "https://doi.org/10.3390/ijms23052434",
      },
      {
        label:
          "D'Andrea et al. Is it time for a moratorium on the use of benzalkonium chloride in eyedrops? Br J Clin Pharmacol, 2022.",
        url: "https://doi.org/10.1111/bcp.15359",
      },
      {
        label:
          "Pucker. A review of the compatibility of topical artificial tears and rewetting drops with contact lenses. Contact Lens Anterior Eye, 2020.",
        url: "https://doi.org/10.1016/j.clae.2020.04.013",
      },
    ],
  },
  {
    slug: "tratamento-com-colirios-diferencas-e-tipos",
    category: "Tratamentos",
    title: "Tratamento com colírios: tipos, diferenças e uso seguro",
    seoTitle: "Colírios para olho seco: tipos e uso seguro",
    description:
      "Um guia para entender o que muda entre lágrimas artificiais, géis, pomadas, conservantes e colírios de prescrição.",
    summary: {
      finding:
        "Colírio é um formato de aplicação, não um tratamento único. Lágrimas artificiais aliviam sintomas e apoiam o filme lacrimal; imunomoduladores, corticoides e antimicrobianos tratam mecanismos e doenças específicas.",
      implication:
        "Viscosidade, conservante, horário e compatibilidade com lentes precisam combinar com a rotina — e colírio de prescrição depende de indicação e acompanhamento, não da intensidade do ardor ou da vermelhidão.",
      limits:
        "O alívio logo após pingar mostra que a superfície foi umedecida, mas não confirma a causa. Não existe um “colírio mais forte” que seja melhor para todo mundo.",
    },
    readingTime: "9 min",
    updated: "10 de agosto de 2026",
    datePublished: "2026-08-10",
    dateModified: "2026-08-10",
    sourcesVerified: "10 de agosto de 2026",
    tags: [
      "colírios",
      "tratamento",
      "lágrimas artificiais",
      "lubrificantes",
      "conservantes",
      "géis",
      "pomadas",
      "uso seguro",
    ],
    sections: [
      {
        heading: "Colírio é um formato, não um tratamento único",
        paragraphs: [
          "Colírio é uma forma de aplicar uma solução, emulsão, suspensão ou medicamento na superfície do olho. O mesmo formato pode servir para lubrificar, tratar alergia, controlar inflamação, combater uma infecção, reduzir a pressão ocular ou preparar um exame.",
          "No olho seco, as lágrimas artificiais são usadas principalmente para aliviar sintomas e apoiar o filme lacrimal. Elas não corrigem sozinhas todas as causas possíveis, como alteração das pálpebras, disfunção das glândulas de Meibomius ou inflamação. Por isso, não existe um “colírio mais forte” que seja melhor para todo mundo.",
        ],
        note: "Alívio logo depois da aplicação mostra que a superfície foi umedecida; não confirma, sozinho, qual é a causa do desconforto.",
      },
      {
        heading: "Lágrimas artificiais: o que muda na formulação",
        paragraphs: [
          "As lágrimas artificiais podem combinar água, sais, polímeros e outras substâncias que ajudam a espalhar ou manter o líquido na superfície. Entre os componentes encontrados em diferentes formulações estão carmelose, hipromelose, hialuronato, polietilenoglicol, glicerina, trealose e componentes lipídicos. O nome do componente não permite prever sozinho qual produto funcionará melhor.",
          "Algumas formulações são mais fluidas e interferem menos na visão, mas podem exigir reaplicação mais frequente. Outras aumentam a permanência ou acrescentam uma fase lipídica, o que pode ser útil quando a evaporação participa do quadro, mas também pode deixar a visão embaçada por alguns minutos.",
          "A escolha depende do mecanismo predominante, da frequência de uso, da rotina, da tolerância e da presença de lentes de contato. Uma formulação diferente pode fazer mais sentido quando a primeira arde, dura pouco ou deixa a visão turva demais.",
        ],
      },
      {
        heading: "Gotas líquidas, géis e pomadas",
        bullets: [
          "Gotas líquidas: costumam ser mais confortáveis durante o dia e causar menos embaçamento, mas podem permanecer menos tempo.",
          "Géis: são mais viscosos, tendem a durar mais e podem ser úteis em determinados horários; a visão pode ficar turva temporariamente.",
          "Pomadas: formam uma camada mais espessa e duradoura, geralmente reservada para a noite porque são oleosas e borram a visão. Não devem ser usadas com lentes de contato, a menos que isso tenha sido especificamente orientado.",
        ],
        paragraphs: [
          "Mais viscoso não significa automaticamente melhor. A formulação precisa proteger a superfície sem atrapalhar a atividade que você precisa realizar. A bula e a orientação profissional devem prevalecer sobre uma regra geral.",
        ],
      },
      {
        heading: "Com conservante ou sem conservante",
        paragraphs: [
          "Conservantes ajudam a manter a segurança microbiológica de muitos frascos multidose. Em algumas pessoas, porém, o uso frequente ou prolongado de formulações conservadas pode irritar uma superfície ocular já sensível. As apresentações sem conservante podem vir em flaconetes de dose única ou em frascos multidose com sistemas próprios de proteção.",
          "Como regra prática, quando a lágrima artificial é usada muitas vezes ao dia, quando existe sensibilidade a conservantes ou quando há lentes de contato, vale discutir uma opção sem conservante. Materiais para pacientes usam com frequência a faixa de quatro a seis aplicações diárias como sinal para essa conversa, não como uma prescrição rígida.",
          "Sem conservante não significa que a gota será ideal para qualquer pessoa ou que nunca causará ardor: o princípio ativo, os demais componentes, o pH e a própria condição do olho também importam. Com lentes de contato, use apenas uma apresentação indicada como compatível e siga o intervalo de retirada e recolocação informado no rótulo ou pela equipe.",
        ],
      },
      {
        heading: "Colírios de prescrição não são “lágrimas mais fortes”",
        paragraphs: [
          "Alguns colírios tratam mecanismos específicos e não devem ser escolhidos apenas pela vermelhidão ou pelo ardor. Eles podem ser necessários quando há uma doença identificada, mas precisam de indicação, acompanhamento e, em alguns casos, receita.",
        ],
        bullets: [
          "Anti-inflamatórios e imunomoduladores, como ciclosporina ou lifitegraste, podem fazer parte do cuidado do olho seco com componente inflamatório. A resposta costuma ser diferente do alívio imediato de uma lágrima artificial.",
          "Corticoides reduzem inflamação e podem ter papel por tempo limitado, mas o uso inadequado pode aumentar a pressão ocular, favorecer catarata ou agravar infecções.",
          "Antibióticos, antivirais e antifúngicos são direcionados a infecções específicas. Um olho vermelho ou ardendo não é, por si só, motivo para usar um antimicrobiano.",
          "Colírios para alergia procuram controlar coceira e lacrimejamento alérgico; não substituem a investigação de outras causas de secura.",
          "Colírios que apenas contraem vasos para deixar o olho mais branco não tratam a causa do olho seco. O uso diário pode fazer a vermelhidão voltar ou piorar quando o efeito passa.",
        ],
        alert:
          "Não use sobras de antibiótico, corticoide, anestésico ou colírio de outra pessoa. Anestésicos oftálmicos são para procedimentos e não devem ser usados em casa.",
      },
      {
        heading: "Como a escolha é feita",
        paragraphs: [
          "Uma escolha razoável começa pela pergunta: o que estamos tentando melhorar? Evaporação, baixa produção, inflamação, alergia, infecção, problema palpebral e uso de lentes pedem raciocínios diferentes. O exame e a história ajudam a separar esses caminhos.",
        ],
        bullets: [
          "Qual mecanismo parece participar mais: evaporação, pouca produção, inflamação ou uma combinação?",
          "A prioridade é aliviar, proteger a córnea, tratar uma causa ou mudar a evolução da doença?",
          "A viscosidade e o possível embaçamento combinam com trabalho, direção, leitura e telas?",
          "A frequência de uso e as lentes de contato tornam o conservante relevante?",
          "Como combinar esta gota com as outras e em quanto tempo a resposta será revisada?",
          "Quais efeitos são esperados e quais indicam que devo procurar orientação?",
        ],
      },
      {
        heading: "Uso seguro em casa",
        bullets: [
          "lave as mãos antes de abrir o frasco e não encoste a ponta no olho, nos cílios ou na pele;",
          "confira o nome, a validade e o prazo de uso depois de aberto indicado na embalagem;",
          "feche o frasco logo após aplicar e não compartilhe colírios;",
          "se usar mais de um medicamento ocular, aguarde cerca de cinco minutos entre eles, salvo orientação diferente;",
          "use a quantidade e a frequência da receita ou da bula, sem aumentar por conta própria;",
          "retire as lentes de contato quando o produto não for compatível ou quando o rótulo e a equipe orientarem;",
          "anote ardor, coceira, inchaço, vermelhidão, embaçamento e duração do alívio para conversar na revisão.",
        ],
        note: "Uma gota aplicada corretamente costuma ser mais útil do que várias gotas que escorrem para fora. Não tente compensar uma aplicação perdida dobrando a próxima dose sem orientação.",
      },
      {
        heading: "Quando não é hora de testar outro colírio",
        paragraphs: [
          "Dor intensa, sensibilidade importante à luz, mudança súbita da visão, secreção espessa, trauma, exposição química ou vermelhidão marcada — especialmente em quem usa lentes de contato — pedem avaliação rápida. Esses sinais podem apontar para problemas que não devem ser mascarados por lubrificantes ou gotas para “tirar o vermelho”.",
          "Se um colírio provocar inchaço, coceira intensa, falta de ar, piora persistente ou alteração visual, procure orientação imediatamente e leve o frasco ou uma foto do rótulo.",
        ],
        alert:
          "Este guia é educativo. A indicação de um colírio, principalmente antibiótico, corticoide, antialérgico ou imunomodulador, depende da avaliação individual.",
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
      {
        label: "American Academy of Ophthalmology — Eye Drops",
        url: "https://store.aao.org/media/resources/051183/051183-Eye-Drops-rf1.pdf",
      },
      {
        label: "American Academy of Ophthalmology — Dry Eye",
        url: "https://store.aao.org/media/resources/051180/051180-dry-eye-rf1.pdf",
      },
      {
        label: "Guy’s and St Thomas’ NHS — Dry eye syndrome: treatment",
        url: "https://www.guysandstthomas.nhs.uk/health-information/dry-eye-syndrome/treatment",
      },
      {
        label: "Ministério da Saúde — Doenças oculares",
        url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/doencas-oculares/doencas-oculares/",
      },
    ],
  },
  {
    slug: "olho-seco-apos-cirurgia-ocular",
    category: "Pós-operatório",
    title:
      "Olho seco após cirurgia ocular: o que é esperado, como cuidar e quando procurar ajuda",
    seoTitle: "Olho seco após cirurgia ocular: o que esperar",
    description:
      "Como entender desconforto, visão oscilante e uso de colírios depois de catarata ou cirurgia refrativa.",
    summary: {
      finding:
        "Catarata e cirurgia refrativa podem alterar temporariamente a superfície ocular, a sensibilidade da córnea e a estabilidade do filme lacrimal. Uma revisão sistemática encontrou piora de parâmetros do olho seco que pode persistir até três meses após a catarata.",
      implication:
        "A tendência importa mais que o sintoma isolado: desconforto leve que melhora aos poucos difere de dor, vermelhidão ou perda visual que aumentam. As instruções da equipe que operou prevalecem sobre regras gerais.",
      limits:
        "Os prazos descrevem grupos de pacientes, não uma pessoa. Olho seco é uma possibilidade, não um diagnóstico automático — infecção, inflamação e mudança refrativa também causam dor e embaçamento.",
    },
    readingTime: "9 min",
    updated: "10 de agosto de 2026",
    datePublished: "2026-08-10",
    dateModified: "2026-08-10",
    sourcesVerified: "10 de agosto de 2026",
    tags: [
      "cirurgia",
      "pós-operatório",
      "catarata",
      "LASIK",
      "PRK",
      "recuperação",
      "colírios",
      "sinais de alerta",
    ],
    sections: [
      {
        heading: "A ideia central: recuperação e olho seco podem se misturar",
        paragraphs: [
          "Cirurgias de catarata e cirurgias refrativas, como LASIK e PRK, podem alterar temporariamente a superfície ocular, a sensibilidade da córnea e a estabilidade do filme lacrimal. Ardor, sensação de areia, lacrimejamento e visão que oscila podem aparecer durante a recuperação.",
          "Olho seco é uma possibilidade, não um diagnóstico automático. Infecção, inflamação, alteração da córnea, mudança refrativa e outras condições também podem causar dor ou embaçamento. A técnica utilizada, o estado do olho antes da cirurgia e as instruções da equipe definem o que é esperado em cada caso.",
        ],
        note: "Este guia ajuda a organizar perguntas. As orientações escritas pela equipe que realizou o procedimento têm prioridade sobre qualquer regra geral encontrada na internet.",
      },
      {
        heading: "Antes da cirurgia, o que vale contar",
        paragraphs: [
          "Informe se já tinha olho seco, ardor, visão oscilante, uso frequente de lágrimas artificiais, lentes de contato, blefarite, alergia, cirurgia ocular anterior, doença autoimune ou uso de medicamentos. Uma superfície ocular instável pode precisar de avaliação e cuidado antes de uma cirurgia eletiva.",
          "No LASIK, olho seco está entre as condições que podem aumentar o risco de complicações. Isso não decide sozinho se alguém pode ou não operar, mas torna a conversa pré-operatória mais importante.",
        ],
        bullets: [
          "Quais sintomas são esperados na minha cirurgia e por quanto tempo?",
          "A superfície ocular precisa ser tratada ou acompanhada antes do procedimento?",
          "Quais colírios serão usados, por quanto tempo e o que devo fazer se esquecer uma aplicação?",
          "Quando posso retomar telas, exercício, direção e lentes de contato?",
          "Qual é o contato para dúvidas ou piora depois da cirurgia?",
        ],
      },
      {
        heading: "O que pode acontecer no começo",
        bullets: [
          "sensação de areia, ardor leve ou irritação;",
          "lacrimejamento e alguma vermelhidão;",
          "visão borrada ou oscilante enquanto a superfície se estabiliza;",
          "sensibilidade à luz ou desconforto com vento e ar seco;",
          "necessidade temporária de usar colírios conforme o plano recebido.",
        ],
        paragraphs: [
          "Após a cirurgia de catarata, materiais de orientação a pacientes descrevem vermelhidão leve, lacrimejamento, sensação de areia e visão borrada como sintomas que costumam melhorar progressivamente. Depois do LASIK, olho seco, halos, visão borrada e sensibilidade à luz são efeitos conhecidos e, em geral, melhoram ao longo dos meses. A trajetória da PRK e de outras técnicas pode ser diferente.",
        ],
        note: "A tendência importa: sintomas leves que melhoram gradualmente são diferentes de dor, vermelhidão ou perda visual que aumentam.",
      },
      {
        heading: "Como proteger a recuperação",
        bullets: [
          "use os colírios prescritos exatamente como orientado; não prolongue, interrompa ou troque medicamentos de prescrição por conta própria;",
          "lave e seque as mãos antes de tocar a região ou aplicar gotas;",
          "não encoste a ponta do frasco no olho, nos cílios ou na pele;",
          "não esfregue nem pressione o olho, mesmo quando houver coceira ou sensação de corpo estranho;",
          "reduza vento, fumaça e fluxo direto de ar; óculos escuros podem tornar a luz mais confortável;",
          "não volte a usar lentes de contato até receber liberação para o seu caso;",
          "siga as restrições específicas sobre água, maquiagem, exercício, natação e proteção durante o sono;",
          "compareça às revisões e conte se o desconforto estiver atrapalhando leitura, trabalho, direção ou sono.",
        ],
        note: "Se a equipe liberar uma lágrima artificial adicional, confirme qual apresentação é compatível com o pós-operatório e como separá-la dos demais colírios.",
      },
      {
        heading: "Por que a visão pode oscilar",
        paragraphs: [
          "O filme lacrimal também funciona como uma superfície óptica. Quando ele se rompe ou se distribui de maneira irregular, a visão pode ficar nublada ou variar entre as piscadas. Isso pode acontecer junto com ardor e sensação de secura.",
          "Uma revisão sistemática sobre cirurgia de catarata encontrou evidências de piora de alguns parâmetros do olho seco no período inicial e intermediário, com alterações que podem persistir até três meses. Esse dado descreve grupos de pacientes, não cria um prazo individual de recuperação.",
          "Para o LASIK, o National Eye Institute informa que a cicatrização pode levar de dois a três meses e que efeitos como olho seco, halos, embaçamento e sensibilidade à luz costumam melhorar nesse período. Raramente, podem persistir. Se a visão piora rapidamente ou volta a piorar depois de ter melhorado, não espere o prazo terminar para pedir orientação.",
        ],
      },
      {
        heading: "Como a equipe verifica se é olho seco",
        paragraphs: [
          "A avaliação combina o tempo desde a cirurgia, o tipo de sintoma, a comparação entre os olhos e o exame da superfície ocular. A equipe pode observar a córnea, as pálpebras, as piscadas e a inflamação, além de medir a quantidade ou a estabilidade das lágrimas e usar corantes quando isso ajuda a responder à pergunta clínica.",
          "Quando os sintomas continuam, a investigação pode precisar separar olho seco de problemas de cicatrização, infecção, alteração refrativa, inflamação ou dor com componente neurossensorial. Um único número ou uma única aplicação de colírio não explica todos os pós-operatórios.",
        ],
        note: "Leve os nomes dos colírios, a data da cirurgia, as instruções recebidas e uma descrição de quando a visão ou o desconforto pioram.",
      },
      {
        heading: "Sinais de alerta: quando procurar ajuda rapidamente",
        bullets: [
          "dor forte ou dor que está aumentando, especialmente se não melhora com a orientação recebida;",
          "visão que piora rapidamente ou que começa a piorar depois de uma melhora inicial;",
          "vermelhidão, inchaço ou sensibilidade à luz que aumentam;",
          "secreção espessa ou pegajosa;",
          "flashes de luz, aumento súbito de pontos ou fios escuros, sombra ou cortina no campo visual;",
          "trauma, perfuração ou contato com produto químico.",
        ],
        alert:
          "Dor intensa ou piora rápida da visão depois de uma cirurgia ocular pode ser uma emergência. Contate imediatamente o serviço que realizou o procedimento ou procure atendimento oftalmológico de urgência, conforme a orientação local.",
      },
      {
        heading: "Perguntas úteis na revisão",
        bullets: [
          "Minha evolução é compatível com a técnica e o tempo desde a cirurgia?",
          "O olho seco explica todo o quadro ou precisamos excluir outra causa?",
          "Quais colírios são indispensáveis, por quanto tempo e em que ordem devo usá-los?",
          "Quando posso retomar telas, trabalho, exercício, direção e lentes de contato?",
          "Qual sintoma deve me fazer ligar no mesmo dia?",
          "Se continuar sintomático, quando devemos reavaliar a superfície ocular e o plano de cuidado?",
        ],
        note: "Recuperação não é uma competição para voltar à rotina mais cedo. O objetivo é cicatrizar com segurança e comunicar qualquer mudança relevante.",
      },
    ],
    sources: [
      {
        label: "National Eye Institute — Causes of Dry Eye",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye/causes-dry-eye",
      },
      {
        label: "National Eye Institute — Surgery for Refractive Errors",
        url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors/surgery-refractive-errors",
      },
      {
        label:
          "Ta et al. — Dry eye post-cataract surgery: a systematic review and meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/39806338/",
      },
      {
        label: "Guy’s and St Thomas’ NHS — After cataract surgery",
        url: "https://www.guysandstthomas.nhs.uk/health-information/cataract-surgery/after-cataract-surgery",
      },
      {
        label: "TFOS DEWS III — manejo e tratamento",
        url: "https://pubmed.ncbi.nlm.nih.gov/40467022/",
      },
    ],
  },
  {
    slug: "olho-seco-persistente-depressao-apneia",
    category: "Sintomas e investigação",
    title:
      "Quando o colírio não basta: olho seco persistente, depressão e apneia do sono",
    seoTitle: "Olho seco persistente, depressão e apneia",
    description:
      "Como revisar causas, reconhecer associações com humor e sono e organizar os próximos passos sem parar tratamentos por conta própria.",
    summary: {
      finding:
        "Uma metanálise de 32 estudos estimou 40% de depressão entre pessoas com olho seco (IC 95% 29–52%), com 1,81 vez a chance dos controles. Em apneia obstrutiva do sono, 11 estudos com 1.526 pessoas mostraram ruptura lacrimal cerca de 3 s menor, Schirmer 2,61 mm menor e OSDI 14,63 pontos maior.",
      implication:
        "Colírio que alivia pouco é motivo para revisar mecanismo, técnica de uso e condições associadas — inclusive sono e humor — em vez de procurar uma gota mais forte.",
      limits:
        "Os estudos são majoritariamente observacionais: mostram associação, não causa. Sintoma ocular não diagnostica depressão nem apneia, e nem antidepressivo nem CPAP devem ser alterados por conta própria.",
    },
    readingTime: "11 min",
    updated: "10 de agosto de 2026",
    datePublished: "2026-08-10",
    dateModified: "2026-08-10",
    sourcesVerified: "10 de agosto de 2026",
    tags: [
      "olho seco persistente",
      "depressão",
      "saúde mental",
      "apneia do sono",
      "CPAP",
      "sono",
      "colírios",
      "investigação",
    ],
    sections: [
      {
        heading: "A ideia central: persistência pede revisão, não culpa",
        paragraphs: [
          "Quando um colírio alivia pouco ou por pouco tempo, isso não significa que você falhou nem que os sintomas são imaginários. O olho seco é uma doença multifatorial: evaporação, baixa produção de lágrimas, inflamação, pálpebras, ambiente, medicamentos e processamento nervoso podem participar ao mesmo tempo.",
          "A próxima decisão nem sempre é procurar uma gota mais forte. Muitas vezes, é revisar se o mecanismo foi identificado, se o produto está sendo usado de modo adequado, se existe uma condição associada e se o desconforto está afetando sono, humor, trabalho ou relações.",
        ],
        note: "Sintomas oculares não diagnosticam depressão nem apneia do sono. Eles podem, porém, ser um motivo útil para conversar sobre essas possibilidades quando há sinais em outras áreas da vida.",
      },
      {
        heading: "O que revisar antes de trocar de produto",
        paragraphs: [
          "Uma lágrima artificial pode umedecer a superfície sem tratar a causa predominante. Se a evaporação, a disfunção das glândulas de Meibomius, a inflamação, a blefarite, o fechamento incompleto das pálpebras ou uma doença sistêmica continuarem presentes, o alívio pode ser curto.",
          "Também é importante separar ardor causado pelo próprio produto, irritação por conservantes, embaçamento temporário de uma formulação espessa e piora visual que exige outra investigação. Mais aplicações não compensam automaticamente um diagnóstico incompleto.",
        ],
        bullets: [
          "qual é o objetivo de cada colírio e por quanto tempo a resposta deve ser avaliada;",
          "quantas vezes você aplica, se a ponta encosta no olho e se o produto arde sempre ou apenas no início;",
          "se os sintomas pioram ao acordar, à noite, diante de telas, vento ou ar-condicionado;",
          "se há crostas, coceira, pálpebras inflamadas, piscadas incompletas ou dificuldade para fechar os olhos durante o sono;",
          "quais medicamentos, suplementos, cosméticos e lentes de contato fazem parte da rotina;",
          "se a intensidade do sintoma parece maior do que os sinais observados no exame.",
        ],
      },
      {
        heading: "O que os estudos mostram sobre olho seco e depressão",
        paragraphs: [
          "Uma revisão sistemática e metanálise de 32 estudos estimou prevalência de depressão de 40% entre pessoas com doença do olho seco, com intervalo de confiança de 29% a 52%, e encontrou 1,81 vez mais chance de depressão em comparação com controles. Os escores de sintomas de olho seco se associaram aos escores de depressão, mas os sinais clínicos objetivos não tiveram a mesma relação em todos os estudos (Basilious et al., 2022).",
          "Uma revisão de revisões publicada em 2022 também concluiu que existe associação entre olho seco e depressão, mas destacou que ainda são necessários estudos melhores para esclarecer o mecanismo e a causalidade. Esses resultados não significam que o olho seco cause depressão, que a depressão cause olho seco ou que toda pessoa com sintomas oculares tenha um transtorno depressivo.",
        ],
        note: "A associação pode envolver dor persistente, piora da visão funcional, sono interrompido, limitações na rotina, inflamação, condições compartilhadas e a forma como os sintomas são percebidos e relatados.",
        evidence: {
          design: "Revisão sistemática e metanálise",
          effect: "40%",
          outcome:
            "prevalência de depressão em pessoas com doença do olho seco",
          stats: [
            "32 estudos",
            "IC 95% 29–52%",
            "1,81 vez a chance dos controles",
          ],
          level: 2,
          levelLabel: "Baixo — estudos observacionais",
          caveat:
            "Os escores de sintoma acompanharam os de depressão, mas os sinais clínicos objetivos não tiveram a mesma relação em todos os estudos. Associação não é causa.",
          reference: {
            label:
              "Basilious et al. Dry eye disease and psychiatric disorders, 2022",
            url: "https://pubmed.ncbi.nlm.nih.gov/34935549/",
          },
        },
      },
      {
        heading: "Depressão e antidepressivos podem mudar o plano",
        paragraphs: [
          "Humor deprimido, perda de interesse, culpa, desesperança, alteração do sono, mudança de apetite e dificuldade de concentração merecem ser avaliados por um profissional de saúde mental ou por um médico de referência. Fadiga e sono ruim também podem aparecer na apneia, em outras doenças e como efeito de medicamentos; não é seguro concluir a causa apenas pelo cansaço.",
          "Uma revisão sistemática que tentou separar os efeitos encontrou estudos associando tanto a depressão quanto o uso de antidepressivos ao olho seco, de forma aparentemente independente. A qualidade e os métodos variaram. Por isso, informe quando o sintoma começou, quando a medicação foi iniciada ou aumentada e quais mudanças ocorreram, mas não interrompa nem reduza um antidepressivo por conta própria.",
        ],
        bullets: [
          "O desconforto começou antes ou depois de uma mudança de medicamento?",
          "O sono, o humor ou a vontade de fazer atividades mudaram por pelo menos duas semanas?",
          "A dor ocular está reduzindo trabalho, leitura, deslocamentos, convívio ou autocuidado?",
          "Há uma equipe que possa coordenar oftalmologia, saúde mental e outras condições clínicas?",
        ],
        alert:
          "Pensamentos de morte ou de machucar a si mesmo exigem ajuda imediata por um serviço de emergência ou de crise da sua região. Não espere a próxima consulta oftalmológica.",
      },
      {
        heading: "Onde entra a apneia obstrutiva do sono",
        paragraphs: [
          "A apneia obstrutiva do sono acontece quando a via aérea superior se fecha repetidamente durante o sono. Ronco alto, pausas respiratórias observadas, engasgos ou suspiros durante a noite, boca seca ao acordar e sonolência diurna são sinais que justificam uma conversa com um profissional; o diagnóstico costuma exigir avaliação do sono e não pode ser feito pelo olho seco.",
          "A relação com a superfície ocular é plausível por mais de um caminho: sono fragmentado, inflamação e hipóxia intermitente podem coexistir com alterações das pálpebras, das glândulas de Meibomius e do filme lacrimal. Ainda assim, os estudos disponíveis são em grande parte observacionais e mostram associação, não uma prova de causa direta.",
          "A relação entre apneia e depressão também não é linear. Uma revisão sistemática não encontrou associação convincente nos estudos transversais (odds ratio 1,12; intervalo de confiança de 0,78 a 1,47), mas cinco estudos longitudinais sugeriram maior risco de depressão durante o acompanhamento (risco relativo 2,18; intervalo de confiança de 1,47 a 2,88). A heterogeneidade foi alta, então sonolência, fadiga e humor deprimido precisam ser avaliados sem presumir uma única causa (Edwards et al., 2020).",
        ],
      },
      {
        heading: "O que a evidência encontrou na apneia",
        paragraphs: [
          "Uma revisão sistemática e metanálise de 2024 reuniu 11 estudos e 1.526 pessoas para comparar apneia obstrutiva do sono com ausência de apneia. Nos resultados agrupados, o tempo de ruptura do filme lacrimal foi cerca de 3 segundos menor, o teste de Schirmer foi 2,61 mm menor e o escore de sintomas OSDI foi 14,63 pontos maior no grupo com apneia. Os próprios autores classificaram a qualidade da evidência como limitada pelo desenho observacional.",
          "Outra metanálise, com 15 estudos, estimou olho seco em 48% das pessoas com apneia e encontrou menor Schirmer e menor estabilidade lacrimal, além de mais sintomas, alterações de córnea e perda de glândulas de Meibomius, especialmente nos quadros mais graves (Sun et al., 2023). Uma associação com a gravidade não prova que tratar apenas a apneia resolverá o olho seco.",
        ],
        note: "Esses números descrevem grupos de pesquisa. Não servem para calcular a chance individual de alguém nem substituem exame ocular ou estudo do sono.",
        evidence: {
          design: "Metanálise de estudos observacionais",
          effect: "+14,63",
          outcome: "pontos de OSDI na apneia obstrutiva do sono",
          stats: [
            "11 estudos",
            "n = 1.526",
            "ruptura lacrimal ~3 s menor",
            "Schirmer 2,61 mm menor",
          ],
          level: 2,
          levelLabel: "Baixo",
          caveat:
            "Os próprios autores classificaram a qualidade da evidência como limitada pelo desenho observacional.",
          reference: {
            label:
              "Lin et al. Obstructive sleep apnea, CPAP and dry eye disease, 2024",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11629664/",
          },
        },
      },
      {
        heading: "Sono ruim pode reforçar o círculo de sintomas",
        paragraphs: [
          "Em um estudo caso-controle com 125 pessoas com apneia e 125 controles, olho seco foi identificado em 56,8% do grupo com apneia e em 42,4% dos controles. Entre as pessoas com apneia, a proporção foi 67,5% nas que tinham sono ruim e 37,8% nas que tinham sono melhor; o grupo com sono ruim também apresentou piores medidas de sintomas, estabilidade lacrimal e coloração da córnea (Pu et al., 2022).",
          "É um estudo único, e seus resultados não estabelecem uma sequência causal. Na prática, porém, olho seco que acorda a pessoa, sono fragmentado, depressão e apneia podem se alimentar mutuamente. Perguntar sobre o horário dos sintomas — especialmente secura ao acordar — pode ajudar a escolher os próximos exames.",
        ],
        bullets: [
          "ronco habitual ou pausas respiratórias relatadas por quem dorme perto de você;",
          "acordar engasgando, com boca seca, dor de cabeça ou sensação de não ter descansado;",
          "sonolência que atrapalha dirigir, trabalhar, estudar ou permanecer acordado;",
          "olhos mais irritados ao acordar do que no restante do dia;",
          "mudança simultânea no sono, no humor e no desconforto ocular.",
        ],
      },
      {
        heading: "Se você usa CPAP",
        paragraphs: [
          "O CPAP trata a apneia e não deve ser interrompido por conta própria. Ao mesmo tempo, vazamento de ar em direção aos olhos ou exposição noturna da superfície podem aumentar ardor e evaporação. Se o olho piorou depois de iniciar o aparelho ou de trocar a máscara, leve essa informação à equipe do sono e à oftalmologia.",
          "Na revisão de 2024, apenas três estudos, com 180 pessoas, avaliaram especificamente CPAP e olho seco. O uso por menos de seis meses não mostrou evidência suficiente de melhora; resultados mais favoráveis apareceram em pessoas que usaram CPAP por pelo menos um ano, mas o número de estudos foi pequeno. Isso permite uma orientação prática, não uma promessa de melhora individual.",
          "Em outra metanálise de ensaios clínicos, o CPAP também melhorou sintomas depressivos em comparação com controle, com efeito maior nos estudos que incluíam pessoas já deprimidas. O resultado apoia tratar a apneia quando ela existe, mas não transforma CPAP em tratamento único para depressão nem substitui acompanhamento de saúde mental (Povitz et al., 2014).",
        ],
        bullets: [
          "peça para verificarem ajuste da máscara e vazamento próximo aos olhos;",
          "anote se a piora coincide com maior pressão, troca de interface ou dormir em determinada posição;",
          "não altere pressão, horários ou adesão do CPAP sem falar com a equipe que acompanha a apneia;",
          "procure avaliação ocular se houver dor, vermelhidão persistente, lesão da córnea ou alteração visual;",
          "mantenha o tratamento da apneia enquanto a causa da irritação ocular é investigada.",
        ],
        note: "CPAP e olho seco não são uma escolha de um contra o outro: o aparelho pode proteger a saúde ao tratar a apneia, enquanto um vazamento pode irritar os olhos. As duas questões precisam ser ajustadas juntas.",
      },
      {
        heading: "Como organizar os próximos passos",
        paragraphs: [
          "Leve para a consulta uma linha do tempo, os nomes e horários dos colírios, medicamentos sistêmicos, resultado de exames, padrão do sono e impacto do desconforto na rotina. Um diário curto por uma ou duas semanas pode registrar horário, intensidade, atividade, horas de sono, uso de CPAP, humor e o que trouxe alívio.",
        ],
        bullets: [
          "Qual mecanismo parece predominar: evaporação, pouca produção, inflamação, pálpebras, glândulas ou combinação?",
          "Os sintomas e os sinais do exame contam a mesma história? Precisamos considerar dor com componente neurossensorial?",
          "Algum medicamento ou doença associada merece revisão sem que eu suspenda nada sozinho?",
          "O padrão ao acordar justifica investigar fechamento incompleto das pálpebras ou apneia do sono?",
          "Como vamos medir resposta e quando revisar o plano se o colírio continuar insuficiente?",
          "Quem deve coordenar o cuidado se houver sintomas de depressão, apneia e olho seco ao mesmo tempo?",
        ],
      },
      {
        heading: "Sinais de alerta",
        bullets: [
          "dor ocular forte, piora rápida da visão, sensibilidade intensa à luz, secreção espessa, trauma ou exposição química;",
          "vermelhidão importante, especialmente em um olho, ou sintomas relevantes em quem usa lentes de contato;",
          "sonolência a ponto de cochilar ao dirigir ou operar máquinas — interrompa a atividade e procure avaliação;",
          "pensamentos de morte ou de machucar a si mesmo — procure ajuda de emergência imediatamente.",
        ],
        alert:
          "Este guia não diagnostica depressão, apneia do sono ou uma causa específica de olho seco. Ele ajuda a conectar sintomas e preparar uma avaliação coordenada.",
      },
    ],
    sources: [
      {
        label: "TFOS DEWS III — manejo e tratamento",
        url: "https://pubmed.ncbi.nlm.nih.gov/40467022/",
      },
      {
        label: "Basilious et al. — Dry eye disease and psychiatric disorders",
        url: "https://pubmed.ncbi.nlm.nih.gov/34935549/",
      },
      {
        label: "Dry eye disease and depression — umbrella review",
        url: "https://pubmed.ncbi.nlm.nih.gov/36466469/",
      },
      {
        label:
          "Rakofsky et al. — Depression, antidepressants and dry eye disease",
        url: "https://pubmed.ncbi.nlm.nih.gov/33779578/",
      },
      {
        label: "Lin et al. — Obstructive sleep apnea, CPAP and dry eye disease",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11629664/",
      },
      {
        label:
          "Sun et al. — Ocular surface outcomes in obstructive sleep apnea",
        url: "https://pubmed.ncbi.nlm.nih.gov/37215172/",
      },
      {
        label:
          "Pu et al. — Sleep quality and dry eye in obstructive sleep apnea",
        url: "https://pubmed.ncbi.nlm.nih.gov/36388897/",
      },
      {
        label: "Edwards et al. — Obstructive sleep apnea and depression",
        url: "https://pubmed.ncbi.nlm.nih.gov/33158487/",
      },
      {
        label:
          "Povitz et al. — Treatment of obstructive sleep apnea and depressive symptoms",
        url: "https://pubmed.ncbi.nlm.nih.gov/25423175/",
      },
      {
        label:
          "National Heart, Lung, and Blood Institute — Sleep apnea symptoms",
        url: "https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms",
      },
    ],
  },
  {
    slug: "higiene-palpebral-com-seguranca",
    category: "Autocuidado",
    title: "Higiene palpebral com segurança",
    description:
      "O que essa prática pretende fazer, quais cuidados tomar e por que intensidade não é sinônimo de eficácia.",
    summary: {
      finding:
        "Calor local confortável e limpeza gentil das bordas seguem sendo a base do cuidado na disfunção das glândulas de Meibomius. Uma revisão Cochrane de 13 ensaios com 1.155 participantes não encontrou vantagem consistente da pulsação térmica de consultório sobre a compressa morna feita em casa.",
      implication:
        "A rotina simples e barata tem respaldo comparável ao de alternativas bem mais caras, desde que a técnica seja confortável e não machuque a pele nem o globo ocular.",
      limits:
        "A certeza dessa evidência foi classificada como baixa a muito baixa, e os ensaios de produtos de limpeza palpebral são pequenos e curtos. Mais frequência e mais força não significam melhor resultado.",
    },
    readingTime: "6 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
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
        heading: "O que a evidência mostra sobre compressa e limpeza",
        figure: figures.lidHygieneEducation,
        paragraphs: [
          "A combinação de calor local e limpeza das bordas continua sendo a base do cuidado na disfunção das glândulas de Meibomius. Um ensaio comparou lenços palpebrais sem detergente com a rotina convencional de compressa morna e higiene: os dois grupos melhoraram em sintomas e sinais ao longo de 90 dias.",
          "Uma revisão Cochrane de 13 ensaios com 1.155 participantes avaliou um dispositivo de pulsação térmica usado em consultório e não encontrou vantagem consistente sobre a compressa morna feita em casa. A certeza da evidência foi classificada como baixa a muito baixa.",
        ],
        note: "A leitura prática é encorajadora: a rotina simples e barata tem respaldo comparável ao de alternativas bem mais caras.",
        evidence: {
          design: "Revisão Cochrane de pulsação térmica",
          effect: "Sem vantagem",
          outcome:
            "do dispositivo de consultório sobre a compressa morna feita em casa",
          stats: ["13 ensaios", "n = 1.155"],
          level: 1,
          levelLabel: "Muito baixo a baixo",
          caveat:
            "A certeza da evidência foi classificada como baixa a muito baixa pelos próprios revisores.",
          reference: {
            label:
              "Pucker et al. LipiFlow for the treatment of dry eye disease. Cochrane, 2024",
            url: "https://doi.org/10.1002/14651858.CD015448.pub2",
          },
        },
      },
      {
        heading: "Produtos de limpeza palpebral",
        paragraphs: [
          "Existem lenços e soluções específicos para a borda palpebral. Um ensaio com pacientes com blefarite testou ácido hipocloroso a 0,01% aplicado por nebulização e observou melhora de sintomas e de sinais da borda palpebral em duas semanas, sem eventos adversos relatados.",
          "São estudos pequenos e de curta duração. Servem para mostrar que há opções toleráveis, não para eleger um produto como superior aos demais.",
        ],
        alert:
          "Óleo de melaleuca (tea tree) e outros óleos essenciais aparecem em receitas caseiras para Demodex. Em concentração inadequada irritam a superfície ocular. Esse tipo de tratamento tem indicação específica e precisa de orientação profissional.",
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
      {
        label:
          "Pucker et al. LipiFlow for the treatment of dry eye disease. Cochrane Database of Systematic Reviews, 2024.",
        url: "https://doi.org/10.1002/14651858.CD015448.pub2",
      },
      {
        label:
          "Runda et al. Ensaio randomizado comparando lenços palpebrais sem detergente com higiene convencional na DGM. Indian J Ophthalmol, 2022.",
        url: "https://doi.org/10.4103/ijo.IJO_2885_21",
      },
      {
        label:
          "Zhang et al. Effect of hypochlorous acid on blepharitis through ultrasonic atomization: a randomized clinical trial. J Clin Med, 2023.",
        url: "https://doi.org/10.3390/jcm12031164",
      },
    ],
  },
  {
    slug: "qualidade-de-vida-e-olho-seco",
    category: "Viver com olho seco",
    title: "Qualidade de vida e olho seco",
    description:
      "Estratégias para lidar com uma condição flutuante sem reduzir a experiência a uma pontuação.",
    summary: {
      finding:
        "Olho seco interfere em leitura, direção, trabalho, sono e lazer, e a aparência do olho nem sempre acompanha a intensidade do sintoma — o que torna o impacto invisível para quem está por perto.",
      implication:
        "Registrar limitações concretas — tempo de tela tolerado, interrupções no trabalho, dificuldade para dirigir — comunica o efeito na vida diária melhor do que descrever a intensidade da dor.",
      limits:
        "Em parte das pessoas a dor permanece desproporcional aos sinais da superfície, o que envolve processamento nervoso e pede abordagem ampla. Relatos de comunidades servem como pergunta a investigar, não como prescrição.",
    },
    readingTime: "7 min",
    updated: "25 de julho de 2026",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
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
    seoTitle: "Conjuntivocálase: o olho seco mecânico",
    description:
      "Entenda como dobras da conjuntiva podem alterar o caminho das lágrimas, aumentar o atrito e produzir sintomas parecidos com olho seco.",
    summary: {
      finding:
        "Pregas frouxas da conjuntiva podem desestabilizar o filme lacrimal e atrasar a eliminação das lágrimas. É essa segunda parte que explica arder e lacrimejar ao mesmo tempo.",
      implication:
        "O que orienta o cuidado é a localização e o volume da prega e sua relação com o menisco lacrimal e os pontos de drenagem, não a simples existência de uma dobra.",
      limits:
        "A condição se torna comum com o envelhecimento e frequentemente não dá sintoma. Alergia, blefarite e alterações palpebrais produzem queixas parecidas, e procedimentos na conjuntiva dependem de avaliação especializada.",
    },
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
        heading: "Drenagem lenta explica a combinação estranha",
        figure: figures.conjunctivochalasisEducation,
        paragraphs: [
          "Uma revisão sistemática sobre conjuntivocálase descreve dois efeitos que costumam andar juntos: instabilidade do filme lacrimal e atraso na eliminação das lágrimas. É essa segunda parte que torna possível arder e lacrimejar ao mesmo tempo, algo que muitos pacientes acham contraditório.",
          "Quando a lágrima demora mais para ser drenada, ela também permanece mais tempo em contato com a superfície, acumulando mediadores inflamatórios. O olho pode estar molhado e irritado simultaneamente.",
        ],
        note: "A mesma revisão aponta o envelhecimento como o fator de risco mais importante — e lembra que a condição é frequentemente despercebida na prática clínica justamente por ser comum e nem sempre sintomática.",
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
  {
    slug: "olho-seco-lentes-de-contato",
    category: "Vida diária",
    title: "Olho seco e lentes de contato: conforto, adaptação e segurança",
    seoTitle: "Olho seco e lentes de contato: o que muda",
    description:
      "Entenda como as lentes interagem com as lágrimas, quais padrões observar e quando interromper o uso para proteger os olhos.",
    summary: {
      finding:
        "A lente de contato divide o filme lacrimal em camadas à frente e atrás dela e pode revelar ou agravar instabilidade e evaporação, com desconforto que cresce ao longo do dia.",
      implication:
        "Material, desenho, adaptação, calendário de troca e produtos compatíveis são revisáveis; em doença mais grave da superfície, lentes esclerais podem ter papel terapêutico com equipe habilitada.",
      limits:
        "Nem todo desconforto com lentes é olho seco: adaptação inadequada, alergia, inflamação e infecção entram no diagnóstico. Dor, fotofobia, secreção ou queda de visão pedem avaliação rápida, não mais lubrificante.",
    },
    readingTime: "7 min",
    updated: "26 de julho de 2026",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    sourcesVerified: "26 de julho de 2026",
    tags: [
      "lentes de contato",
      "olho seco",
      "filme lacrimal",
      "conforto",
      "higiene",
      "lentes esclerais",
      "ceratite",
    ],
    sections: [
      {
        heading: "Como as lentes interagem com as lágrimas",
        paragraphs: [
          "A lente de contato fica sobre a superfície ocular e divide o filme lacrimal em camadas à frente e atrás da lente. Material, desenho, adaptação, tempo de uso, piscadas, ambiente e condição prévia das lágrimas e das pálpebras influenciam essa interação.",
          "Isso não significa que toda pessoa que usa lentes terá olho seco. Em algumas, porém, a lente pode revelar ou agravar instabilidade das lágrimas, evaporação e desconforto que aumentam ao longo do dia.",
        ],
        note: "Desconforto com lentes não deve ser atribuído automaticamente ao olho seco. Adaptação inadequada, alergia, inflamação, lesão e infecção também precisam ser consideradas.",
      },
      {
        heading: "Padrões úteis para observar",
        bullets: [
          "ardor, ressecamento ou sensação crescente da lente após algumas horas;",
          "visão que oscila e melhora temporariamente ao piscar;",
          "piora em telas, ar-condicionado, vento ou ambientes secos;",
          "necessidade de retirar as lentes antes do horário habitual;",
          "diferença persistente entre os olhos ou sintomas logo após colocar a lente.",
        ],
        paragraphs: [
          "Anote o tipo de lente, frequência de troca, solução de cuidado, horas de uso e atividades relacionadas à piora. Registre também se os sintomas melhoram após retirar as lentes. Esse contexto ajuda a avaliação, mas não substitui o exame.",
        ],
      },
      {
        heading: "O que pode ser revisto na avaliação",
        paragraphs: [
          "A investigação pode incluir adaptação e movimento da lente, material, tempo e calendário de uso, produtos de limpeza, alergias, pálpebras, glândulas de Meibomius e produção e estabilidade das lágrimas.",
          "Mudanças de material, desenho, rotina de troca, tempo de uso ou solução devem ser individualizadas. Use somente colírios ou gotas de reumidificação indicados como compatíveis com seu tipo de lente e com orientação profissional.",
        ],
        note: "Não aplique saliva, água, soro caseiro ou qualquer solução improvisada nas lentes. Solução salina, quando indicada para uma etapa específica, não substitui a desinfecção.",
      },
      {
        heading: "Hábitos que reduzem riscos",
        bullets: [
          "lave e seque bem as mãos antes de tocar nas lentes;",
          "não durma com as lentes, a menos que isso tenha sido especificamente orientado;",
          "retire as lentes antes de nadar, tomar banho ou entrar em banheira de hidromassagem;",
          "use solução desinfetante nova e nunca complete a solução antiga do estojo;",
          "respeite o calendário de troca das lentes e substitua o estojo regularmente;",
          "tenha óculos disponíveis para interromper o uso quando necessário.",
        ],
        paragraphs: [
          "Lentes são dispositivos médicos, inclusive as coloridas sem grau. Não compartilhe lentes nem compre modelos sem avaliação e adaptação adequadas.",
        ],
      },
      {
        heading: "Quando uma lente faz parte do tratamento",
        paragraphs: [
          "Em situações selecionadas, lentes terapêuticas podem proteger a superfície ocular. Lentes esclerais, por exemplo, formam um reservatório líquido sobre a córnea e podem ser consideradas em doença da superfície ocular mais grave.",
          "Esse uso não é equivalente ao de uma lente gelatinosa corretiva comum. Seleção, adaptação, manuseio, produtos e acompanhamento precisam ser conduzidos por uma equipe habilitada, porque benefício e risco dependem do caso.",
        ],
      },
      {
        heading: "Quando retirar e procurar ajuda",
        paragraphs: [
          "Retire as lentes e não as recoloque se houver dor, vermelhidão importante, sensibilidade à luz, secreção, piora súbita da visão ou desconforto que persiste ou aumenta após a retirada.",
          "Esses sinais podem ocorrer em infecções da córnea e outras condições que exigem avaliação rápida. Leve as lentes, o estojo e os produtos usados se a equipe de saúde orientar.",
        ],
        alert:
          "Dor, fotofobia ou redução da visão em quem usa lentes de contato não devem ser tratados como simples ressecamento. Procure atendimento oftalmológico rapidamente.",
      },
    ],
    sources: [
      {
        label:
          "TFOS Lifestyle — Impact of contact lenses on the ocular surface",
        url: "https://pubmed.ncbi.nlm.nih.gov/37149139/",
      },
      {
        label:
          "Indian Journal of Ophthalmology — Contact lenses in dry eye disease and ocular surface disorders",
        url: "https://pubmed.ncbi.nlm.nih.gov/37026246/",
      },
      {
        label: "CDC — Preventing eye infections when wearing contacts",
        url: "https://www.cdc.gov/contact-lenses/prevention/index.html",
      },
      {
        label: "FDA — Contact lens risks",
        url: "https://www.fda.gov/medical-devices/contact-lenses/contact-lens-risks",
      },
    ],
  },
  {
    slug: "epifora-olho-seco-vias-lacrimais",
    category: "Sintomas e investigação",
    title: "Epífora, olho seco e avaliação das vias lacrimais",
    description:
      "Entenda por que um olho pode lacrimejar, como as lágrimas chegam ao nariz e o que cada etapa da avaliação procura responder.",
    summary: {
      finding:
        "Epífora nomeia o sintoma, não a causa. Uma superfície ressecada ou irritada pode disparar lacrimejamento reflexo, e pregas de conjuntivocálase podem atrasar a saída da lágrima sem que haja obstrução do canal.",
      implication:
        "Relatar se começou de repente, se atinge um ou os dois olhos e o que piora o quadro ajuda a separar lacrimejamento reflexo, alteração palpebral e obstrução — cada um com estratégia própria.",
      limits:
        "O teste de desaparecimento da fluoresceína pode sugerir escoamento lento sem localizar o ponto do problema, e nem toda epífora exige sondagem, irrigação, imagem ou endoscopia.",
    },
    readingTime: "9 min",
    updated: "26 de julho de 2026",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    sourcesVerified: "26 de julho de 2026",
    tags: [
      "epífora",
      "lacrimejamento",
      "olhos aguados",
      "olho seco",
      "vias lacrimais",
      "ponto lacrimal",
      "canalículos",
      "saco lacrimal",
      "ducto nasolacrimal",
      "irrigação lacrimal",
      "sondagem",
      "fluoresceína",
      "dacriocistografia",
      "dacriocintilografia",
    ],
    sections: [
      {
        heading: "Epífora descreve o sintoma, não a causa",
        paragraphs: [
          "Epífora é o nome usado para lacrimejamento anormal, sobretudo quando as lágrimas se acumulam ou transbordam para as pálpebras e o rosto. A palavra não significa automaticamente que exista um canal obstruído.",
          "O volume de lágrimas percebido resulta do equilíbrio entre produção, distribuição pelas piscadas, evaporação e drenagem. Uma alteração em qualquer uma dessas etapas pode deixar o olho aguado, e mais de um mecanismo pode coexistir.",
        ],
        note: "“Olho aguado” e “olho seco” não são opostos perfeitos. Uma pessoa pode produzir lágrimas reflexas em excesso e ainda ter um filme lacrimal instável.",
      },
      {
        heading: "Como o olho seco pode provocar lacrimejamento",
        paragraphs: [
          "Quando a superfície ocular fica ressecada ou irritada, os nervos podem estimular uma resposta reflexa da glândula lacrimal. Vento, frio, fumaça, telas, alteração das pálpebras, cílios e inflamação também podem ativar essa resposta.",
          "Essas lágrimas adicionais podem escorrer sem formar uma película estável entre as piscadas. Por isso, ardor, sensação de areia, visão que oscila e lacrimejamento podem aparecer juntos.",
          "Alergia, infecção, lesão da córnea, conjuntivocálase e outros problemas da superfície também causam lacrimejamento. A presença de lágrimas abundantes não confirma nem exclui olho seco.",
        ],
      },
      {
        heading: "O caminho normal das lágrimas",
        paragraphs: [
          "Depois de espalhadas pelas piscadas, as lágrimas formam um pequeno reservatório junto à pálpebra inferior, chamado menisco lacrimal. Elas entram pelos pontos lacrimais, pequenas aberturas no canto interno das pálpebras superior e inferior.",
          "Dos pontos, seguem pelos canalículos até o saco lacrimal e depois pelo ducto nasolacrimal, que termina dentro do nariz. O movimento das pálpebras e do músculo ao redor dos olhos ajuda a funcionar como uma bomba.",
          "Pontos fora de posição, pálpebras frouxas ou viradas, piscadas ineficientes, estreitamentos e obstruções em diferentes trechos podem reduzir o escoamento mesmo quando a produção de lágrimas é normal.",
        ],
        figure: figures.lacrimalSystemPtOpen,
      },
      {
        heading: "Padrões úteis para relatar",
        bullets: [
          "se começou de repente ou aos poucos e se ocorre em um ou nos dois olhos;",
          "se acontece somente no vento, frio, fumaça, telas ou também dentro de casa;",
          "se as lágrimas ficam acumuladas ou chegam a escorrer pelo rosto;",
          "se há ardor, coceira, sensação de areia, visão oscilante ou sensibilidade à luz;",
          "se existe secreção, crostas ou inchaço doloroso perto do canto interno;",
          "se houve trauma, cirurgia, radioterapia, uso de colírios ou alteração facial;",
          "se varia com a posição das pálpebras ou com algum movimento facial.",
        ],
        paragraphs: [
          "Lacrimejamento reflexo costuma acompanhar irritação e gatilhos ambientais, enquanto transbordamento persistente de um lado pode aumentar a suspeita de drenagem reduzida. Esses padrões se sobrepõem e não substituem o exame.",
        ],
      },
      {
        heading: "O que é observado antes dos testes",
        paragraphs: [
          "A avaliação começa pela superfície ocular, pelos cílios e pela córnea. Também observa posição e firmeza das pálpebras, fechamento, piscadas, pontos lacrimais, altura do menisco e eventual refluxo ou secreção.",
          "Esse passo é importante porque uma via aberta não resolve lacrimejamento causado por irritação, e tratar apenas a superfície pode não resolver um estreitamento ou falha da bomba lacrimal.",
        ],
        bullets: [
          "superfície e estabilidade do filme lacrimal;",
          "pálpebras, cílios, piscadas e posição dos pontos lacrimais;",
          "acúmulo de lágrimas e comparação entre os olhos;",
          "região do saco lacrimal e interior do nariz quando indicado.",
        ],
      },
      {
        heading: "O que os testes de drenagem podem mostrar",
        paragraphs: [
          "No teste de desaparecimento da fluoresceína, uma pequena quantidade de corante é colocada nas lágrimas e se observa quanto permanece após um intervalo. Retenção pode sugerir escoamento mais lento, mas o teste não localiza sozinho o ponto do problema.",
          "Na sondagem e irrigação, uma equipe habilitada avalia resistência, refluxo e passagem de líquido ao longo da via. O teste pode ajudar a localizar bloqueios, mas a passagem de líquido não garante que o sistema drene normalmente durante a rotina.",
          "Quando história, exame e irrigação não explicam o sintoma, exames selecionados podem mapear a anatomia ou o trânsito. A dacriocistografia usa contraste para mostrar o trajeto; a dacriocintilografia acompanha o deslocamento de uma pequena quantidade de marcador radioativo. Endoscopia nasal ou outras imagens são reservadas a perguntas específicas.",
          "A tomografia de coerência óptica do segmento anterior (AS-OCT) pode medir altura, área ou volume do menisco lacrimal, porém não percorre sozinha toda a via de drenagem até o nariz.",
        ],
        note: "Nem toda pessoa com epífora precisa de sondagem, irrigação, imagem ou endoscopia. A sequência depende da história e do que já foi encontrado no exame.",
      },
      {
        heading: "O cuidado depende do mecanismo",
        paragraphs: [
          "Quando predomina lacrimejamento reflexo, o objetivo é identificar e reduzir a irritação da superfície. Alterações das pálpebras e da bomba lacrimal precisam de uma estratégia própria. Se há estreitamento ou obstrução, a localização e a repercussão orientam quais opções podem ser discutidas.",
          "Plugue lacrimal e cauterização reduzem intencionalmente a drenagem para conservar lágrimas em alguns contextos de olho seco. Eles não devem ser tratados como solução automática quando já existe epífora ou quando a causa do lacrimejamento ainda não foi esclarecida.",
          "Não tente sondar, irrigar ou pressionar repetidamente a região em casa. O portal não recomenda antibiótico, colírio ou procedimento com base apenas no sintoma.",
        ],
      },
      {
        heading: "Uma causa comum que passa despercebida",
        paragraphs: [
          "Nem todo lacrimejamento vem de obstrução do canal ou de irritação da córnea. Pregas frouxas da conjuntiva, chamadas conjuntivocálase, podem ocupar o espaço por onde a lágrima é recolhida junto à pálpebra inferior e atrasar sua eliminação.",
          "Uma revisão sistemática descreve essa condição como causa frequente de irritação ocular, sobretudo em pessoas mais velhas, e observa que ela costuma ser subvalorizada na avaliação de rotina.",
        ],
        note: "Vale citar isso na consulta se o lacrimejamento vier junto de ardor, piorar ao olhar para baixo ou ao ler, e não houver sinal de obstrução nos testes de drenagem.",
      },
      {
        heading: "Quando o lacrimejamento pede avaliação rápida",
        paragraphs: [
          "Dor forte, mudança visual, sensibilidade importante à luz, trauma, produto químico, objeto preso ou olho muito vermelho precisam de avaliação rápida, mesmo que o lacrimejamento seja o sintoma mais evidente.",
          "Inchaço doloroso junto ao canto interno do olho, especialmente com secreção ou febre, pode indicar inflamação ou infecção do saco lacrimal e também não deve esperar.",
        ],
        alert:
          "Epífora persistente merece investigação; epífora acompanhada de dor intensa, piora visual, trauma ou inchaço doloroso com febre exige prioridade.",
      },
    ],
    sources: [
      {
        label: "TFOS DEWS III — metodologia diagnóstica",
        url: "https://pubmed.ncbi.nlm.nih.gov/40451408/",
      },
      {
        label: "NHS — Watering eyes",
        url: "https://www.nhs.uk/symptoms/watering-eyes/",
      },
      {
        label: "Lopez Montes et al. — Assessment of the Watery Eye",
        url: "https://pubmed.ncbi.nlm.nih.gov/36508543/",
      },
      {
        label: "Lee e Baek — Etiology of Epiphora",
        url: "https://pubmed.ncbi.nlm.nih.gov/34237206/",
      },
      {
        label: "Marmalidou et al. — Conjunctivochalasis: a systematic review",
        url: "https://doi.org/10.1016/j.survophthal.2017.10.010",
      },
      {
        label: "Usmani et al. — Functional epiphora",
        url: "https://pubmed.ncbi.nlm.nih.gov/36952153/",
      },
    ],
  },
  {
    slug: "meibografia-o-que-a-imagem-mostra",
    category: "Diagnóstico",
    seoTitle: "Meibografia: o que a imagem mostra",
    title: "Meibografia: o que a imagem das glândulas mostra",
    description:
      "A meibografia registra a estrutura das glândulas palpebrais. Mostra perda e encurtamento, mas não mede secreção nem fecha sozinha o diagnóstico.",
    summary: {
      finding:
        "A meibografia, em geral com luz infravermelha e a pálpebra virada, registra a estrutura das glândulas de Meibomius: distribuição, encurtamento, tortuosidade e áreas em que o tecido glandular não fica visível.",
      implication:
        "A imagem ajuda a documentar o que se vê nas pálpebras e a acompanhar o mesmo exame ao longo do tempo. Ela não substitui a expressão da secreção, a avaliação das bordas nem a conversa sobre sintomas.",
      limits:
        "Um escore de área visível não distingue atrofia de oclusão e não fecha olho seco. A reconstrução 3D por OCT, num estudo de 9 pessoas com aparelho de laboratório e campo de 5 × 2 mm, acrescentou detalhe de ácino — e os próprios autores pediram para usá-la junto da foto infravermelha, não no lugar dela.",
    },
    readingTime: "7 min",
    updated: "25 de agosto de 2026",
    datePublished: "2026-08-25",
    dateModified: "2026-08-25",
    sourcesVerified: "25 de agosto de 2026",
    tags: [
      "meibografia",
      "diagnóstico",
      "glândulas",
      "pálpebras",
      "imagem",
      "DGM",
    ],
    sections: [
      {
        heading: "O que o exame procura mostrar",
        paragraphs: [
          "A meibografia mais usada no consultório emprega luz infravermelha com a pálpebra virada. As glândulas de Meibomius aparecem como colunas claras, muitas vezes com um padrão que lembra cacho de uva.",
          "A leitura procura distribuição, encurtamento, tortuosidade, dilatação e áreas em que o tecido glandular não fica visível — o que a literatura costuma chamar de dropout ou perda glandular. É um retrato da estrutura, não uma medida completa da função.",
        ],
        figure: figures.meibographyInfraredHwang2013,
        note: "A foto isolada não informa a qualidade da secreção, não prova que uma glândula visível esteja funcionando e não explica, sozinha, os sintomas.",
      },
      {
        heading: "Infravermelho e OCT não são a mesma imagem",
        paragraphs: [
          "A meibografia infravermelha é uma foto de frente: mostra a pálpebra inteira, sem informação de profundidade. O OCT da pálpebra evertida faz cortes e, em pesquisa, pode reconstruir um volume.",
          "Isso não é o mesmo exame que o AS-OCT do menisco lacrimal, usado para medir a faixa de lágrima junto à pálpebra inferior. Um estudo de Hwang e colaboradores (2013) reconstruiu volumes de OCT em 2 voluntários e 7 pacientes com disfunção das glândulas de Meibomius. Nos voluntários, os ácinos ficaram mais nítidos do que na foto infravermelha.",
        ],
        figure: figures.meibographyOct3dHwang2013,
        evidence: {
          design: "Série descritiva de FD-OCT 3D",
          effect: "n = 9",
          outcome:
            "2 voluntários e 7 pacientes; campo 5 × 2 mm; aparelho de laboratório",
          stats: ["4,2 s por volume", "campo 5 × 2 mm"],
          level: 4,
          levelLabel: "Muito baixo",
          caveat:
            "Série pequena, sem grupo-controle formal e sem aparelho comercial. Os autores recomendam usar o OCT 3D junto da meibografia infravermelha, não no lugar dela.",
          reference: {
            label:
              "Hwang et al. In Vivo 3D Meibography of the Human Eyelid. PLoS ONE, 2013",
            url: "https://doi.org/10.1371/journal.pone.0067143",
          },
        },
      },
      {
        heading: "O que a imagem não responde",
        bullets: [
          "não mede, sozinha, se a glândula ainda consegue secretar;",
          "não distingue atrofia de oclusão;",
          "não fecha o diagnóstico de olho seco;",
          "não indica, isolada, um procedimento ou um aparelho;",
          "pode mudar de contraste logo após uma expressão da pálpebra.",
        ],
        paragraphs: [
          "O DEWS III confirma doença do olho seco com sintomas mais um signo de perda de equilíbrio das lágrimas ou da superfície. A meibografia não entra nesse critério. Ela ajuda a subclassificar o eixo da pálpebra, quando a imagem foi bem adquirida.",
        ],
      },
      {
        heading: "Como a imagem entra na conversa",
        paragraphs: [
          "Pergunte quais pálpebras foram fotografadas, se a aquisição estava nítida e se o exame foi feito antes ou depois de expressar as glândulas. Vale também perguntar o que a imagem mudou — ou não mudou — no plano.",
          "A higiene palpebral e o calor local confortável continuam sendo a base do cuidado na disfunção das glândulas de Meibomius. A foto não substitui essa rotina e não prediz, sozinha, quem vai se beneficiar de um procedimento.",
        ],
        note: "Uma imagem fora de foco, com reflexo ou com a pálpebra mal virada não deveria virar laudo. Nesses casos, a pergunta útil é se dá para repetir a aquisição.",
      },
    ],
    sources: [
      {
        label:
          "Hwang et al. In Vivo 3D Meibography of the Human Eyelid Using Real Time Imaging Fourier-Domain OCT. PLoS ONE, 2013.",
        url: "https://doi.org/10.1371/journal.pone.0067143",
      },
      {
        label:
          "Arita et al. Noncontact Infrared Meibography to Document Age-Related Changes of the Meibomian Glands in a Normal Population. Ophthalmology, 2008.",
        url: "https://doi.org/10.1016/j.ophtha.2007.06.031",
      },
      {
        label: "TFOS DEWS III — metodologia diagnóstica",
        url: "https://pubmed.ncbi.nlm.nih.gov/40451408/",
      },
      {
        label: "Pult e Nichols. A Review of Meibography. Optom Vis Sci, 2012.",
        url: "https://doi.org/10.1097/OPX.0b013e3182512ac1",
      },
    ],
  },
];

export const getGuide = (slug: string) =>
  guides.find((guide) => guide.slug === slug);

/**
 * Guias relacionados por afinidade real de assunto.
 *
 * A seleção era `guides.filter(outro).slice(0, 3)`: os três primeiros do
 * array, iguais em todas as doze páginas. O resultado aparecia na medição de
 * links internos — três guias recebiam doze links cada e oito recebiam um só,
 * o da listagem. E o leitor que terminava o guia de lentes de contato era
 * mandado para os mesmos três textos de sempre.
 *
 * A pontuação é deliberadamente simples: tag em comum vale mais que categoria
 * em comum, porque tag descreve assunto e categoria descreve prateleira.
 *
 * O desempate percorre o array em círculo a partir do próprio guia, em vez de
 * ordenar por slug. Guias sem assunto em comum com ninguém empatam em zero, e
 * um desempate alfabético mandaria todos eles para os mesmos dois destinos —
 * trocaria um desequilíbrio por outro. A rotação é determinística: o mesmo
 * conteúdo produz a mesma lista em qualquer build.
 */
export const selectRelatedGuides = (guide: Guide, pool = guides, limit = 3) => {
  const tags = new Set(guide.tags);
  const origin = pool.findIndex((candidate) => candidate.slug === guide.slug);

  return pool
    .map((candidate, index) => ({
      candidate,
      index,
      score:
        candidate.tags.filter((tag) => tags.has(tag)).length * 2 +
        (candidate.category === guide.category ? 1 : 0),
      distance: (index - origin + pool.length) % pool.length,
    }))
    .filter((entry) => entry.candidate.slug !== guide.slug)
    .sort(
      (left, right) =>
        right.score - left.score || left.distance - right.distance,
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
};
