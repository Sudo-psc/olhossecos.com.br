import type { APIRoute } from "astro";
import { getUnifiedSearchIndex } from "@/lib/search";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(getUnifiedSearchIndex()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
