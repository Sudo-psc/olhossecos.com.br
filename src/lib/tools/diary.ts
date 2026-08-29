import { buildPdf, type PdfLine } from "./client-pdf.ts";

export const DIARY_STORAGE_KEY = "olhossecos.diario.v1";
export const DIARY_LENGTH_DAYS = 14;
export const DIARY_INTENSITY_MAX = 10;
export const DIARY_NOTE_MAX = 280;

export interface DiaryEntry {
  date: string;
  intensity: number;
  note: string;
}

export interface DiaryStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const isoDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(date);

export const diaryWindow = (today: Date = new Date()): string[] => {
  const days: string[] = [];
  for (let offset = DIARY_LENGTH_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    day.setUTCDate(day.getUTCDate() - offset);
    days.push(isoDay(day));
  }
  return days;
};

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/u.test(value);

export const parseDiaryEntries = (raw: string | null): DiaryEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as DiaryEntry).date !== "string" ||
        !isIsoDate((item as DiaryEntry).date) ||
        typeof (item as DiaryEntry).intensity !== "number" ||
        !Number.isInteger((item as DiaryEntry).intensity) ||
        (item as DiaryEntry).intensity < 0 ||
        (item as DiaryEntry).intensity > DIARY_INTENSITY_MAX
      ) {
        return [];
      }
      const note =
        typeof (item as DiaryEntry).note === "string"
          ? (item as DiaryEntry).note.slice(0, DIARY_NOTE_MAX)
          : "";
      return [
        {
          date: (item as DiaryEntry).date,
          intensity: (item as DiaryEntry).intensity,
          note,
        },
      ];
    });
  } catch {
    return [];
  }
};

export const loadDiary = (store: DiaryStore): DiaryEntry[] =>
  parseDiaryEntries(store.getItem(DIARY_STORAGE_KEY));

export const saveDiary = (store: DiaryStore, entries: DiaryEntry[]) => {
  store.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
};

export const upsertDiaryEntry = (
  store: DiaryStore,
  entry: DiaryEntry,
): DiaryEntry[] => {
  const next = loadDiary(store).filter((item) => item.date !== entry.date);
  next.push({
    date: entry.date,
    intensity: entry.intensity,
    note: entry.note.slice(0, DIARY_NOTE_MAX),
  });
  next.sort((left, right) => left.date.localeCompare(right.date));
  saveDiary(store, next);
  return next;
};

export const clearDiary = (store: DiaryStore) => {
  store.removeItem(DIARY_STORAGE_KEY);
};

export const entriesInWindow = (
  entries: DiaryEntry[],
  today: Date = new Date(),
): Array<DiaryEntry | { date: string; intensity: null; note: "" }> => {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  return diaryWindow(today).map(
    (date) => byDate.get(date) ?? { date, intensity: null, note: "" },
  );
};

export const diaryToCsv = (entries: DiaryEntry[]): string => {
  const header = "date,intensity,note";
  const rows = [...entries]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((entry) => {
      const note = entry.note.replaceAll('"', '""');
      return `${entry.date},${entry.intensity},"${note}"`;
    });
  return [header, ...rows].join("\n");
};

export const buildDiaryPdf = (
  entries: DiaryEntry[],
  today: Date = new Date(),
): Uint8Array => {
  const windowEntries = entriesInWindow(entries, today);
  const lines: PdfLine[] = [
    {
      text: "Olhos Secos — diário de sintomas (14 dias)",
      size: 14,
      bold: true,
      gapAfter: 12,
    },
    {
      text: "Registro feito neste navegador. Sem servidor, sem cadastro, sem envio de dados.",
      size: 9,
      gapAfter: 8,
    },
    {
      text: "Nenhum nome ou e-mail foi associado a este arquivo.",
      size: 8,
      gapAfter: 12,
    },
    {
      text: "Data          Intensidade (0-10)    Nota",
      size: 9,
      bold: true,
      gapAfter: 8,
    },
  ];

  for (const entry of windowEntries) {
    const intensity =
      entry.intensity === null ? "—" : String(entry.intensity).padStart(2, " ");
    const note = entry.note || "—";
    lines.push({
      text: `${entry.date}     ${intensity}                 ${note}`,
      size: 8,
      gapAfter: 10,
    });
  }

  lines.push({
    text: "Este diário não diagnostica olho seco e não substitui avaliação profissional.",
    size: 9,
    bold: true,
    gapAfter: 10,
  });
  return buildPdf([lines]);
};

export const DIARY_PDF_FILENAME = "diario-sintomas-olhos-secos.pdf";
export const DIARY_CSV_FILENAME = "diario-sintomas-olhos-secos.csv";
