import { downloadPdf } from "./client-pdf.ts";
import {
  DIARY_CSV_FILENAME,
  DIARY_INTENSITY_MAX,
  DIARY_NOTE_MAX,
  DIARY_PDF_FILENAME,
  buildDiaryPdf,
  clearDiary,
  diaryToCsv,
  entriesInWindow,
  loadDiary,
  upsertDiaryEntry,
} from "./diary.ts";

const downloadText = (text: string, filename: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const renderRows = (root: HTMLElement) => {
  const body = root.querySelector<HTMLElement>("[data-diary-rows]");
  const live = root.querySelector<HTMLElement>("[data-diary-live]");
  if (!body) return;
  const entries = entriesInWindow(loadDiary(localStorage));
  body.replaceChildren();

  for (const entry of entries) {
    const row = document.createElement("tr");

    const dateCell = document.createElement("th");
    dateCell.scope = "row";
    const date = document.createElement("label");
    date.htmlFor = `intensity-${entry.date}`;
    date.textContent = entry.date;
    dateCell.append(date);

    const intensityCell = document.createElement("td");
    const intensity = document.createElement("input");
    intensity.id = `intensity-${entry.date}`;
    intensity.type = "number";
    intensity.min = "0";
    intensity.max = String(DIARY_INTENSITY_MAX);
    intensity.step = "1";
    intensity.inputMode = "numeric";
    intensity.name = `intensity-${entry.date}`;
    intensity.setAttribute("aria-label", `Intensidade em ${entry.date}, de 0 a 10`);
    if (entry.intensity !== null) intensity.value = String(entry.intensity);
    intensityCell.append(intensity);

    const noteCell = document.createElement("td");
    const note = document.createElement("input");
    note.type = "text";
    note.maxLength = DIARY_NOTE_MAX;
    note.name = `note-${entry.date}`;
    note.setAttribute("aria-label", `Nota em ${entry.date}`);
    note.value = entry.note;
    noteCell.append(note);

    row.append(dateCell, intensityCell, noteCell);
    body.append(row);

    const persist = () => {
      if (intensity.value === "") return;
      const value = Number(intensity.value);
      if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > DIARY_INTENSITY_MAX
      ) {
        return;
      }
      upsertDiaryEntry(localStorage, {
        date: entry.date,
        intensity: value,
        note: note.value,
      });
      if (live) live.textContent = `Registro de ${entry.date} guardado neste navegador.`;
    };
    intensity.addEventListener("change", persist);
    note.addEventListener("change", persist);
  }
};

export const mountDiary = (root: HTMLElement) => {
  renderRows(root);

  root
    .querySelector<HTMLButtonElement>("[data-diary-pdf]")
    ?.addEventListener("click", () => {
      downloadPdf(buildDiaryPdf(loadDiary(localStorage)), DIARY_PDF_FILENAME);
    });

  root
    .querySelector<HTMLButtonElement>("[data-diary-csv]")
    ?.addEventListener("click", () => {
      downloadText(
        diaryToCsv(loadDiary(localStorage)),
        DIARY_CSV_FILENAME,
        "text/csv;charset=utf-8",
      );
    });

  root
    .querySelector<HTMLButtonElement>("[data-diary-clear]")
    ?.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Apagar todos os registros deste navegador? Esta ação não tem volta.",
      );
      if (!confirmed) return;
      clearDiary(localStorage);
      renderRows(root);
      const live = root.querySelector<HTMLElement>("[data-diary-live]");
      if (live) live.textContent = "Todos os registros deste navegador foram apagados.";
    });
};
