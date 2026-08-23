import assert from "node:assert/strict";
import { test } from "node:test";
import { books } from "./books.ts";
import { guides } from "./guides.ts";
import { publishedArticles } from "./superficie.ts";

/**
 * Limites do que o Google exibe, não do que é permitido escrever. Passar deles
 * não penaliza ranking — só faz o buscador cortar a frase no meio, e o corte
 * cai onde ele quiser.
 *
 * Dez artigos da SUPERFÍCIE usavam a linha fina inteira como description; o
 * pior tinha 292 caracteres, quase metade invisível na SERP. Título e manchete
 * são campos separados de propósito: `seoTitle` encurta para o buscador sem
 * mexer no H1 que o leitor vê.
 */

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;

const entries = [
  ...guides.map((guide) => ({
    id: `/guias/${guide.slug}`,
    // O Layout acrescenta " | Olho Seco" quando o título ainda não cita a marca.
    title: (() => {
      const base = guide.seoTitle ?? guide.title;
      return base.toLocaleLowerCase("pt-BR").includes("olho seco")
        ? base
        : `${base} | Olho Seco`;
    })(),
    description: guide.description,
  })),
  ...publishedArticles.map((article) => ({
    id: `/superficie/artigos/${article.slug}`,
    title: article.seo.title,
    description: article.seo.description,
  })),
  ...books.map((book) => ({
    id: `/livros/${book.slug}`,
    title: book.seo.title.toLocaleLowerCase("pt-BR").includes("olho seco")
      ? book.seo.title
      : `${book.seo.title} | Olho Seco`,
    description: book.seo.description,
  })),
];

test("nenhum título passa do que a SERP mostra", () => {
  const long = entries
    .filter((entry) => entry.title.length > TITLE_MAX)
    .map((entry) => `${entry.id}: ${entry.title.length} — ${entry.title}`);

  assert.deepEqual(
    long,
    [],
    `acima de ${TITLE_MAX} caracteres o Google trunca; use seoTitle para encurtar sem mexer no H1:\n${long.join("\n")}`,
  );
});

test("nenhuma description passa do que a SERP mostra", () => {
  const long = entries
    .filter((entry) => entry.description.length > DESCRIPTION_MAX)
    .map((entry) => `${entry.id}: ${entry.description.length}`);

  assert.deepEqual(
    long,
    [],
    `acima de ${DESCRIPTION_MAX} caracteres o trecho é cortado no meio:\n${long.join("\n")}`,
  );
});

test("título e description não ficam vazios nem repetidos", () => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const problems: string[] = [];

  for (const entry of entries) {
    if (entry.title.trim().length === 0)
      problems.push(`${entry.id}: sem título`);
    if (entry.description.trim().length === 0) {
      problems.push(`${entry.id}: sem description`);
    }
    const sameTitle = titles.get(entry.title);
    if (sameTitle) problems.push(`título repetido: ${sameTitle} e ${entry.id}`);
    titles.set(entry.title, entry.id);
    const sameDescription = descriptions.get(entry.description);
    if (sameDescription) {
      problems.push(`description repetida: ${sameDescription} e ${entry.id}`);
    }
    descriptions.set(entry.description, entry.id);
  }

  assert.deepEqual(problems, []);
});
