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

      const contentType = response.headers.get("Content-Type") || "";
      
      // If it's an m3u8 playlist, we need to rewrite URLs to go through our proxy
      if (contentType.includes("mpegurl") || contentType.includes("m3u8") || targetUrl.includes(".m3u8")) {
        const text = await response.text();
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
        
        // Rewrite relative URLs in the playlist to go through our proxy
        const rewrittenText = text.split("\n").map(line => {
          // Skip comments and empty lines
          if (line.startsWith("#") || line.trim() === "") {
            return line;
          }
          
          // If it's a relative URL, make it absolute and proxy it
          if (!line.startsWith("http")) {
            const absoluteUrl = baseUrl + line;
            const proxyUrl = `/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return proxyUrl;
          }
          
          // If it's already absolute, proxy it
          const proxyUrl = `/proxy?url=${encodeURIComponent(line)}`;
          return proxyUrl;
        }).join("\n");
        
        return new Response(rewrittenText, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-cache",
          },
        });
      }
      
      // For non-playlist content (video segments), just pass through
      const data = await response.arrayBuffer();
      
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
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