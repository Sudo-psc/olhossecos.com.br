/**
 * Interpretação leiga do DEQ-5. O número nunca viaja sozinho: a faixa,
 * o que ela significa e a limitação do instrumento saem juntos.
 *
 * Cortes do abstract de Chalmers et al., 2010 (PMID 20093066):
 * ">6 suggest DE and scores >12 may indicate further testing to rule out SS-DE."
 */

import {
  DEQ5_MAX,
  DEQ5_MIN,
  type Deq5Answers,
  deq5Items,
  isCompleteDeq5,
  scoreDeq5,
} from "./deq5.ts";

export const SIGNS_SYMPTOMS_ARTICLE_PATH =
  "/superficie/artigos/quando-sintomas-e-sinais-nao-batem";

export type Deq5BandId = "below-screen" | "screen-positive" | "sjogren-screen";

export interface Deq5Band {
  id: Deq5BandId;
  /** Intervalo inclusivo desta faixa. */
  min: number;
  max: number;
  label: string;
  meaning: string;
}

export const deq5Bands: readonly Deq5Band[] = [
  {
    id: "below-screen",
    min: 0,
    max: 6,
    label: "Abaixo do corte de rastreio",
    meaning:
      "Neste instrumento, escores até 6 ficam no ou abaixo do corte que o estudo de validação usou para sugerir olho seco. Isso descreve o relato de sintomas — não diz que a superfície ocular está saudável, nem que avaliação profissional seja desnecessária.",
  },
  {
    id: "screen-positive",
    min: 7,
    max: 12,
    label: "Acima do corte de rastreio",
    meaning:
      "Escore maior que 6 é o corte em que Chalmers e colaboradores sugerem considerar olho seco neste questionário. Leve o número à consulta. Ele não confirma doença e não escolhe tratamento.",
  },
  {
    id: "sjogren-screen",
    min: 13,
    max: 22,
    label: "Corte que sugere investigar Sjögren",
    meaning:
      "Escore maior que 12, no estudo de validação, foi o corte proposto para considerar investigação adicional da síndrome de Sjögren. Não é um diagnóstico. Significa que vale mostrar este resultado ao médico e perguntar se cabe essa investigação.",
  },
] as const;

export const instrumentLimitation =
  "Instrumento de sintoma, não diagnóstico. Sintoma e sinal frequentemente não batem.";

export interface Deq5Result {
  score: number;
  band: Deq5Band;
  limitation: string;
  articlePath: string;
}

export const bandForScore = (score: number): Deq5Band => {
  if (!Number.isInteger(score) || score < DEQ5_MIN || score > DEQ5_MAX) {
    throw new Error(`Escore DEQ-5 fora do intervalo 0–22: ${score}`);
  }
  const band = deq5Bands.find((item) => score >= item.min && score <= item.max);
  if (!band) {
    throw new Error(`Faixa DEQ-5 ausente para escore ${score}`);
  }
  return band;
};

export const interpretDeq5 = (answers: Deq5Answers): Deq5Result => {
  const score = scoreDeq5(answers);
  return {
    score,
    band: bandForScore(score),
    limitation: instrumentLimitation,
    articlePath: SIGNS_SYMPTOMS_ARTICLE_PATH,
  };
};

export const answeredItems = (answers: Deq5Answers) =>
  deq5Items.map((item) => ({
    id: item.id,
    heading: item.heading,
    prompt: item.prompt,
    value: answers[item.id],
  }));

export const hasDiagnosticLanguage = (text: string) =>
  /\bvocê tem\b|\byou have\b|diagnóstico de|está com síndrome|confirma olho seco/iu.test(
    text,
  );

export const isCompleteForResult = isCompleteDeq5;
