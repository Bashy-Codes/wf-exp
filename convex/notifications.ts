import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

/**
 * Helper function to create a notification
 */
export async function createNotification(
  ctx: any,
  recipientId: Id<"users">,
  senderId: Id<"users">,
  type:
    | "friend_request_sent"
    | "friend_request_accepted"
    | "friend_request_rejected"
    | "friend_removed"
    | "conversation_deleted"
    | "user_blocked"
    | "post_reaction"
    | "post_commented"
    | "comment_replied"

    | "gift_received"
    | "discussion_thread_replied"
    | "community_join_request"
) {
  // Don't send notification to yourself
  if (recipientId === senderId) {
    return;
  }

  await ctx.db.insert("notifications", {
    recipientId,
    senderId,
    type,
    hasUnread: true
  });
}

/**
 * Get user notifications with pagination
 */
export const getUserNotifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId)
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Get sender profiles for each notification
    const senderIds = notifications.page.map(
      (notification) => notification.senderId
    );
    const senderProfiles = await Promise.all(
      senderIds.map(async (senderId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", senderId))
          .unique();

        if (!profile) return null;

        // Get user data for the profile
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        return {
          userId: profile.userId,
          name: user.name,
          country: user.country
        };
      })
    );

    const enrichedPage = notifications.page
      .map((notification, index) => {
        const senderProfile = senderProfiles[index];
        if (!senderProfile) return null;

        return {
          notificationId: notification._id,
          type: notification.type,
          hasUnread: notification.hasUnread,
          createdAt: notification._creationTime,
          sender: senderProfile,
        };
      })
      .filter((notification) => notification !== null);

    return {
      ...notifications,
      page: enrichedPage,
    };
  },
});

/**
 * Mark all notifications as read for the current user
 */
export const markNotificationsAsRead = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", currentUserId).eq("hasUnread", true)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        hasUnread: false,
      });
    }

    return { success: true };
  },
});

/**
 * Delete all notifications for the current user
 */
export const deleteAllNotifications = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", currentUserId))
      .collect();

    for (const notification of userNotifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true };
  },
});

/**
 * Check if user has unread notifications
 */
export const hasUnreadNotifications = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const unreadNotification = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", currentUserId).eq("hasUnread", true)
      )
      .first();

    return !!unreadNotification;
  },
});
