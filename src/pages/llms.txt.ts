import type { APIRoute } from "astro";
import { discoveryHeaders, llmsTxt } from "@/lib/discovery";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(llmsTxt, {
    headers: discoveryHeaders("text/plain"),
  });
