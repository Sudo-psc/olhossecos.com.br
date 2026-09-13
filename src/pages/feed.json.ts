import type { APIRoute } from "astro";
import { discoveryHeaders } from "@/lib/discovery";
import { renderJsonFeed } from "@/lib/feeds";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(renderJsonFeed("paciente")), {
    headers: discoveryHeaders("application/feed+json"),
  });
