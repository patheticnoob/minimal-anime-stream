import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Save or update watch progress for a user
export const saveProgress = mutation({
  args: {
    animeId: v.string(),
    animeTitle: v.string(),
    animeImage: v.optional(v.union(v.string(), v.null())),
    episodeId: v.string(),
    episodeNumber: v.number(),
    currentTime: v.number(),
    duration: v.number(),
    language: v.optional(v.object({
      sub: v.optional(v.union(v.string(), v.null())),
      dub: v.optional(v.union(v.string(), v.null())),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      console.error("❌ saveProgress: User not authenticated");
      throw new Error("Not authenticated");
    }

    console.log("💾 Saving progress:", {
      userId,
      animeId: args.animeId,
      episodeId: args.episodeId,
      episodeNumber: args.episodeNumber,
      currentTime: args.currentTime,
      duration: args.duration,
    });

    // Check if progress already exists
    const existing = await ctx.db
      .query("watchProgress")
      .withIndex("by_user_and_anime", (q) => 
        q.eq("userId", userId).eq("animeId", args.animeId)
      )
      .first();

    const progressData = {
      userId,
      animeId: args.animeId,
      animeTitle: args.animeTitle,
      animeImage: args.animeImage,
      episodeId: args.episodeId,
      episodeNumber: args.episodeNumber,
      currentTime: args.currentTime,
      duration: args.duration,
      language: args.language,
      lastWatched: Date.now(),
    };

    if (existing) {
      console.log("📝 Updating existing progress record");
      await ctx.db.patch(existing._id, progressData);
      return existing._id;
    } else {
      console.log("✨ Creating new progress record");
      const id = await ctx.db.insert("watchProgress", progressData);
      return id;
    }
  },
});

// Get watch progress for a specific anime
export const getProgress = query({
  args: { animeId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("watchProgress")
      .withIndex("by_user_and_anime", (q) => 
        q.eq("userId", userId).eq("animeId", args.animeId)
      )
      .first();
  },
});

// Get all continue watching items for user
export const getContinueWatching = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const progress = await ctx.db
      .query("watchProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by last watched, most recent first
    return progress.sort((a, b) => b.lastWatched - a.lastWatched).slice(0, 12);
  },
});