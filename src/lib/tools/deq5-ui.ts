import { DEQ5_PDF_FILENAME, buildDeq5ReportPdf } from "./deq5-pdf.ts";
import {
  emptyDeq5Answers,
  isCompleteDeq5,
  type Deq5Answers,
} from "./deq5.ts";
import { deq5Items } from "./deq5.ts";
import { downloadPdf } from "./client-pdf.ts";
import { interpretDeq5 } from "./result-engine.ts";

const readAnswers = (root: HTMLElement): Deq5Answers => {
  const answers = emptyDeq5Answers();
  for (const item of deq5Items) {
    const checked = root.querySelector<HTMLInputElement>(
      `input[name="${item.id}"]:checked`,
    );
    answers[item.id] = checked ? Number(checked.value) : null;
  }
  return answers;
};

const renderResult = (region: HTMLElement, answers: Deq5Answers) => {
  if (!isCompleteDeq5(answers)) {
    region.replaceChildren();
    const pending = document.createElement("p");
    pending.textContent =
      "O escore aparece quando as cinco perguntas tiverem resposta.";
    region.append(pending);
    return;
  }
  const result = interpretDeq5(answers);
  region.replaceChildren();

  const score = document.createElement("p");
  score.className = "tool-score";
  const value = document.createElement("span");
  value.textContent = String(result.score);
  score.append(value, " de 22");

  const band = document.createElement("p");
  band.className = "tool-band";
  band.textContent = result.band.label;

  const meaning = document.createElement("p");
  meaning.textContent = result.band.meaning;

  const limit = document.createElement("p");
  limit.className = "tool-limit";
  limit.append(result.limitation, " ");
  const article = document.createElement("a");
  article.href = result.articlePath;
  article.textContent = "Quando sintomas e sinais não batem";
  limit.append(article, ".");

  region.append(score, band, meaning, limit);
};

export const mountDeq5 = (root: HTMLElement) => {
  const form = root.querySelector<HTMLFormElement>("[data-deq5-form]");
  const result = root.querySelector<HTMLElement>("[data-deq5-result]");
  const exportButton = root.querySelector<HTMLButtonElement>("[data-deq5-pdf]");
  if (!form || !result || !exportButton) return;

  const refresh = () => {
    const answers = readAnswers(root);
    renderResult(result, answers);
    exportButton.disabled = !isCompleteDeq5(answers);
  };

  form.addEventListener("change", refresh);
  exportButton.addEventListener("click", () => {
    const answers = readAnswers(root);
    if (!isCompleteDeq5(answers)) return;
    downloadPdf(buildDeq5ReportPdf(answers), DEQ5_PDF_FILENAME);
  });
  refresh();
};
