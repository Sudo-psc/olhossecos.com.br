import { defineMiddleware } from "astro:middleware";
import { isLabIndexPath, LAB_EDICAO_00_PATH } from "./lib/lab-routes";

const applySecurityHeaders = (response: Response) => {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  response.headers.set("X-XSS-Protection", "0");

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (import.meta.env.PROD) cspDirectives.push("upgrade-insecure-requests");

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  if (import.meta.env.PROD) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  response.headers.delete("X-Powered-By");
  return response;
};

const isEdicao00Lab = (pathname: string) =>
  pathname === "/superficie/lab/edicao-00" ||
  pathname.startsWith("/superficie/lab/edicao-00/");

const isEdicao00Assets = (pathname: string) =>
  pathname === "/superficie/issues/edicao-00" ||
  pathname.startsWith("/superficie/issues/edicao-00/");

const isBlockedLabOrPoc = (pathname: string) => {
  if (
    isEdicao00Lab(pathname) ||
    isEdicao00Assets(pathname) ||
    isLabIndexPath(pathname)
  ) {
    return false;
  }
  return (
    pathname.startsWith("/superficie/lab/") ||
    pathname === "/superficie/issues/poc" ||
    pathname.startsWith("/superficie/issues/poc/")
  );
};

const isLabOrPoc = (pathname: string) =>
  isBlockedLabOrPoc(pathname) ||
  isEdicao00Lab(pathname) ||
  isEdicao00Assets(pathname) ||
  isLabIndexPath(pathname);

export const onRequest = defineMiddleware(async (context, next) => {
  if (isLabIndexPath(context.url.pathname)) {
    return applySecurityHeaders(
      new Response(null, {
        status: 302,
        headers: {
          Location: LAB_EDICAO_00_PATH,
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }),
    );
  }

  if (import.meta.env.PROD && isBlockedLabOrPoc(context.url.pathname)) {
    return applySecurityHeaders(
      new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }),
    );
  }

  const response = applySecurityHeaders(await next());
  if (isLabOrPoc(context.url.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
});
