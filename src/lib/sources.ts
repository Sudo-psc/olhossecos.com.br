export interface EditorialSource {
  name: string;
  type: string;
  url: string;
  description: string;
  verified: string;
}

const verified = "25 de julho de 2026";

export const sources = {
  dews3Executive: {
    name: "TFOS DEWS III — resumo executivo",
    type: "Consenso científico internacional",
    url: "https://pubmed.ncbi.nlm.nih.gov/41005521/",
    description:
      "Síntese das conclusões e recomendações atualizadas sobre definição, diagnóstico e manejo da doença do olho seco.",
    verified,
  },
  dews3Diagnostic: {
    name: "TFOS DEWS III — metodologia diagnóstica",
    type: "Consenso científico internacional",
    url: "https://pubmed.ncbi.nlm.nih.gov/40451408/",
    description:
      "Revisão da definição, dos critérios diagnósticos, da subclassificação e das avaliações da superfície ocular.",
    verified,
  },
  dews3Management: {
    name: "TFOS DEWS III — manejo e tratamento",
    type: "Consenso científico internacional",
    url: "https://pubmed.ncbi.nlm.nih.gov/40467022/",
    description:
      "Revisão baseada em evidências das estratégias de manejo, autocuidado e tratamento do olho seco.",
    verified,
  },
  dews3Digest: {
    name: "TFOS DEWS III — atualização interdisciplinar",
    type: "Consenso científico internacional",
    url: "https://pubmed.ncbi.nlm.nih.gov/40472874/",
    description:
      "Atualização sobre fatores de risco, mecanismos, dor, iatrogenia, qualidade de vida e pesquisa.",
    verified,
  },
  nei: {
    name: "National Eye Institute — Dry Eye",
    type: "Instituição pública de pesquisa e educação",
    url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye",
    description:
      "Visão geral para pacientes sobre sintomas, riscos, investigação, cuidados e tratamentos.",
    verified,
  },
  nhs: {
    name: "NHS — Dry eyes",
    type: "Serviço público de saúde",
    url: "https://www.nhs.uk/symptoms/dry-eyes/",
    description:
      "Orientações em linguagem simples sobre sintomas, autocuidado e sinais que pedem ajuda rápida.",
    verified,
  },
  dryEyeAssociation: {
    name: "Dry Eye Association",
    type: "Associação de pacientes",
    url: "https://dry-eye-association.com/",
    description:
      "Recursos de educação e apoio produzidos para pessoas que vivem com olho seco e condições associadas.",
    verified,
  },
  sjogrens: {
    name: "Sjögren’s Foundation — Dry Eye",
    type: "Fundação de pacientes",
    url: "https://sjogrens.org/understanding-sjogrens/symptoms/dry-eye",
    description:
      "Informações sobre olho seco associado à doença de Sjögren e recursos para pacientes.",
    verified,
  },
  preventBlindness: {
    name: "Prevent Blindness — Dry Eye",
    type: "Organização sem fins lucrativos",
    url: "https://preventblindness.org/wp-content/uploads/2023/09/FS38-Dry-Eye-2.pdf",
    description:
      "Material educativo para pacientes sobre sintomas, fatores associados, diagnóstico e opções de cuidado.",
    verified,
  },
} satisfies Record<string, EditorialSource>;

export const primarySources: EditorialSource[] = [
  sources.dews3Executive,
  sources.dews3Diagnostic,
  sources.dews3Management,
  sources.dews3Digest,
  sources.nei,
  sources.nhs,
  sources.dryEyeAssociation,
  sources.sjogrens,
  sources.preventBlindness,
];

export const sourceLink = (source: EditorialSource) => ({
  label: source.name,
  url: source.url,
});
