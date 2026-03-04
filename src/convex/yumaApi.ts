"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const getAnimeDetails = action({
  args: { animeId: v.string() },
  handler: async (_, args) => {
    try {
      const response = await fetch(`https://yumaapi.vercel.app/info/${args.animeId}`);
      
      if (!response.ok) {
        throw new Error(`Yuma API returned ${response.status}`);
      }
      
      const data = await response.json();
      // Return the raw data so frontend can map it
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch anime details";
      throw new Error(`Unable to load anime details from Yuma: ${message}`);
    }
  },
});

export const getEpisodeSources = action({
  args: { episodeId: v.string() },
  handler: async (_, args) => {
    try {
      const response = await fetch(`https://yumaapi.vercel.app/watch?episodeId=${args.episodeId}`);
      
      if (!response.ok) {
        throw new Error(`Yuma API returned ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch sources";
      throw new Error(`Unable to load sources from Yuma: ${message}`);
    }
  },
});