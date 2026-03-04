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
      // Forward Range header for byte-range requests
      const incomingRange = request.headers.get("range") || request.headers.get("Range") || undefined;

      const response = await fetch(targetUrl, {
        headers: {
          "Referer": "https://megacloud.blog/",
          "Origin": "https://megacloud.blog",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          ...(incomingRange ? { Range: incomingRange } : {}),
        },
      });

      if (!response.ok && response.status !== 206) {
        return new Response(`Failed to fetch: ${response.statusText}`, { 
          status: response.status 
        });
      }

      const contentType = response.headers.get("Content-Type") || "";
      const isPlaylist =
        contentType.includes("mpegurl") ||
        contentType.includes("m3u8") ||
        targetUrl.includes(".m3u8");

      if (isPlaylist) {
        const text = await response.text();
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
        const baseOrigin = new URL(targetUrl).origin;

        // Rewrite helper: make absolute
        const absolutize = (u: string) => {
          if (u.startsWith("http://") || u.startsWith("https://")) return u;
          if (u.startsWith("/")) return `${baseOrigin}${u}`;
          return `${baseUrl}${u}`;
        };

        // Rewrite each line, including URIs inside comment tags like EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP
        const rewrittenText = text
          .split("\n")
          .map((line) => {
            // Rewrite URI="..." inside comment lines
            if (line.startsWith("#") && line.includes('URI="')) {
              return line.replace(/URI="([^"]+)"/g, (_m, uri) => {
                const absolute = absolutize(uri);
                const proxyUrl = `/proxy?url=${encodeURIComponent(absolute)}`;
                return `URI="${proxyUrl}"`;
              });
            }

            // Skip other comments/empty lines
            if (line.startsWith("#") || line.trim() === "") {
              return line;
            }

            // Non-comment lines (variant/segment URIs)
            const absolute = absolutize(line.trim());
            return `/proxy?url=${encodeURIComponent(absolute)}`;
          })
          .join("\n");

        return new Response(rewrittenText, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges",
            "Cache-Control": "no-cache",
          },
        });
      }

      // For non-playlist content (segments/keys), pass through with original status (e.g., 206)
      const data = await response.arrayBuffer();
      const passthroughHeaders: Record<string, string> = {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges",
      };

      const contentLength = response.headers.get("Content-Length");
      if (contentLength) passthroughHeaders["Content-Length"] = contentLength;

      const contentRange = response.headers.get("Content-Range");
      if (contentRange) passthroughHeaders["Content-Range"] = contentRange;

      const acceptRanges = response.headers.get("Accept-Ranges");
      if (acceptRanges) passthroughHeaders["Accept-Ranges"] = acceptRanges;

      const cacheControl = response.headers.get("Cache-Control");
      passthroughHeaders["Cache-Control"] = cacheControl || "public, max-age=3600";

      return new Response(data, {
        status: response.status, // preserve 206 for ranges
        headers: passthroughHeaders,
      });
    } catch (error) {
      console.error("Proxy error:", error);
      return new Response(
        `Proxy error: ${error instanceof Error ? error.message : "Unknown error"}`,
        { status: 500 },
      );
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