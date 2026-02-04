import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createGroup = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    banner: v.optional(v.id("_storage")),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, { title, description, banner, memberIds }) => {
    const creatorId = await getAuthUserId(ctx);
    if (!creatorId) throw new Error("Not authenticated");

    const groupId = await ctx.db.insert("groups", {
      title,
      description,
      banner,
      membersCount: memberIds.length + 1,
      creatorId,
    });

    await ctx.db.insert("groupMembers", { groupId, userId: creatorId });

    for (const userId of memberIds) {
      await ctx.db.insert("groupMembers", { groupId, userId });
    }

    return groupId;
  },
});

export const markGroupAsRead = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .first();

    if (!membership) throw new Error("Not authorized");

    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
    });
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    if (group.creatorId !== currentUserId) {
      throw new Error("Only admin can delete group");
    }

    // Delete all messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete group
    await ctx.db.delete(groupId);
  },
});

export const leaveGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    if (group.creatorId === currentUserId) {
      throw new Error("Admin cannot leave group. Delete the group instead.");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .first();

    if (!membership) throw new Error("Not a member");

    // Delete membership
    await ctx.db.delete(membership._id);

    // Update group members count
    await ctx.db.patch(groupId, {
      membersCount: Math.max(0, group.membersCount - 1),
    });
  },
});
