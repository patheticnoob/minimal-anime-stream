import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Watch progress tracking
    watchProgress: defineTable({
      userId: v.id("users"),
      animeId: v.string(),
      animeTitle: v.string(),
      animeImage: v.optional(v.union(v.string(), v.null())),
      episodeId: v.string(),
      episodeNumber: v.number(),
      currentTime: v.number(),
      duration: v.number(),
      lastWatched: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_anime", ["userId", "animeId"]),

    // Watchlist
    watchlist: defineTable({
      userId: v.id("users"),
      animeId: v.string(),
      animeTitle: v.string(),
      animeImage: v.optional(v.string()),
      animeType: v.optional(v.string()),
      language: v.optional(v.object({
        sub: v.optional(v.union(v.string(), v.null())),
        dub: v.optional(v.union(v.string(), v.null())),
      })),
      addedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_anime", ["userId", "animeId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;