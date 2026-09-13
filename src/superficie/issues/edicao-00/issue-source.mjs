/**
 * Fonte editorial da edição de laboratório `edicao-00` (34 páginas).
 *
 * O reader não importa este módulo — só o `manifest.json` gerado. A cópia
 * das páginas DGM/TFOS é selada (why-it-matters / practice / limitations).
 * O HTML canônico continua nas rotas `/superficie/artigos/*`.
 *
 * As doze matérias da edição estão publicadas. Só DGM e TFOS carregam
 * `articleId` — as outras dez são recortes escritos à mão, sem vínculo de
 * dados com o artigo. Por isso a copy das páginas fixas (capa, editorial,
 * sumário) precisa ser revista quando o número de matérias no ar muda: ela
 * já ficou dizendo "duas no ar e dez seladas" com doze publicadas.
 */
export const issue = {
  id: "edicao-00",
  number: "00",
  title: "A nova era da superfície ocular",
  subtitle:
    "Do sintoma ao fenótipo: diagnóstico multimodal e terapias dirigidas por mecanismo.",
  pages: [
    {
      type: "cover",
      plate: "p01-capa",
      theme: "dark",
      eyebrow: "EDIÇÃO 00 · ARTIGOS NO AR",
      title: "SUPERFÍCIE",
      subtitle: "A nova era da superfície ocular",
      body: [
        "Do sintoma ao fenótipo: diagnóstico multimodal e terapias dirigidas por mecanismo.",
      ],
      // Sem `footer`: cai no padrão "SUPERFÍCIE · EDIÇÃO 00". O carimbo
      // "Laboratório · não indexar" ficava queimado no pixel da capa, e o
      // `lab-stamp-mask` do reader só esconde o bloco de texto — quem abria
      // o reader via o carimbo interno na imagem. O bloqueio de indexação
      // é responsabilidade do robots.txt e do middleware, não da arte.
    },
    {
      type: "ad",
      plate: "p02-pub-2a",
      theme: "light",
      adPlacement: "center",
      title: "PUBLICIDADE",
    },
    {
      type: "editorial",
      plate: "p03-editorial",
      theme: "light",
      eyebrow: "EDITORIAL",
      title: "Duas leituras da mesma edição",
      subtitle: "O HTML publicado é o texto canônico desta revista.",
      body: [
        "As doze matérias da Edição Fundadora estão no ar em /superficie/artigos/. Estas páginas são o recorte impresso de cada uma delas — a leitura de revista, não uma segunda versão do texto.",
        "A Edição Fundadora nº 00 fecha em novembro de 2026. O que você vê aqui é o objeto de revista que alimenta o reader; não é o editorial fundador, que será publicado com o fechamento.",
        "O texto canônico de cada matéria permanece em /superficie/artigos/. Referências, disclosures e o selo editorial estão lá. Nestas páginas há só o recorte que cabe no papel.",
      ],
    },
    {
      type: "contents",
      plate: "p04-sumario",
      theme: "light",
      eyebrow: "SUMÁRIO",
      title: "Nesta edição",
      subtitle: "As doze matérias no ar. A edição impressa fecha em novembro.",
      body: [
        "01 Capa",
        "02 PUBLICIDADE",
        "03 Editorial",
        "04 Sumário",
        "05 Além da obstrução: a biologia molecular da DGM",
        "07 TFOS DEWS III na prática",
        "10 Quando sintomas e sinais não batem",
        "12 Além do meiboscore",
        "15 Cinco testes, cinco perguntas",
        "17 A prega, o atrito e o piscar",
        "20 Quando a higiene não basta",
        "22 O mecanismo da visita, não o degrau",
        "25 Três meses não são doze",
        "27 Tratar antes de medir",
        "30 O número automático não diagnostica",
        "32 Quem entra, quem some",
        "34 PUBLICIDADE",
      ],
    },
    {
      type: "article",
      articleId: "biologia-molecular-da-dgm",
      plate: "p05-dgm-open",
      theme: "dark",
      eyebrow: "CLÍNICA",
      title: "Além da obstrução: a biologia molecular da DGM",
      subtitle:
        "PPARγ, receptor androgênico e células progenitoras ajudam a explicar a perda funcional da glândula de Meibomius antes da atrofia.",
      body: [
        "A disfunção das glândulas de Meibomius não é apenas uma doença de glândulas obstruídas. Alterações na diferenciação dos meibócitos, na sinalização androgênica e na renovação do compartimento progenitor podem preceder a atrofia — mas a evidência permanece majoritariamente pré-clínica.",
        "A obstrução é apenas parte da história: a DGM também pode envolver falha na produção e na renovação de meibócitos funcionais.",
        "Três eixos convergem: redução de PPARγ, menor suporte androgênico e disfunção do nicho progenitor.",
        "A implicação clínica atual é fenotipar melhor, não prescrever vias moleculares.",
      ],
    },
    {
      type: "article",
      articleId: "biologia-molecular-da-dgm",
      plate: "p06-dgm-verso",
      theme: "light",
      eyebrow: "CLÍNICA",
      title: "O que muda na prática — e o que ainda não sabemos",
      subtitle: "A mudança imediata é de raciocínio, não de prescrição.",
      body: [
        "A meibografia mostra estrutura; a expressão glandular e o exame da margem palpebral mostram parte da função; sintomas e estabilidade lacrimal mostram repercussão. Nenhuma dessas medidas revela diretamente a atividade de PPARγ, receptor androgênico, Notch, Hedgehog ou ferroptose em um paciente.",
        "Por isso, um fenótipo aparentemente obstrutivo não deve ser interpretado como mecanismo único. A avaliação pode integrar morfologia, qualidade e expressibilidade da secreção, sinais inflamatórios, estabilidade do filme, exposições e contexto hormonal.",
        "A maior parte da evidência que sustenta este modelo vem de culturas celulares, organoides, rastreamento de linhagem e animais. Não estabelece, sozinha, causalidade clínica nem eficácia terapêutica em pessoas com DGM.",
        "Agonistas de PPARγ, moduladores de Hedgehog, terapias androgênicas e estratégias de rejuvenescimento do nicho progenitor são hipóteses translacionais. Neste estágio, não devem ser apresentados como tratamento estabelecido.",
      ],
    },
    {
      type: "article",
      articleId: "tfos-dews-iii-na-pratica",
      plate: "p07-tfos-open",
      theme: "dark",
      eyebrow: "EVIDÊNCIA",
      title: "TFOS DEWS III na prática",
      subtitle:
        "O mecanismo decide a direção; a gravidade decide a urgência, a intensidade e a proteção.",
      body: [
        "O TFOS DEWS III não aposenta a gravidade; muda sua função. Em vez de determinar, sozinha, uma sequência universal de tratamentos, ela passa a modular urgência, intensidade e proteção da superfície.",
        "O consenso define o olho seco como doença multifatorial e sintomática, marcada pela perda de homeostase do filme lacrimal e/ou da superfície ocular, na qual instabilidade e hiperosmolaridade, inflamação e dano, e anormalidades neurossensoriais atuam como fatores etiológicos.",
        "A superfície ocular passa a dividir explicitamente com o filme lacrimal o núcleo da homeostase. Isso acomoda melhor situações em que fricção, dano epitelial, anatomia, inflamação primária ou disfunção neural sustentam sintomas.",
        "A doença é, por definição, sintomática. Sinais isolados exigem acompanhamento, mas não preenchem sozinhos a definição. Sintomas sem evidência objetiva de perda de homeostase obrigam a ampliar o diagnóstico diferencial.",
      ],
    },
    {
      type: "article",
      articleId: "tfos-dews-iii-na-pratica",
      plate: "p08-tfos-verso",
      theme: "light",
      eyebrow: "EVIDÊNCIA",
      title: "Nove drivers e o mapa de seis minutos",
      subtitle:
        "O algoritmo pode ser iniciado com recursos presentes em grande parte dos consultórios oftalmológicos brasileiros.",
      figure: {
        src: "mapa-nove-drivers.png",
        caption:
          "O mapa dos nove drivers. Três territórios etiológicos — TFOS DEWS III (filme lacrimal, pálpebras, superfície ocular).",
      },
      body: [
        "Filme lacrimal: lipídico, aquoso e mucina/glicocálix.",
        "Pálpebras: piscar/fechamento e margem palpebral.",
        "Superfície ocular: desalinhamento anatômico, disfunção neural, dano/ruptura celular e inflamação primária/estresse oxidativo.",
        "0–1 min — Sintomas e impacto. 1–2 min — Mascaradores. 2–3 min — Filme sem corante. 3–4 min — Pálpebras e meibo. 4–5 min — Superfície com corantes. 5–6 min — Plano testável: nomeie os drivers, pareie cada conduta a um alvo e defina o que deverá ter mudado no retorno.",
      ],
    },
    {
      type: "ad",
      plate: "p09-pub-faixa-a",
      theme: "light",
      adPlacement: "band",
      title: "PUBLICIDADE",
    },
    {
      type: "article",
      plate: "p10-fenotipagem-open",
      theme: "dark",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "Quando sintomas e sinais não batem",
      subtitle:
        "Fenotipagem integrada no consultório: mapear eixos, não forçar concordância",
      body: [
        "Quando o questionário é alto e a coloração, o tempo de ruptura ou a osmolaridade são baixos — ou o inverso —, a tentação do consultório é repetir o exame, trocar o instrumento ou escalar o tratamento como se a discordância fosse erro de medida.",
        "A pergunta útil é outra: como mapear o paciente aos eixos aquoso, evaporativo-DGM, inflamatório, neurossensorial e mecânico quando sintomas, sinais e mecanismos não batem, sem forçar concordância.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p11-fenotipagem-verso",
      theme: "light",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "A discordância é um achado, não um exame inconsistente",
      body: [
        "Na prática, é tentador tratar a discordância entre sintomas e sinais como falha do exame. Essa reação pressupõe que sintomas e sinais deveriam convergir. Não deveriam.",
        "A implicação clínica atual é hierarquizar o driver da visita — o que explica a discordância de hoje — em vez de tratar todos os eixos de uma vez.",
      ],
    },
    {
      type: "article",
      plate: "p12-meibografia-open",
      theme: "dark",
      eyebrow: "MÉTODOS & MÉTRICAS",
      title: "Além do meiboscore",
      subtitle: "Como adquirir, ler e não superinterpretar a meibografia",
      body: [
        "A meibografia mostra estrutura. Não fecha, sozinha, o diagnóstico nem a conduta.",
        "O recorte desta matéria é como adquirir a imagem, como ler o que ela mostra, e onde o meiboscore deixa de bastar.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p13-meibografia-verso",
      theme: "light",
      eyebrow: "MÉTODOS & MÉTRICAS",
      title: "A imagem não fecha o diagnóstico",
      subtitle: "Estrutura não é função. Uma imagem não é fenótipo estável.",
      body: [
        "Fora de foco, com reflexo, com dedo no campo, com eversão incompleta ou excessiva: não se lauda. Pede-se nova aquisição.",
        "O protocolo mínimo: infravermelho sem contato; eversão reproduzível das duas pálpebras de ambos os olhos; iluminação sem reflexo no tarso; foco no plano das glândulas; registrar pré- ou pós-expressão; follow-up no mesmo aparelho, mesma pálpebra, mesma eversão.",
        "O que ler além do meiboscore: dropout, encurtamento, distorção, dilatação, contraste, assimetria superior–inferior. Sempre acoplar função: expressibilidade ao longo da pálpebra, não só no terço temporal.",
        "Onde a imagem decide: documentar baseline; acompanhar no mesmo sistema; subclassificar o eixo lipídio ou pálpebra. Onde não decide: diagnosticar doença do olho seco; diagnosticar DGM sozinha.",
      ],
    },
    {
      type: "ad",
      plate: "p14-pub-full-b",
      theme: "light",
      adPlacement: "center",
      title: "PUBLICIDADE",
    },
    {
      type: "article",
      plate: "p15-testes-open",
      theme: "dark",
      eyebrow: "MÉTODOS & MÉTRICAS",
      title: "Cinco testes, cinco perguntas",
      subtitle:
        "NIBUT, osmolaridade, coloração, interferometria e MMP-9 — o que cada um mede, e o que não mede",
      body: [
        "O consultório ainda trata tempo de ruptura, osmolaridade, coloração, interferometria e MMP-9 como se fossem proxies intercambiáveis de gravidade. Cada um responde a uma pergunta. A discordância entre eles é dado, não falha do exame.",
        "NIBUT mede estabilidade do filme. Osmolaridade mede homeostase e estresse hiperosmolar. Coloração localiza onde o epitélio falhou. Interferometria descreve a camada lipídica. MMP-9 ponto-de-cuidado é bandeira de inflamação. Nenhum deles é escala de gravidade. Nenhum substitui o outro.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p16-testes-verso",
      theme: "light",
      eyebrow: "MÉTODOS & MÉTRICAS",
      title: "Cinco perguntas. Uma caixa de custo.",
      body: [
        "NIBUT: o filme é estável? Preferir não invasivo. Não converter FBUT em NIBUT nem o inverso. Corte operacional DEWS III: menor que 10 segundos.",
        "Osmolaridade: há estresse hiperosmolar? ≥ 308 ou Δ > 8 é marcador DEWS III, não gravidade. Uma leitura isolada no cinza 300–320 não decide.",
        "Colorações: onde o epitélio falhou? Fluoresceína, córnea. Lisamina, conjuntiva e margem. Não somar escalas.",
        "Interferometria: a camada lipídica é fina ou pobre? Não diagnostica DGM.",
        "MMP-9: há bandeira de inflamação agora? Não define fenótipo. Não exclui DED se negativo.",
        "O custo só se justifica se a decisão muda. Não se justifica como screening universal nem como “confirma DED”.",
      ],
    },
    {
      type: "article",
      plate: "p17-mecanico-open",
      theme: "dark",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "A prega, o atrito e o piscar",
      subtitle: "Olho seco mecânico: CCh mimetiza DED, não é DED",
      body: [
        "O consultório ainda escala o paciente que não responde à lágrima como se o filme fosse o único endereço. Irritação, epífora, tempo de ruptura curto na córnea inferior: o reflexo é trocar o lubrificante, acrescentar anti-inflamatório, chamar de “olho seco refratário”.",
        "Uma parte desses pacientes tem desalinhamento, atrito ou dinâmica palpebral. A conjuntivocálase é o achado mais comum e o mais ignorado. Mimetiza doença do olho seco. Coexiste com ela. Não é ela.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p18-mecanico-verso",
      theme: "light",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "Três sinais que o consultório mistura",
      body: [
        "LWE — epiteliopatia do lid wiper — marca atrito quando o filme é “normal”. LIPCOF — pregas lid-paralelas — prediz sintoma e não é CCh. CCh é redundância em volume que invade o menisco, com sítio e dinâmica. Distinguir os três na lâmpada é o gesto.",
        "CCh mimetiza e coexiste. Irritação ou epífora com prega óbvia e filme já tratado é CCh sintomática, não “DED refratária”. Não escalar imunomodulador por causa da CCh.",
        "Médico primeiro. Lubrificante viscoso pode reduzir grau de prega e sintoma o bastante para adiar cirurgia. Cirurgia quando o sintoma e a topografia batem e o médico falhou.",
      ],
    },
    {
      type: "ad",
      plate: "p19-pub-faixa-b",
      theme: "light",
      adPlacement: "band",
      title: "PUBLICIDADE",
    },
    {
      type: "article",
      plate: "p20-demodex-open",
      theme: "dark",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "Quando a higiene não basta",
      subtitle:
        "Anti-Demodex: caspa cilíndrica, carga e o que realmente reduz ácaro",
      body: [
        "A higiene palpebral virou default para qualquer margem suja. Em infestação documentada, o default não erradica o ácaro. Tratar só com conforto é o mecanismo errado. Tratar toda blefarite como Demodex também é.",
        "Caspa cilíndrica — o colarete na base do cílio — é o sinal de lâmpada mais específico. Sem caspa — e sem amostragem ou microscopia confocal — a higiene é higiene.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p21-demodex-verso",
      theme: "light",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "O que reduz ácaro, e o que só reduz queixa",
      body: [
        "Higiene diária com shampoo reduz a contagem de Demodex e não elimina. Conforto não é causal.",
        "Lotilaner 0,25% duas vezes ao dia por seis semanas é o único regime com ensaios fase 3, mascarados, veículo-controlados, e erradicação de ácaro como desfecho. Até 15 de agosto de 2026 não há registro oftalmológico ANVISA citável. Pipeline. Não vitrine.",
      ],
    },
    {
      type: "article",
      plate: "p22-terapias-open",
      theme: "dark",
      eyebrow: "DA EVIDÊNCIA À PRÁTICA",
      title: "O mecanismo da visita, não o degrau",
      subtitle:
        "Terapias dirigidas: escolher, escalar e parar quando a evidência para",
      body: [
        "O consultório ainda escala por gravidade: lágrima, anti-inflamatório, plug, aparelho. O driver da visita importa mais que o escore. Não há ensaio que teste tratamento dirigido por mecanismo contra escalada por gravidade.",
        "Falha terapêutica costuma ser lida como “precisa de mais droga”. Quando a lágrima não resolve, o gesto é procurar doença sistêmica, DGM, anatomia e disfunção neuropática. Re-fenotipar. Não subir o degrau.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p23-terapias-verso",
      theme: "light",
      eyebrow: "DA EVIDÊNCIA À PRÁTICA",
      title: "Escolher com o mapa na mão",
      body: [
        "CsA, lifitegrast e corticoide curto têm RCT e revisão sistemática. O grau de certeza é baixo a moderado, não “aprovado = funciona em todos”.",
        "Secretagogos têm meta-análise contra hialuronato. Citáveis como classe. Neurossensorial: soro autólogo tem sinal fraco em DED clássica. Evaporativo: calor, expressão e lipídio como conceito. Aparelhos ficam na matéria de tecnologias.",
      ],
    },
    {
      type: "ad",
      plate: "p24-pub-full-c",
      theme: "light",
      adPlacement: "center",
      title: "PUBLICIDADE",
    },
    {
      type: "article",
      plate: "p25-tecnologias-open",
      theme: "dark",
      eyebrow: "TECNOLOGIA EM FOCO",
      title: "Três meses não são doze",
      subtitle: "Tecnologias em olho seco: como ler a evidência comparativa",
      body: [
        "O consultório está sendo vendido um ranking de aparelhos. A meta-análise em rede de 2026 compara 47 ensaios a dois a quatro meses. P-score não é “melhor aparelho para comprar”.",
        "Luz Intensa Pulsada Regulada (IRPL) e IPL de consultório não são o mesmo protocolo. Schirmer: nenhuma tecnologia supera o conservador. Esta matéria ensina a ler. Não prescreve aparelho.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p26-tecnologias-verso",
      theme: "light",
      eyebrow: "TECNOLOGIA EM FOCO",
      title: "Como ler o ranking — e o que ele não é",
      body: [
        "TearCare com expressão e IPL com máscara aquecida ficam no topo de TBUT na rede. QMR no topo de coloração. IPL no topo de sintoma. A rede mistura subtipos de IPL.",
        "SAHARA compara pulsação térmica mais expressão com ciclosporina 0,05%. TBUT ganhou no braço térmico. OSDI empatou. Cochrane IPL e Cochrane LipiFlow são o contrapeso: a classe não tem evidência conclusiva de superioridade versus compressa ou higiene.",
      ],
    },
    {
      type: "article",
      plate: "p27-prehab-open",
      theme: "dark",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "Tratar antes de medir",
      subtitle: "Prehab ocular: a superfície que muda a LIO e a satisfação",
      body: [
        "A fila da catarata e da refrativa ainda opera no filme instável. “Dói o olho?” não identifica quem vai errar a ceratometria. Prehab é tratar a superfície visualmente significativa, re-medir quando o K repetir, e avisar o que a cirurgia também cria.",
        "Disfunção objetiva da superfície é a regra na fila, não a exceção. Quem só pergunta perde o paciente que vai trocar o poder da LIO.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p28-prehab-verso",
      theme: "light",
      eyebrow: "ATUALIZAÇÃO CLÍNICA",
      title: "Re-medir quando o K repetir",
      body: [
        "O risco biométrico não é o questionário. Hiperosmolaridade associou-se a mais variabilidade de K e mais troca de poder de LIO. Agrupar por olho seco autorrelatado não separou os grupos.",
        "LIO premium multiplica o custo do erro. Duas semanas de lágrima não têm âncora de acurácia de LIO nesta lista. Não é vitrine de aparelho.",
      ],
    },
    {
      type: "ad",
      plate: "p29-pub-faixa-c",
      theme: "light",
      adPlacement: "band",
      title: "PUBLICIDADE",
    },
    {
      type: "article",
      plate: "p30-ia-open",
      theme: "dark",
      eyebrow: "CONSULTÓRIO DIGITAL",
      title: "O número automático não diagnostica",
      subtitle: "Como ler meibografia e interferometria de IA",
      body: [
        "O laudo automático de meibografia já está na sala. O paper que o mercado vai citar diz o contrário do slide: a gradação por IA parece menos acurada que a humana. Certeza muito baixa a baixa.",
        "O número na tela é segmentação, não diagnóstico. Esta matéria ensina a ler o laudo e o paper. Não é catálogo de software.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p31-ia-verso",
      theme: "light",
      eyebrow: "CONSULTÓRIO DIGITAL",
      title: "Segmentação não é diagnóstico",
      body: [
        "A IA de meibografia parece menos acurada que o grader humano. Validação externa escassa.",
        "Dice alto no set interno cai no aparelho externo. Trocar de meibógrafo no follow-up e chamar a diferença de progressão é o mesmo erro da quantificação humana, agora com caixa-preta.",
      ],
    },
    {
      type: "article",
      plate: "p32-center-open",
      theme: "dark",
      eyebrow: "GESTÃO",
      title: "Quem entra, quem some",
      subtitle: "Jornada, indicadores, custo e acesso de um Dry Eye Center",
      body: [
        "O center que só recebe quem já tem o rótulo perde a maior parte da demanda. A maioria dos sintomáticos não tem o diagnóstico. Quase metade some de um center dedicado em dois anos.",
        "Anatomia aqui é funil: quem entra, quem some, o que se mede, a quem o sistema chega.",
      ],
      byline: "Dr. Philipe Saraiva Cruz · CRM-MG 69.870 · RQE 71.903",
    },
    {
      type: "article",
      plate: "p33-center-verso",
      theme: "light",
      eyebrow: "GESTÃO",
      title: "O indicador que some do discurso",
      body: [
        "Entrada: a maioria dos sintomáticos não tem o diagnóstico. Retenção: quase metade some de um center dedicado. O indicador que some do discurso de “investimento” é perda de seguimento em 12 a 24 meses, não só pacientes novos no mês.",
        "Prevalências não se somam. Cada número responde a uma pergunta. Não fundir.",
      ],
    },
    {
      type: "ad",
      plate: "p34-pub-4a",
      theme: "dark",
      adPlacement: "center",
      title: "PUBLICIDADE",
    },
  ],
  toc: [
    { title: "Editorial", page: 3 },
    { title: "Além da obstrução: a biologia molecular da DGM", page: 5 },
    { title: "TFOS DEWS III na prática", page: 7 },
    { title: "Quando sintomas e sinais não batem", page: 10 },
    { title: "Além do meiboscore", page: 12 },
    { title: "Cinco testes, cinco perguntas", page: 15 },
    { title: "A prega, o atrito e o piscar", page: 17 },
    { title: "Quando a higiene não basta", page: 20 },
    { title: "O mecanismo da visita, não o degrau", page: 22 },
    { title: "Três meses não são doze", page: 25 },
    { title: "Tratar antes de medir", page: 27 },
    { title: "O número automático não diagnostica", page: 30 },
    { title: "Quem entra, quem some", page: 32 },
  ],
  articles: [
    {
      id: "biologia-molecular-da-dgm",
      title: "Além da obstrução: a biologia molecular da DGM",
      pages: [5, 6],
      htmlPath:
        "/superficie/issues/edicao-00/articles/biologia-molecular-da-dgm.html",
    },
    {
      id: "tfos-dews-iii-na-pratica",
      title: "TFOS DEWS III na prática",
      pages: [7, 8],
      htmlPath:
        "/superficie/issues/edicao-00/articles/tfos-dews-iii-na-pratica.html",
    },
  ],
};
