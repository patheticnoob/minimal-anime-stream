import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserDataFlow = query({
  args: {},
  handler: async (ctx) => {
    // EMERGENCY: Force v1 API due to Yumaapi outage
    // Yumaapi is down, so v3 and v4 (which depend on it) won't work
    return "v1"; // Force Hianime API for all users

    // Original logic (commented out during outage):
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   return "v4"; // Default flow for non-authenticated users
    // }
    // const user = await ctx.db.get(userId);
    // return user?.dataFlow || "v4"; // Default to v4 if not set
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
