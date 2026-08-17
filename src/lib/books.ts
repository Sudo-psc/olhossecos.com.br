export interface BookSeo {
  title: string;
  description: string;
}

export interface BookPurchaseLink {
  store: "Amazon Kindle / KDP" | "Apple Books" | "Clube de Autores";
  label: string;
  url: string;
  format: "eBook" | "Impresso";
}

export interface BookCover {
  avif480: string;
  avif800: string;
  webp480: string;
  webp800: string;
  width: number;
  height: number;
  alt: string;
}

export interface Book {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: BookCover;
  author: string;
  status: string;
  badge: string;
  topics: string[];
  audience: string;
  language: string;
  isbn?: string;
  numberOfPages?: number;
  edition?: string;
  year?: number;
  purchaseLinks: BookPurchaseLink[];
  seo: BookSeo;
}

export const author = {
  name: "Philipe Saraiva Cruz",
  role: "Médico Oftalmologista",
  slug: "philipe-saraiva-cruz",
  description:
    "Philipe Saraiva Cruz é médico oftalmologista e autor de obras dedicadas à superfície ocular, doença do olho seco e conjuntivocálase. Sua produção editorial integra evidência científica, prática clínica, diagnóstico por imagem, tecnologia e inovação em saúde ocular.",
};

export const books: Book[] = [
  {
    slug: "conjuntivocalase-diagnostico-fisiopatologia-abordagem-clinica",
    title:
      "Conjuntivocálase: Fundamentos, Diagnóstico e Tratamento na Era da Superfície Ocular",
    subtitle:
      "Uma condição subdiagnosticada da superfície ocular e sua relação com o olho seco e o desconforto ocular crônico.",
    description:
      "Obra médica dedicada ao estudo aprofundado da conjuntivocálase, sua fisiopatologia, impacto na superfície ocular e implicações clínicas no diagnóstico diferencial do olho seco.",
    cover: {
      avif480: "/images/livros/conjuntivocalase-480.avif",
      avif800: "/images/livros/conjuntivocalase-800.avif",
      webp480: "/images/livros/conjuntivocalase-480.webp",
      webp800: "/images/livros/conjuntivocalase-800.webp",
      width: 800,
      height: 993,
      alt: "Livro Conjuntivocálase, de Philipe Saraiva Cruz, em vista tridimensional",
    },
    author: author.name,
    status: "Publicado",
    badge: "Obra avançada",
    topics: [
      "definição e epidemiologia da conjuntivocálase",
      "fisiopatologia da frouxidão conjuntival",
      "relação com olho seco evaporativo",
      "impacto na estabilidade do filme lacrimal",
      "sintomas e queixas clínicas",
      "diagnóstico clínico e por imagem",
      "diferenciação de outras doenças da superfície ocular",
      "associação com inflamação crônica",
      "abordagem terapêutica conservadora",
      "indicações cirúrgicas",
      "implicações no pós-operatório ocular",
      "integração com diagnóstico multimodal da superfície ocular",
    ],
    audience:
      "Médicos oftalmologistas, residentes, pesquisadores e profissionais dedicados à superfície ocular.",
    language: "Português",
    isbn: "978-65-02-16866-0",
    numberOfPages: 446,
    edition: "1ª edição",
    year: 2026,
    purchaseLinks: [
      {
        store: "Amazon Kindle / KDP",
        label: "eBook na Amazon",
        url: "https://www.amazon.com.br/dp/B0H5HWW171",
        format: "eBook",
      },
      {
        store: "Apple Books",
        label: "eBook no Apple Books",
        url: "https://books.apple.com/br/book/conjuntivoc%C3%A1lase/id6788016063",
        format: "eBook",
      },
      {
        store: "Clube de Autores",
        label: "Impresso no Clube de Autores",
        url: "https://clubedeautores.com.br/livro/conjuntivocalase",
        format: "Impresso",
      },
    ],
    seo: {
      title: "Conjuntivocálase: Diagnóstico e Abordagem Clínica",
      description:
        "Conheça a obra de Philipe Saraiva Cruz sobre conjuntivocálase, fisiopatologia, diagnóstico diferencial, olho seco e abordagem clínica.",
    },
  },
  {
    slug: "o-custo-invisivel-do-olho-seco",
    title: "O Custo Invisível do Olho Seco",
    subtitle:
      "Impactos clínicos, funcionais e sistêmicos de uma doença subestimada.",
    description:
      "Obra que explora o impacto clínico, econômico e humano do olho seco, destacando sua subnotificação e consequências na qualidade de vida e na prática médica.",
    cover: {
      avif480: "/images/livros/custo-invisivel-480.avif",
      avif800: "/images/livros/custo-invisivel-800.avif",
      webp480: "/images/livros/custo-invisivel-480.webp",
      webp800: "/images/livros/custo-invisivel-800.webp",
      width: 800,
      height: 993,
      alt: "Livro O Custo Invisível do Olho Seco, de Philipe Saraiva Cruz, em vista tridimensional",
    },
    author: author.name,
    status: "Publicado",
    badge: "Monografia clínica e conceitual",
    topics: [
      "impacto na qualidade de vida",
      "subdiagnóstico do olho seco",
      "carga econômica da doença",
      "produtividade e função visual",
      "dor ocular crônica",
      "impacto psicológico",
      "adesão ao tratamento",
      "sistemas de saúde",
      "visão contemporânea da doença",
      "importância do diagnóstico precoce",
    ],
    audience:
      "Médicos, pesquisadores, gestores e profissionais interessados nas dimensões clínicas, humanas e sistêmicas do olho seco.",
    language: "Português",
    isbn: "978-65-02-22313-0",
    numberOfPages: 191,
    edition: "Edição digital v2.21",
    year: 2026,
    purchaseLinks: [
      {
        store: "Amazon Kindle / KDP",
        label: "eBook na Amazon",
        url: "https://www.amazon.com.br/dp/B0H9JW6TGX",
        format: "eBook",
      },
      {
        store: "Apple Books",
        label: "eBook no Apple Books",
        url: "https://books.apple.com/br/book/o-custo-invis%C3%ADvel-do-olho-seco/id6792581396",
        format: "eBook",
      },
      {
        store: "Clube de Autores",
        label: "Impresso no Clube de Autores",
        url: "https://clubedeautores.com.br/livro/o-custo-invisivel-do-olho-seco",
        format: "Impresso",
      },
    ],
    seo: {
      title: "O Custo Invisível do Olho Seco | Philipe Saraiva",
      description:
        "Conheça a obra de Philipe Saraiva Cruz sobre os impactos clínicos, funcionais, econômicos e humanos da doença do olho seco.",
    },
  },
];

export const getBookBySlug = (slug: string) =>
  books.find((book) => book.slug === slug);
