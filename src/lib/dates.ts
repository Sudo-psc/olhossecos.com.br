/**
 * Formatação de data para leitura humana.
 *
 * Existiam dois formatadores idênticos — um em MagazineArticlePage, outro em
 * radar/index — e a home não usava nenhum: imprimia `publishedAt` cru, então a
 * ficha da matéria mostrava "2026-08-15" enquanto a página do mesmo artigo
 * mostrava "15 de agosto de 2026".
 *
 * O `timeZone: "UTC"` não é decoração. As datas do acervo são dias civis sem
 * hora; formatadas no fuso local, num offset negativo como o de São Paulo,
 * cairiam para o dia anterior.
 */
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatLongDate = (iso?: string) =>
  iso ? longDateFormatter.format(new Date(`${iso}T12:00:00Z`)) : undefined;
