"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { writeFileSync } from "fs";
import { join } from "path";

// Helper to lazily import hianime and support both named and default exports
async function getClient() {
  try {
    // Use dynamic import with proper async/await
    const mod = await import("hianime");
    
    if (!mod) {
      throw new Error(
        "Backend dependency 'hianime' not installed. Please add it via: pnpm add hianime",
      );
    }

    const HianimeCtor = (mod as any).Hianime ?? (mod as any).default;
    if (!HianimeCtor) {
      throw new Error("Failed to resolve Hianime export.");
    }
    // eslint-disable-next-line new-cap
    const client = new HianimeCtor();
    return client;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown module import error";
    throw new Error(
      `Backend dependency 'hianime' not installed or failed to load: ${message}`,
    );
  }
}

// Helper to log responses to file
function logResponse(functionName: string, args: any, response: any) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      function: functionName,
      args,
      response,
    };
    
    const logLine = JSON.stringify(logEntry, null, 2) + "\n\n" + "=".repeat(80) + "\n\n";
    
    // Append to responses.txt in the project root
    const filePath = join(process.cwd(), "responses.txt");
    writeFileSync(filePath, logLine, { flag: "a" });
    
    console.log(`Logged response for ${functionName} to responses.txt`);
  } catch (err) {
    console.error("Failed to log response:", err);
  }
}

// Get top airing anime list (paginated)
export const topAiring = action({
  args: { page: v.optional(v.number()) },
  handler: async (_, args) => {
    try {
      const client = await getClient();
      const page = args.page ?? 1;
      const res = await client.getTopAiring(page);
      
      // Log the response
      logResponse("topAiring", { page }, res);
      
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch top airing anime";
      throw new Error(`Unable to load anime list: ${message}`);
    }
  },
});

// Get episodes for an anime (by dataId)
export const episodes = action({
  args: { dataId: v.string() },
  handler: async (_, args) => {
    try {
      const client = await getClient();
      const res = await client.getEpisodes(args.dataId);
      
      // Log the response
      logResponse("episodes", { dataId: args.dataId }, res);
      
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch episodes";
      throw new Error(`Unable to load episodes: ${message}`);
    }
  },
});

// Get servers for an episode
export const episodeServers = action({
  args: { episodeId: v.string() },
  handler: async (_, args) => {
    try {
      const client = await getClient();
      const res = await client.getEpisodeServers(args.episodeId);
      
      // Log the response
      logResponse("episodeServers", { episodeId: args.episodeId }, res);
      
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch servers";
      throw new Error(`Unable to load streaming servers: ${message}`);
    }
  },
});

// Get sources for a server
export const episodeSources = action({
  args: { serverId: v.string() },
  handler: async (_, args) => {
    try {
      const client = await getClient();
      const res = await client.getEpisodeSources(args.serverId);
      
      // Log the response for debugging
      console.log("Episode sources response:", JSON.stringify(res, null, 2));
      logResponse("episodeSources", { serverId: args.serverId }, res);
      
      // Ensure we return a valid response even if tracks are missing
      return {
        sources: res.sources || [],
        tracks: res.tracks || [],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch sources";
      console.error("Episode sources error:", message);
      
      // Log the error
      logResponse("episodeSources", { serverId: args.serverId }, { error: message });
      
      // Provide more helpful error message for common issues
      if (message.includes("nonce") || message.includes("embed")) {
        throw new Error("This streaming source is temporarily unavailable. Please try a different episode.");
      }
      throw new Error(`Unable to load video sources: ${message}`);
    }
  },
});