import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveLegacyRedirect } from "./legacy-redirects.ts";

test("mapeia posts locais e landings mortas para o equivalente educativo", () => {
  const cases: Array<[string, string]> = [
    ["/blog", "/guias"],
    ["/blog/sintomas-olho-seco-caratinga", "/sintomas"],
    ["/blog/meibografia-caratinga", "/guias/meibografia-o-que-a-imagem-mostra"],
    ["/blog/mitos-e-verdades", "/guias/olho-seco-guia-essencial"],
    ["/blog/luz-pulsada-olho-seco-caratinga", "/tratamentos"],
    ["/blog/slug-que-nao-existe-mais", "/guias"],
    ["/quiz", "/ferramentas/deq-5"],
    ["/testerapido", "/ferramentas/deq-5"],
    ["/irpl-olho-seco-caratinga", "/tratamentos"],
    ["/tratamentos/luz-pulsada-irpl", "/tratamentos"],
    ["/politica-de-privacidade", "/privacidade"],
    ["/sobre", "/autor/philipe-saraiva-cruz"],
    ["/faq", "/olho-seco"],
    ["/profissionais", "/profissional"],
  ];

  for (const [from, to] of cases) {
    assert.equal(resolveLegacyRedirect(from), to, from);
    assert.equal(resolveLegacyRedirect(`${from}/`), to, `${from}/`);
  }
});

test("não intercepta rotas vivas do portal", () => {
  for (const path of [
    "/",
    "/contato",
    "/guias",
    "/guias/meibografia-o-que-a-imagem-mostra",
    "/tratamentos",
    "/paciente",
    "/profissional",
    "/ferramentas/deq-5",
  ]) {
    assert.equal(resolveLegacyRedirect(path), null, path);
  }
});
