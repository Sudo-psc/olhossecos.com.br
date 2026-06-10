/**
 * Site configuration and constants
 */

export const SITE_CONFIG = {
  name: "Saraiva Vision Clínica Especializada em Olho Seco",
  description:
    "Referência em tratamento de olho seco em Caratinga. Tecnologia avançada e atendimento humanizado na Clínica Saraiva Vision.",
  url: "https://olhossecos.com.br",
  locale: "pt_BR",
  language: "pt-BR",

  // Business Info
  business: {
    name: "Saraiva Vision Clínica Especializada em Olho Seco",
    cnpj: "53.864.119/0001-79",
    phone: "(33) 99860-1427",
    whatsapp: "5533998601427",
    email: "contato@saraivavision.com.br",
    hours: {
      weekdays: "08:00 - 18:00",
      saturday: "08:00 - 12:00",
      sunday: "Fechado",
    },
    coordinates: {
      lat: -19.7925,
      lng: -42.1447,
    },
  },

  // Doctor Info
  doctor: {
    name: "Dr. Philipe Saraiva Cruz",
    // Título formal completo (CFM compliance) - usado em schemas e contextos legais
    titleFormal:
      "Médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco",
    // Título para exibição (UX-friendly) - usado em interfaces visuais
    title: "Médico pós-graduado em Oftalmologia",
    crm: "CRM-MG 69.870",
    rqe: "RQE 307527",
    // Área de atuação principal (para exibição)
    specialty: "Olho Seco e Superfície Ocular",
    // Bio longa para uso consistente
    longBio:
      "Médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco",
    // Lista completa de especialidades
    specialties: [
      "Olho Seco",
      "Superfície Ocular",
      "Cirurgia Ocular Minimamente Invasiva",
    ],
  },

  // Social Media
  social: {
    instagram: "https://instagram.com/saraiva_vision",
    facebook: "https://facebook.com/saraivavision",
    youtube: "https://youtube.com/@saraivavision",
    linkedin: "https://linkedin.com/company/saraivavision",
  },

  // SEO Defaults
  seo: {
    titleTemplate: "%s | Saraiva Vision - Olhos Secos",
    defaultTitle:
      "Saraiva Vision Clínica Especializada em Olho Seco | Dr. Philipe Saraiva Cruz",
    defaultDescription:
      "Saraiva Vision - Clínica Especializada em Olho Seco em Caratinga/MG. Dr. Philipe Saraiva Cruz, médico pós-graduado em oftalmologia com área de atuação em oftalmologia clínica geral, procedimentos minimamente invasivos e olho seco.",
    defaultImage: "/og-image.jpg",
  },

  // Navigation
  navigation: [
    { name: "Início", href: "/" },
    { name: "Olho Seco", href: "/olho-seco" },
    { name: "Tratamentos", href: "/tratamentos" },
    { name: "App 20-20-20", href: "/widget" },
    { name: "Vídeos", href: "/videos" },
    { name: "Blog", href: "/blog" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ],

  // Dry Eye Widget — open source desktop app (20-20-20 rule)
  widget: {
    name: "Dry Eye Widget",
    page: "/widget",
    landing: "https://olhossecos.com.br/app/",
    github: "https://github.com/Sudo-psc/dry-eye-widget",
    download: "https://github.com/Sudo-psc/dry-eye-widget/releases/latest",
  },

  // Footer Links
  footerLinks: {
    quick: [
      { name: "Início", href: "/" },
      { name: "Olho Seco", href: "/olho-seco" },
      { name: "Tratamentos", href: "/tratamentos" },
      { name: "App 20-20-20", href: "/widget" },
      { name: "Blog", href: "/blog" },
      { name: "FAQ", href: "/faq" },
      { name: "Contato", href: "/contato" },
    ],
    services: [
      { name: "Diagnóstico de Olho Seco", href: "/tratamentos#diagnostico" },
      { name: "Plugs Lacrimais", href: "/tratamentos#plugs" },
      { name: "Jato de Plasma", href: "/tratamentos#plasma" },
      { name: "Meibografia", href: "/tratamentos#meibografia" },
      { name: "Consulta Oftalmológica", href: "/contato" },
    ],
    legal: [
      { name: "Política de Privacidade", href: "/privacidade" },
      { name: "Termos de Uso", href: "/termos" },
    ],
  },
};

// Structured Data for the clinic
export function getClinicStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${SITE_CONFIG.url}/#clinic`,
    name: SITE_CONFIG.business.name,
    alternateName: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.business.phone,
    email: SITE_CONFIG.business.email,
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.business.coordinates.lat,
      longitude: SITE_CONFIG.business.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "12:00",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: "BRL",
    paymentAccepted: "Cash, Credit Card, Debit Card, PIX",
    medicalSpecialty: "Ophthalmology",
    sameAs: Object.values(SITE_CONFIG.social),
  };
}

// Structured Data for the doctor
export function getDoctorStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${SITE_CONFIG.url}/#doctor`,
    name: SITE_CONFIG.doctor.name,
    // Usa título formal para conformidade com CFM em structured data
    jobTitle: SITE_CONFIG.doctor.titleFormal,
    medicalSpecialty: "Ophthalmology",
    description: SITE_CONFIG.doctor.longBio,
    identifier: [
      {
        "@type": "PropertyValue",
        name: "CRM",
        value: SITE_CONFIG.doctor.crm,
      },
      {
        "@type": "PropertyValue",
        name: "RQE",
        value: SITE_CONFIG.doctor.rqe,
      },
    ],
    worksFor: {
      "@id": `${SITE_CONFIG.url}/#clinic`,
    },
    url: SITE_CONFIG.url,
  };
}

// Breadcrumb structured data helper
export function getBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

// FAQ structured data helper
export function getFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Article structured data helper
export function getArticleStructuredData(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url.startsWith("http")
      ? article.url
      : `${SITE_CONFIG.url}${article.url}`,
    image: article.image || SITE_CONFIG.seo.defaultImage,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author || SITE_CONFIG.doctor.name,
    },
    publisher: {
      "@id": `${SITE_CONFIG.url}/#clinic`,
    },
  };
}
