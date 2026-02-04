import { query, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { r2 } from "../storage";
import schema from "../schema";
import { stream, mergedStream } from "convex-helpers/server/stream";
import { v } from "convex/values";
import { getCountryName, getCountryFlag } from "../helpers";

async function enrichFriendshipProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
  locale?: string
): Promise<{
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  country: string;
} | null> {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const profilePictureUrl = await r2.getPublicUrl(user.profilePicture);

  return {
    userId: user._id,
    profilePicture: profilePictureUrl,
    name: user.name,
    country: getCountryFlag(user.country) + " " + getCountryName(user.country, locale),
  };
}

export const getUserFriends = query({
  args: {
    userLocale: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userLocale, paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const asA = stream(ctx.db, schema)
      .query("friendships")
      .withIndex("by_userA_status", (q) =>
        q.eq("userAId", currentUserId).eq("status", "accepted")
      );

    const asB = stream(ctx.db, schema)
      .query("friendships")
      .withIndex("by_userB_status", (q) =>
        q.eq("userBId", currentUserId).eq("status", "accepted")
      );

    const merged = mergedStream([asA, asB], ["_creationTime"]);

    const { page, isDone, continueCursor } = await merged.paginate(paginationOpts);

    const enrichedPage = await Promise.all(
      page.map(async (friendship) => {
        const friendId =
          friendship.userAId === currentUserId
            ? friendship.userBId
            : friendship.userAId;
        const profile = await enrichFriendshipProfile(ctx, friendId, userLocale);
        if (!profile) return null;

        return {
          friendshipId: friendship._id,
          userId: profile.userId,
          profilePicture: profile.profilePicture,
          name: profile.name,
          country: profile.country,
          status: friendship.status,
          senderId: friendship.senderId,
        };
      })
    );

    return {
      page: enrichedPage.filter((item) => item !== null),
      isDone,
      continueCursor,
    };
  },
});

export const getFriendRequests = query({
  args: {
    userLocale: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userLocale, paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const asA = stream(ctx.db, schema)
      .query("friendships")
      .withIndex("by_userA_status", (q) =>
        q.eq("userAId", currentUserId).eq("status", "pending")
      );

    const asB = stream(ctx.db, schema)
      .query("friendships")
      .withIndex("by_userB_status", (q) =>
        q.eq("userBId", currentUserId).eq("status", "pending")
      );

    const merged = mergedStream([asA, asB], ["_creationTime"]);

    const { page, isDone, continueCursor } = await merged.paginate(paginationOpts);

    const enrichedPage = await Promise.all(
      page.map(async (friendship) => {
        const friendId =
          friendship.userAId === currentUserId
            ? friendship.userBId
            : friendship.userAId;
        const profile = await enrichFriendshipProfile(ctx, friendId, userLocale);
        if (!profile) return null;

        return {
          friendshipId: friendship._id,
          userId: profile.userId,
          profilePicture: profile.profilePicture,
          name: profile.name,
          country: profile.country,
          status: friendship.status,
          senderId: friendship.senderId,
        };
      })
    );

    return {
      page: enrichedPage.filter((item) => item !== null),
      isDone,
      continueCursor,
    };
  },
});
