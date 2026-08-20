export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  definition: string;
  category?: string;
  aliases?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "as-oct",
    term: "AS-OCT (OCT do segmento anterior)",
    shortDefinition:
      "Exame de imagem sem contato que cria cortes do segmento anterior do olho e mede o menisco lacrimal.",
    definition:
      "Exame de imagem sem contato que cria cortes do segmento anterior do olho. No olho seco, pode medir o menisco lacrimal e documentar relações anatômicas, mas não confirma o diagnóstico sozinho e não é o mesmo exame que o OCT de retina.",
    category: "Exames",
    aliases: [
      "as-oct",
      "oct segmento anterior",
      "oct anterior",
      "tomografia de segmento anterior",
    ],
  },
  {
    slug: "aquodeficiente",
    term: "Aquodeficiente",
    shortDefinition:
      "Forma de olho seco caracterizada pela produção insuficiente da porção aquosa da lágrima.",
    definition:
      "Forma de olho seco em que a produção da porção aquosa das lágrimas é insuficiente.",
    category: "Mecanismos",
    aliases: [
      "aquodeficiente",
      "deficiência aquosa",
      "olho seco aquodeficiente",
      "hipossecretor",
    ],
  },
  {
    slug: "blefarite",
    term: "Blefarite",
    shortDefinition:
      "Inflamação crônica ou recorrente das bordas das pálpebras, cílios e glândulas.",
    definition:
      "Inflamação das bordas das pálpebras, que pode envolver cílios, pele e glândulas.",
    category: "Pálpebras",
    aliases: ["blefarite", "blefarite anterior", "blefarite posterior"],
  },
  {
    slug: "canaliculos-lacrimais",
    term: "Canalículos lacrimais",
    shortDefinition:
      "Canais microscópicos que conduzem as lágrimas dos pontos lacrimais até o saco lacrimal.",
    definition:
      "Pequenos canais que recebem as lágrimas pelos pontos lacrimais e as conduzem em direção ao saco lacrimal.",
    category: "Anatomia",
    aliases: ["canalículos", "canalículos lacrimais", "canalículo"],
  },
  {
    slug: "conjuntiva",
    term: "Conjuntiva",
    shortDefinition:
      "Membrana transparente que recobre a esclera (parte branca) e o interior das pálpebras.",
    definition:
      "Membrana transparente que recobre a parte branca do olho e a face interna das pálpebras.",
    category: "Anatomia",
    aliases: ["conjuntiva", "conjuntiva bulbar", "conjuntiva tarsal"],
  },
  {
    slug: "conjuntivocalase",
    term: "Conjuntivocálase",
    shortDefinition:
      "Pregas frouxas da conjuntiva que interferem no fluxo das lágrimas e causam atrito mecânico.",
    definition:
      "Pregas frouxas e redundantes da conjuntiva. Podem não causar sintomas ou, dependendo da localização, interferir no caminho das lágrimas e aumentar o atrito durante as piscadas.",
    category: "Superfície",
    aliases: [
      "conjuntivocálase",
      "conjunctivochalasis",
      "pregas conjuntivais",
      "olho seco mecânico",
    ],
  },
  {
    slug: "conservante",
    term: "Conservante",
    shortDefinition:
      "Substância adicionada a colírios para evitar contaminação, mas que pode irritar o olho no uso crônico.",
    definition:
      "Substância que reduz a contaminação de frascos multidose. Alguns tipos podem irritar uma superfície ocular sensível, especialmente com uso frequente.",
    category: "Tratamentos",
    aliases: [
      "conservante",
      "conservantes",
      "bak",
      "cloreto de benzalcônio",
      "sem conservantes",
    ],
  },
  {
    slug: "cornea",
    term: "Córnea",
    shortDefinition:
      "Estrutura transparente e curva na frente do olho responsável pela maior parte do foco visual.",
    definition:
      "Camada transparente na parte da frente do olho. Participa da focalização da luz e precisa de uma superfície lacrimal regular.",
    category: "Anatomia",
    aliases: ["córnea", "epitélio corneano"],
  },
  {
    slug: "dacriocintilografia",
    term: "Dacriocintilografia (cintilografia lacrimal)",
    shortDefinition:
      "Exame funcional com radiotraçador que avalia o tempo de trânsito das lágrimas pelas vias de drenagem.",
    definition:
      "Exame que acompanha o trânsito de uma pequena quantidade de marcador radioativo pelas vias lacrimais. Pode ajudar a identificar atraso funcional em situações selecionadas.",
    category: "Exames",
    aliases: ["dacriocintilografia", "cintilografia lacrimal"],
  },
  {
    slug: "dacriocistografia",
    term: "Dacriocistografia",
    shortDefinition:
      "Exame radiológico contrastado que mapeia a anatomia e eventuais obstruções das vias lacrimais.",
    definition:
      "Exame de imagem com contraste usado para mapear a anatomia das vias lacrimais e localizar estreitamentos ou obstruções em casos selecionados.",
    category: "Exames",
    aliases: ["dacriocistografia"],
  },
  {
    slug: "dgm",
    term: "Disfunção das glândulas de Meibomius (DGM)",
    shortDefinition:
      "Alteração na qualidade ou quantidade do óleo palpebral, principal causa de olho seco evaporativo.",
    definition:
      "Alteração na produção ou liberação dos lipídios das glândulas das pálpebras, frequentemente associada ao olho seco evaporativo.",
    category: "Pálpebras",
    aliases: [
      "dgm",
      "disfunção das glândulas de meibomius",
      "meibomite",
      "mgd",
    ],
  },
  {
    slug: "ducto-nasolacrimal",
    term: "Ducto nasolacrimal",
    shortDefinition:
      "Canal que drena as lágrimas do saco lacrimal até a cavidade nasal.",
    definition:
      "Trecho da via de drenagem que leva as lágrimas do saco lacrimal para o interior do nariz.",
    category: "Anatomia",
    aliases: ["ducto nasolacrimal", "canal nasolacrimal"],
  },
  {
    slug: "epifora",
    term: "Epífora",
    shortDefinition:
      "Lacrimejamento excessivo ou transbordamento de lágrimas por hiperprodução reflexa ou falha de drenagem.",
    definition:
      "Lacrimejamento anormal, especialmente quando as lágrimas se acumulam ou transbordam. Pode ocorrer por produção reflexa aumentada, falha de distribuição ou redução da drenagem; o termo não define a causa.",
    category: "Sintomas",
    aliases: ["epífora", "lacrimejamento", "olhos lacrimejando", "olho aguado"],
  },
  {
    slug: "evaporativo",
    term: "Evaporativo",
    shortDefinition:
      "Forma de olho seco em que a lágrima seca rápido demais, geralmente por deficiência na camada de gordura.",
    definition:
      "Forma de olho seco em que as lágrimas evaporam rápido demais, muitas vezes por instabilidade da camada lipídica.",
    category: "Mecanismos",
    aliases: ["evaporativo", "olho seco evaporativo", "perda evaporativa"],
  },
  {
    slug: "filme-lacrimal",
    term: "Filme lacrimal",
    shortDefinition:
      "Camada de três componentes (lipídios, água e mucinas) que reveste e protege a superfície ocular.",
    definition:
      "Película dinâmica de lágrimas que lubrifica, nutre, protege e ajuda a manter a visão nítida.",
    category: "Fundamentos",
    aliases: ["filme lacrimal", "camada lacrimal", "lágrima", "lágrimas"],
  },
  {
    slug: "fluoresceina",
    term: "Fluoresceína",
    shortDefinition:
      "Corante vital amarelo-esverdeado usado para avaliar o tempo de ruptura lacrimal e lesões da córnea.",
    definition:
      "Corante usado em avaliações da superfície ocular e da estabilidade do filme lacrimal.",
    category: "Exames",
    aliases: [
      "fluoresceína",
      "fluoresceina sodica",
      "teste de fluoresceína",
      "tbut",
    ],
  },
  {
    slug: "glandulas-de-meibomius",
    term: "Glândulas de Meibomius",
    shortDefinition:
      "Glândulas sebáceas nas pálpebras que produzem a camada lipídica protetora do filme lacrimal.",
    definition:
      "Glândulas localizadas nas pálpebras que produzem lipídios importantes para reduzir a evaporação das lágrimas.",
    category: "Anatomia",
    aliases: [
      "glândulas de meibomius",
      "glandulas de meibomio",
      "meibomius",
      "meibócitos",
      "meibum",
    ],
  },
  {
    slug: "hiperosmolaridade",
    term: "Hiperosmolaridade",
    shortDefinition:
      "Concentração elevada de sais e solutos na lágrima decorrente da evaporação ou baixa produção.",
    definition:
      "Aumento da concentração de partículas nas lágrimas, associado à perda de equilíbrio da superfície ocular.",
    category: "Mecanismos",
    aliases: ["hiperosmolaridade", "osmolaridade", "osmolaridade lacrimal"],
  },
  {
    slug: "inflamacao",
    term: "Inflamação da superfície ocular",
    shortDefinition:
      "Cascata imunológica e celular que danifica o epitélio e perpetua o ciclo vicioso do olho seco.",
    definition:
      "Resposta biológica que pode contribuir para irritação, instabilidade das lágrimas e alterações da córnea ou conjuntiva.",
    category: "Mecanismos",
    aliases: ["inflamação", "inflamação ocular", "mmp-9"],
  },
  {
    slug: "irrigacao-lacrimal",
    term: "Irrigação das vias lacrimais",
    shortDefinition:
      "Procedimento com soro estéril para verificar se há passagem livre de lágrimas até o nariz.",
    definition:
      "Teste realizado com líquido estéril para avaliar a passagem e possíveis refluxos no sistema de drenagem. Uma via pérvia no teste não exclui todo atraso funcional.",
    category: "Exames",
    aliases: [
      "irrigação das vias lacrimais",
      "lavagem de vias lacrimais",
      "sondagem lacrimal",
    ],
  },
  {
    slug: "lagrimas-artificiais",
    term: "Lágrimas artificiais",
    shortDefinition:
      "Colírios formulados para hidratar, lubrificar e estabilizar o filme lacrimal.",
    definition:
      "Formulações lubrificantes usadas para aumentar umidade e conforto. Variam em composição, viscosidade e conservação.",
    category: "Tratamentos",
    aliases: [
      "lágrimas artificiais",
      "lubrificantes oculares",
      "colírio lubrificante",
      "colírios",
    ],
  },
  {
    slug: "luz-intensa-pulsada",
    term: "Luz intensa pulsada (IPL)",
    shortDefinition:
      "Terapia com pulsos de luz aplicada na região periocular para tratar DGM e reduzir inflamação.",
    definition:
      "Procedimento que aplica pulsos de luz na pele ao redor das pálpebras, com proteção ocular. É estudado principalmente no olho seco evaporativo associado à disfunção das glândulas de Meibomius; indicação e resposta não são definidas pela meibografia isoladamente.",
    category: "Tratamentos",
    aliases: ["luz intensa pulsada", "ipl", "terapia por luz pulsada"],
  },
  {
    slug: "meibografia",
    term: "Meibografia",
    shortDefinition:
      "Exame de imagem infravermelha que visualiza a arquitetura e eventual atrofia das glândulas de Meibomius.",
    definition:
      "Imagem, geralmente feita com luz infravermelha, que ajuda a observar a estrutura das glândulas de Meibomius. Não mede toda a função glandular e deve ser interpretada junto com sintomas, secreção, pálpebras e estabilidade das lágrimas.",
    category: "Exames",
    aliases: [
      "meibografia",
      "meiboscore",
      "dropout meibomiano",
      "meibografia infravermelha",
    ],
  },
  {
    slug: "mucinas",
    term: "Mucinas",
    shortDefinition:
      "Glicoproteínas produzidas por células caliciformes que ancoram a lágrima ao epitélio corneano.",
    definition:
      "Moléculas que contribuem para a distribuição e aderência do filme lacrimal à superfície do olho.",
    category: "Fundamentos",
    aliases: [
      "mucinas",
      "camada de mucina",
      "glicocálix",
      "células caliciformes",
    ],
  },
  {
    slug: "neurossensorial",
    term: "Neurossensorial",
    shortDefinition:
      "Relativo à sensibilidade, inervação corneana e percepção nervosa da dor e do desconforto.",
    definition:
      "Relativo aos nervos e ao processamento das sensações. Alterações neurossensoriais podem influenciar dor, desconforto e resposta às lágrimas.",
    category: "Mecanismos",
    aliases: [
      "neurossensorial",
      "dor neuropática",
      "nervos corneanos",
      "estesiometria",
    ],
  },
  {
    slug: "nibut",
    term: "NIBUT (Tempo de Ruptura Não Invasivo)",
    shortDefinition:
      "Medição precisa e sem fluoresceína do tempo em que o filme lacrimal permanece uniforme.",
    definition:
      "Tempo não invasivo de ruptura do filme lacrimal (Non-Invasive Break-Up Time), medido por sistemas ópticos sem instilação de corante, preservando a dinâmica lacrimal natural.",
    category: "Exames",
    aliases: ["nibut", "tempo não invasivo de ruptura", "tbut não invasivo"],
  },
  {
    slug: "olho-seco-mecanico",
    term: "Olho seco mecânico",
    shortDefinition:
      "Desconforto associado a atrito físico decorrente de conjuntivocálase, pálpebras frouxas ou malposicionamento.",
    definition:
      "Expressão descritiva para sintomas em que atrito, piscadas ou alterações anatômicas da superfície ocular participam do problema. Não é apresentada no portal como um diagnóstico isolado.",
    category: "Mecanismos",
    aliases: ["olho seco mecânico", "atrito mecânico"],
  },
  {
    slug: "osmolaridade-lacrimal",
    term: "Osmolaridade lacrimal",
    shortDefinition:
      "Biomarcador que mede a perda de homeostase e a concentração salina das lágrimas.",
    definition:
      "Medida da concentração de partículas nas lágrimas. É uma peça da investigação, não um diagnóstico isolado.",
    category: "Exames",
    aliases: ["osmolaridade lacrimal", "tearlab", "teste de osmolaridade"],
  },
  {
    slug: "piscar-incompleto",
    term: "Piscar incompleto",
    shortDefinition:
      "Piscada parcial frequente no uso de telas, que deixa a parte inferior da córnea exposta e desprotegida.",
    definition:
      "Piscada em que as pálpebras não se encontram totalmente, reduzindo a redistribuição das lágrimas.",
    category: "Vida diária",
    aliases: [
      "piscar incompleto",
      "piscada incompleta",
      "frequência de piscar",
      "piscadas",
    ],
  },
  {
    slug: "plugue-lacrimal",
    term: "Plugue lacrimal",
    shortDefinition:
      "Microdispositivo inserido no ponto lacrimal para reter a lágrima natural no olho em casos de aquodeficiência.",
    definition:
      "Pequeno dispositivo colocado no ponto lacrimal para reduzir a drenagem e manter as lágrimas por mais tempo. Não é adequado para todos os mecanismos.",
    category: "Tratamentos",
    aliases: ["plugue lacrimal", "plug de ponto lacrimal", "oclusão de ponto"],
  },
  {
    slug: "ponto-lacrimal",
    term: "Ponto lacrimal",
    shortDefinition:
      "Orifício diminuto na borda medial de cada pálpebra por onde a lágrima inicia sua drenagem.",
    definition:
      "Pequena abertura próxima ao canto interno das pálpebras por onde as lágrimas começam a drenar.",
    category: "Anatomia",
    aliases: ["ponto lacrimal", "pontos lacrimais", "punctum"],
  },
  {
    slug: "saco-lacrimal",
    term: "Saco lacrimal",
    shortDefinition:
      "Reservatório anatômico que recebe a lágrima dos canalículos e a direciona ao nariz.",
    definition:
      "Estrutura junto ao canto interno do olho que recebe as lágrimas dos canalículos antes de encaminhá-las ao ducto nasolacrimal.",
    category: "Anatomia",
    aliases: ["saco lacrimal"],
  },
  {
    slug: "superficie-ocular",
    term: "Superfície ocular",
    shortDefinition:
      "Sistema funcional integrado composto por córnea, conjuntiva, filme lacrimal e pálpebras.",
    definition:
      "Conjunto que inclui córnea, conjuntiva, filme lacrimal e estruturas relacionadas das pálpebras.",
    category: "Fundamentos",
    aliases: ["superfície ocular", "superficie ocular"],
  },
  {
    slug: "teste-de-schirmer",
    term: "Teste de Schirmer",
    shortDefinition:
      "Teste clássico com fita de papel milimetrado para quantificar a produção aquosa da lágrima.",
    definition:
      "Teste com uma pequena tira de papel usado para estimar a produção aquosa de lágrimas. O resultado precisa ser interpretado com o restante da avaliação.",
    category: "Exames",
    aliases: ["teste de schirmer", "schirmer", "schirmer 1", "schirmer 2"],
  },
  {
    slug: "tempo-de-ruptura",
    term: "Tempo de ruptura do filme lacrimal (TBUT)",
    shortDefinition:
      "Segundos que a lágrima leva para evaporar ou romper após a piscada (valores baixos indicam instabilidade).",
    definition:
      "Tempo até surgirem falhas na película de lágrimas após uma piscada; ajuda a avaliar estabilidade.",
    category: "Exames",
    aliases: [
      "tempo de ruptura",
      "tbut",
      "break-up time",
      "estabilidade lacrimal",
    ],
  },
];

export const getGlossaryTerm = (
  slugOrAlias: string,
): GlossaryTerm | undefined => {
  const normalized = slugOrAlias
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return glossaryTerms.find((item) => {
    if (item.slug === normalized) return true;
    const termNorm = item.term
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (termNorm === normalized || termNorm.startsWith(normalized)) return true;
    if (
      item.aliases?.some((alias) => {
        const aliasNorm = alias
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return aliasNorm === normalized;
      })
    ) {
      return true;
    }
    return false;
  });
};
