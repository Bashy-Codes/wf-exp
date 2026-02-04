import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";


export const createReport = mutation({
  args: {
    targetType: v.union(v.literal("user"), v.literal("post"), v.literal("discussion")),
    targetId: v.string(),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other"),
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const reporterId = await getAuthUserId(ctx);
    if (!reporterId) {
      throw new Error("Not authenticated");
    }

    // Validate report reason length
    if (args.reportReason.trim().length < 10) {
      throw new Error("Report reason must be at least 10 characters long");
    }

    if (args.reportReason.trim().length > 500) {
      throw new Error("Report reason must be less than 500 characters");
    }

    let targetUserId: Id<"users"> | undefined;
    let targetPostId: Id<"posts"> | undefined;
    let targetDiscussionId: Id<"discussions"> | undefined;

    // Validate target and get owner
    if (args.targetType === "user") {
      const userId = args.targetId as Id<"users">;
      if (reporterId === userId) {
        throw new Error("You cannot report yourself");
      }
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User not found");
      }
      targetUserId = userId;
    } else if (args.targetType === "post") {
      const postId = args.targetId as Id<"posts">;
      const post = await ctx.db.get(postId);
      if (!post) {
        throw new Error("Post not found");
      }
      if (reporterId === post.userId) {
        throw new Error("You cannot report your own post");
      }
      targetUserId = post.userId;
      targetPostId = postId;
    } else if (args.targetType === "discussion") {
      const discussionId = args.targetId as Id<"discussions">;
      const discussion = await ctx.db.get(discussionId);
      if (!discussion) {
        throw new Error("Discussion not found");
      }
      if (reporterId === discussion.userId) {
        throw new Error("You cannot report your own discussion");
      }
      targetUserId = discussion.userId;
      targetDiscussionId = discussionId;
    }

    // Create the report
    const reportId = await ctx.db.insert("reports", {
      reporterId,
      reportType: args.reportType,
      reportReason: args.reportReason.trim(),
      attachment: args.attachment,
      targetType: args.targetType,
      targetUserId,
      targetPostId,
      targetDiscussionId,
    });

    return reportId;
  },
});
