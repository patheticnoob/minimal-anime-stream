import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserDataFlow = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      return "v1"; // Default flow for non-authenticated users
    }

    const user = await ctx.db.get(userId);
    return user?.dataFlow || "v1"; // Default to v1 if not set
  },
});

export const setUserDataFlow = mutation({
  args: { dataFlow: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Validate data flow version
    const validFlows = ["v1", "v2", "v3", "v4"];
    if (!validFlows.includes(args.dataFlow)) {
      throw new Error("Invalid data flow version");
    }

    await ctx.db.patch(user._id, { dataFlow: args.dataFlow });
  },
});
