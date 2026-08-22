import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBasePath,
  rewriteHtml,
  withBasePath,
} from "./site-base-path.mjs";

test("normaliza o prefixo de publicação", () => {
  assert.equal(normalizeBasePath("/v2/"), "/v2");
  assert.equal(normalizeBasePath("/"), "");
});

test("prefixa apenas caminhos internos e não duplica o base", () => {
  assert.equal(withBasePath("/guias", "/v2"), "/v2/guias");
  assert.equal(withBasePath("/v2/guias", "/v2"), "/v2/guias");
  assert.equal(
    withBasePath("https://example.org/guia", "/v2"),
    "https://example.org/guia",
  );
  assert.equal(withBasePath("#newsletter", "/v2"), "#newsletter");
});

test("não duplica o prefixo em URLs absolutas do próprio site", () => {
  assert.match(
    rewriteHtml(
      '<meta property="og:url" content="https://olhossecos.com.br/v2">',
      "/v2",
    ),
    /content="https:\/\/olhossecos\.com\.br\/v2"/u,
  );
});

test("reescreve links, endpoints, srcsets e JSON embutido", () => {
  const html = [
    '<a href="/guias">Guias</a>',
    '<img src="/images/hero.jpg">',
    '<source srcset="/images/hero-760.webp 760w, /images/hero.webp 1200w">',
    '<form action="/api/newsletter"></form>',
    '<script type="application/json">{"href":"/app"}</script>',
  ].join("");

  assert.equal(
    rewriteHtml(html, "/v2"),
    [
      '<a href="/v2/guias">Guias</a>',
      '<img src="/v2/images/hero.jpg">',
      '<source srcset="/v2/images/hero-760.webp 760w, /v2/images/hero.webp 1200w">',
      '<form action="/v2/api/newsletter"></form>',
      '<script type="application/json">{"href":"/v2/app"}</script>',
    ].join(""),
  );
});
