"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const searchBroadcast = action({
  args: { title: v.string() },
  handler: async (_, args) => {
    if (!args.title.trim()) return null;

    try {
      const url = new URL("https://api.jikan.moe/v4/anime");
      url.searchParams.set("q", args.title);
      url.searchParams.set("limit", "1");
      url.searchParams.set("sfw", "true");

      const response = await fetch(url.toString());
      if (!response.ok) return null;

      const payload = await response.json();
      const anime = payload?.data?.[0];
      if (!anime || !anime.broadcast) return null;

      const rawStatus = typeof anime.status === "string" ? anime.status.toLowerCase() : null;
      let normalizedStatus: "airing" | "complete" | "upcoming" | null = null;
      if (rawStatus) {
        if (rawStatus.includes("current") || rawStatus === "airing") {
          normalizedStatus = "airing";
        } else if (rawStatus.includes("not yet") || rawStatus.includes("upcoming")) {
          normalizedStatus = "upcoming";
        } else if (rawStatus.includes("finish") || rawStatus.includes("complete")) {
          normalizedStatus = "complete";
        }
      }

      return {
        malId: anime.mal_id ?? null,
        title: anime.title ?? args.title,
        airing: anime.airing ?? null,
        status: normalizedStatus,
        broadcast: {
          day: anime.broadcast.day ?? null,
          time: anime.broadcast.time ?? null,
          timezone: anime.broadcast.timezone ?? null,
          string: anime.broadcast.string ?? null,
        },
      };
    } catch (error) {
      console.error("Failed to fetch Jikan broadcast info", error);
      return null;
    }
  },
});