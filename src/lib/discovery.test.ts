import assert from "node:assert/strict";
import { test } from "node:test";
import { responsibleDoctor } from "./doctor.ts";
import {
  discoveryContentTypes,
  llmsFullTxt,
  llmsTxt,
  securityTxt,
  webManifest,
} from "./discovery.ts";

test("llms.txt descreve escopo, citação e atribuição com CRM", () => {
  assert.match(llmsTxt, /CRM-MG 69\.870/);
  assert.match(llmsTxt, /RQE 71\.903/);
  assert.match(llmsTxt, /não substitui/i);
  assert.match(llmsTxt, /Como atribuir/);
  assert.match(llmsTxt, /O que pode ser citado/);
  assert.doesNotMatch(
    llmsTxt,
    /melhor do mercado|resultado garantido|antes e depois/i,
  );
  assert.match(llmsTxt, new RegExp(responsibleDoctor.name, "u"));
});

test("llms-full.txt lista guias, artigos e RADAR", () => {
  assert.match(llmsFullTxt, /\/guias\//);
  assert.match(llmsFullTxt, /\/superficie\/artigos\//);
  assert.match(llmsFullTxt, /\/superficie\/radar\//);
});

test("security.txt tem contato, validade e canônico", () => {
  assert.match(
    securityTxt,
    /^Contact: https:\/\/olhossecos\.com\.br\/privacidade/m,
  );
  assert.match(securityTxt, /^Expires: 2027-08-25/m);
  assert.match(
    securityTxt,
    /^Canonical: https:\/\/olhossecos\.com\.br\/\.well-known\/security\.txt/m,
  );
});

test("as rotas de descoberta declaram content-type próprio", () => {
  assert.equal(
    discoveryContentTypes["/rss.xml"],
    "application/rss+xml; charset=utf-8",
  );
  assert.equal(
    discoveryContentTypes["/manifest.webmanifest"],
    "application/manifest+json; charset=utf-8",
  );
  assert.equal(
    discoveryContentTypes["/.well-known/security.txt"],
    "text/plain; charset=utf-8",
  );
});

test("o manifesto mínimo não registra service worker", () => {
  assert.equal(webManifest.theme_color, "#071D45");
  assert.equal(webManifest.display, "standalone");
  assert.ok(webManifest.icons.length >= 2);
  assert.equal("serviceworker" in webManifest, false);
});
