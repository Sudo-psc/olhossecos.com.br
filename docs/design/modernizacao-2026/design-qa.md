# Design QA — direção A + progresso de B

Data: 6 de agosto de 2026  
Status: **aprovado no QA local**

## Método

A referência aprovada e a implementação final foram comparadas diretamente em
Chromium, com viewport normalizado de **390 × 844**. Também houve inspeção em
**1440 × 1000**. Como não havia integração Browser/IAB nem Playwright instalada
no projeto, o QA usou o Chromium disponível no ambiente via CDP, sem adicionar
dependências.

| Estado | Referência aprovada                                          | Implementação final                                                  |
| ------ | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Início | [conceito-a-inicio-mobile.png](conceito-a-inicio-mobile.png) | [implementation-home-mobile.png](implementation-home-mobile.png)     |
| Guia   | [conceito-a-guia-mobile.png](conceito-a-guia-mobile.png)     | [implementation-guide-mobile.png](implementation-guide-mobile.png)   |
| Busca  | [conceito-a-busca-mobile.png](conceito-a-busca-mobile.png)   | [implementation-search-mobile.png](implementation-search-mobile.png) |

As versões desktop finais estão em
[início](implementation-home-desktop.png),
[guia](implementation-guide-desktop.png) e
[busca](implementation-search-desktop.png).

## Ledger de fidelidade

1. **Hierarquia inicial:** eyebrow, H1, texto de apoio, busca e sugestões mantêm
   a ordem, a densidade e o texto aprovados no conceito A.
2. **Identidade:** branco real, azul profundo e teal permanecem dominantes; o
   coral aparece somente na faixa de segurança e em seus controles.
3. **Composição editorial:** títulos serifados, interface sans-serif, linhas
   finas, cantos contidos e áreas abertas preservam a linguagem do portal.
4. **Primeira dobra móvel:** busca, segurança e três caminhos de entrada ficam
   visíveis em 390 × 844, com alvos de toque e foco perceptíveis.
5. **Guias:** cabeçalho compacto, barra de progresso teal, sumário recolhível e
   seção ativa incorporam o mecanismo de orientação do conceito B.
6. **Busca:** query, limpar, contagem anunciada, filtros recolhidos e primeiro
   resultado aparecem de imediato, com hierarquia diferenciada entre página do
   portal e guia.
7. **Tipografia e ritmo:** a escala fluida e os intervalos menores reproduzem a
   densidade do protótipo sem reduzir o corpo editorial.
8. **Conteúdo e imagens:** textos clínicos, figuras, numeração real da biblioteca
   e arte de marca foram preservados; nenhuma imagem de preenchimento foi
   introduzida.

## Desvios intencionais

- O protótipo de guia mostrava o sumário aberto para demonstrar suas seções. Na
  implementação móvel ele começa recolhido, permitindo que o conteúdo real
  apareça antes da dobra; continua acessível por teclado e toque.
- Título, categoria, datas, seções e quantidade de resultados são os dados reais
  do portal, não o texto ilustrativo do protótipo.
- Os rótulos educativos existentes continuam visíveis no desktop para preservar
  conteúdo e contexto clínico.
- O texto integral da faixa de segurança foi preservado conforme a fonte
  editorial, embora o conceito usasse uma versão abreviada.
- O modo escuro continua apenas no protótipo, conforme o escopo de avaliação sem
  deploy.

## Texto acima da dobra

Na página inicial, a implementação reproduz a proposta aprovada: “Informação
independente e baseada em fontes”, “Entenda seus sintomas com clareza.” e o texto
de orientação que começa por “Organize o que você sente”. Em guias e busca, o
conteúdo editorial real foi mantido. Não foram adicionados cidade, profissional,
agendamento, captação, publicidade, recomendação individual ou produto.

## Parecer

Não restou divergência visual material e corrigível entre o conceito aprovado e
a implementação. Os desvios registrados protegem conteúdo real, densidade da
primeira dobra e comportamento acessível; o resultado está apto para uma troca
controlada futura, sujeita à autorização explícita de deploy.
