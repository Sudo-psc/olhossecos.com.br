import { figures, type FigureAsset } from "@/lib/figures";

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  alert?: string;
  figure?: FigureAsset;
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
    slug: "tratamento-com-colirios-diferencas-e-tipos",
    category: "Tratamentos",
    title: "Tratamento com colírios: tipos, diferenças e uso seguro",
    description:
      "Um guia para entender o que muda entre lágrimas artificiais, géis, pomadas, conservantes e colírios de prescrição.",
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
    description:
      "Como entender desconforto, visão oscilante e uso de colírios depois de catarata ou cirurgia refrativa.",
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
  {
    slug: "olho-seco-lentes-de-contato",
    category: "Vida diária",
    title: "Olho seco e lentes de contato: conforto, adaptação e segurança",
    description:
      "Entenda como as lentes interagem com as lágrimas, quais padrões observar e quando interromper o uso para proteger os olhos.",
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
    title: "Épifora, olho seco e avaliação das vias lacrimais",
    description:
      "Entenda por que um olho pode lacrimejar, como as lágrimas chegam ao nariz e o que cada etapa da avaliação procura responder.",
    readingTime: "9 min",
    updated: "26 de julho de 2026",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    sourcesVerified: "26 de julho de 2026",
    tags: [
      "épifora",
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
        heading: "Épifora descreve o sintoma, não a causa",
        paragraphs: [
          "Épifora é o nome usado para lacrimejamento anormal, sobretudo quando as lágrimas se acumulam ou transbordam para as pálpebras e o rosto. A palavra não significa automaticamente que exista um canal obstruído.",
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
          "AS-OCT pode medir altura, área ou volume do menisco lacrimal, porém não percorre sozinho toda a via de drenagem até o nariz.",
        ],
        note: "Nem toda pessoa com épifora precisa de sondagem, irrigação, imagem ou endoscopia. A sequência depende da história e do que já foi encontrado no exame.",
      },
      {
        heading: "O cuidado depende do mecanismo",
        paragraphs: [
          "Quando predomina lacrimejamento reflexo, o objetivo é identificar e reduzir a irritação da superfície. Alterações das pálpebras e da bomba lacrimal precisam de uma estratégia própria. Se há estreitamento ou obstrução, a localização e a repercussão orientam quais opções podem ser discutidas.",
          "Plugue lacrimal e cauterização reduzem intencionalmente a drenagem para conservar lágrimas em alguns contextos de olho seco. Eles não devem ser tratados como solução automática quando já existe épifora ou quando a causa do lacrimejamento ainda não foi esclarecida.",
          "Não tente sondar, irrigar ou pressionar repetidamente a região em casa. O portal não recomenda antibiótico, colírio ou procedimento com base apenas no sintoma.",
        ],
      },
      {
        heading: "Quando o lacrimejamento pede avaliação rápida",
        paragraphs: [
          "Dor forte, mudança visual, sensibilidade importante à luz, trauma, produto químico, objeto preso ou olho muito vermelho precisam de avaliação rápida, mesmo que o lacrimejamento seja o sintoma mais evidente.",
          "Inchaço doloroso junto ao canto interno do olho, especialmente com secreção ou febre, pode indicar inflamação ou infecção do saco lacrimal e também não deve esperar.",
        ],
        alert:
          "Épifora persistente merece investigação; épifora acompanhada de dor intensa, piora visual, trauma ou inchaço doloroso com febre exige prioridade.",
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
        label: "Usmani et al. — Functional epiphora",
        url: "https://pubmed.ncbi.nlm.nih.gov/36952153/",
      },
    ],
  },
];

export const getGuide = (slug: string) =>
  guides.find((guide) => guide.slug === slug);
