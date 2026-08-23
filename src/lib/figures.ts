export interface FigureCredit {
  label: string;
  url?: string;
}

export interface FigureLicense {
  label: string;
  url: string;
}

export interface FigureAsset {
  src: string;
  avifSrcSet: string;
  webpSrcSet: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: FigureCredit;
  license?: FigureLicense;
  modification?: string;
  disclosure?: string;
  presentation?: "wide" | "compact";
}

export const figures = {
  tearFilmEducation: {
    src: "/images/educacao/filme-lacrimal-realista.jpg",
    avifSrcSet:
      "/images/educacao/filme-lacrimal-realista-760.avif 760w, /images/educacao/filme-lacrimal-realista-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/filme-lacrimal-realista-760.webp 760w, /images/educacao/filme-lacrimal-realista-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Visualização realista de uma película lacrimal fina se distribuindo sobre a córnea de um olho.",
    caption:
      "A cada piscada, o filme lacrimal se redistribui sobre a superfície ocular. Seus componentes funcionam de forma integrada e dinâmica.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação em estilo realista, sem escala anatômica e não é uma fotografia clínica.",
  },
  tearFilmLayersEducation: {
    src: "/images/educacao/camadas-filme-lacrimal-realista.jpg",
    avifSrcSet:
      "/images/educacao/camadas-filme-lacrimal-realista-760.avif 760w, /images/educacao/camadas-filme-lacrimal-realista-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/camadas-filme-lacrimal-realista-760.webp 760w, /images/educacao/camadas-filme-lacrimal-realista-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Visualização microscópica ampliada do epitélio da córnea, da fase mucoaquosa e da película lipídica superficial.",
    caption:
      "Visualização ampliada: uma película lipídica muito fina recobre a fase mucoaquosa; junto ao epitélio, as mucinas formam uma interface gradual. No olho real, esses componentes são integrados e dinâmicos.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; espessuras e estruturas foram ampliadas e não estão em escala anatômica.",
  },
  diagnosticImagingEducation: {
    src: "/images/educacao/meibografia-as-oct-educacao.jpg",
    avifSrcSet:
      "/images/educacao/meibografia-as-oct-educacao-760.avif 760w, /images/educacao/meibografia-as-oct-educacao-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/meibografia-as-oct-educacao-760.webp 760w, /images/educacao/meibografia-as-oct-educacao-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Composição esquemática com uma meibografia de pálpebra à esquerda e um corte de AS-OCT do menisco lacrimal à direita.",
    caption:
      "Meibografia e AS-OCT produzem imagens diferentes: a primeira documenta a estrutura das glândulas palpebrais; o segundo pode registrar cortes e medidas do segmento anterior.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; não é exame real, laudo ou padrão de normalidade.",
  },
  iplEducation: {
    src: "/images/educacao/luz-pulsada-ipl-educacao.jpg",
    avifSrcSet:
      "/images/educacao/luz-pulsada-ipl-educacao-760.avif 760w, /images/educacao/luz-pulsada-ipl-educacao-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/luz-pulsada-ipl-educacao-760.webp 760w, /images/educacao/luz-pulsada-ipl-educacao-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Ilustração de aplicação de luz intensa pulsada na pele abaixo da pálpebra, com proteção ocular opaca.",
    caption:
      "Na IPL, pulsos de luz são aplicados na pele periocular seguindo um protocolo e com proteção ocular apropriada.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; não demonstra um protocolo específico nem substitui instruções de segurança.",
  },
  lacrimalSystemPtOpen: {
    src: "/images/educacao/sistema-lacrimal-pt-cc-by-sa.png",
    avifSrcSet:
      "/images/educacao/sistema-lacrimal-pt-cc-by-sa-760.avif 760w, /images/educacao/sistema-lacrimal-pt-cc-by-sa-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/sistema-lacrimal-pt-cc-by-sa-760.webp 760w, /images/educacao/sistema-lacrimal-pt-cc-by-sa-1200.webp 1200w",
    width: 1200,
    height: 1013,
    alt: "Diagrama em português da glândula lacrimal, dos pontos e canalículos lacrimais, do saco lacrimal e do canal nasolacrimal.",
    caption:
      "A glândula lacrimal participa da produção; as piscadas distribuem as lágrimas; pontos e canalículos conduzem o líquido ao saco lacrimal e ao canal nasolacrimal.",
    credit: {
      label: "Jmarchn — Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Tear_system-pt.svg",
    },
    license: {
      label: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0/",
    },
    modification:
      "Conversão do SVG para formatos raster, fundo branco e redimensionamento.",
    presentation: "compact",
  },
  blinkCompletenessEducation: {
    src: "/images/educacao/piscada-completa-incompleta.jpg",
    avifSrcSet:
      "/images/educacao/piscada-completa-incompleta-760.avif 760w, /images/educacao/piscada-completa-incompleta-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/piscada-completa-incompleta-760.webp 760w, /images/educacao/piscada-completa-incompleta-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Comparação lado a lado de um olho humano: à esquerda a pálpebra superior encosta na inferior, fechando por completo; à direita resta uma faixa exposta da superfície ocular.",
    caption:
      "Na piscada completa a pálpebra superior alcança a inferior e o filme lacrimal é redistribuído por toda a superfície. Na incompleta, uma faixa inferior fica sem essa renovação.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica e não é uma fotografia clínica.",
  },
  symptomDiaryEducation: {
    src: "/images/educacao/registro-de-sintomas.jpg",
    avifSrcSet:
      "/images/educacao/registro-de-sintomas-760.avif 760w, /images/educacao/registro-de-sintomas-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/registro-de-sintomas-760.webp 760w, /images/educacao/registro-de-sintomas-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Caderno de papel aberto sobre uma mesa clara, com um gráfico de linha simples desenhado à mão acompanhando um valor ao longo de vários dias, e uma caneta ao lado.",
    caption:
      "Um registro simples e constante costuma dizer mais em consulta do que a tentativa de lembrar meses de sintomas de memória.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica e não é uma fotografia clínica.",
  },
  tearSubstituteViscosityEducation: {
    src: "/images/educacao/viscosidade-lubrificantes.jpg",
    avifSrcSet:
      "/images/educacao/viscosidade-lubrificantes-760.avif 760w, /images/educacao/viscosidade-lubrificantes-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/viscosidade-lubrificantes-760.webp 760w, /images/educacao/viscosidade-lubrificantes-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Três conta-gotas de vidro transparentes lado a lado liberando gotas de espessuras diferentes: uma fluida, uma intermediária e uma espessa que se alonga em um filete.",
    caption:
      "Lubrificantes variam em viscosidade. O mais espesso tende a permanecer mais tempo na superfície, mas também pode embaçar a visão temporariamente.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica e não é uma fotografia clínica.",
  },
  lidHygieneEducation: {
    src: "/images/educacao/compressa-morna-higiene-palpebral.jpg",
    avifSrcSet:
      "/images/educacao/compressa-morna-higiene-palpebral-760.avif 760w, /images/educacao/compressa-morna-higiene-palpebral-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/compressa-morna-higiene-palpebral-760.webp 760w, /images/educacao/compressa-morna-higiene-palpebral-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Pessoa adulta de olhos fechados com um pano limpo dobrado apoiado sobre as pálpebras, mãos segurando o pano com delicadeza, e um algodão limpo sobre a superfície ao lado.",
    caption:
      "Calor local confortável e limpeza suave das bordas palpebrais formam a base da rotina. Intensidade não é sinônimo de eficácia.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica e não é uma fotografia clínica.",
  },
  conjunctivochalasisEducation: {
    src: "/images/educacao/pregas-conjuntivais.jpg",
    avifSrcSet:
      "/images/educacao/pregas-conjuntivais-760.avif 760w, /images/educacao/pregas-conjuntivais-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/pregas-conjuntivais-760.webp 760w, /images/educacao/pregas-conjuntivais-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Aproximação da parte inferior de um olho humano mostrando dobras frouxas e translúcidas da conjuntiva reunidas no espaço entre o globo ocular e a margem da pálpebra inferior.",
    caption:
      "Pregas frouxas da conjuntiva podem ocupar o espaço por onde a lágrima é recolhida junto à pálpebra inferior, atrasando sua eliminação.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica e não é uma fotografia clínica.",
  },
  symptomsDailyLife: {
    src: "/images/educacao/sintomas-dia-a-dia.jpg",
    avifSrcSet:
      "/images/educacao/sintomas-dia-a-dia-760.avif 760w, /images/educacao/sintomas-dia-a-dia-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/sintomas-dia-a-dia-760.webp 760w, /images/educacao/sintomas-dia-a-dia-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Pessoa adulta sentada diante de um notebook em luz natural, com os olhos fechados e a mão apoiada junto a um deles, em expressão de cansaço.",
    caption:
      "Os sintomas costumam aparecer em tarefas de atenção prolongada e melhorar com pausas — um padrão que vale observar e relatar.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
  dryEyeFactors: {
    src: "/images/educacao/fatores-filme-lacrimal.jpg",
    avifSrcSet:
      "/images/educacao/fatores-filme-lacrimal-760.avif 760w, /images/educacao/fatores-filme-lacrimal-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/fatores-filme-lacrimal-760.webp 760w, /images/educacao/fatores-filme-lacrimal-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Composição sobre superfície clara com um ventilador de mesa, óculos, um estojo de lentes de contato e um organizador de comprimidos.",
    caption:
      "Ambiente, medicamentos, lentes de contato e características individuais podem participar em proporções diferentes no mesmo quadro.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
  selfCareEnvironment: {
    src: "/images/educacao/autocuidado-ambiente.jpg",
    avifSrcSet:
      "/images/educacao/autocuidado-ambiente-760.avif 760w, /images/educacao/autocuidado-ambiente-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/autocuidado-ambiente-760.webp 760w, /images/educacao/autocuidado-ambiente-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Canto de sala em luz natural, com umidificador liberando vapor suave, um copo de água, uma planta e uma poltrona afastada da saída de ar.",
    caption:
      "Ajustar umidade, evitar ar direto no rosto e fazer pausas são medidas de baixo risco que atuam sobre gatilhos, não sobre a causa.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
  ocularWarningSign: {
    src: "/images/educacao/sinais-de-alerta-ocular.jpg",
    avifSrcSet:
      "/images/educacao/sinais-de-alerta-ocular-760.avif 760w, /images/educacao/sinais-de-alerta-ocular-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/sinais-de-alerta-ocular-760.webp 760w, /images/educacao/sinais-de-alerta-ocular-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Pessoa adulta em close, com um dos olhos visivelmente avermelhado e irritado, levando a mão até perto dele, com expressão preocupada.",
    caption:
      "Vermelhidão intensa acompanhada de dor, queda da visão ou sensibilidade importante à luz não deve ser tratada como simples olho seco.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
  slitLampAssessment: {
    src: "/images/educacao/avaliacao-lampada-de-fenda.jpg",
    avifSrcSet:
      "/images/educacao/avaliacao-lampada-de-fenda-760.avif 760w, /images/educacao/avaliacao-lampada-de-fenda-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/avaliacao-lampada-de-fenda-760.webp 760w, /images/educacao/avaliacao-lampada-de-fenda-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Profissional de jaleco branco sentado a uma lâmpada de fenda em sala escurecida, ajustando o equipamento sob a luz azul-esverdeada do feixe.",
    caption:
      "A avaliação na lâmpada de fenda permite examinar pálpebras, filme lacrimal e superfície ocular com ampliação e iluminação controladas.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
  curatedReading: {
    src: "/images/educacao/leitura-conteudo-curado.jpg",
    avifSrcSet:
      "/images/educacao/leitura-conteudo-curado-760.avif 760w, /images/educacao/leitura-conteudo-curado-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/leitura-conteudo-curado-760.webp 760w, /images/educacao/leitura-conteudo-curado-1200.webp 1200w",
    width: 1200,
    height: 805,
    alt: "Vista superior de um tablet apoiado em uma mesa clara ao lado de uma xícara de café, um par de óculos e uma pilha de papéis.",
    caption:
      "Conteúdo selecionado e enviado com regularidade ajuda a acompanhar o tema sem depender de busca avulsa na internet.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; cena ilustrativa com pessoas fictícias, não é fotografia de paciente real nem registro clínico.",
  },
} satisfies Record<string, FigureAsset>;

export const openImageCredits = [
  {
    title: "Sistema lacrimal",
    author: "Jmarchn",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tear_system-pt.svg",
    licenseLabel: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    modification:
      "Conversão do SVG para formatos raster, fundo branco e redimensionamento.",
  },
];
