import assert from "node:assert/strict";
import test from "node:test";
import {
  getAnalyticsFingerprint,
  getInitialAnalyticsEvent,
  getSafeAnalyticsDetail,
} from "./analytics-client.ts";

test("classifica visualizações editoriais pelas rotas canônicas", () => {
  assert.equal(
    getInitialAnalyticsEvent(
      "/livros/conjuntivocalase-diagnostico-fisiopatologia-abordagem-clinica",
    ),
    "book_view",
  );
  assert.equal(
    getInitialAnalyticsEvent("/superficie/artigos/meibografia-alem-da-imagem"),
    "article_view",
  );
  assert.equal(
    getInitialAnalyticsEvent("/superficie/edicao-00"),
    "magazine_issue_view",
  );
  assert.equal(getInitialAnalyticsEvent("/olho-seco"), "page_view");
  assert.equal(getInitialAnalyticsEvent("/ferramentas/deq-5"), "tool_open");
  assert.equal(getInitialAnalyticsEvent("/ferramentas/diario"), "tool_open");
});

test("completa o caminho sem copiar propriedades potencialmente pessoais", () => {
  assert.deepEqual(
    getSafeAnalyticsDetail(
      {
        event: "newsletter_signup",
        source: "newsletter",
        email: "nao-enviar@example.com",
        arbitrary: "ignorar",
      },
      "/newsletter",
    ),
    {
      event: "newsletter_signup",
      page_path: "/newsletter",
      source: "newsletter",
    },
  );
});

test("remove PII semântica de UTMs e URLs antes de enviar o evento", () => {
  assert.deepEqual(
    getSafeAnalyticsDetail(
      {
        event: "newsletter_signup",
        source: "newsletter",
        utm_campaign: "ana.silva@example.com",
        link_url: "https://example.org/?email=ana.silva@example.com",
      },
      "/newsletter",
    ),
    {
      event: "newsletter_signup",
      page_path: "/newsletter",
      source: "newsletter",
    },
  );
});

test("recusa detalhe sem nome de evento válido", () => {
  assert.equal(getSafeAnalyticsDetail({ event: "" }, "/"), null);
  assert.equal(getSafeAnalyticsDetail({}, "/"), null);
});

test("aceita métricas seguras do reader e descarta conteúdo privado", () => {
  assert.deepEqual(
    getSafeAnalyticsDetail(
      {
        event: "search",
        query_length: 9,
        result_count: 4,
        source: "global_search",
        query: "não enviar o termo",
      },
      "/olho-seco",
    ),
    {
      event: "search",
      page_path: "/olho-seco",
      query_length: 9,
      result_count: 4,
      source: "global_search",
    },
  );
});

test("normaliza o evento antes da deduplicação no navegador", () => {
  assert.deepEqual(
    getSafeAnalyticsDetail(
      { event: "click_purchase", book: "livro", store: "amazon" },
      "/livros/livro",
    ),
    {
      event: "purchase_click",
      page_path: "/livros/livro",
      book: "livro",
      store: "amazon",
    },
  );
  assert.equal(
    getSafeAnalyticsDetail({ event: "home_view" }, "/")?.event,
    "page_view",
  );
});

test("deduplica visualizações equivalentes sem colapsar cliques distintos", () => {
  assert.equal(
    getAnalyticsFingerprint({
      event: "book_view",
      page_path: "/livros/livro",
    }),
    getAnalyticsFingerprint({
      event: "book_view",
      page_path: "/livros/livro",
      book: "livro",
    }),
  );
  assert.notEqual(
    getAnalyticsFingerprint({
      event: "purchase_click",
      page_path: "/livros/livro",
      store: "amazon",
    }),
    getAnalyticsFingerprint({
      event: "purchase_click",
      page_path: "/livros/livro",
      store: "apple-books",
    }),
  );
  assert.notEqual(
    getAnalyticsFingerprint({
      event: "page_view",
      page_path: "/superficie/lab/flipbook",
      issue_id: "superficie-poc",
      page_number: 4,
    }),
    getAnalyticsFingerprint({
      event: "page_view",
      page_path: "/superficie/lab/flipbook",
      issue_id: "superficie-poc",
      page_number: 5,
    }),
  );
});
