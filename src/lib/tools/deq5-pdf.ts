import { responsibleDoctor } from "../doctor.ts";
import {
  deq5Citation,
  deq5FrequencyOptions,
  deq5IntensityOptions,
  deq5Items,
  type Deq5Answers,
} from "./deq5.ts";
import { buildSinglePagePdf, type PdfLine } from "./client-pdf.ts";
import { interpretDeq5 } from "./result-engine.ts";

const optionLabel = (itemIndex: number, value: number | null): string => {
  if (value === null) return "—";
  const item = deq5Items[itemIndex];
  const options =
    item?.kind === "intensity" ? deq5IntensityOptions : deq5FrequencyOptions;
  return (
    options.find((option) => option.value === value)?.label ?? String(value)
  );
};

const todayIsoDate = (now: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(now);

export const buildDeq5ReportLines = (
  answers: Deq5Answers,
  now: Date = new Date(),
): PdfLine[] => {
  const result = interpretDeq5(answers);
  const date = todayIsoDate(now);

  const lines: PdfLine[] = [
    { text: "Olhos Secos — DEQ-5 para levar à consulta", size: 14, bold: true, gapAfter: 14 },
    { text: "Instrumento: 5-Item Dry Eye Questionnaire (DEQ-5)", size: 10, bold: true },
    { text: `Fonte: ${deq5Citation}`, size: 8, gapAfter: 8 },
    { text: `Data do preenchimento: ${date}`, size: 10 },
    {
      text: "Nenhum nome, e-mail ou identificador pessoal foi preenchido por este site.",
      size: 8,
      gapAfter: 12,
    },
    { text: "Respostas", size: 11, bold: true, gapAfter: 8 },
  ];

  deq5Items.forEach((item, index) => {
    lines.push({ text: `${index + 1}. ${item.prompt}`, size: 8, gapAfter: 9 });
    lines.push({
      text: `Resposta: ${optionLabel(index, answers[item.id])} (${answers[item.id] ?? "—"})`,
      size: 8,
      gapAfter: 10,
    });
  });

  lines.push({ text: "Resultado", size: 11, bold: true, gapAfter: 8 });
  lines.push({
    text: `Escore: ${result.score} de 22  ·  Faixa: ${result.band.label}`,
    size: 10,
    bold: true,
  });
  lines.push({ text: result.band.meaning, size: 8, gapAfter: 8 });
  lines.push({
    text: `${result.limitation} Leia: https://olhossecos.com.br${result.articlePath}`,
    size: 8,
    gapAfter: 12,
  });
  lines.push({
    text: "Este material não substitui avaliação, exame ou orientação profissional.",
    size: 9,
    bold: true,
    gapAfter: 14,
  });
  lines.push({
    text: "Anotação do profissional (espaço em branco)",
    size: 10,
    bold: true,
    gapAfter: 36,
  });
  lines.push({
    text: "________________________________________________________________",
    size: 10,
    gapAfter: 22,
  });
  lines.push({
    text: "________________________________________________________________",
    size: 10,
    gapAfter: 16,
  });
  lines.push({
    text: `Responsável técnico do portal: Dr. ${responsibleDoctor.name} · ${responsibleDoctor.registration}`,
    size: 8,
  });
  return lines;
};

export const buildDeq5ReportPdf = (
  answers: Deq5Answers,
  now: Date = new Date(),
): Uint8Array => buildSinglePagePdf(buildDeq5ReportLines(answers, now));

export const DEQ5_PDF_FILENAME = "deq-5-olhos-secos.pdf";
