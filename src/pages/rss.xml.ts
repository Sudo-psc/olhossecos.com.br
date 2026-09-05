import type { APIRoute } from "astro";
import { discoveryHeaders } from "@/lib/discovery";
import { renderRss } from "@/lib/feeds";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderRss("paciente"), {
    headers: discoveryHeaders("application/rss+xml"),
  });
