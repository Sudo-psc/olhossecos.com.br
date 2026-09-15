import assert from "node:assert/strict";
import { test } from "node:test";
import { clinic } from "./clinic.ts";
import {
  clinicLocalBusinessSchema,
  definedTermSetSchema,
  faqPageSchema,
  isIndexableSitemapPath,
  lastmodForSitemapPath,
  organizationSchema,
  physician,
  physicianSchema,
  portalMedicalConditions,
  siteName,
} from "./seo.ts";

test("o sitemap omite redirects, páginas noindex e o laboratório da revista", () => {
  assert.equal(isIndexableSitemapPath("/blog"), false);
  assert.equal(isIndexableSitemapPath("/videos"), false);
  assert.equal(isIndexableSitemapPath("/exames"), false);
  assert.equal(isIndexableSitemapPath("/newsletter/confirmar"), false);
  assert.equal(isIndexableSitemapPath("/newsletter/descadastrar"), false);
  assert.equal(isIndexableSitemapPath("/superficie/lab/flipbook"), false);
  assert.equal(isIndexableSitemapPath("/superficie/issues/edicao-00"), false);
  assert.equal(isIndexableSitemapPath("/superficie/artigos"), true);
  assert.equal(isIndexableSitemapPath("/newsletter"), true);
  assert.equal(isIndexableSitemapPath("/search-index.json"), false);
  assert.equal(isIndexableSitemapPath("/rss.xml"), false);
  assert.equal(isIndexableSitemapPath("/llms.txt"), false);
  assert.equal(isIndexableSitemapPath("/.well-known/security.txt"), false);
  assert.equal(isIndexableSitemapPath("/contato"), true);
  assert.equal(isIndexableSitemapPath("/quiz"), false);
  assert.equal(
    isIndexableSitemapPath("/blog/sintomas-olho-seco-caratinga"),
    false,
  );
  assert.equal(isIndexableSitemapPath("/tratamentos/luz-pulsada-irpl"), false);
});

test("lastmod dos artigos publicados usa a data editorial, não o fallback de julho", () => {
  assert.equal(
    lastmodForSitemapPath("/superficie/artigos/tres-meses-nao-sao-doze"),
    "2026-08-17",
  );
  assert.equal(
    lastmodForSitemapPath("/superficie/artigos/tfos-dews-iii-na-pratica"),
    "2026-08-15",
  );
  assert.equal(
    lastmodForSitemapPath("/superficie/radar/agosto-2026"),
    "2026-08-09",
  );
  assert.equal(
    lastmodForSitemapPath("/superficie/radar/setembro-2026"),
    "2026-09-15",
  );
});

test("hubs editoriais herdam a data do conteúdo mais recente", () => {
  assert.equal(lastmodForSitemapPath("/superficie"), "2026-08-25");
  assert.equal(lastmodForSitemapPath("/superficie/artigos"), "2026-08-25");
  assert.equal(lastmodForSitemapPath("/profissional"), "2026-09-15");
  assert.equal(lastmodForSitemapPath("/paciente"), "2026-09-14");
});

/**
 * A raiz virou pré-página: não lista mais guia nem artigo, então publicar um
 * conteúdo novo não é motivo para anunciá-la como modificada.
 */
test("a pré-página não herda data de conteúdo", () => {
  assert.equal(lastmodForSitemapPath("/"), "2026-08-24");
});

test("Organization e médico compartilham o mesmo @id canônico do portal", () => {
  const siteUrl = new URL("https://olhossecos.com.br/");
  const organization = organizationSchema(siteUrl);
  const person = physicianSchema(siteUrl);

  assert.equal(organization.name, siteName);
  assert.equal(organization["@id"], "https://olhossecos.com.br/#organization");
  assert.deepEqual(organization.alternateName, [
    "Olho Seco — Portal do paciente",
    "olhossecos.com.br",
  ]);
  assert.equal(
    person["@id"],
    "https://olhossecos.com.br/autor/philipe-saraiva-cruz#person",
  );
  assert.deepEqual(person["@type"], ["Person", "Physician"]);
  assert.equal(
    person.identifier.find((item) => item.name === "CRM")?.value,
    physician.crm,
  );
  assert.equal(person.worksFor["@id"], organization["@id"]);
  assert.ok(person.sameAs.includes(physician.sameAs[1]));
  assert.ok(
    person.sameAs.includes("https://www.linkedin.com/in/dr-philipe-saraiva"),
  );
  assert.ok(person.sameAs.includes("https://drphilipesaraiva.com.br/"));
  assert.equal(person.hasCredential[0]?.name, physician.crm);
  assert.equal(portalMedicalConditions.length, 3);
  assert.equal(portalMedicalConditions[0]?.name, "Síndrome do olho seco");
  assert.equal(person.affiliation.url, clinic.url);
  assert.equal(person.affiliation.address.streetAddress, clinic.streetAddress);
});

test("LocalBusiness descreve a clínica, não o portal editorial", () => {
  const siteUrl = new URL("https://olhossecos.com.br/");
  const local = clinicLocalBusinessSchema(siteUrl);

  assert.equal(local["@type"], "LocalBusiness");
  assert.equal(local.url, clinic.url);
  assert.equal(local.address.addressLocality, "Caratinga");
  assert.doesNotMatch(JSON.stringify(local), /MedicalBusiness|cupom/u);
});

test("FAQ e glossário geram schema visível para rich results", () => {
  const faq = faqPageSchema([
    {
      question: "O que é olho seco?",
      answer: "Uma doença multifatorial da superfície ocular.",
    },
  ]);
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity[0]?.name, "O que é olho seco?");

  const glossary = definedTermSetSchema(
    "Glossário do olho seco",
    "https://olhossecos.com.br/glossario",
    [{ term: "Filme lacrimal", definition: "Película dinâmica de lágrimas." }],
  );
  assert.equal(glossary["@type"], "DefinedTermSet");
  assert.equal(glossary.hasDefinedTerm[0]?.name, "Filme lacrimal");
});
