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

export const onRequest = defineMiddleware(async (context, next) => {
  const response = applySecurityHeaders(await next());
  if (
    context.url.pathname.startsWith("/superficie/lab/") ||
    context.url.pathname.startsWith("/superficie/issues/poc/")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
});
