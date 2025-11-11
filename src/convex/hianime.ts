"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

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

// Get top airing anime list (paginated)
export const topAiring = action({
  args: { page: v.optional(v.number()) },
  handler: async (_, args) => {
    const client = await getClient();
    const page = args.page ?? 1;
    const res = await client.getTopAiring(page);
    return res;
  },
});

// Get episodes for an anime (by dataId)
export const episodes = action({
  args: { dataId: v.string() },
  handler: async (_, args) => {
    const client = await getClient();
    const res = await client.getEpisodes(args.dataId);
    return res;
  },
});

// Get servers for an episode
export const episodeServers = action({
  args: { episodeId: v.string() },
  handler: async (_, args) => {
    const client = await getClient();
    const res = await client.getEpisodeServers(args.episodeId);
    return res;
  },
});

// Get sources for a server
export const episodeSources = action({
  args: { serverId: v.string() },
  handler: async (_, args) => {
    const client = await getClient();
    const res = await client.getEpisodeSources(args.serverId);
    return res;
  },
});