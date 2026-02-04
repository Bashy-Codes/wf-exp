import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { areFriends, getCountryFlag, getCountryName } from "../helpers";
import { createNotification } from "../notifications";
import { r2 } from "../storage";

import { Id } from "../_generated/dataModel";

/**
 * Add or update a reaction on a post
 */
export const addPostReaction = mutation({
  args: {
    postId: v.id("posts"),
    emoji: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate emoji
    if (!args.emoji || args.emoji.length === 0) {
      throw new Error("Invalid emoji");
    }

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends, it's own post, or post author is admin
    const isFriend = await areFriends(ctx, userId, post.userId);

    if (!isFriend && post.userId !== userId) {
      throw new Error("You can only react to posts from friends or admins");
    }

    // Check if user already reacted to this post
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_userId_postId", (q) =>
        q.eq("userId", userId).eq("postId", args.postId)
      )
      .first();

    if (existingReaction) {
      if (existingReaction.emoji === args.emoji) {
        // Same emoji - remove reaction
        await Promise.all([
          ctx.db.delete(existingReaction._id),
          ctx.db.patch(args.postId, {
            reactionsCount: Math.max(0, post.reactionsCount - 1),
          }),
        ]);
        return { success: true, hasReacted: false, userReaction: null };
      } else {
        // Different emoji - update reaction
        await ctx.db.patch(existingReaction._id, {
          emoji: args.emoji,
        });
        return { success: true, hasReacted: true, userReaction: args.emoji };
      }
    } else {
      // Add new reaction
      await Promise.all([
        ctx.db.insert("reactions", {
          userId,
          postId: args.postId,
          emoji: args.emoji,
        }),
        ctx.db.patch(args.postId, {
          reactionsCount: post.reactionsCount + 1,
        }),
      ]);

      // Send notification to post owner (if not reacting to own post)
      if (post.userId !== userId) {
        const reactorUser = await ctx.db.get(userId);

        if (reactorUser) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "post_reaction",
          );


        }
      }

      return { success: true, hasReacted: true, userReaction: args.emoji };
    }
  },
});

/**
 * Get reactions for a post with pagination
 */
export const getPostReactions = query({
  args: {
    postId: v.id("posts"),
    userLocale: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if post exists and user can access it
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends or it's own post
    const isFriend = await areFriends(ctx, userId, post.userId);

    if (!isFriend && post.userId !== userId) {
      throw new Error(
        "You can only view reactions on posts from friends or admins"
      );
    }

    // Get reactions with pagination, ordered by creation time (newest first)
    const result = await ctx.db
      .query("reactions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich reactions with user profile
    const enrichedReactions = await Promise.all(
      result.page.map(async (reaction) => {
        // Get user data
        const user = await ctx.db.get(reaction.userId);

        if (!user) {
          throw new Error("User not found for reaction author");
        }

        // Get user profile for country
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique();

        if (!profile) {
          throw new Error("Profile not found for reaction author");
        }

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        return {
          reactionId: reaction._id,
          emoji: reaction.emoji,
          userId: user._id,
          name: user.name,
          profilePicture: profilePictureUrl,
          country: `${getCountryFlag(user.country)} ${getCountryName(user.country)}`,
          isPremium: user.isPremium,
        };
      })
    );

    return {
      ...result,
      page: enrichedReactions,
    };
  },
});

/**
 * Comment on a post or reply to a comment (unlimited nesting)
 */
export const commentPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    replyParentId: v.optional(v.id("comments")),
    attachment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.content.trim() && !args.attachment) {
      throw new Error("Comment must have content or attachment");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment too long (max 1000 characters)");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const isFriend = await areFriends(ctx, userId, post.userId);

    if (!isFriend && post.userId !== userId) {
      throw new Error("You can only comment on posts from friends or admins");
    }

    let parentComment = null;
    if (args.replyParentId) {
      parentComment = await ctx.db.get(args.replyParentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      if (parentComment.postId !== args.postId) {
        throw new Error("Parent comment does not belong to this post");
      }
    }

    const commentData: any = {
      userId,
      postId: args.postId,
      content: args.content.trim(),
      repliesCount: 0,
    };

    if (args.replyParentId) {
      commentData.replyParentId = args.replyParentId;
    }

    if (args.attachment) {
      commentData.attachment = args.attachment;
    }

    const [commentId] = await Promise.all([
      ctx.db.insert("comments", commentData),
      ctx.db.patch(args.postId, {
        commentsCount: post.commentsCount + 1,
      }),
      args.replyParentId ? ctx.db.patch(args.replyParentId, {
        repliesCount: (parentComment?.repliesCount || 0) + 1,
      }) : Promise.resolve(),
    ]);

    const commenterUser = await ctx.db.get(userId);

    if (commenterUser) {
      if (args.replyParentId && parentComment) {
        if (parentComment.userId !== userId) {
          await createNotification(
            ctx,
            parentComment.userId,
            userId,
            "comment_replied",
          );


        }

        if (post.userId !== userId && post.userId !== parentComment.userId) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "comment_replied",
          );
        }
      } else {
        if (post.userId !== userId) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "post_commented",
          );


        }
      }
    }

    return { commentId, success: true };
  },
});

/**
 * Delete a comment or reply (cascading delete for all nested replies)
 */
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }

    const post = await ctx.db.get(comment.postId);
    if (!post) throw new Error("Post not found");

    // Recursively count and delete all nested replies
    const deleteRepliesRecursive = async (parentId: Id<"comments">): Promise<number> => {
      const replies = await ctx.db
        .query("comments")
        .withIndex("by_replyParent", (q) => q.eq("replyParentId", parentId))
        .collect();

      let count = 0;
      for (const reply of replies) {
        count += await deleteRepliesRecursive(reply._id);
        await ctx.db.delete(reply._id);
        count++;
      }
      return count;
    };

    const deletedRepliesCount = await deleteRepliesRecursive(args.commentId);
    const totalDeleted = deletedRepliesCount + 1;

    await Promise.all([
      ctx.db.delete(args.commentId),
      ctx.db.patch(comment.postId, {
        commentsCount: Math.max(0, post.commentsCount - totalDeleted),
      }),
      comment.replyParentId ? (async () => {
        const parent = await ctx.db.get(comment.replyParentId!);
        if (parent) {
          await ctx.db.patch(comment.replyParentId!, {
            repliesCount: Math.max(0, parent.repliesCount - totalDeleted),
          });
        }
      })() : Promise.resolve(),
    ]);

    return { success: true };
  },
});

/**
 * Get comments for a post (only top-level comments)
 */
export const getComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const isFriend = await areFriends(ctx, userId, post.userId);

    if (!isFriend && post.userId !== userId) {
      throw new Error(
        "You can only view comments on posts from friends or admins"
      );
    }

    const result = await ctx.db
      .query("comments")
      .withIndex("by_postId_replyParent", (q) =>
        q.eq("postId", args.postId).eq("replyParentId", undefined)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedComments = await Promise.all(
      result.page.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        if (!user) {
          throw new Error("User not found for comment author");
        }

        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        const attachmentUrl = comment.attachment
          ? comment.attachment.startsWith("http")
            ? comment.attachment
            : await r2.getUrl(comment.attachment)
          : undefined;

        return {
          commentId: comment._id,
          createdAt: comment._creationTime,
          userId: comment.userId,
          postId: comment.postId,
          content: comment.content,
          attachment: attachmentUrl,
          repliesCount: comment.repliesCount,
          isOwner: comment.userId === userId,
          commentAuthor: {
            userId: user._id,
            name: user.name,
            profilePicture: profilePictureUrl,
            isPremiumUser: user.isPremium
          },
        };
      })
    );

    return {
      ...result,
      page: enrichedComments,
    };
  },
});

/**
 * Get a single comment with details
 */
export const getComment = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const post = await ctx.db.get(comment.postId);
    if (!post) throw new Error("Post not found");

    const isFriend = await areFriends(ctx, userId, post.userId);
    if (!isFriend && post.userId !== userId) {
      throw new Error("You can only view comments on posts from friends");
    }

    const user = await ctx.db.get(comment.userId);
    if (!user) throw new Error("User not found");

    const profilePictureUrl = await r2.getUrl(user.profilePicture);

    const attachmentUrl = comment.attachment
      ? comment.attachment.startsWith("http")
        ? comment.attachment
        : await r2.getUrl(comment.attachment)
      : undefined;

    return {
      commentId: comment._id,
      createdAt: comment._creationTime,
      userId: comment.userId,
      postId: comment.postId,
      content: comment.content,
      attachment: attachmentUrl,
      repliesCount: comment.repliesCount,
      isOwner: comment.userId === userId,
      commentAuthor: {
        userId: user._id,
        name: user.name,
        profilePicture: profilePictureUrl,
        isPremiumUser: user.isPremium
      },
    };
  },
});

/**
 * Get replies for a specific comment
 */
export const getCommentReplies = query({
  args: {
    commentId: v.id("comments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const parentComment = await ctx.db.get(args.commentId);
    if (!parentComment) throw new Error("Comment not found");

    const post = await ctx.db.get(parentComment.postId);
    if (!post) throw new Error("Post not found");

    const isFriend = await areFriends(ctx, userId, post.userId);
    if (!isFriend && post.userId !== userId) {
      throw new Error("You can only view replies on posts from friends");
    }

    const result = await ctx.db
      .query("comments")
      .withIndex("by_replyParent", (q) => q.eq("replyParentId", args.commentId))
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedReplies = await Promise.all(
      result.page.map(async (reply) => {
        const user = await ctx.db.get(reply.userId);
        if (!user) throw new Error("User not found");

        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        const attachmentUrl = reply.attachment
          ? reply.attachment.startsWith("http")
            ? reply.attachment
            : await r2.getUrl(reply.attachment)
          : undefined;

        return {
          commentId: reply._id,
          createdAt: reply._creationTime,
          userId: reply.userId,
          postId: reply.postId,
          content: reply.content,
          attachment: attachmentUrl,
          repliesCount: reply.repliesCount,
          replyParentId: reply.replyParentId,
          isOwner: reply.userId === userId,
          commentAuthor: {
            userId: user._id,
            name: user.name,
            profilePicture: profilePictureUrl,
            isPremiumUser: user.isPremium
          },
        };
      })
    );

    return {
      ...result,
      page: enrichedReplies,
    };
  },
});

/**
 * Toggle pin status on a post
 */
export const togglePinPost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== userId) {
      throw new Error("You can only pin your own posts");
    }

    await ctx.db.patch(args.postId, {
      isPinned: !post.isPinned,
    });

    return { success: true, isPinned: !post.isPinned };
  },
});
