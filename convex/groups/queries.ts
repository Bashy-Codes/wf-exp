import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { r2 } from "../storage";

export const getUserGroups = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return { page: [], isDone: true, continueCursor: "" };

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .collect();

    const groupIds = memberships.map((m) => m.groupId);
    const groups = await Promise.all(
      groupIds.map(async (groupId) => {
        const group = await ctx.db.get(groupId);
        if (!group) return null;

        const bannerUrl = group.banner ? await ctx.storage.getUrl(group.banner) : undefined

        const membership = memberships.find((m) => m.groupId === groupId);
        const lastReadAt = membership?.lastReadAt || 0;

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
          .order("desc")
          .first();

        let lastMessageData = null;
        if (lastMessage) {
          const sender = await ctx.db.get(lastMessage.senderId);
          lastMessageData = {
            content: lastMessage.content,
            type: lastMessage.type,
            senderName: sender?.name || "Unknown",
            createdAt: lastMessage._creationTime,
          };
        }

        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
          .filter((q) => q.gt(q.field("_creationTime"), lastReadAt))
          .collect();

        return {
          groupId: group._id,
          groupPhoto: bannerUrl,
          groupTitle: group.title,
          lastMessage: lastMessageData,
          unreadCount: unreadCount.length,
          isGroupAdmin: group.creatorId === currentUserId,
        };
      })
    );

    return { page: groups.filter((g) => g !== null), isDone: true, continueCursor: "" };
  },
});

export const getGroupMessages = query({
  args: {
    groupId: v.id("groups"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { groupId, paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .first();

    if (!membership) throw new Error("Not authorized");

    const results = await ctx.db
      .query("messages")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .order("desc")
      .paginate(paginationOpts);

    const enrichedMessages = await Promise.all(
      results.page.map(async (message) => {
        const isOwner = message.senderId === currentUserId;
        const senderUser = await ctx.db.get(message.senderId);
        if (!senderUser) return null;

        const senderProfilePicture = await r2.getPublicUrl(senderUser.profilePicture);

        let attachmentUrl: string | null = null;
        if (message.attachment) {
          if (message.type === "image") {
            attachmentUrl = await r2.getPublicUrl(message.attachment);
          } else if (message.type === "gif") {
            attachmentUrl = message.attachment;
          }
        }

        let replyParent = null;
        if (message.replyParentId) {
          const parentMessage = await ctx.db.get(message.replyParentId);
          if (parentMessage) {
            const parentSenderUser = await ctx.db.get(parentMessage.senderId);
            if (parentSenderUser) {
              replyParent = {
                messageId: parentMessage._id,
                content: parentMessage.content,
                type: parentMessage.type,
                senderName: parentSenderUser.name,
              };
            }
          }
        }

        return {
          messageId: message._id,
          conversationId: message.conversationId || "",
          createdAt: message._creationTime,
          content: message.content,
          type: message.type,
          attachmentUrl,
          isOwner,
          replyParentId: message.replyParentId,
          replyParent,
          correction: message.correction,
          sender: {
            senderId: message.senderId,
            senderName: senderUser.name,
          },
        };
      })
    );

    return {
      ...results,
      page: enrichedMessages.filter((m) => m !== null),
    };
  },
});

export const getGroupInfo = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .first();

    if (!membership) throw new Error("Not authorized");

    const bannerUrl = group.banner ? await ctx.storage.getUrl(group.banner) : null;

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();

    const memberIds = memberships.map((m) => m.userId);

    return {
      groupId: group._id,
      title: group.title,
      description: group.description,
      banner: bannerUrl,
      membersCount: group.membersCount,
      createdAt: group._creationTime,
      memberIds,
      isAdmin: group.creatorId === currentUserId,
    };
  },
});

export const getGroupMembers = query({
  args: {
    groupId: v.id("groups"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { groupId, paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .first();

    if (!membership) throw new Error("Not authorized");

    const results = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .paginate(paginationOpts);

    const members = await Promise.all(
      results.page.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        if (!user) return null;

        const profilePicture = await r2.getPublicUrl(user.profilePicture);

        return {
          userId: user._id,
          name: user.name,
          profilePicture,
          country: user.country,
        };
      })
    );

    return {
      ...results,
      page: members.filter((m) => m !== null),
    };
  },
});
