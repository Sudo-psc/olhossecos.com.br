import type { APIRoute } from "astro";
import { createHash } from "node:crypto";
import { handlePartnerInquiryRequest } from "@/lib/partner-inquiries";

export const prerender = false;

const getClientKey = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",").at(-1)?.trim() ??
    "unknown";

  return createHash("sha256")
    .update(`superficie-partner:${address}`)
    .digest("hex");
};

const respond: APIRoute = ({ request }) =>
  handlePartnerInquiryRequest(request, { clientKey: getClientKey(request) });

export const POST = respond;
export const ALL = respond;
