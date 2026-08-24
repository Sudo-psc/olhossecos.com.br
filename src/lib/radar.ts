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
    "O período consolidou a transição prática do olho seco como síndrome para precisão por mecanismo e fenótipo. Além de DEWS III, métricas de DGM, eixo intestino–superfície, luz pulsada e o agonista TRPM8, a ampliação do ciclo acrescenta um ensaio de fase 3 de lifitegrast, a dissociação entre camada lipídica e sintoma quando se soma LLLT ao IPL, o acompanhamento de cinco anos da superfície no glaucoma (GITS), a incidência de olho seco sob imunoterapia, e duas leituras honestas de lágrima artificial e vitamina oral — sempre com o tamanho da evidência à vista.",
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
    {
      title: "Lifitegrast KH732 confirma sinal e sintoma em fase 3",
      whyItMatters:
        "Dá número recente para uma classe já conhecida e lembra que o ganho de coloração inferior pode ser o recorte em que a molécula mais aparece.",
    },
    {
      title: "LLLT no IPL engrossa a camada lipídica sem ganho clínico extra",
      whyItMatters:
        "Evita vender o adjunto como salto de sintoma: o ensaio mostra diferença estrutural persistente, não superioridade em OSDI, NIBUT ou citocinas.",
    },
    {
      title: "Multiterapia no glaucoma não piora a superfície em cinco anos",
      whyItMatters:
        "Tira o automatismo de culpar o número de frascos e aponta o subgrupo que já chega com superfície ruim — aí o desenho do tratamento muda.",
    },
    {
      title:
        "Olho seco sob imunoterapia é raro no conjunto — a vigilância muda o número",
      whyItMatters:
        "Ajuda a conversa com oncologia sem alarmar: incidência agrupada baixa, heterogeneidade enorme, e a maioria fecha com terapia tópica.",
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
    {
      title:
        "Lifitegrast ophthalmic solution 5.0% (KH732) for dry eye disease: A randomized, multicenter, double-masked, vehicle-controlled phase 3 trial",
      source: "The Ocular Surface, v. 41, p. 45-53",
      date: "Impresso em julho de 2026; online em 30/04/2026",
      url: "https://doi.org/10.1016/j.jtos.2026.04.006",
      doi: "10.1016/j.jtos.2026.04.006",
      summary:
        "Ensaio de fase 3, multicêntrico, duplo-mascarado, veículo-controlado (Lu, Jin, Li et al.). Adultos com DED moderada a grave e coloração corneana ≥2,0 em qualquer região foram randomizados 1:1 para lifitegrast 5% (KH732) ou veículo, duas vezes ao dia por 84 dias, após washout de 3 a 7 dias. O desfecho primário — variação da coloração corneana inferior (ICSS) no dia 84 — favoreceu lifitegrast (n = 309) versus veículo (n = 306), P = 0,027. Também melhoraram EDS (P ajustado = 0,006), desconforto ocular (0,010), fotofobia (0,004) e OSDI (0,014). Análises post hoc sugeriram efeito mais claro quando a pior coloração basal era inferior e diferenças sintomáticas a partir do dia 14. Não houve evento adverso ocular grave.",
      whyItMatters:
        "Atualiza a classe anti-LFA-1 com um fase 3 recente. O ganho é de sinal e sintoma, não só de um escore; o recorte de coloração inferior é post hoc e não vira critério de indicação sozinho.",
      evidenceLevel: "Ensaio de fase 3 / RCT multicêntrico",
      section: "Farmacologia e pipeline",
    },
    {
      title:
        "Low-level light therapy as an adjunct to intense pulsed light for lipid layer thickness improvement in meibomian gland dysfunction: A randomized trial",
      source: "The Ocular Surface, v. 41, p. 15-22",
      date: "Impresso em julho de 2026; online em 15/04/2026",
      url: "https://doi.org/10.1016/j.jtos.2026.04.004",
      doi: "10.1016/j.jtos.2026.04.004",
      summary:
        "RCT prospectivo, duplo-cego, sham-controlado (Kharuhayothin, Kasetsuwan, Uthaithammarat, Pongpirul, Reinprayoon). 58 pessoas com DGM grau ≥2 receberam quatro sessões semanais de IPL combinadas a LLLT ativo ou LLLT sham. O desfecho primário foi a espessura da camada lipídica nas semanas 2, 4, 12 e 24. Os dois braços melhoraram na maior parte dos desfechos. A diferença entre grupos na camada lipídica apareceu na semana 12 e persistiu até a 24: aumento médio de 16,17 ± 8,55 nm com IPL+LLLT versus 5,86 ± 7,50 nm só com IPL (diferença estimada 10,3 nm; IC 95% 6,1–14,5). Não houve diferença entre grupos em sintomas, NIBUT, coloração, meiboescore ou citocinas lacrimais (IFN-γ, IL-1β, IL-6, TNF-α).",
      whyItMatters:
        "Complementa a meta-análise de IPL já neste ciclo: o adjunto LLLT muda um parâmetro estrutural, não o que o paciente relata em 24 semanas. Útil para alinhar expectativa e não empilhar tecnologia sem pergunta clínica.",
      evidenceLevel: "RCT / n = 58 / sham-controlado",
      section: "Tecnologias diagnósticas e terapêuticas",
    },
    {
      title:
        "Impact of mono- or multitherapy on ocular surface health and quality of life after 5 years of follow-up in the Glaucoma Intensive Treatment Study (GITS)",
      source: "Acta Ophthalmologica, v. 104, n. 5, p. 535-543",
      date: "Impresso em agosto de 2026; online em 29/01/2026",
      url: "https://doi.org/10.1111/aos.70078",
      doi: "10.1111/aos.70078",
      summary:
        "Análise de superfície do GITS (Jóhannesson, Lindén, Aspberg et al.) em glaucoma primário de ângulo aberto e pseudoesfoliação. Sintomas (OSDI em sueco, com Rasch) e sinais (BUT, Schirmer I, lissamina verde) aos 5 anos em 219 de 242 participantes iniciais (90%). Não houve diferença significativa entre mono e multiterapia em sintoma ou sinal. Mais de 90% dos dois braços relataram pouco ou nenhum problema subjetivo e tinham coloração nula ou mínima. BUT normal em 46% e Schirmer normal em 60%. Uso de colírio sem conservante ou lágrima adicional também não diferiu. Os autores destacam um subgrupo com OSD mais grave independentemente da quantidade de frascos.",
      whyItMatters:
        "Tira o reflexo de atribuir toda superfície ruim ao número de hipotensores. O que muda conduta é o paciente que já chega com OSD importante — aí laser ou formulação sem conservante entram na conversa, não o dogma da monoterapia para todos.",
      evidenceLevel: "RCT / follow-up de 5 anos / n = 219",
      section: "Superfície ocular perioperatória",
    },
    {
      title:
        "What is the incidence and clinical significance of dry eye disease in patients treated with immune checkpoint inhibitors? A systematic review and meta-analysis of ocular immune-related adverse events",
      source: "Acta Ophthalmologica, v. 104, n. 6, p. e599-e614",
      date: "Online em 09/03/2026; impresso em setembro de 2026",
      url: "https://doi.org/10.1111/aos.70058",
      doi: "10.1111/aos.70058",
      summary:
        "Revisão sistemática e meta-análise (Chen, Chan, Chan; PROSPERO CRD420251091266) de 13 estudos em adultos sob ICI (anti-PD-1, PD-L1 ou CTLA-4) com denominador extraível. Incidência agrupada de DED: 2% (IC 95% 1%–3%), com heterogeneidade marcada (0,2%–65%), atribuída a vigilância, critério e forma de captura. Combinação CTLA-4+PD-1 teve incidência numérica maior (25%) do que monoterapias, sem diferença estatística entre subgrupos (P = 0,18); esses recortes vêm de um subconjunto limitado e não são comparáveis ao 2% global. Coortes de pulmão (41%), rim (32%) e melanoma (4%) também diferem, possivelmente por intensidade de busca. Schirmer anormal em 62% dos sintomáticos. A maioria dos eventos foi leve e tópica; minoria pediu imunomodulação sistêmica.",
      whyItMatters:
        "Dá um número para a conversa com oncologia sem transformar todo ICI em caso de superfície. O 2% é o conjunto; o intervalo de 0,2% a 65% avisa que o protocolo de busca muda o diagnóstico.",
      evidenceLevel: "Revisão sistemática / meta-análise",
      section: "Fenotipagem da doença do olho seco",
    },
    {
      title:
        "Effects of HP-Guar Nano-emulsion Artificial Tears on Symptoms and Severity of Meibomian Gland Dysfunction in Evaporative Dry Eye During a 90-Day Longitudinal Study",
      source: "Ophthalmic and Physiological Optics, v. 46, n. 3, p. 474-481",
      date: "27/04/2026",
      url: "https://doi.org/10.1007/s44402-026-00089-1",
      doi: "10.1007/s44402-026-00089-1",
      summary:
        "Ensaio longitudinal, mascaramento simples, sem grupo controle (Pena-Verdeal, Garcia-Queiruga, Castro-Giráldez et al.). 51 pessoas com DED evaporativo leve a moderado usaram 1–2 gotas de lágrima de nanoemulsão HP-Guar quatro vezes ao dia por 90 dias. Houve mudança em OSDI, na escala ‘Healthy today’ do EQ-5D-5L, no escore de DGM, na área de perda da pálpebra inferior e no padrão da camada lipídica (todos P ≤ 0,03). Não mudaram NIBUT, coloração, Meibometria, vermelhidão nem o escore EQ-5D-5L global (P ≥ 0,09). Estudo financiado por Alcon Investigator Initiated Trial (#86928491). Os próprios autores chamam o resultado de exploratório e pedem ensaio controlado.",
      whyItMatters:
        "Útil como leitura de lágrima de uso diário, não como prova de classe. Sem controle, melhoria no tempo pode ser regressão à média ou efeito de acompanhar o paciente.",
      evidenceLevel: "Ensaio longitudinal / n = 51 / sem controle",
      section: "Tecnologias diagnósticas e terapêuticas",
    },
    {
      title:
        "The Efficacy of Oral Vitamin Supplementation in Dry Eye Disease: A Systematic Review",
      source: "Ophthalmic and Physiological Optics, v. 46, n. 3, p. 568-579",
      date: "15/04/2026",
      url: "https://doi.org/10.1007/s44402-026-00079-3",
      doi: "10.1007/s44402-026-00079-3",
      summary:
        "Revisão sistemática (Heidari, Markoulli, Arcot, Doostdar, Tavakoli; PROSPERO CRD42024629589) da suplementação oral de vitaminas em sinais e sintomas de olho seco. 13 estudos eligíveis, avaliados por dois revisores: vitamina D (61,5%), vitamina A (23%) e B1 + mecobalamina (15,5%). Nenhum estudo de vitamina C. Nenhum foi julgado de alta qualidade. Os autores concluem que a evidência é limitada por desenho fraco, poder insuficiente, seguimento curto e dose variável.",
      whyItMatters:
        "Fecha a conversa de ‘tomar vitamina para olho seco’ com o tamanho real da literatura: existe racional, não existe protocolo. Não autoriza prescrever dose a partir desta síntese.",
      evidenceLevel: "Revisão sistemática / qualidade baixa",
      section: "Farmacologia e pipeline",
    },
  ],
  industry: [
    {
      title: "TRPM8 (acoltremon / TRYPTYR): marco de classe nova",
      label: "Regulação / aprovação",
      url: "https://www.fda.gov/drugs/drug-approvals-and-databases/drug-trials-snapshot-tryptyr",
      note: "O fato regulatório é sólido. A incorporação local depende de disponibilidade, custo e posicionamento clínico.",
    },
    {
      title: "ZEISS CLINIC 360: 510(k) K260694",
      label: "Regulação / 510(k)",
      url: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K260694",
      note: "Clearance em 17/07/2026 para software de gestão de imagem oftálmica (NFJ, classe II). Não é evidência de desfecho clínico. Incorporação local depende de fluxo, custo e se o consultório já vive no ecossistema ZEISS.",
    },
  ],
  transparencyNote:
    "Este RADAR priorizou itens com link verificável e acesso público. Onde houver paywall ou exigência de cadastro, mantemos o título e a referência e indicamos, quando disponível, um caminho alternativo pelo PubMed, DOI ou página institucional. Nenhuma entrada é publicada sem fonte original. Ciclo ampliado em 24 de agosto de 2026 com seis achados adicionais; cada DOI foi conferido no Crossref antes da entrada.",
  seo: {
    title: "RADAR Científico — Agosto 2026 | SUPERFÍCIE",
    description:
      "Curadoria de evidências em olho seco e superfície ocular: TFOS DEWS III, desfechos em DGM, eixo intestino–superfície, luz pulsada, TRPM8, lifitegrast fase 3, LLLT adjunto ao IPL, superfície no glaucoma (GITS), imunoterapia e vitamina oral.",
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
