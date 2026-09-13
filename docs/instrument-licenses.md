# Licenciamento de instrumentos clínicos — Fase 2

Verificação feita em 25 de agosto de 2026, **antes** de qualquer
implementação de questionário. O portal só reproduz itens de um
instrumento quando a licença está clara. Esta nota registra o que foi
encontrado e a decisão operacional.

## OSDI (Ocular Surface Disease Index)

**Não implementar os 12 itens.** A licença não é livre.

| Fonte | O que afirma |
| --- | --- |
| [ePROVIDE / Mapi Research Trust](https://eprovide.mapi-trust.org/instruments/ocular-surface-disease-index) | Ficha oficial do instrumento. Copyright © 1995, AbbVie. Distribuição e uso passam pelo catálogo de COA licensing da Mapi Trust. |
| Schiffman et al., *Arch Ophthalmol*, 2000 (desenvolvimento) | O OSDI foi encomendado e é detido pela Allergan (hoje AbbVie). |
| Reproduções clínicas (p.ex. Dry Eye Zone) | Exibem “Ocular Surface Disease Index (OSDI) Version 1 © 1995 Allergan. All rights reserved.” |

Não há licença aberta, permissão acadêmica genérica nem texto que autorize
reproduzir os enunciados num site público sem contrato. Vários calculadores
online o fazem; isso não é autorização.

**Decisão:** o OSDI permanece atrás da flag `osdiEnabled = false` em
`src/lib/tools/flags.ts`. Nenhuma página serve os itens. Ligar a flag
exige licença escrita da AbbVie / Mapi Trust e um commit explícito do
responsável técnico.

## DEQ-5 (5-Item Dry Eye Questionnaire)

**Implementar com citação da fonte original.** Uso acadêmico e clínico
com atribuição é o padrão descrito pelos próprios autores.

Fonte primária conferida no PubMed (PMID [20093066](https://pubmed.ncbi.nlm.nih.gov/20093066/),
DOI [10.1016/j.clae.2009.12.010](https://doi.org/10.1016/j.clae.2009.12.010)):

> Chalmers RL, Begley CG, Caffery B. Validation of the 5-Item Dry Eye
> Questionnaire (DEQ-5): Discrimination across self-assessed severity and
> aqueous tear deficient dry eye diagnoses. *Cont Lens Anterior Eye*.
> 2010;33(2):55–60.

O artigo é de Elsevier (“All rights reserved”), o que protege o PDF da
revista — não instala um titular comercial separado, ao estilo Allergan,
sobre os cinco enunciados. Não há ficha na Mapi Trust exigindo licença
paga para o DEQ-5. A literatura clínica (incluindo o próprio abstract)
publica critérios de corte e descreve os cinco itens pelo conteúdo
(frequência de desconforto, secura e lacrimejamento; intensidade no fim
do dia de desconforto e secura).

Cortes **do próprio artigo de validação**, não de um resumo posterior:

- escore **> 6** sugere considerar olho seco neste instrumento;
- escore **> 12** pode indicar investigação adicional para síndrome de
  Sjögren (SS-DE).

Médias do estudo: controles 2,7; ceratoconjuntivite sicca sem Sjögren
10,5; Sjögren 14,0.

**Decisão:** o DEQ-5 entra no portal com os enunciados originais em
inglês, citação visível da fonte, e sem paráfrase dos itens. Qualquer
texto em português ao lado é rótulo de apoio, não o instrumento.

## O que esta fase não faz

- Não pede licença à AbbVie (ação humana, se o OSDI for desejado).
- Não reproduz SPEED, SANDE, OSDI-6 nem outros instrumentos.
- Não interpreta o DEQ-5 como diagnóstico.
