import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Export all user data including watchlist, watch progress, and user preferences
 */
export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user info
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get watchlist (limit to 1000 items for safety)
    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(1000);

    // Get watch progress (limit to 1000 items for safety)
    const watchProgress = await ctx.db
      .query("watchProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(1000);

    // Create export data object
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      userData: {
        name: user.name,
        email: user.email,
        theme: user.theme,
        dataFlow: user.dataFlow,
      },
      watchlist: watchlist.map((item) => ({
        animeId: item.animeId,
        animeTitle: item.animeTitle,
        animeImage: item.animeImage,
        animeType: item.animeType,
        language: item.language,
        addedAt: item.addedAt,
      })),
      watchProgress: watchProgress.map((item) => ({
        animeId: item.animeId,
        animeTitle: item.animeTitle,
        animeImage: item.animeImage,
        episodeId: item.episodeId,
        episodeNumber: item.episodeNumber,
        currentTime: item.currentTime,
        duration: item.duration,
        language: item.language,
        lastWatched: item.lastWatched,
      })),
      stats: {
        totalWatchlistItems: watchlist.length,
        totalProgressItems: watchProgress.length,
      },
    };

    return exportData;
  },
});

/**
 * Import user data from an export file
 */
export const importUserData = mutation({
  args: {
    data: v.string(), // JSON string of export data
    mode: v.union(v.literal("merge"), v.literal("replace")), // merge: add to existing, replace: clear and import
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let importData;
    try {
      importData = JSON.parse(args.data);
    } catch (error) {
      throw new Error("Invalid JSON format");
    }

    // Validate data structure
    if (!importData.version || !importData.watchlist || !importData.watchProgress) {
      throw new Error("Invalid export file format");
    }

    // If replace mode, delete existing data (batch operations for safety)
    if (args.mode === "replace") {
      // Delete existing watchlist (limit to 500 items per batch)
      const existingWatchlist = await ctx.db
        .query("watchlist")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(500);

      const deleteWatchlistOps = existingWatchlist.map((item) =>
        ctx.db.delete(item._id)
      );
      await Promise.all(deleteWatchlistOps);

      // Delete existing watch progress (limit to 500 items per batch)
      const existingProgress = await ctx.db
        .query("watchProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(500);

      const deleteProgressOps = existingProgress.map((item) =>
        ctx.db.delete(item._id)
      );
      await Promise.all(deleteProgressOps);
    }

    let importedWatchlist = 0;
    let importedProgress = 0;
    let skippedWatchlist = 0;
    let skippedProgress = 0;

    // Limit import to 500 items to prevent excessive operations
    const watchlistToImport = importData.watchlist.slice(0, 500);
    const progressToImport = importData.watchProgress.slice(0, 500);

    // Import watchlist
    for (const item of watchlistToImport) {
      // Check if already exists (for merge mode)
      const existing = await ctx.db
        .query("watchlist")
        .withIndex("by_user_and_anime", (q) =>
          q.eq("userId", userId).eq("animeId", item.animeId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("watchlist", {
          userId,
          animeId: item.animeId,
          animeTitle: item.animeTitle,
          animeImage: item.animeImage,
          animeType: item.animeType,
          language: item.language,
          addedAt: item.addedAt || Date.now(),
        });
        importedWatchlist++;
      } else {
        skippedWatchlist++;
      }
    }

    // Import watch progress
    for (const item of progressToImport) {
      // Check if already exists
      const existing = await ctx.db
        .query("watchProgress")
        .withIndex("by_user_and_anime", (q) =>
          q.eq("userId", userId).eq("animeId", item.animeId)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("watchProgress", {
          userId,
          animeId: item.animeId,
          animeTitle: item.animeTitle,
          animeImage: item.animeImage,
          episodeId: item.episodeId,
          episodeNumber: item.episodeNumber,
          currentTime: item.currentTime,
          duration: item.duration,
          language: item.language,
          lastWatched: item.lastWatched || Date.now(),
        });
        importedProgress++;
      } else if (args.mode === "replace") {
        // Update existing progress in replace mode
        await ctx.db.patch(existing._id, {
          animeTitle: item.animeTitle,
          animeImage: item.animeImage,
          episodeId: item.episodeId,
          episodeNumber: item.episodeNumber,
          currentTime: item.currentTime,
          duration: item.duration,
          language: item.language,
          lastWatched: item.lastWatched || Date.now(),
        });
        importedProgress++;
      } else {
        skippedProgress++;
      }
    }

    return {
      success: true,
      imported: {
        watchlist: importedWatchlist,
        progress: importedProgress,
      },
      skipped: {
        watchlist: skippedWatchlist,
        progress: skippedProgress,
      },
    };
  },
});
