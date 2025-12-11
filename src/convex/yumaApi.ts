"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get anime info from Yuma API to extract anilist_id
export const getAnimeInfo = action({
  args: { animeId: v.string() },
  handler: async (_, args): Promise<any> => {
    try {
      const response = await fetch(`https://yumaapi.vercel.app/info/${args.animeId}`);
      
      if (!response.ok) {
        throw new Error(`Yuma API returned ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch anime info";
      throw new Error(`Unable to load anime info from Yuma: ${message}`);
    }
  },
});

// Get episodes using anilist_id from Yuma info
export const getEpisodesViaYuma = action({
  args: { animeId: v.string() },
  handler: async (ctx, args): Promise<any> => {
    try {
      // First get the anilist_id from Yuma
      const response = await fetch(`https://yumaapi.vercel.app/info/${args.animeId}`);
      
      if (!response.ok) {
        throw new Error(`Yuma API returned ${response.status}`);
      }
      
      const yumaInfo: any = await response.json();
      
      if (!yumaInfo.anilist_id) {
        throw new Error(`No anilist_id found for anime: ${args.animeId}`);
      }
      
      // Then fetch episodes using the numeric anilist_id
      const episodes: any = await ctx.runAction(api.hianime.episodes, { dataId: yumaInfo.anilist_id });
      return episodes;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch episodes via Yuma";
      throw new Error(`Unable to load episodes: ${message}`);
    }
  },
});