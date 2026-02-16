import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserTheme = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      return "nothing";
    }

    const user = await ctx.db.get(userId);

    return user?.theme || "nothing";
  },
});

export const setUserTheme = mutation({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Validate theme
    const validThemes = ["classic", "nothing"];
    if (!validThemes.includes(args.theme)) {
      throw new Error("Invalid theme");
    }

    await ctx.db.patch(user._id, { theme: args.theme });
  },
});