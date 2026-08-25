import { guides } from "./guides.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { siteName, siteOrigin } from "./seo.ts";
import { getMagazineArticlePath, publishedArticles } from "./superficie.ts";

export type FeedChannel = "paciente" | "superficie" | "radar";

export interface FeedEntry {
  id: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: string;
}

export interface AlternateFeed {
  type: "application/rss+xml" | "application/feed+json";
  href: string;
  title: string;
}

export const feedPaths = {
  paciente: { rss: "/rss.xml", json: "/feed.json" },
  superficie: { rss: "/superficie/rss.xml", json: "/superficie/feed.json" },
  radar: {
    rss: "/superficie/radar/rss.xml",
    json: "/superficie/radar/feed.json",
  },
} as const;

const byDateDesc = (left: FeedEntry, right: FeedEntry) =>
  right.publishedAt.localeCompare(left.publishedAt);

export const pacienteEntries = (): FeedEntry[] =>
  guides
    .map((guide) => ({
      id: `${siteOrigin}/guias/${guide.slug}`,
      url: `${siteOrigin}/guias/${guide.slug}`,
      title: guide.title,
      summary: guide.description,
      publishedAt: guide.dateModified ?? guide.datePublished ?? "2026-07-25",
    }))
    .sort(byDateDesc);

export const superficieEntries = (): FeedEntry[] =>
  publishedArticles
    .map((article) => ({
      id: `${siteOrigin}${getMagazineArticlePath(article)}`,
      url: `${siteOrigin}${getMagazineArticlePath(article)}`,
      title: article.title,
      summary: article.excerpt,
      publishedAt: article.modifiedAt ?? article.publishedAt ?? "2026-08-15",
    }))
    .sort(byDateDesc);

export const radarEntries = (): FeedEntry[] =>
  radarReports
    .map((report) => ({
      id: `${siteOrigin}${getRadarReportPath(report)}`,
      url: `${siteOrigin}${getRadarReportPath(report)}`,
      title: report.title,
      summary: report.seo.description,
      publishedAt: report.publishedAt,
    }))
    .sort(byDateDesc);

export const entriesFor = (channel: FeedChannel): FeedEntry[] => {
  if (channel === "superficie") return superficieEntries();
  if (channel === "radar") return radarEntries();
  return pacienteEntries();
};

const channelMeta: Record<
  FeedChannel,
  { title: string; description: string; home: string }
> = {
  paciente: {
    title: `${siteName} — Portal do paciente`,
    description:
      "Guias e páginas educativas sobre olho seco. Conteúdo geral, não substitui avaliação.",
    home: `${siteOrigin}/paciente`,
  },
  superficie: {
    title: "SUPERFÍCIE — Revista de Olho Seco e Superfície Ocular",
    description:
      "Artigos da revista SUPERFÍCIE para profissionais. Independência editorial; sem promessa de resultado.",
    home: `${siteOrigin}/superficie`,
  },
  radar: {
    title: "RADAR Científico — SUPERFÍCIE",
    description:
      "Varredura mensal da literatura de olho seco e superfície ocular, com fonte em toda entrada.",
    home: `${siteOrigin}/superficie/radar`,
  },
};

export const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const rfc822 = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00.000Z`).toUTCString();

export const renderRss = (channel: FeedChannel): string => {
  const meta = channelMeta[channel];
  const rssPath = feedPaths[channel].rss;
  const items = entriesFor(channel)
    .map(
      (entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(entry.url)}</link>
      <guid isPermaLink="true">${escapeXml(entry.id)}</guid>
      <pubDate>${rfc822(entry.publishedAt)}</pubDate>
      <description>${escapeXml(entry.summary)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${escapeXml(meta.home)}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>pt-BR</language>
    <atom:link href="${escapeXml(`${siteOrigin}${rssPath}`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
};

export const renderJsonFeed = (channel: FeedChannel) => {
  const meta = channelMeta[channel];
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: meta.title,
    home_page_url: meta.home,
    feed_url: `${siteOrigin}${feedPaths[channel].json}`,
    description: meta.description,
    language: "pt-BR",
    items: entriesFor(channel).map((entry) => ({
      id: entry.id,
      url: entry.url,
      title: entry.title,
      content_text: entry.summary,
      date_published: `${entry.publishedAt}T00:00:00.000Z`,
    })),
  };
};

const normalize = (pathname: string) => pathname.replace(/\/+$/u, "") || "/";

export const alternateFeedsForPath = (pathname: string): AlternateFeed[] => {
  const path = normalize(pathname);

  const paciente: AlternateFeed[] = [
    {
      type: "application/rss+xml",
      href: feedPaths.paciente.rss,
      title: "Portal do paciente — RSS",
    },
    {
      type: "application/feed+json",
      href: feedPaths.paciente.json,
      title: "Portal do paciente — JSON Feed",
    },
  ];
  const superficie: AlternateFeed[] = [
    {
      type: "application/rss+xml",
      href: feedPaths.superficie.rss,
      title: "SUPERFÍCIE — RSS",
    },
    {
      type: "application/feed+json",
      href: feedPaths.superficie.json,
      title: "SUPERFÍCIE — JSON Feed",
    },
  ];
  const radar: AlternateFeed[] = [
    {
      type: "application/rss+xml",
      href: feedPaths.radar.rss,
      title: "RADAR Científico — RSS",
    },
    {
      type: "application/feed+json",
      href: feedPaths.radar.json,
      title: "RADAR Científico — JSON Feed",
    },
  ];

  if (path === "/") return [...paciente, ...superficie, ...radar];
  if (path.startsWith("/superficie/radar")) return radar;
  if (path.startsWith("/superficie") || path === "/profissional") {
    return [...superficie, ...radar];
  }
  return paciente;
};
