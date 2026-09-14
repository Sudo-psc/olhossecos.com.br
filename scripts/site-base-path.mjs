import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const normalizeBasePath = (value = "") => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/gu, "")}`;
};

export const toLogicalPath = (value, basePath) => {
  const normalized = value.replace(/\/$/u, "") || "/";
  if (
    basePath &&
    (normalized === basePath || normalized.startsWith(`${basePath}/`))
  ) {
    return normalized.slice(basePath.length) || "/";
  }
  return normalized;
};

export const withBasePath = (value, basePath) => {
  if (typeof value !== "string" || !value || !basePath) return value;
  if (!value.startsWith("/") || value.startsWith("//")) return value;

  const [pathname, suffix = ""] = value.split(/(?=[?#])/u);
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
    return value;
  }
  return `${basePath}${pathname}${suffix}`;
};

const withAbsoluteBasePath = (value, basePath) => {
  if (!basePath || typeof value !== "string") return value;
  const origin = "https://olhossecos.com.br";
  return value.replace(
    /https:\/\/olhossecos\.com\.br(\/[^\s"'<>]*)?/gu,
    (_, path) => `${origin}${path ? withBasePath(path, basePath) : basePath}`,
  );
};

const withBasePathInSrcset = (value, basePath) =>
  value
    .split(",")
    .map((candidate) => {
      const match = /^(\s*)(\S+)(.*)$/u.exec(candidate);
      if (!match) return candidate;
      return `${match[1]}${withBasePath(match[2], basePath)}${match[3]}`;
    })
    .join(",");

const rewriteJsonStrings = (value, basePath) =>
  withAbsoluteBasePath(
    value.replace(/(["'])(\/[^"']*)\1/gu, (_, quote, path) => {
      return `${quote}${withBasePath(path, basePath)}${quote}`;
    }),
    basePath,
  );

export const rewriteHtml = (html, basePath) => {
  if (!basePath) return html;

  const attributes =
    /\b(href|src|srcset|action|poster|content|data-endpoint|data-manifest-url|data-pdf-href)=(['"])(.*?)\2/gu;
  let rewritten = html.replace(attributes, (match, name, quote, value) => {
    const nextValue =
      name === "srcset"
        ? withBasePathInSrcset(value, basePath)
        : withBasePath(value, basePath);
    return `${name}=${quote}${nextValue}${quote}`;
  });

  rewritten = rewritten.replace(
    /(<script\b[^>]*type=(?:"|')application\/json(?:"|')[^>]*>)([\s\S]*?)(<\/script>)/gu,
    (_, opening, body, closing) =>
      `${opening}${rewriteJsonStrings(body, basePath)}${closing}`,
  );

  rewritten = withAbsoluteBasePath(rewritten, basePath);

  return rewritten;
};

const rewriteJson = (json, basePath) => rewriteJsonStrings(json, basePath);

const visitFiles = async (directory, callback) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visitFiles(path, callback);
    } else {
      await callback(path);
    }
  }
};

export const rewriteClientBase = async (clientDirectory, rawBasePath) => {
  const basePath = normalizeBasePath(rawBasePath);
  if (!basePath) return;

  await visitFiles(clientDirectory, async (path) => {
    const extension = path.slice(path.lastIndexOf("."));
    if (![".html", ".json", ".txt"].includes(extension)) return;

    const original = await readFile(path, "utf8");
    let rewritten = original;
    if (extension === ".html") rewritten = rewriteHtml(original, basePath);
    if (extension === ".json") rewritten = rewriteJson(original, basePath);
    if (path.endsWith("/robots.txt")) {
      rewritten = rewritten
        .replace(
          /^(\s*)(Allow|Disallow):\s*(\/[^\s]*)/gmu,
          (_, indentation, directive, value) =>
            `${indentation}${directive}: ${withBasePath(value, basePath)}`,
        )
        .replace(
          /Sitemap:\s*https:\/\/olhossecos\.com\.br(\/\S*)/gu,
          (_, path) =>
            `Sitemap: https://olhossecos.com.br${withBasePath(path, basePath)}`,
        );
    }
    if (rewritten !== original) await writeFile(path, rewritten);
  });
};
