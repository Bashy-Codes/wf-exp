import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { areFriends, getUserFriends, incrementCollectionPostsCount, decrementCollectionPostsCount, getRelativeTime } from "../helpers";
import { r2 } from "../storage";

/**
 * Create a new post
 */
export const createPost = mutation({
  args: {
    content: v.string(),
    attachments: v.optional(v.array(v.object({
      type: v.union(v.literal("image"), v.literal("gif")),
      url: v.string(),
    }))),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Post content cannot be empty");
    }

    if (args.content.length > 2000) {
      throw new Error("Post too long (max 2000 characters)");
    }

    // Validate attachments array (max 3)
    if (args.attachments && args.attachments.length > 3) {
      throw new Error("Maximum 3 attachments allowed per post");
    }

    // If collectionId is provided, verify the collection exists and user owns it
    if (args.collectionId) {
      const collection = await ctx.db.get(args.collectionId);
      if (!collection) {
        throw new Error("Collection not found");
      }
      if (collection.userId !== userId) {
        throw new Error("You can only add posts to your own collections");
      }
    }

    // Create the post with counters initialized to 0
    const postId = await ctx.db.insert("posts", {
      userId,
      content: args.content,
      attachments: args.attachments,
      collectionId: args.collectionId,
      reactionsCount: 0,
      commentsCount: 0,
      isPinned: false,
    });

    // If post is added to a collection, increment the collection's posts count
    if (args.collectionId) {
      await incrementCollectionPostsCount(ctx, args.collectionId);
    }

    return { postId, success: true };
  },
});

/**
 * Update post attachments after upload
 */
export const updatePostAttachments = mutation({
  args: {
    postId: v.id("posts"),
    attachments: v.array(v.object({
      type: v.union(v.literal("image"), v.literal("gif")),
      url: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate attachments array (max 3)
    if (args.attachments.length > 3) {
      throw new Error("Maximum 3 attachments allowed per post");
    }

    // Get the post to verify ownership
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== userId) {
      throw new Error("You can only update your own posts");
    }

    // Update the post with the attachments
    await ctx.db.patch(args.postId, {
      attachments: args.attachments,
    });

    return { success: true };
  },
});

/**
 * Delete a post along with all its comments and reactions and decrement counters
 */
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the post to verify ownership
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== userId) {
      throw new Error("You can only delete your own posts");
    }

    // If post was in a collection, decrement the collection's posts count
    if (post.collectionId) {
      await decrementCollectionPostsCount(ctx, post.collectionId);
    }

    // Delete all comments for this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all reactions for this post
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Delete post attachments if they exist
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        if (attachment.type === "image") {
          await r2.deleteObject(ctx, attachment.url);
        }
      }
    }

    // Delete the post itself
    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

/**
 * Get feed posts from friends with pagination
 */
export const getFeedPosts = query({
  args: {
    userLocale: v.optional(v.string()),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };

    // Get user's friends
    const friends = await getUserFriends(ctx, userId);

    // Include user's own posts, friends' posts, and admin posts
    const allowedUserIds = [userId, ...friends];

    // Remove duplicates
    const uniqueAllowedUserIds = [...new Set(allowedUserIds)];

    // Posts with pagination
    const result = await ctx.db
      .query("posts")
      .withIndex("by_isPinned")
      .filter((q) =>
        q.or(...uniqueAllowedUserIds.map((id) => q.eq(q.field("userId"), id)))
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich posts with user profile, reactions count, comments count, and user's reaction status
    const enrichedPosts = await Promise.all(
      result.page.map(async (post) => {
        // Get post author's user data
        const postAuthor = await ctx.db.get(post.userId);

        if (!postAuthor) {
          throw new Error("User not found for post author");
        }

        // Check if current user reacted to this post
        const userReaction = await ctx.db
          .query("reactions")
          .withIndex("by_userId_postId", (q) =>
            q.eq("userId", userId).eq("postId", post._id)
          )
          .first();

        // Get attachment URLs if attachments exist
        const attachmentUrls =
          post.attachments && post.attachments.length > 0
            ? await Promise.all(
              post.attachments.map(async (att) => ({
                type: att.type,
                url: att.type === "image" ? await r2.getPublicUrl(att.url) : att.url,
              }))
            )
            : [];

        // Get profile picture URL
        const profilePictureUrl = await r2.getPublicUrl(postAuthor.profilePicture);

        return {
          postId: post._id,
          userId: post.userId,
          content: post.content,
          postAttachments: attachmentUrls,
          reactionsCount: post.reactionsCount,
          commentsCount: post.commentsCount,
          createdAt: getRelativeTime(post._creationTime, args.userLocale),
          hasReacted: !!userReaction,
          userReaction: userReaction?.emoji,
          isOwner: post.userId === userId,
          isPinned: post.isPinned,
          postAuthor: {
            userId: postAuthor._id,
            name: postAuthor.name,
            profilePicture: profilePictureUrl,
            isPremiumUser: postAuthor.isPremium
          },
        };
      })
    );

    return {
      ...result,
      page: enrichedPosts,
    };
  },
});


/**
 * Get a specific post details
 */
export const getPostDetails = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    if (!postAuthor) {
      throw new Error("User not found for post author");
    }

    // Check if users are friends or own post
    const isFriend = await areFriends(ctx, userId, post.userId);

    if (!isFriend && post.userId !== userId) {
      throw new Error("You can only view posts from friends");
    }

    // Check if current user reacted to this post
    const userReaction = await ctx.db
      .query("reactions")
      .withIndex("by_userId_postId", (q) =>
        q.eq("userId", userId).eq("postId", post._id)
      )
      .first();

    // Get attachment URLs if attachments exist
    const attachmentUrls =
      post.attachments && post.attachments.length > 0
        ? await Promise.all(post.attachments.map(async (att) => ({
          type: att.type,
          url: att.type === "image" ? await r2.getUrl(att.url) : att.url,
        })))
        : [];

    // Get profile picture URL
    const profilePictureUrl = await r2.getUrl(postAuthor.profilePicture);

    return {
      postId: post._id,
      createdAt: post._creationTime,
      userId: post.userId,
      content: post.content,
      postAttachments: attachmentUrls,
      reactionsCount: post.reactionsCount,
      commentsCount: post.commentsCount,
      hasReacted: !!userReaction,
      userReaction: userReaction?.emoji,
      isOwner: post.userId === userId,
      isPinned: post.isPinned,
      postAuthor: {
        userId: postAuthor._id,
        name: postAuthor.name,
        profilePicture: profilePictureUrl,
        isPremiumUser: postAuthor.isPremium
      },
    };
  },
});

/**
 * Get posts from a specific user
 */
export const getUserPosts = query({
  args: {
    targetUserId: v.id("users"),
    userLocale: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if users are friends or it's own posts
    const isFriend = await areFriends(ctx, userId, args.targetUserId);

    if (!isFriend && args.targetUserId !== userId) {
      throw new Error("You can only view posts from friends");
    }

    // Get user data for the target user
    const user = await ctx.db.get(args.targetUserId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get pinned posts first
    const pinnedPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId_isPinned", (q) =>
        q.eq("userId", args.targetUserId).eq("isPinned", true)
      )
      .order("desc")
      .collect();

    // Get regular posts with pagination
    const result = await ctx.db
      .query("posts")
      .withIndex("by_userId_isPinned", (q) =>
        q.eq("userId", args.targetUserId).eq("isPinned", false)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Combine pinned posts at the top with paginated posts
    const allPosts = [...pinnedPosts, ...result.page];

    // Enrich each post with additional data
    const enrichedPosts = await Promise.all(
      allPosts.map(async (post) => {
        // Check if current user reacted to this post
        const userReaction = await ctx.db
          .query("reactions")
          .withIndex("by_userId_postId", (q) =>
            q.eq("userId", userId).eq("postId", post._id)
          )
          .first();

        // Get attachment URLs if attachments exist
        const attachmentUrls =
          post.attachments && post.attachments.length > 0
            ? await Promise.all(
              post.attachments.map(async (att) => ({
                type: att.type,
                url: att.type === "image" ? await r2.getUrl(att.url) : att.url,
              }))
            )
            : [];

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        return {
          postId: post._id,
          createdAt: getRelativeTime(post._creationTime, args.userLocale),
          userId: post.userId,
          content: post.content,
          postAttachments: attachmentUrls,
          reactionsCount: post.reactionsCount,
          commentsCount: post.commentsCount,
          hasReacted: !!userReaction,
          userReaction: userReaction?.emoji,
          isOwner: post.userId === userId,
          isPinned: post.isPinned,
          postAuthor: {
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
      page: enrichedPosts,
    };
  },
});

/**
 * Get photos from a specific user's posts
 */
export const getUserPhotos = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if users are friends or viewing own photos
    const isFriend = await areFriends(ctx, currentUserId, args.userId);
    if (!isFriend && args.userId !== currentUserId) {
      throw new Error("You can only view photos from friends");
    }

    // Get posts with attachments from the user
    const result = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .filter((q) => q.neq(q.field("attachments"), undefined))
      .paginate(args.paginationOpts);

    // Extract and flatten all attachment URLs
    const photoUrls: string[] = [];
    for (const post of result.page) {
      if (post.attachments && post.attachments.length > 0) {
        const urls = await Promise.all(
          post.attachments
            .filter((att) => att.type === "image")
            .map((att) => r2.getUrl(att.url))
        );
        photoUrls.push(...urls);
      }
    }

    return {
      ...result,
      page: photoUrls,
    };
  },
});
