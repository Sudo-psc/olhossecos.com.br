import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  isPortalNavCurrent,
  portals,
  resolvePortal,
  type PortalId,
} from "./portals.ts";

/**
 * A raiz é pré-página: não pertence a portal nenhum. Se ela passasse a
 * resolver para um dos dois, o cabeçalho exibiria a navegação de um público
 * antes de a pessoa escolher — que é justamente o que a separação evita.
 */
test("a raiz não pertence a portal nenhum", () => {
  assert.equal(resolvePortal("/"), null);
  assert.equal(resolvePortal(""), null);
});

test("a revista, os livros e a home técnica são portal profissional", () => {
  for (const path of [
    "/profissional",
    "/superficie",
    "/superficie/radar",
    "/superficie/artigos/tfos-dews-iii-na-pratica",
    "/livros",
    "/livros/o-custo-invisivel-do-olho-seco",
  ]) {
    assert.equal(resolvePortal(path), "profissional", path);
  }
});

test("o resto do conteúdo fica no portal do paciente", () => {
  for (const path of [
    "/paciente",
    "/sintomas",
    "/causas",
    "/diagnostico",
    "/tratamentos",
    "/autocuidado",
    "/guias/olho-seco-guia-essencial",
    "/newsletter",
    "/glossario",
    "/ferramentas",
    "/ferramentas/deq-5",
    "/ferramentas/diario",
    "/politica-de-correcao",
  ]) {
    assert.equal(resolvePortal(path), "paciente", path);
  }
});

test("a barra final não muda o portal resolvido", () => {
  assert.equal(resolvePortal("/superficie/"), "profissional");
  assert.equal(resolvePortal("/sintomas/"), "paciente");
});

/**
 * Separar públicos não pode virar porta trancada: quem entrou pelo lado errado
 * precisa do outro a um clique, em qualquer página.
 */
test("cada portal aponta para a home do outro", () => {
  assert.equal(portals.paciente.crossLink.href, portals.profissional.home);
  assert.equal(portals.profissional.crossLink.href, portals.paciente.home);
});

test("a navegação de um portal não empurra o conteúdo do outro", () => {
  const belongsTo = (href: string, portal: PortalId) =>
    resolvePortal(href.split("#")[0] ?? href) === portal;

  const strayLinks = (["paciente", "profissional"] as const).flatMap((id) =>
    portals[id].nav
      .filter((item) => !belongsTo(item.href, id))
      .map((item) => `${id}: ${item.href}`),
  );

  assert.deepEqual(
    strayLinks,
    [],
    `item de navegação levando para fora do próprio portal:\n${strayLinks.join("\n")}`,
  );
});

/**
 * O item da revista acende em toda rota dela que não seja de um item irmão —
 * sem isso, `/superficie/edicoes` deixaria a navegação inteira apagada, e um
 * `startsWith` cru acenderia "SUPERFÍCIE" junto com "Artigos".
 */
test("só um item da navegação acende por rota", () => {
  const nav = portals.profissional.nav;
  for (const pathname of [
    "/superficie",
    "/superficie/edicoes",
    "/superficie/artigos",
    "/superficie/artigos/anti-demodex",
    "/superficie/radar",
    "/superficie/parceiros",
    "/livros",
  ]) {
    const active = nav.filter((item) =>
      isPortalNavCurrent(item.href, pathname),
    );
    assert.equal(
      active.length,
      1,
      `${pathname}: ${active.length} itens ativos`,
    );
  }
});

/**
 * Link de menu para rota inexistente só aparece quando alguém clica. A lista
 * de rotas vem do próprio diretório de páginas.
 */
test("todo link de navegação e rodapé aponta para uma rota que existe", async () => {
  const routes = new Set<string>();
  const collect = async (directory: string, prefix = "") => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await collect(join(directory, entry.name), `${prefix}/${entry.name}`);
        continue;
      }
      if (!entry.name.endsWith(".astro")) continue;
      if (entry.name.includes("[")) continue;
      const name = entry.name.replace(/\.astro$/u, "");
      routes.add(name === "index" ? prefix || "/" : `${prefix}/${name}`);
    }
  };
  await collect("src/pages");

  const broken: string[] = [];
  for (const portal of Object.values(portals)) {
    const links = [
      ...portal.nav,
      ...portal.footerColumns.flatMap((column) => column.links),
      portal.crossLink,
      { label: "home", href: portal.home },
    ];
    for (const link of links) {
      const [path] = link.href.split("#");
      if (!path || path.startsWith("http")) continue;
      if (!routes.has(path)) broken.push(`${portal.id}: ${link.href}`);
    }
  }

  assert.deepEqual(
    broken,
    [],
    `link de portal para rota que não existe:\n${broken.join("\n")}`,
  );
});
