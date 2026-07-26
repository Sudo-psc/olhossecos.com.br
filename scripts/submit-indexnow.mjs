import { readFile } from "node:fs/promises";

const host = "olhossecos.com.br";
const key = "2dc1c31eb7959b2797192e4388cb255d";
const sitemapPath = new URL("../dist/client/sitemap-0.xml", import.meta.url);
const sitemap = await readFile(sitemapPath, "utf8");
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => new URL(url).host === host);

if (urlList.length === 0) {
  throw new Error("Nenhuma URL canônica foi encontrada no sitemap.");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow recusou o envio com HTTP ${response.status}.`);
}

console.log(
  `${urlList.length} URLs enviadas ao IndexNow (HTTP ${response.status}).`,
);
