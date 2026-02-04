import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { createNotification } from "../notifications";
import { areFriends, hasPendingRequest, checkUsersPrivacy } from "../helpers";


export const sendFriendRequest = mutation({
  args: {
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (currentUserId === args.receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    const alreadyFriends = await areFriends(ctx, currentUserId, args.receiverId);
    if (alreadyFriends) {
      throw new Error("You are already friends with this user");
    }

    const pendingRequest = await hasPendingRequest(ctx, currentUserId, args.receiverId);
    if (pendingRequest) {
      throw new Error("A friend request already exists");
    }

    const receiver = await ctx.db.get(args.receiverId);
    if (!receiver) {
      throw new Error("User not found");
    }

    const canInteract = await checkUsersPrivacy(ctx, currentUserId, args.receiverId);
    if (!canInteract) {
      throw new Error("Cannot send friend request due to privacy restrictions");
    }

    const [userAId, userBId] = currentUserId < args.receiverId
      ? [currentUserId, args.receiverId]
      : [args.receiverId, currentUserId];

    await ctx.db.insert("friendships", {
      userAId,
      userBId,
      status: "pending",
      senderId: currentUserId,
    });

    const senderUser = await ctx.db.get(currentUserId);

    if (senderUser) {
      await createNotification(ctx, args.receiverId, currentUserId, "friend_request_sent");


    }

    return { success: true };
  },
});

export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friend request not found");
    }

    if (friendship.userAId !== currentUserId && friendship.userBId !== currentUserId) {
      throw new Error("You can only accept requests sent to you");
    }

    if (friendship.status !== "pending") {
      throw new Error("This request has already been processed");
    }

    const otherUserId = friendship.userAId === currentUserId ? friendship.userBId : friendship.userAId;

    const canInteract = await checkUsersPrivacy(ctx, currentUserId, otherUserId);
    if (!canInteract) {
      throw new Error("Cannot accept friend request due to privacy restrictions");
    }

    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
    });

    const accepterUser = await ctx.db.get(currentUserId);

    if (accepterUser) {
      await createNotification(ctx, otherUserId, currentUserId, "friend_request_accepted");


    }

    return { success: true };
  },
});

export const rejectFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friend request not found");
    }

    if (friendship.userAId !== currentUserId && friendship.userBId !== currentUserId) {
      throw new Error("You can only reject requests sent to you");
    }

    if (friendship.status !== "pending") {
      throw new Error("This request has already been processed");
    }

    const otherUserId = friendship.userAId === currentUserId ? friendship.userBId : friendship.userAId;

    await ctx.db.delete(args.friendshipId);

    const rejecterUser = await ctx.db.get(currentUserId);

    if (rejecterUser) {
      await createNotification(ctx, otherUserId, currentUserId, "friend_request_rejected");
    }

    return { success: true };
  },
});

export const removeFriend = mutation({
  args: {
    friendUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (currentUserId === args.friendUserId) {
      throw new Error("Cannot remove yourself as friend");
    }

    const [userAId, userBId] = currentUserId < args.friendUserId
      ? [currentUserId, args.friendUserId]
      : [args.friendUserId, currentUserId];

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("userAId", userAId).eq("userBId", userBId)
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (!friendship) {
      throw new Error("You are not friends with this user");
    }

    await ctx.db.delete(friendship._id);

    const conversation1 = await ctx.db
      .query("conversations")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUserId).eq("otherUserId", args.friendUserId)
      )
      .first();

    const conversation2 = await ctx.db
      .query("conversations")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.friendUserId).eq("otherUserId", currentUserId)
      )
      .first();

    if (conversation1 || conversation2) {
      const conversationId = conversation1?.conversationId || conversation2?.conversationId;

      if (conversationId) {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversationGroup", (q) =>
            q.eq("conversationId", conversationId)
          )
          .collect();

        for (const message of messages) {
          if (message.type === "image" && message.attachment) {
            // R2 cleanup handled separately
          }
          await ctx.db.delete(message._id);
        }

        if (conversation1) await ctx.db.delete(conversation1._id);
        if (conversation2) await ctx.db.delete(conversation2._id);
      }
    }

    const lettersFromCurrentUser = await ctx.db
      .query("letters")
      .withIndex("by_sender", (q) => q.eq("senderId", currentUserId))
      .filter((q) => q.eq(q.field("recipientId"), args.friendUserId))
      .collect();

    for (const letter of lettersFromCurrentUser) {
      await ctx.db.delete(letter._id);
    }

    const lettersToCurrentUser = await ctx.db
      .query("letters")
      .withIndex("by_sender", (q) => q.eq("senderId", args.friendUserId))
      .filter((q) => q.eq(q.field("recipientId"), currentUserId))
      .collect();

    for (const letter of lettersToCurrentUser) {
      await ctx.db.delete(letter._id);
    }

    const currentUser = await ctx.db.get(currentUserId);

    if (currentUser) {
      await createNotification(ctx, args.friendUserId, currentUserId, "friend_removed");
    }

    return { success: true };
  },
});
