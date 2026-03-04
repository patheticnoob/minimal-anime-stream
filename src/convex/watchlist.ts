import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add anime to watchlist
export const addToWatchlist = mutation({
  args: {
    animeId: v.string(),
    animeTitle: v.string(),
    animeImage: v.optional(v.string()),
    animeType: v.optional(v.string()),
    language: v.optional(v.object({
      sub: v.optional(v.union(v.string(), v.null())),
      dub: v.optional(v.union(v.string(), v.null())),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_anime", (q) => 
        q.eq("userId", userId).eq("animeId", args.animeId)
      )
      .first();

    if (existing) {
      throw new Error("Already in watchlist");
    }

    return await ctx.db.insert("watchlist", {
      userId,
      animeId: args.animeId,
      animeTitle: args.animeTitle,
      animeImage: args.animeImage,
      animeType: args.animeType,
      language: args.language,
      addedAt: Date.now(),
    });
  },
});

// Remove anime from watchlist
export const removeFromWatchlist = mutation({
  args: { animeId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_anime", (q) => 
        q.eq("userId", userId).eq("animeId", args.animeId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});

// Check if anime is in watchlist
export const isInWatchlist = query({
  args: { animeId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_anime", (q) => 
        q.eq("userId", userId).eq("animeId", args.animeId)
      )
      .first();

    return !!item;
  },
});

// Get user's watchlist
export const getWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by added date, most recent first
    return items.sort((a, b) => b.addedAt - a.addedAt);
  },
});
