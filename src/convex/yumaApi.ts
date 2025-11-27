"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Fetch recent episodes from Yuma API
export const recentEpisodes = action({
  args: { page: v.optional(v.number()) },
  handler: async (_, args) => {
    try {
      const page = args.page ?? 1;
      const response = await fetch(`https://yumaapi.vercel.app/recent-episodes?page=${page}`);
      
      if (!response.ok) {
        // Silently fail - don't throw error
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      // Silently fail - return null instead of throwing
      return null;
    }
  },
});
