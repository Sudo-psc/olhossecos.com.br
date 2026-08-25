import { responsibleDoctor } from "./doctor.ts";

export const discoveryHeaders = (contentType: string) => ({
  "Content-Type": `${contentType}; charset=utf-8`,
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
});

/** O adapter serve o arquivo prerenderizado pela extensão (.xml →
 *  application/xml). Estes tipos são o contrato público das rotas. */
export const discoveryContentTypes: Record<string, string> = {
  "/rss.xml": "application/rss+xml; charset=utf-8",
  "/feed.json": "application/feed+json; charset=utf-8",
  "/superficie/rss.xml": "application/rss+xml; charset=utf-8",
  "/superficie/feed.json": "application/feed+json; charset=utf-8",
  "/superficie/radar/rss.xml": "application/rss+xml; charset=utf-8",
  "/superficie/radar/feed.json": "application/feed+json; charset=utf-8",
  "/llms.txt": "text/plain; charset=utf-8",
  "/llms-full.txt": "text/plain; charset=utf-8",
  "/.well-known/security.txt": "text/plain; charset=utf-8",
  "/manifest.webmanifest": "application/manifest+json; charset=utf-8",
};
import { guides } from "./guides.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { siteOrigin } from "./seo.ts";
import { getMagazineArticlePath, publishedArticles } from "./superficie.ts";

const attribution = `Dr. ${responsibleDoctor.name}, ${responsibleDoctor.registration}. Portal educativo olhossecos.com.br.`;

export const llmsTxt = `# Olhos Secos

> Portal editorial sobre olho seco e superfície ocular, da Saraiva Vision (Caratinga/MG). Conteúdo educativo. Não substitui diagnóstico, avaliação ou orientação profissional individualizada. Sem promessa de resultado.

Responsável técnico: ${attribution}

## O que este site é

- Portal do paciente: ${siteOrigin}/paciente
- Portal profissional: ${siteOrigin}/profissional
- Revista SUPERFÍCIE: ${siteOrigin}/superficie
- RADAR Científico: ${siteOrigin}/superficie/radar
- Política editorial: ${siteOrigin}/politica-editorial
- Privacidade: ${siteOrigin}/privacidade

## O que pode ser citado

Pode citar títulos, resumos, datas, referências bibliográficas e a política editorial. Ao citar, preserve limitações, grau de evidência e a ausência de indicação individual. Não apresente o texto como conduta clínica nem como desfecho certo.

## Como atribuir

${attribution}
URL canônica da página citada. Data de revisão quando a página a declarar.

## O que não fazer

- Não inventar CRM, RQE, DOI ou resultado clínico.
- Não usar o material para anúncio de tratamento, comparação de casos ou comparação com serviços.
- Não extrair dados de formulários, newsletter ou analytics.
- Não tratar o conteúdo como prontuário ou orientação a um paciente nomeado.

## Feeds

- Paciente: ${siteOrigin}/rss.xml e ${siteOrigin}/feed.json
- SUPERFÍCIE: ${siteOrigin}/superficie/rss.xml e ${siteOrigin}/superficie/feed.json
- RADAR: ${siteOrigin}/superficie/radar/rss.xml e ${siteOrigin}/superficie/radar/feed.json
`;

export const llmsFullTxt = `${llmsTxt}

## Páginas do paciente

- ${siteOrigin}/paciente — entrada do portal do paciente
- ${siteOrigin}/olho-seco — o que é olho seco
- ${siteOrigin}/sintomas
- ${siteOrigin}/causas
- ${siteOrigin}/diagnostico
- ${siteOrigin}/tratamentos
- ${siteOrigin}/autocuidado
- ${siteOrigin}/sinais-de-alerta
- ${siteOrigin}/glossario
- ${siteOrigin}/guias — biblioteca de guias
- ${siteOrigin}/fontes
- ${siteOrigin}/app — Dry Eye Widget

## Guias

${guides
  .map((guide) => `- ${siteOrigin}/guias/${guide.slug} — ${guide.title}`)
  .join("\n")}

## SUPERFÍCIE

- ${siteOrigin}/superficie — home da revista
- ${siteOrigin}/superficie/edicoes
- ${siteOrigin}/superficie/artigos
- ${siteOrigin}/superficie/edicao-00
- ${siteOrigin}/superficie/parceiros — parcerias; rótulo de publicidade quando houver

## Artigos publicados

${publishedArticles
  .map(
    (article) =>
      `- ${siteOrigin}${getMagazineArticlePath(article)} — ${article.title}`,
  )
  .join("\n")}

## RADAR Científico

${radarReports
  .map(
    (report) =>
      `- ${siteOrigin}${getRadarReportPath(report)} — ${report.title} (${report.publishedAt})`,
  )
  .join("\n")}

## Livros e autor

- ${siteOrigin}/livros
- ${siteOrigin}/autor/philipe-saraiva-cruz
`;

export const securityTxt = `Contact: https://olhossecos.com.br/privacidade
Expires: 2027-08-25T23:59:59.000Z
Preferred-Languages: pt-BR, en
Canonical: https://olhossecos.com.br/.well-known/security.txt
Policy: https://olhossecos.com.br/privacidade
`;

export const webManifest = {
  name: "Olho Seco — Portal do paciente",
  short_name: "Olho Seco",
  description:
    "Informação independente e baseada em evidências para pacientes com olho seco.",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#071D45",
  lang: "pt-BR",
  icons: [
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
    },
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
  ],
} as const;
