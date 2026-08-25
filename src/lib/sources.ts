export interface EditorialSource {
  name: string;
  type: string;
  url: string;
  description: string;
  verified: string;
}

const verified = "25 de julho de 2026";
const verifiedToday = "26 de julho de 2026";
const verifiedCurrent = "10 de agosto de 2026";
const verifiedHwang = "25 de agosto de 2026";

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
  iplSystematicReview: {
    name: "Peira et al. — luz pulsada para olho seco associado à disfunção meibomiana",
    type: "Revisão sistemática e metanálise",
    url: "https://pubmed.ncbi.nlm.nih.gov/39611367/",
    description:
      "Síntese de 13 estudos randomizados sobre benefícios, incertezas e segurança da luz intensa pulsada em pessoas com disfunção das glândulas de Meibomius.",
    verified: verifiedToday,
  },
  iplRandomizedTrial: {
    name: "Toyos et al. — luz pulsada e expressão das glândulas de Meibomius",
    type: "Ensaio clínico randomizado",
    url: "https://pubmed.ncbi.nlm.nih.gov/35737696/",
    description:
      "Comparação entre luz intensa pulsada associada à expressão glandular e procedimento simulado associado à expressão glandular.",
    verified: verifiedToday,
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
  aaoEyeDrops: {
    name: "American Academy of Ophthalmology — Eye Drops",
    type: "Material educativo para pacientes",
    url: "https://store.aao.org/media/resources/051183/051183-Eye-Drops-rf1.pdf",
    description:
      "Explicação para pacientes sobre classes de colírios, efeitos adversos, técnica de aplicação e cuidados de segurança.",
    verified: verifiedCurrent,
  },
  aaoDryEye: {
    name: "American Academy of Ophthalmology — Dry Eye",
    type: "Material educativo para pacientes",
    url: "https://store.aao.org/media/resources/051180/051180-dry-eye-rf1.pdf",
    description:
      "Material para pacientes sobre camadas da lágrima, lágrimas artificiais, conservantes, pomadas e tratamento do olho seco.",
    verified: verifiedCurrent,
  },
  guysDryEyeTreatment: {
    name: "Guy’s and St Thomas’ NHS — Dry eye syndrome: treatment",
    type: "Serviço público de saúde",
    url: "https://www.guysandstthomas.nhs.uk/health-information/dry-eye-syndrome/treatment",
    description:
      "Orientações para pacientes sobre gotas, géis, pomadas, conservantes, armazenamento e efeitos indesejados.",
    verified: verifiedCurrent,
  },
  ministryOcularDiseases: {
    name: "Ministério da Saúde — Doenças oculares",
    type: "Órgão público de saúde",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/doencas-oculares/doencas-oculares/",
    description:
      "Orientações gerais sobre sintomas oculares, uso de colírios lubrificantes e riscos da automedicação.",
    verified: verifiedCurrent,
  },
  neiDryEyeCauses: {
    name: "National Eye Institute — Causes of Dry Eye",
    type: "Instituição pública de pesquisa e educação",
    url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/dry-eye/causes-dry-eye",
    description:
      "Informações para pacientes sobre cirurgia a laser, medicamentos, condições de saúde e outros fatores associados ao olho seco.",
    verified: verifiedCurrent,
  },
  neiRefractiveSurgery: {
    name: "National Eye Institute — Surgery for Refractive Errors",
    type: "Instituição pública de pesquisa e educação",
    url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors/surgery-refractive-errors",
    description:
      "Material para pacientes sobre LASIK, efeitos adversos, recuperação, acompanhamento e outras cirurgias refrativas.",
    verified: verifiedCurrent,
  },
  postCataractDryEyeMetaAnalysis: {
    name: "Ta et al. — Dry eye post-cataract surgery",
    type: "Revisão sistemática e metanálise",
    url: "https://pubmed.ncbi.nlm.nih.gov/39806338/",
    description:
      "Síntese de estudos sobre alterações do olho seco após cirurgia de catarata e sua evolução no período pós-operatório.",
    verified: verifiedCurrent,
  },
  cataractAftercare: {
    name: "Guy’s and St Thomas’ NHS — After cataract surgery",
    type: "Serviço público de saúde",
    url: "https://www.guysandstthomas.nhs.uk/health-information/cataract-surgery/after-cataract-surgery",
    description:
      "Orientações para pacientes sobre sintomas esperados, colírios, cuidados e sinais de alerta após cirurgia de catarata.",
    verified: verifiedCurrent,
  },
  dryEyePsychiatricMetaAnalysis: {
    name: "Basilious et al. — Dry eye disease and psychiatric disorders",
    type: "Revisão sistemática e metanálise",
    url: "https://pubmed.ncbi.nlm.nih.gov/34935549/",
    description:
      "Síntese da prevalência de depressão e ansiedade em pessoas com doença do olho seco e da associação entre sintomas oculares e escores psicológicos.",
    verified: verifiedCurrent,
  },
  dryEyeDepressionUmbrellaReview: {
    name: "Dry eye disease and depression — umbrella review",
    type: "Revisão de revisões sistemáticas e metanálises",
    url: "https://pubmed.ncbi.nlm.nih.gov/36466469/",
    description:
      "Revisão de metanálises que confirma uma associação entre olho seco e depressão, mas ressalta que ainda faltam evidências para estabelecer o mecanismo e a causalidade.",
    verified: verifiedCurrent,
  },
  depressionAntidepressantsDryEye: {
    name: "Rakofsky et al. — Depression, antidepressants and dry eye disease",
    type: "Revisão sistemática",
    url: "https://pubmed.ncbi.nlm.nih.gov/33779578/",
    description:
      "Revisão que avalia separadamente a associação da depressão e do uso de antidepressivos com sintomas de olho seco.",
    verified: verifiedCurrent,
  },
  osaDryEyeMetaAnalysis: {
    name: "Lin et al. — Obstructive sleep apnea, CPAP and dry eye disease",
    type: "Revisão sistemática e metanálise",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11629664/",
    description:
      "Revisão de 11 estudos sobre apneia obstrutiva do sono e olho seco e síntese narrativa de três estudos sobre o efeito do CPAP na superfície ocular.",
    verified: verifiedCurrent,
  },
  osaOcularSurfaceMetaAnalysis: {
    name: "Sun et al. — Ocular surface outcomes in obstructive sleep apnea",
    type: "Revisão sistemática e metanálise",
    url: "https://pubmed.ncbi.nlm.nih.gov/37215172/",
    description:
      "Metanálise de estudos sobre olho seco, estabilidade lacrimal, coloração da córnea, glândulas de Meibomius e gravidade da apneia.",
    verified: verifiedCurrent,
  },
  osaSleepQualityDryEye: {
    name: "Pu et al. — Sleep quality and dry eye in obstructive sleep apnea",
    type: "Estudo caso-controle",
    url: "https://pubmed.ncbi.nlm.nih.gov/36388897/",
    description:
      "Estudo com polissonografia e avaliação da superfície ocular que relacionou pior qualidade do sono a parâmetros mais desfavoráveis de olho seco em pessoas com apneia.",
    verified: verifiedCurrent,
  },
  osaDepressionMetaAnalysis: {
    name: "Edwards et al. — Obstructive sleep apnea and depression",
    type: "Revisão sistemática e metanálise",
    url: "https://pubmed.ncbi.nlm.nih.gov/33158487/",
    description:
      "Síntese de estudos observacionais sobre a associação entre apneia obstrutiva do sono e depressão, separando evidência transversal e longitudinal.",
    verified: verifiedCurrent,
  },
  cpapDepressiveSymptomsMetaAnalysis: {
    name: "Povitz et al. — Treatment of obstructive sleep apnea and depressive symptoms",
    type: "Revisão sistemática e metanálise de ensaios clínicos",
    url: "https://pubmed.ncbi.nlm.nih.gov/25423175/",
    description:
      "Metanálise de ensaios sobre CPAP e aparelhos de avanço mandibular para sintomas depressivos em pessoas com apneia do sono.",
    verified: verifiedCurrent,
  },
  nhlbiSleepApneaSymptoms: {
    name: "National Heart, Lung, and Blood Institute — Sleep apnea symptoms",
    type: "Instituição pública de saúde",
    url: "https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms",
    description:
      "Sinais e sintomas que podem justificar uma conversa sobre apneia do sono, incluindo pausas respiratórias, ronco, engasgos e sonolência diurna.",
    verified: verifiedCurrent,
  },
  nhsWateringEyes: {
    name: "NHS — Watering eyes",
    type: "Serviço público de saúde",
    url: "https://www.nhs.uk/symptoms/watering-eyes/",
    description:
      "Informações para pacientes sobre lacrimejamento, causas possíveis, sinais de alerta e situações em que pode ser necessária investigação.",
    verified: verifiedToday,
  },
  wateryEyeAssessment: {
    name: "Lopez Montes et al. — avaliação do olho lacrimejante",
    type: "Revisão clínica",
    url: "https://pubmed.ncbi.nlm.nih.gov/36508543/",
    description:
      "Revisão da anatomia, das causas e da avaliação clínica do lacrimejamento, incluindo superfície ocular, pálpebras e sistema de drenagem.",
    verified: verifiedToday,
  },
  epiphoraEtiology: {
    name: "Lee e Baek — causas de epífora",
    type: "Estudo clínico retrospectivo",
    url: "https://pubmed.ncbi.nlm.nih.gov/34237206/",
    description:
      "Estudo que ilustra a natureza multifatorial da epífora, incluindo lacrimejamento reflexo associado ao olho seco e alterações das vias lacrimais.",
    verified: verifiedToday,
  },
  functionalEpiphora: {
    name: "Usmani et al. — epífora funcional",
    type: "Estudo clínico retrospectivo",
    url: "https://pubmed.ncbi.nlm.nih.gov/36952153/",
    description:
      "Avaliação de casos em que a irrigação era pérvia, mas exames de imagem demonstraram atraso funcional da drenagem lacrimal.",
    verified: verifiedToday,
  },
  nhsEyeInjuries: {
    name: "NHS — Eye injuries",
    type: "Serviço público de saúde",
    url: "https://www.nhs.uk/conditions/eye-injuries/",
    description:
      "Primeiros cuidados e sinais de urgência em trauma, perfuração ou exposição química dos olhos.",
    verified: verifiedToday,
  },
  dryEyeAssociation: {
    name: "Dry Eye Association",
    type: "Associação de pacientes",
    url: "https://dry-eye-association.com/",
    description:
      "Recursos de educação e apoio produzidos para pessoas que vivem com olho seco e condições associadas.",
    verified,
  },
  conjunctivochalasisReview: {
    name: "Marmalidou et al. — Conjunctivochalasis: a systematic review",
    type: "Revisão sistemática",
    url: "https://pubmed.ncbi.nlm.nih.gov/29128574/",
    description:
      "Síntese sobre pregas conjuntivais redundantes, sintomas, fluxo lacrimal, atrito, inflamação e opções de cuidado.",
    verified: verifiedToday,
  },
  hwangMeibography3d: {
    name: "Hwang et al. — meibografia 3D por OCT de domínio Fourier",
    type: "Estudo clínico descritivo",
    url: "https://doi.org/10.1371/journal.pone.0067143",
    description:
      "Reconstrução em volume das glândulas de Meibomius com FD-OCT em 2 voluntários e 7 pacientes, comparada à meibografia infravermelha. PLoS ONE, licença CC BY 4.0.",
    verified: verifiedHwang,
  },
  conjunctivochalasisTearFlow: {
    name: "Huang et al. — fluxo lacrimal na conjuntivocálase",
    type: "Estudo clínico comparativo",
    url: "https://pubmed.ncbi.nlm.nih.gov/23583167/",
    description:
      "Avaliação da interferência da conjuntivocálase na reposição das lágrimas entre o fórnice e o menisco lacrimal.",
    verified: verifiedToday,
  },
  frictionRelatedDisease: {
    name: "Ahn et al. — doença da superfície ocular relacionada ao atrito",
    type: "Estudo clínico transversal",
    url: "https://pubmed.ncbi.nlm.nih.gov/35219899/",
    description:
      "Estudo da associação entre atrito, disfunção das glândulas de Meibomius, deficiência aquosa e alterações como conjuntivocálase.",
    verified: verifiedToday,
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
  sources.iplSystematicReview,
  sources.iplRandomizedTrial,
  sources.dews3Digest,
  sources.nei,
  sources.nhs,
  sources.aaoEyeDrops,
  sources.aaoDryEye,
  sources.guysDryEyeTreatment,
  sources.ministryOcularDiseases,
  sources.neiDryEyeCauses,
  sources.neiRefractiveSurgery,
  sources.postCataractDryEyeMetaAnalysis,
  sources.cataractAftercare,
  sources.dryEyePsychiatricMetaAnalysis,
  sources.dryEyeDepressionUmbrellaReview,
  sources.depressionAntidepressantsDryEye,
  sources.osaDryEyeMetaAnalysis,
  sources.osaOcularSurfaceMetaAnalysis,
  sources.osaSleepQualityDryEye,
  sources.osaDepressionMetaAnalysis,
  sources.cpapDepressiveSymptomsMetaAnalysis,
  sources.nhlbiSleepApneaSymptoms,
  sources.nhsWateringEyes,
  sources.wateryEyeAssessment,
  sources.epiphoraEtiology,
  sources.functionalEpiphora,
  sources.nhsEyeInjuries,
  sources.dryEyeAssociation,
  sources.conjunctivochalasisReview,
  sources.conjunctivochalasisTearFlow,
  sources.frictionRelatedDisease,
  sources.sjogrens,
  sources.preventBlindness,
];

export const sourceLink = (source: EditorialSource) => ({
  label: source.name,
  url: source.url,
});
