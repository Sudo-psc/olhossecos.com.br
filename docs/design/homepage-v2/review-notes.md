# Homepage V2 — notas para revisão do primeiro gate

## Artefatos

- `wireframe.html`: arquitetura completa e responsiva da homepage.
- `wireframe-desktop.png`: captura integral em 1440 px.
- `wireframe-mobile.png`: captura integral em 390 px.
- `hero-hifi.html`: protótipo responsivo do header, hero e início da escolha de jornada.
- `hero-hifi-desktop.png`: captura em 1440 × 1000.
- `hero-hifi-mobile.png`: captura em 390 px.

Os arquivos são artefatos de design isolados. Nenhum deles é importado ou servido pela aplicação Astro.

## Direção proposta

O conceito mantém o patrimônio visual existente — EyeMark, navy, teal, títulos serifados e linguagem científica — mas altera o enquadramento de “portal do paciente” para “portal temático central”. O hero apresenta as duas audiências imediatamente, com prioridade visual ao paciente e uma entrada inequívoca para profissionais.

O visual científico usa temporariamente o asset responsivo existente do filme lacrimal. Isso permite aprovar composição, hierarquia e densidade antes de decidir se uma nova macroimagem/interferometria deverá ser produzida.

## Arquitetura do wireframe

1. Header com hubs temáticos e newsletter.
2. Hero com dois caminhos e visual científico.
3. Escolha de jornada: pacientes e profissionais.
4. Seis conteúdos essenciais para pacientes.
5. SUPERFÍCIE em seção navy de alto impacto, com Edição Fundadora identificada como “EM DESENVOLVIMENTO”.
6. Livros em composição assimétrica.
7. Dry Eye Widget com linguagem prudente.
8. Atualização profissional em lista editorial preparada para CMS.
9. Newsletter com primeiro passo curto.
10. Sobre e responsabilidade editorial discretos.
11. Footer em quatro grupos.

## Decisões para aprovação

1. **Marca no header:** aprovar “Olhos Secos” + EyeMark com o descritor “Ciência e informação”, sem substituir a marca existente.
2. **Hero:** aprovar título, proporção aproximada de 75–80% da primeira viewport e a imagem à direita no desktop / após os CTAs no mobile.
3. **Prioridade dos CTAs:** paciente em teal preenchido; profissional com contorno navy.
4. **Jornadas:** aprovar os blocos irmãos com mesma importância estrutural, mas linguagens e densidades próprias.
5. **SUPERFÍCIE:** aprovar navy + ouro discreto e o status explícito de desenvolvimento.
6. **Extensão:** aprovar a sequência integral antes de iniciar o segundo gate de implementação.

## Pontos deliberadamente não resolvidos neste gate

- A capa definitiva da Edição Fundadora não foi usada nem simulada como publicada.
- O endpoint e o progressive profiling da newsletter não foram implementados.
- Conteúdo profissional e evidência permanecem placeholders honestos até existirem itens reais e referências verificadas.
- As rotas `/profissionais`, `/superficie` e `/newsletter` ainda precisam ser criadas ou coordenadas antes da publicação dos links.
- Nenhuma instrumentação de analytics foi adicionada à aplicação.

## Critério para avançar

Após aprovação visual e arquitetural, o segundo gate implementará somente header, hero, roteamento paciente/profissional, “Comece por aqui” e SUPERFÍCIE, seguido de screenshots e QA antes do restante da homepage.
