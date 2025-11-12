import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Proxy endpoint for m3u8 streams
http.route({
  path: "/proxy",
  method: "GET",
  handler: httpAction(async (_, request) => {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    
    if (!targetUrl) {
      return new Response("Missing url parameter", { status: 400 });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "Referer": "https://megacloud.blog/",
          "Origin": "https://megacloud.blog",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        return new Response(`Failed to fetch: ${response.statusText}`, { 
          status: response.status 
        });
      }

      const data = await response.arrayBuffer();
      
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      console.error("Proxy error:", error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : "Unknown error"}`, { 
        status: 500 
      });
    }
  }),
});

// Handle OPTIONS for CORS preflight
http.route({
  path: "/proxy",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }),
});

export default http;