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

const julho2026: RadarReport = {
  slug: "julho-2026",
  label: "Julho 2026",
  title:
    "Dor crônica da superfície, defeito epitelial e o custo de não separar mecanismos",
  period: "Varredura de junho e julho de 2026",
  publishedAt: "2026-07-12",
  executiveSummary:
    "O ciclo anterior ao de agosto organizou três frentes que o consultório já encontra sem nomeá-las: a dor crônica da superfície que se comporta como condição nociplástica, o defeito epitelial persistente como problema de recurso e não só de colírio, e o olho seco que aparece depois de cirurgia palpebral estética. Em todos os casos, o texto precisa dizer o tamanho da evidência — revisão narrativa, série retrospectiva, associação observacional — para não transformar hipótese em conduta.",
  highlights: [
    {
      title:
        "Dor crônica da superfície cabe no vocabulário das dores sobrepostas",
      whyItMatters:
        "Ajuda a ler a dissociação entre sintoma e sinal sem reduzir o relato a “olho seco que não fecha”.",
    },
    {
      title:
        "Defeito epitelial persistente consome tempo e visita no sistema público",
      whyItMatters:
        "Mostra o custo de protocolos longos e a necessidade de comparar alternativas com n pequeno e desenho retrospectivo à vista.",
    },
    {
      title:
        "Blefaroplastia de incisão completa se associa a DGM e piscada incompleta no curto prazo",
      whyItMatters:
        "Orienta a conversa perioperatória: o procedimento estético pode alterar o filme lacrimal por semanas, sem provar dano permanente.",
    },
    {
      title:
        "Ivermectina na blefarite por Demodex ainda não tem regime padronizado",
      whyItMatters:
        "Organiza o que os relatos mostram — queda de densidade e de cilindros — e o que falta: protocolo, prazo e comparação com lotilaner.",
    },
  ],
  findings: [
    {
      title:
        "Chronic Ocular Surface Pain: A Missing Member of the Chronic Overlapping Pain Conditions?",
      source: "Drugs",
      date: "10/06/2026",
      url: "https://doi.org/10.1007/s40265-026-02343-9",
      doi: "10.1007/s40265-026-02343-9",
      summary:
        "Revisão narrativa de Chang, Hattenhauer, Saccaro, Mamatkazina, Felix, De Lott e Galor sobre dor crônica da superfície ocular (mais de três meses) no quadro das dez condições de dor crônica sobrepostas. Argumenta que um subconjunto compartilha predominância feminina, agrupamento com outras dores nociplásticas e persistência após anestesia tópica.",
      whyItMatters:
        "Oferece vocabulário para a dissociação sintoma–sinal sem transformar a revisão em critério diagnóstico novo. A proposta de “11ª condição” é hipótese de enquadramento, não classificação adotada.",
      evidenceLevel: "Revisão narrativa",
      section: "Fenotipagem da doença do olho seco",
    },
    {
      title:
        "Management of ocular surface disease involving inflammation and persistent epithelial defects utilising various treatment modalities in the UK National Health Service (NHS)",
      source: "Eye",
      date: "04/06/2026",
      url: "https://doi.org/10.1038/s41433-026-04314-6",
      doi: "10.1038/s41433-026-04314-6",
      summary:
        "Série retrospectiva de 30 pessoas com defeito epitelial persistente em dois centros do NHS. O manejo convencional fechou o defeito em 57%, com duração média de 176 ± 188 dias e cerca de 10 consultas ambulatoriais por caso. Tarsorrafia (83%) e membrana amniótica (34%) foram frequentes. A comparação com matriz amniótica sem sutura veio de dados agrupados de estudos anteriores nos mesmos centros, não de randomização.",
      whyItMatters:
        "Mostra o peso operacional do PED. Os números de custo e de cura da alternativa não vêm do mesmo ensaio; n = 30 e desenho retrospectivo limitam qualquer generalização.",
      evidenceLevel: "Série retrospectiva / n = 30",
      section: "Tecnologias diagnósticas e terapêuticas",
    },
    {
      title:
        "The Impact of Full-Incision Double-Eyelid Blepharoplasty on Dry Eye: Association with Short-Term Meibomian Gland Dysfunction and Increased Incomplete Blinking",
      source: "Aesthetic Plastic Surgery",
      date: "12/06/2026",
      url: "https://doi.org/10.1007/s00266-026-06052-2",
      doi: "10.1007/s00266-026-06052-2",
      summary:
        "Estudo observacional de Pan e Chen associando blefaroplastia de incisão completa para pálpebra dupla a disfunção das glândulas de Meibômio e aumento de piscadas incompletas no período curto após a cirurgia.",
      whyItMatters:
        "Útil para a conversa perioperatória e para não atribuir automaticamente o desconforto pós-operatório a “olho seco de sempre”. Associação de curto prazo, não prova de dano estrutural permanente.",
      evidenceLevel: "Observacional / associação de curto prazo",
      section: "Superfície ocular perioperatória",
    },
    {
      title:
        "Ivermectin in the Management of Demodex-associated Blepharitis: A Comprehensive Literature Review",
      source: "Eye & Contact Lens",
      date: "01/07/2026",
      url: "https://doi.org/10.1097/icl.0000000000001299",
      doi: "10.1097/icl.0000000000001299",
      summary:
        "Revisão narrativa de Buzzi, Sponga, Angheben, Carnicci, Giansanti e Mencucci sobre ivermectina tópica e oral na blefarite associada a Demodex. Sintetiza ensaios, séries e relatos até novembro de 2025: em geral houve queda da densidade do ácaro, dos cilindros e de alguns sintomas, com eventos adversos pouco frequentes e leves. Os próprios autores pedem regimes padronizados e acompanhamento longo.",
      whyItMatters:
        "Organiza o que já existe sem promover um protocolo. Não substitui o lote aprovado para Demodex nem define dose, duração ou critério de cura.",
      evidenceLevel: "Revisão narrativa",
      section: "Farmacologia e pipeline",
    },
  ],
  industry: [],
  transparencyNote:
    "Este RADAR priorizou itens com DOI conferido no Crossref e resumo público. Nenhuma entrada é publicada sem fonte original. Onde o desenho for revisão narrativa ou série pequena, o nível de evidência diz isso no próprio card.",
  seo: {
    title: "RADAR Científico — Julho 2026 | SUPERFÍCIE",
    description:
      "Curadoria de junho e julho de 2026: dor crônica da superfície, defeito epitelial persistente, blefaroplastia e ivermectina no Demodex.",
  },
};

/** Relatórios publicados, do mais recente para o mais antigo. */
export const radarReports: RadarReport[] = [agosto2026, julho2026];

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
