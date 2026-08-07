# Homepage V2 — Gate 2: fidelidade e QA

Data: 7 de agosto de 2026.

## Escopo implementado

- Header e navegação mobile acessível.
- Hero de alta fidelidade com prioridade para a jornada do paciente.
- Trilho de identificação de audiência.
- Blocos editoriais separados para pacientes e profissionais.
- “Comece por aqui” com seis conteúdos essenciais.
- Seção SUPERFÍCIE e composição honesta da Edição Fundadora.
- Hubs iniciais `/profissionais` e `/superficie` para evitar links sem destino.
- Eventos locais: `home_view`, `patient_path_click`, `professional_path_click`, `article_click`, `superficie_click` e `superficie_issue_click`.

## Comparação com o conceito aprovado

1. **Marca e navegação:** EyeMark, “Olhos Secos”, descritor “Ciência e informação”, seis hubs e CTA Newsletter preservam a composição aprovada.
2. **Hierarquia do hero:** eyebrow, H1, texto, CTAs e linha “Livros • Revista • Evidências • Tecnologia” mantêm texto e ordem do protótipo.
3. **Proporção desktop:** conteúdo em duas colunas, visual científico dominante e índice editorial `03` reproduzem a estrutura do hero aprovado.
4. **Ordem mobile:** texto, CTA paciente, CTA profissional e imagem aparecem em sequência vertical, sem botões comprimidos lado a lado.
5. **Jornadas:** pacientes e profissionais permanecem territórios irmãos, separados por regras editoriais e sem aparência de cards genéricos.
6. **Conteúdos essenciais:** seis itens em grade aberta 3 × 2 no desktop e lista de coluna única no mobile.
7. **SUPERFÍCIE:** quebra navy, dourado discreto, tagline e composição de edição seguem a direção visual aprovada.
8. **Estado editorial:** “Edição Fundadora • Em desenvolvimento” aparece de forma explícita; nenhum lançamento ou validação foi inventado.

## Cópia acima da dobra

A navegação, o eyebrow, o H1, o parágrafo principal, os dois rótulos de CTA e a linha do ecossistema correspondem ao hero aprovado. A descrição do índice científico foi condensada para permanecer legível na implementação responsiva.

## Desvios intencionais deste gate

- Os CTAs de newsletter apontam temporariamente para `/livros#newsletter`, o formulário funcional já existente. O hub `/newsletter` será tratado no próximo gate.
- O footer ainda é o componente anterior. Sua reorganização em quatro colunas pertence ao restante da homepage e não foi antecipada.
- O mockup usa o asset científico responsivo existente, aprovado como direção temporária, enquanto a capa definitiva da Edição Fundadora não existe.
- A camada de dados é tipada e local; a conexão com CMS fica para o estágio em que a fonte editorial for definida.

## QA executado

- `npm run lint`: aprovado.
- `npm run build`: 0 erros, 0 avisos e 0 hints.
- Playwright/Chrome: 3 testes aprovados — sete larguras entre 320 e 1440 px sem overflow horizontal; um único H1; menu mobile abre, fecha com Escape e devolve foco; eventos de analytics disparam; cinco hubs principais respondem.
- Lighthouse móvel em build de produção: Performance 100, Acessibilidade 100, Boas Práticas 100 e SEO 100.
- Métricas de laboratório: FCP 1,2 s; LCP 1,5 s; TBT 0 ms; CLS 0.
- Contraste: o dourado numérico de “Comece por aqui” foi escurecido após a primeira auditoria e passou no reteste.
- Console: nenhum erro durante o QA automatizado.

## Artefatos

- `gate2-implementation-desktop.png`: implementação integral em 1440 px.
- `gate2-implementation-mobile.png`: implementação integral em 390 px.
- `lighthouse-gate2-mobile.json`: relatório bruto da auditoria em build de produção.
