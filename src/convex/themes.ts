import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserTheme = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return "classic";
    
    const user = await ctx.db.get(userId);
    return user?.theme || "classic";
  },
});

export const setUserTheme = mutation({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.patch(userId, { theme: args.theme });
    return { success: true };
  },
});
