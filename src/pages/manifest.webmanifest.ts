import type { APIRoute } from "astro";
import { discoveryHeaders, webManifest } from "@/lib/discovery";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(webManifest), {
    headers: discoveryHeaders("application/manifest+json"),
  });
