import type { APIRoute } from "astro";
import { discoveryHeaders, llmsFullTxt } from "@/lib/discovery";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(llmsFullTxt, {
    headers: discoveryHeaders("text/plain"),
  });
