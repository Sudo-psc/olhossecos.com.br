import type { APIRoute } from "astro";
import { createHash } from "node:crypto";
import { handleAnalyticsRequest } from "@/lib/analytics";

export const prerender = false;

const getClientKey = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",").at(-1)?.trim() ??
    "unknown";

  return createHash("sha256").update(`analytics:${address}`).digest("hex");
};

const respond: APIRoute = ({ request }) =>
  handleAnalyticsRequest(request, {
    clientKey: getClientKey(request),
    rateLimit: import.meta.env.PROD,
  });

export const POST = respond;
export const ALL = respond;
