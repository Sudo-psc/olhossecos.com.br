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
    src: "/images/educacao/filme-lacrimal-educacao.jpg",
    avifSrcSet:
      "/images/educacao/filme-lacrimal-educacao-760.avif 760w, /images/educacao/filme-lacrimal-educacao-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/filme-lacrimal-educacao-760.webp 760w, /images/educacao/filme-lacrimal-educacao-1200.webp 1200w",
    width: 1200,
    height: 800,
    alt: "Ilustração de camadas fluidas transparentes se distribuindo sobre a superfície de um olho.",
    caption:
      "A cada piscada, o filme lacrimal se redistribui sobre a superfície ocular. Seus componentes funcionam de forma integrada e dinâmica.",
    credit: {
      label: "Ilustração original do portal",
    },
    disclosure:
      "Imagem gerada com IA para fins educativos; representação esquemática, sem escala anatômica.",
  },
  tearFilmLayersOpen: {
    src: "/images/educacao/camadas-filme-lacrimal-cc-by-sa.png",
    avifSrcSet:
      "/images/educacao/camadas-filme-lacrimal-cc-by-sa-760.avif 760w, /images/educacao/camadas-filme-lacrimal-cc-by-sa-1200.avif 1200w",
    webpSrcSet:
      "/images/educacao/camadas-filme-lacrimal-cc-by-sa-760.webp 760w, /images/educacao/camadas-filme-lacrimal-cc-by-sa-1200.webp 1200w",
    width: 1200,
    height: 1200,
    alt: "Esquema numerado das camadas do filme lacrimal e do epitélio da córnea.",
    caption:
      "Esquema didático: 1, camada lipídica; 2, componente aquoso; 3, interface rica em mucinas; 4, epitélio da córnea. Na realidade, essas interfaces não são blocos rígidos.",
    credit: {
      label: "Vinne2 — Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Tear_film.svg",
    },
    license: {
      label: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    modification:
      "Conversão do SVG para formatos raster, fundo branco e redimensionamento.",
    presentation: "compact",
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
} satisfies Record<string, FigureAsset>;

export const openImageCredits = [
  {
    title: "Sistema lacrimal",
    author: "Jmarchn",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Tear_system-pt.svg",
    licenseLabel: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    modification:
      "Conversão do SVG para formatos raster, fundo branco e redimensionamento.",
  },
  {
    title: "Esquema do filme lacrimal",
    author: "Vinne2",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tear_film.svg",
    licenseLabel: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    modification:
      "Conversão do SVG para formatos raster, fundo branco e redimensionamento.",
  },
];
