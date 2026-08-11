/**
 * RADAR Científico — curadoria mensal da literatura de olho seco e superfície
 * ocular publicada pela SUPERFÍCIE.
 *
 * Cada relatório nasce da varredura mensal descrita na governança editorial do
 * projeto e passa por revisão do editor responsável antes de entrar aqui. Só
 * itens com fonte verificável e link público são publicados: quando uma
 * referência não puder ser aberta pelo leitor, prefira um link alternativo
 * (PubMed, DOI ou página institucional) a manter a entrada sem acesso.
 *
 * O campo "uso na revista" do relatório interno é planejamento de pauta e não
 * é publicado.
 */

export const radarMonitoring = [
  {
    title: "Literatura científica",
    detail:
      "PubMed, SciELO e periódicos de referência: The Ocular Surface, Cornea, Ophthalmology, AJO, BJO, IOVS, JCRS e Contact Lens & Anterior Eye.",
  },
  {
    title: "Sociedades e congressos",
    detail: "TFOS, ARVO, AAO, CBO e demais eventos da especialidade.",
  },
  {
    title: "Indústria e regulação",
    detail:
      "Aprovações FDA e ANVISA, pipelines farmacológicos e lançamentos de tecnologia diagnóstica e terapêutica.",
  },
  {
    title: "Temas da arquitetura editorial",
    detail:
      "Fenotipagem, diagnóstico multimodal, meibografia, biomarcadores, terapias avançadas, superfície ocular perioperatória, lentes de contato, inteligência artificial e economia clínica.",
  },
] as const;

export const radarCriteria = [
  "Prioridade para estudos e novidades dos últimos 30 a 45 dias.",
  "Toda entrada traz fonte original com link, resumo breve e por que importa para a prática.",
  "Itens sem fonte verificável são descartados.",
  "Divergências entre fontes são sinalizadas para validação do responsável editorial.",
] as const;

export interface RadarFinding {
  /** Título da referência, preservado no idioma original da publicação. */
  title: string;
  /** Periódico, sociedade ou órgão regulador. */
  source: string;
  /** Data ou janela de publicação, como declarada pela fonte. */
  date: string;
  url: string;
  /**
   * DOI conferido no Crossref, quando existir. Serve de caminho alternativo
   * quando o link do editor estiver atrás de paywall ou bloqueio.
   */
  doi?: string;
  summary: string;
  whyItMatters: string;
  evidenceLevel: string;
  /** Seção da arquitetura editorial a que o achado pertence. */
  section: string;
}

export interface RadarHighlight {
  title: string;
  whyItMatters: string;
}

export interface RadarIndustryItem {
  title: string;
  label: string;
  url: string;
  note: string;
}

export interface RadarReport {
  slug: string;
  /** Rótulo do ciclo, como "Agosto 2026". */
  label: string;
  title: string;
  /** Janela coberta pela varredura. */
  period: string;
  publishedAt: string;
  executiveSummary: string;
  highlights: RadarHighlight[];
  findings: RadarFinding[];
  industry: RadarIndustryItem[];
  transparencyNote: string;
  seo: {
    title: string;
    description: string;
  };
}

export const getRadarReportPath = (report: RadarReport) =>
  `/superficie/radar/${report.slug}`;

const agosto2026: RadarReport = {
  slug: "agosto-2026",
  label: "Agosto 2026",
  title: "Do sintoma ao mecanismo: o vocabulário clínico está mudando",
  period: "Varredura de julho e agosto de 2026",
  publishedAt: "2026-08-09",
  executiveSummary:
    "O período consolidou a transição prática do olho seco como síndrome para precisão por mecanismo e fenótipo. Três movimentos organizam o ciclo: classificação orientada a causa-raiz com reconhecimento explícito do eixo neurossensorial, refinamento de desfechos e métricas para disfunção das glândulas de Meibômio em estudos clínicos, e maturação do pipeline com terapias de mecanismo novo — sempre com atenção à dissociação entre sinais e sintomas.",
  highlights: [
    {
      title:
        "TFOS DEWS III reposiciona diagnóstico e terapia em torno de mecanismos",
      whyItMatters:
        "Ajuda a transformar tratamento em escada por gravidade em tratamento dirigido, útil tanto para protocolos de consultório quanto para a comunicação com o paciente.",
    },
    {
      title: "Precisão em DGM depende de métricas mais consistentes",
      whyItMatters:
        "Melhora a leitura crítica de estudos e reduz a disputa entre equipamentos apoiada em desfechos que não são comparáveis entre si.",
    },
    {
      title: "Eixo intestino–superfície ocular ganha releitura por fenótipo",
      whyItMatters:
        "Aponta linhas de pesquisa e pautas de fronteira, mas exige cautela para não antecipar recomendação clínica a partir de plausibilidade mecanística.",
    },
    {
      title: "Sínteses de luz pulsada refinam efetividade e segurança em DGM",
      whyItMatters:
        "Orienta posicionamento realista: quem se beneficia, que expectativa comunicar e como planejar manutenção.",
    },
    {
      title: "Agonista TRPM8 abre o capítulo neuro-lacrimal",
      whyItMatters:
        "Reforça a segmentação do tratamento entre repor e estabilizar a lágrima, reduzir inflamação e aumentar produção.",
    },
  ],
  findings: [
    {
      title: "TFOS DEWS III: Executive Summary",
      source: "American Journal of Ophthalmology, suplemento DEWS III",
      date: "2025–2026",
      url: "https://www.ajo.com/article/S0002-9394(25)00514-8/fulltext",
      doi: "10.1016/j.ajo.2025.09.035",
      summary:
        "Síntese do consenso global do DEWS III, atualizando subclassificação, diagnóstico e manejo da doença do olho seco com ênfase em mecanismo, heterogeneidade e necessidade de padronização.",
      whyItMatters:
        "Oferece estrutura para protocolos de triagem, diagnóstico e terapia, e para justificar decisões terapêuticas por mecanismo.",
      evidenceLevel: "Consenso internacional / guideline",
      section: "Fenotipagem da doença do olho seco",
    },
    {
      title: "Meibomian Gland Outcome Measures in Dry Eye Treatment Trials",
      source: "Journal of Clinical Medicine, v. 15, n. 11, art. 4093",
      date: "25/05/2026",
      url: "https://www.mdpi.com/2077-0383/15/11/4093",
      doi: "10.3390/jcm15114093",
      summary:
        "Sistematiza medidas funcionais e estruturais da glândula de Meibômio usadas em ensaios clínicos — expressibilidade, qualidade do meibum, parâmetros de imagem — e discute implicações para desenho e interpretação de estudos.",
      whyItMatters:
        "Ajuda a escolher quais métricas monitorar em clínica e a comparar resultados entre tecnologias sem confundir endpoint com benefício.",
      evidenceLevel: "Revisão / síntese metodológica",
      section: "Meibografia, diagnóstico multimodal e desfechos",
    },
    {
      title:
        "Gut–ocular surface axis in dry eye disease: phenotype-specific mechanisms, evidence, and microbiome-targeted interventions",
      source: "Frontiers in Cellular and Infection Microbiology",
      date: "2026",
      url: "https://www.frontiersin.org/journals/cellular-and-infection-microbiology/articles/10.3389/fcimb.2026.1873050/full",
      doi: "10.3389/fcimb.2026.1873050",
      summary:
        "Revisão do racional e das evidências do eixo intestino–superfície ocular, conectando fenótipos da doença a mecanismos imunometabólicos e possíveis intervenções no microbioma.",
      whyItMatters:
        "Ainda não muda conduta de rotina, mas organiza a fronteira científica e evita a extrapolação de que qualquer paciente se beneficiaria de intervenção no microbioma.",
      evidenceLevel: "Revisão narrativa / síntese mecanística",
      section: "Medicina regenerativa, microbioma e terapias emergentes",
    },
    {
      title:
        "Effectiveness and safety of intense pulsed light therapy for dry eye symptoms due to meibomian gland dysfunction: systematic review and meta-analysis",
      source: "Acta Ophthalmologica, v. 103, n. 4, p. 371-379",
      date: "Impresso em 2025; online em 29/11/2024",
      url: "https://onlinelibrary.wiley.com/doi/full/10.1111/aos.16802",
      doi: "10.1111/aos.16802",
      summary:
        "Meta-análise de estudos randomizados avaliando luz pulsada intensa em DGM, com síntese de benefício em sintomas e sinais e perfil de eventos adversos, destacando heterogeneidade de protocolos e desfechos.",
      whyItMatters:
        "Apoia o uso em pacientes selecionados e reforça a necessidade de protocolo padronizado e alinhamento de expectativa: quando indicar e como acompanhar.",
      evidenceLevel: "Revisão sistemática / meta-análise",
      section: "Tecnologias diagnósticas e terapêuticas",
    },
    {
      title: "Drug Trials Snapshot: TRYPTYR (acoltremon), agonista TRPM8",
      source: "FDA",
      date: "Aprovação original em 28/05/2025",
      url: "https://www.fda.gov/drugs/drug-approvals-and-databases/drug-trials-snapshot-tryptyr",
      summary:
        "Documento regulatório resumindo população, desenho e resultados centrais dos estudos COMET-2 e COMET-3 que sustentaram a aprovação do acoltremon para sinais e sintomas da doença do olho seco.",
      whyItMatters:
        "Consolida o racional de uma classe nova e ajuda a discutir onde a terapia se encaixa na segmentação por mecanismo, além de como monitorar tolerabilidade.",
      evidenceLevel: "Regulatório (FDA) e ensaios pivotais",
      section: "Farmacologia e pipeline",
    },
    {
      title:
        "Ocular Surface Disease: Latest Innovations in Dry Eye and Meibomian Gland Dysfunction",
      source: "ModernOD, suplemento de julho e agosto de 2026",
      date: "2026",
      url: "https://modernod.com/empower-business-specialty-care-optometric-series/julyaugust-2026-supplement/ocular-surface-disease-latest-innovations-in-dry-eye-and-meibomian-gland-dysfunction/67227/",
      summary:
        "Visão geral educacional e de tendências de mercado em superfície ocular, com ênfase em inovações e abordagem combinada.",
      whyItMatters:
        "Serve como termômetro da narrativa de mercado e ajuda a mapear temas quentes e a checar claims. Não substitui guideline nem ensaio clínico.",
      evidenceLevel: "Conteúdo educacional / notícia de setor",
      section: "Indústria e educação médica",
    },
  ],
  industry: [
    {
      title: "TRPM8 (acoltremon / TRYPTYR): marco de classe nova",
      label: "Regulação / aprovação",
      url: "https://www.fda.gov/drugs/drug-approvals-and-databases/drug-trials-snapshot-tryptyr",
      note: "O fato regulatório é sólido. A incorporação local depende de disponibilidade, custo e posicionamento clínico.",
    },
  ],
  transparencyNote:
    "Este RADAR priorizou itens com link verificável e acesso público. Onde houver paywall ou exigência de cadastro, mantemos o título e a referência e indicamos, quando disponível, um caminho alternativo pelo PubMed, DOI ou página institucional. Nenhuma entrada é publicada sem fonte original.",
  seo: {
    title: "RADAR Científico — Agosto 2026 | SUPERFÍCIE",
    description:
      "Curadoria de evidências em olho seco e superfície ocular: TFOS DEWS III, desfechos em DGM, eixo intestino–superfície ocular, luz pulsada e agonistas TRPM8.",
  },
};

/** Relatórios publicados, do mais recente para o mais antigo. */
export const radarReports: RadarReport[] = [agosto2026];

export const latestRadarReport = (): RadarReport | undefined => radarReports[0];

/** Agrupa os achados por seção editorial preservando a ordem do relatório. */
export const groupFindingsBySection = (report: RadarReport) => {
  const groups = new Map<string, RadarFinding[]>();
  for (const finding of report.findings) {
    const bucket = groups.get(finding.section);
    if (bucket) {
      bucket.push(finding);
    } else {
      groups.set(finding.section, [finding]);
    }
  }
  return [...groups.entries()].map(([section, findings]) => ({
    section,
    findings,
  }));
};
