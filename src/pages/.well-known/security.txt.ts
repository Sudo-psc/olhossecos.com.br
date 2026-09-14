import type { APIRoute } from "astro";
import { discoveryHeaders, securityTxt } from "@/lib/discovery";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(securityTxt, {
    headers: discoveryHeaders("text/plain"),
  });
