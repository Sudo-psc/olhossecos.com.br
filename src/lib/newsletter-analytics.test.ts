import assert from "node:assert/strict";
import { test } from "node:test";
import { getNewsletterCampaignContext } from "./newsletter-analytics.ts";

test("mantém somente parâmetros UTM não vazios no contexto de analytics", () => {
  assert.deepEqual(
    getNewsletterCampaignContext(
      "?utm_source=header&utm_medium=email&utm_campaign=lancamento&utm_content=&email=privado%40example.com",
    ),
    {
      utm_source: "header",
      utm_medium: "email",
      utm_campaign: "lancamento",
    },
  );
});
