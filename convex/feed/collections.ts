import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { areFriends, incrementCollectionPostsCount, decrementCollectionPostsCount } from "../helpers";
import { r2 } from "../storage";

// ============================================================================
// COLLECTIONS SYSTEM
// ============================================================================

/**
 * Get current user's own collections with pagination
 */
export const getCurrentUserCollections = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Get collections for the current user, ordered by creation time (newest first)
    const result = await ctx.db
      .query("collections")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich each collection with additional data
    const enrichedCollections = result.page.map((collection) => {
      return {
        collectionId: collection._id,
        createdAt: collection._creationTime,
        userId: collection.userId,
        title: collection.title,
        postCount: collection.postsCount,
        isOwner: true, // Always true for current user's collections
      };
    });

    return {
      ...result,
      page: enrichedCollections,
    };
  },
});

/**
 * Get user's collections with pagination
 */
export const getUserCollections = query({
  args: {
    targetUserId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if users are friends or it's own collections
    const isFriend = await areFriends(ctx, currentUserId, args.targetUserId);

    if (!isFriend && args.targetUserId !== currentUserId) {
      throw new Error("You can only view collections from friends");
    }

    // Get collections for the target user, ordered by creation time (newest first)
    const result = await ctx.db
      .query("collections")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich each collection with additional data
    const enrichedCollections = result.page.map((collection) => {
      return {
        collectionId: collection._id,
        createdAt: collection._creationTime,
        userId: collection.userId,
        title: collection.title,
        postCount: collection.postsCount,
        isOwner: collection.userId === currentUserId,
      };
    });

    return {
      ...result,
      page: enrichedCollections,
    };
  },
});

/**
 * Get collection details (title, owner info, posts count)
 */
export const getCollectionDetails = query({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Get the collection
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    // Check if users are friends or it's own collection
    const isFriend = await areFriends(ctx, currentUserId, collection.userId);

    if (!isFriend && collection.userId !== currentUserId) {
      throw new Error("You can only view collections from friends");
    }

    // Get the collection owner's user data
    const owner = await ctx.db.get(collection.userId);
    if (!owner) throw new Error("Collection owner not found");

    // Get profile picture URL
    const ownerProfilePictureUrl = await r2.getUrl(owner.profilePicture);

    return {
      collectionId: collection._id,
      title: collection.title,
      postsCount: collection.postsCount,
      owner: {
        userId: owner._id,
        name: owner.name,
        userName: owner.userName,
        profilePicture: ownerProfilePictureUrl
      },
      isOwner: collection.userId === currentUserId,
    };
  },
});

/**
 * Get posts in a collection with pagination
 */
export const getCollectionPosts = query({
  args: {
    collectionId: v.id("collections"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify collection exists and get collection info
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    // Check if user is friend with collection owner or it's own collection
    const isFriend = await areFriends(ctx, userId, collection.userId);
    if (!isFriend && collection.userId !== userId) {
      throw new Error("You can only view collections from friends");
    }

    // Get posts in this collection, ordered by creation time (newest first)
    const result = await ctx.db
      .query("posts")
      .withIndex("by_collectionId", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich each post with full post data
    const enrichedPosts = await Promise.all(
      result.page.map(async (post) => {
        // Get post author's user data
        const postAuthor = await ctx.db.get(post.userId);

        if (!postAuthor) return null;

        // Get counts from post fields
        const reactionsCount = post.reactionsCount;
        const commentsCount = post.commentsCount;

        // Check if current user reacted to this post
        const userReaction = await ctx.db
          .query("reactions")
          .withIndex("by_userId_postId", (q) =>
            q.eq("userId", userId).eq("postId", post._id)
          )
          .first();

        // Get image URLs if images exist
        const imageUrls =
          post.images && post.images.length > 0
            ? await Promise.all(
              post.images.map((imageKey) => r2.getUrl(imageKey))
            )
            : [];

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(postAuthor.profilePicture);

        const CollectionPost = {
          postId: post._id,
          createdAt: post._creationTime,
          userId: post.userId,
          content: post.content,
          postImages: imageUrls,
          reactionsCount,
          commentsCount,
          hasReacted: !!userReaction,
          userReaction: userReaction?.emoji,
          isOwner: post.userId === userId,
          isPinned: post.isPinned,
          postAuthor: {
            userId: postAuthor._id,
            name: postAuthor.name,
            profilePicture: profilePictureUrl,
            isPremiumUser: postAuthor.isPremium,
          },
        };

        return {
          collectionPostId: post._id,
          createdAt: post._creationTime,
          collectionId: args.collectionId,
          post: CollectionPost,
        };
      })
    );

    // Filter out null entries (deleted posts)
    const validPosts = enrichedPosts.filter((post) => post !== null);

    return {
      ...result,
      page: validPosts,
    };
  },
});

/**
 * Create a new collection
 */
export const createCollection = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate input
    if (!args.title.trim()) {
      throw new Error("Collection title cannot be empty");
    }

    if (args.title.length > 30) {
      throw new Error("Collection title too long (max 30 characters)");
    }

    // Create the collection with initial postsCount of 0
    const collectionId = await ctx.db.insert("collections", {
      userId,
      title: args.title.trim(),
      postsCount: 0,
    });

    return { collectionId, success: true };
  },
});

/**
 * Delete a collection
 */
export const deleteCollection = mutation({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the collection
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    // Check ownership
    if (collection.userId !== userId) {
      throw new Error("Not authorized to delete this collection");
    }

    // Remove collection reference from all posts in this collection
    const postsInCollection = await ctx.db
      .query("posts")
      .withIndex("by_collectionId", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .collect();

    for (const post of postsInCollection) {
      await ctx.db.patch(post._id, {
        collectionId: undefined,
      });
    }

    // Delete the collection
    await ctx.db.delete(args.collectionId);

    return { success: true };
  },
});

/**
 * Add a post to a collection
 */
export const addPostToCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the collection
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    // Check ownership
    if (collection.userId !== userId) {
      throw new Error("Not authorized to modify this collection");
    }

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if post is already in a collection (any collection)
    if (post.collectionId) {
      throw new Error("Post is already in a collection");
    }

    // Add post to collection by updating the post's collectionId
    await ctx.db.patch(args.postId, {
      collectionId: args.collectionId,
    });

    // Increment the collection's posts count
    await incrementCollectionPostsCount(ctx, args.collectionId);

    return { success: true };
  },
});

/**
 * Remove a post from a collection
 */
export const removePostFromCollection = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if post is in a collection
    if (!post.collectionId) {
      throw new Error("Post is not in any collection");
    }

    // Get the collection to verify ownership
    const collection = await ctx.db.get(post.collectionId);
    if (!collection) throw new Error("Collection not found");

    // Check ownership (user must own the collection)
    if (collection.userId !== userId) {
      throw new Error("Not authorized to modify this collection");
    }

    // Store the collection ID before removing the post
    const collectionId = post.collectionId;

    // Remove post from collection by clearing the collectionId
    await ctx.db.patch(args.postId, {
      collectionId: undefined,
    });

    // Decrement the collection's posts count
    await decrementCollectionPostsCount(ctx, collectionId);

    return { success: true };
  },
});
