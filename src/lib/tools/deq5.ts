/**
 * DEQ-5 — 5-Item Dry Eye Questionnaire.
 *
 * Enunciados e âncoras no inglês original. Não parafrasear: o
 * instrumento é o texto de Chalmers, Begley e Caffery (2010).
 *
 * Chalmers RL, Begley CG, Caffery B. Validation of the 5-Item Dry
 * Eye Questionnaire (DEQ-5): Discrimination across self-assessed
 * severity and aqueous tear deficient dry eye diagnoses. Cont Lens
 * Anterior Eye. 2010;33(2):55-60. doi:10.1016/j.clae.2009.12.010
 * PMID: 20093066.
 */

export const deq5Source = {
  authors: "Chalmers RL, Begley CG, Caffery B",
  title:
    "Validation of the 5-Item Dry Eye Questionnaire (DEQ-5): Discrimination across self-assessed severity and aqueous tear deficient dry eye diagnoses",
  journal: "Contact Lens & Anterior Eye",
  year: 2010,
  volume: "33",
  issue: "2",
  pages: "55-60",
  doi: "10.1016/j.clae.2009.12.010",
  pmid: "20093066",
  url: "https://doi.org/10.1016/j.clae.2009.12.010",
} as const;

export const deq5Citation =
  "Chalmers RL, Begley CG, Caffery B. Validation of the 5-Item Dry Eye Questionnaire (DEQ-5): Discrimination across self-assessed severity and aqueous tear deficient dry eye diagnoses. Cont Lens Anterior Eye. 2010;33(2):55-60. doi:10.1016/j.clae.2009.12.010.";

export type Deq5FrequencyValue = 0 | 1 | 2 | 3 | 4;
export type Deq5IntensityValue = 0 | 1 | 2 | 3 | 4 | 5;

export const deq5FrequencyOptions = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Frequently" },
  { value: 4, label: "Constantly" },
] as const;

export const deq5IntensityOptions = [
  { value: 0, label: "Never have it" },
  { value: 1, label: "Not at all Intense" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "Very Intense" },
] as const;

export type Deq5ItemId =
  | "discomfort-frequency"
  | "discomfort-intensity"
  | "dryness-frequency"
  | "dryness-intensity"
  | "watery-frequency";

export interface Deq5Item {
  id: Deq5ItemId;
  /** Rótulo de seção do instrumento original, sem tradução. */
  heading: string;
  /** Enunciado exato. */
  prompt: string;
  kind: "frequency" | "intensity";
  max: 4 | 5;
}

export const deq5Items: readonly Deq5Item[] = [
  {
    id: "discomfort-frequency",
    heading: "Questions about EYE DISCOMFORT:",
    prompt:
      "During a typical day in the last month, how often did your eyes feel discomfort?",
    kind: "frequency",
    max: 4,
  },
  {
    id: "discomfort-intensity",
    heading: "Questions about EYE DISCOMFORT:",
    prompt:
      "When your eyes felt discomfort, how intense was this feeling of discomfort at the end of the day, within two hours of going to bed?",
    kind: "intensity",
    max: 5,
  },
  {
    id: "dryness-frequency",
    heading: "Questions about EYE DRYNESS:",
    prompt:
      "During a typical day in the last month, how often did your eyes feel dry?",
    kind: "frequency",
    max: 4,
  },
  {
    id: "dryness-intensity",
    heading: "Questions about EYE DRYNESS:",
    prompt:
      "When your eyes felt dry, how intense was this feeling of dryness at the end of the day, within two hours of going to bed?",
    kind: "intensity",
    max: 5,
  },
  {
    id: "watery-frequency",
    heading: "Question about WATERY EYES:",
    prompt:
      "During a typical day in the last month, how often did your eyes look or feel excessively watery?",
    kind: "frequency",
    max: 4,
  },
] as const;

/** Tradução de apoio. Não substitui o enunciado original e não é pontuada. */
export const deq5SupportGloss: Record<Deq5ItemId, string> = {
  "discomfort-frequency":
    "Num dia típico do último mês, com que frequência seus olhos sentiram desconforto?",
  "discomfort-intensity":
    "Quando sentiu desconforto, quão intenso foi no fim do dia, nas duas horas antes de dormir?",
  "dryness-frequency":
    "Num dia típico do último mês, com que frequência seus olhos sentiram secura?",
  "dryness-intensity":
    "Quando sentiu secura, quão intensa foi no fim do dia, nas duas horas antes de dormir?",
  "watery-frequency":
    "Num dia típico do último mês, com que frequência seus olhos pareceram ou sentiram excessivamente lacrimejantes?",
};

export type Deq5Answers = Record<Deq5ItemId, number | null>;

export const emptyDeq5Answers = (): Deq5Answers => ({
  "discomfort-frequency": null,
  "discomfort-intensity": null,
  "dryness-frequency": null,
  "dryness-intensity": null,
  "watery-frequency": null,
});

export const isCompleteDeq5 = (
  answers: Deq5Answers,
): answers is Record<Deq5ItemId, number> =>
  deq5Items.every((item) => {
    const value = answers[item.id];
    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= item.max
    );
  });

export const scoreDeq5 = (answers: Deq5Answers): number => {
  if (!isCompleteDeq5(answers)) {
    throw new Error("DEQ-5 incompleto: os cinco itens precisam de resposta.");
  }
  return deq5Items.reduce((sum, item) => sum + answers[item.id], 0);
};

export const DEQ5_MIN = 0;
export const DEQ5_MAX = 22;
