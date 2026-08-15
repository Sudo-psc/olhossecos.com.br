import { defineMiddleware } from "astro:middleware";

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

const isLabOrPoc = (pathname: string) =>
  pathname === "/superficie/lab" ||
  pathname.startsWith("/superficie/lab/") ||
  pathname === "/superficie/issues/poc" ||
  pathname.startsWith("/superficie/issues/poc/");

export const onRequest = defineMiddleware(async (context, next) => {
  if (import.meta.env.PROD && isLabOrPoc(context.url.pathname)) {
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
