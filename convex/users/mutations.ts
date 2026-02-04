import { mutation, internalMutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { r2 } from "../storage";
import { Id } from "../_generated/dataModel";
import { createNotification } from "../notifications";
import { calculateAge, getAgeGroup } from "../helpers";

export const updatePremiumStatusInternal = internalMutation({
    args: {
        userId: v.string(),
        isPremium: v.boolean()
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(userId, {
            isPremium: args.isPremium,
        });

        return { success: true };
    },
});


export const createProfile = mutation({
    args: {
        name: v.string(),
        userName: v.string(),
        profilePicture: v.string(),
        gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
        birthDate: v.string(),
        country: v.string(),
        spokenLanguages: v.array(v.string()),
        learningLanguages: v.array(v.string()),
        aboutMe: v.string(),
        hobbies: v.array(v.string()),
        genderPreference: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if profile already exists
        const existingProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
        if (existingProfile) throw new Error("Profile already exists");

        const age = calculateAge(args.birthDate);
        if (age < 13) throw new Error("Must be at least 13 years old");

        const ageGroup = getAgeGroup(args.birthDate);

        // Update user record
        await ctx.db.patch(userId, {
            name: args.name,
            userName: args.userName,
            profilePicture: args.profilePicture,
            gender: args.gender,
            birthDate: args.birthDate,
            country: args.country,
            isPremium: false,
        });

        // Create profile record
        const profileId = await ctx.db.insert("profiles", {
            userId,
            spokenLanguages: args.spokenLanguages,
            learningLanguages: args.learningLanguages,
            aboutMe: args.aboutMe,
            hobbies: args.hobbies,
        });

        // Create userInformation record for discovery
        await ctx.db.insert("userInformation", {
            userId,
            genderPreference: args.genderPreference,
            ageGroup,
            lastActive: Date.now(),
        });

        // Create default "My Drawings" collection for the new user
        await ctx.db.insert("collections", {
            userId,
            title: "My Drawings",
            postsCount: 0,
        });

        return profileId;
    },
});

export const updateProfile = mutation({
    args: {
        name: v.string(),
        country: v.string(),
        spokenLanguages: v.array(v.string()),
        learningLanguages: v.array(v.string()),
        aboutMe: v.string(),
        hobbies: v.array(v.string()),
        genderPreference: v.boolean(),
        profilePicture: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const [user, profile, userInfo] = await Promise.all([
            ctx.db.get(userId),
            ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique(),
            ctx.db
                .query("userInformation")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique(),
        ]);

        if (!user || !profile || !userInfo) return null;

        // Handle profile picture change
        if (user.profilePicture !== args.profilePicture) {
            // Delete old profile picture from R2
            if (user.profilePicture) {
                await r2.deleteObject(ctx, user.profilePicture);
            }
        }

        const ageGroup = getAgeGroup(user.birthDate);

        // Update user record
        await ctx.db.patch(userId, {
            name: args.name,
            country: args.country,
            profilePicture: args.profilePicture,
        });

        // Update profile record
        await ctx.db.patch(profile._id, {
            spokenLanguages: args.spokenLanguages,
            learningLanguages: args.learningLanguages,
            aboutMe: args.aboutMe,
            hobbies: args.hobbies,
        });

        // Update userInformation record
        await ctx.db.patch(userInfo._id, {
            genderPreference: args.genderPreference,
            ageGroup,
            lastActive: Date.now(),
        });

        return profile._id;
    },
});

export const updateLastActive = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const userInfo = await ctx.db
            .query("userInformation")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
        if (!userInfo) return;

        await ctx.db.patch(userInfo._id, {
            lastActive: Date.now(),
        });
    },
});

export const deleteProfile = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const [user, profile, userInfo] = await Promise.all([
            ctx.db.get(userId),
            ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique(),
            ctx.db
                .query("userInformation")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique(),
        ]);

        if (!user || !profile || !userInfo) throw new Error("Profile not found");

        console.log(`Starting complete user deletion for userId: ${userId}`);

        // 1. Delete all posts created by the user and their associated data
        const userPosts = await ctx.db
            .query("posts")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const post of userPosts) {
            // Delete all comments on this post (by any user)
            const postComments = await ctx.db
                .query("comments")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .collect();

            for (const comment of postComments) {
                await ctx.db.delete(comment._id);
            }

            // Delete all reactions on this post (by any user)
            const postReactions = await ctx.db
                .query("reactions")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .collect();

            for (const reaction of postReactions) {
                await ctx.db.delete(reaction._id);
            }

            // Update counters (since we're deleting the post anyway, no need to update counters)

            // Delete post images if they exist
            if (post.images && post.images.length > 0) {
                // Delete post images from R2
                for (const imageKey of post.images) {
                    await r2.deleteObject(ctx, imageKey);
                }
            }

            // Delete the post itself
            await ctx.db.delete(post._id);
        }

        // 2. Delete all comments made by the user on other users' posts
        const userComments = await ctx.db
            .query("comments")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        // Group comments by post to batch update counters
        const commentsByPost = new Map<string, number>();
        for (const comment of userComments) {
            await ctx.db.delete(comment._id);
            const postId = comment.postId;
            commentsByPost.set(postId, (commentsByPost.get(postId) || 0) + 1);
        }

        // Update comment counters for affected posts
        for (const [postId, count] of commentsByPost) {
            const post = await ctx.db.get(postId as Id<"posts">);
            if (post) {
                await ctx.db.patch(postId as Id<"posts">, {
                    commentsCount: Math.max(0, post.commentsCount - count),
                });
            }
        }

        // 3. Delete all reactions made by the user on other users' posts
        const userLikes = await ctx.db
            .query("reactions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        // Group reactions by post to batch update counters
        const likesByPost = new Map<string, number>();
        for (const like of userLikes) {
            await ctx.db.delete(like._id);
            const postId = like.postId;
            likesByPost.set(postId, (likesByPost.get(postId) || 0) + 1);
        }

        // Update reaction counters for affected posts
        for (const [postId, count] of likesByPost) {
            const post = await ctx.db.get(postId as Id<"posts">);
            if (post) {
                await ctx.db.patch(postId as Id<"posts">, {
                    reactionsCount: Math.max(0, post.reactionsCount - count),
                });
            }
        }

        // 4. Delete all collections owned by the user
        const userCollections = await ctx.db
            .query("collections")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const collection of userCollections) {
            // Remove collection reference from all posts in this collection
            const postsInCollection = await ctx.db
                .query("posts")
                .withIndex("by_collectionId", (q) =>
                    q.eq("collectionId", collection._id),
                )
                .collect();

            for (const post of postsInCollection) {
                await ctx.db.patch(post._id, {
                    collectionId: undefined,
                });
            }

            // Delete the collection itself
            await ctx.db.delete(collection._id);
        }

        // 5. Delete all friend requests involving the user
        const sentFriendRequests = await ctx.db
            .query("friendRequests")
            .withIndex("by_sender", (q) => q.eq("senderId", userId))
            .collect();

        for (const request of sentFriendRequests) {
            await ctx.db.delete(request._id);
        }

        const receivedFriendRequests = await ctx.db
            .query("friendRequests")
            .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
            .collect();

        for (const request of receivedFriendRequests) {
            await ctx.db.delete(request._id);
        }

        // 6. Delete all friendships involving the user
        const friendships1 = await ctx.db
            .query("friendships")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const friendship of friendships1) {
            await ctx.db.delete(friendship._id);
        }

        const friendships2 = await ctx.db
            .query("friendships")
            .withIndex("by_friend", (q) => q.eq("friendId", userId))
            .collect();

        for (const friendship of friendships2) {
            await ctx.db.delete(friendship._id);
        }

        // 7. Delete all blocked user records involving the user
        const blockedByUser = await ctx.db
            .query("blockedUsers")
            .withIndex("by_blocker", (q) => q.eq("blockerUserId", userId))
            .collect();

        for (const blocked of blockedByUser) {
            await ctx.db.delete(blocked._id);
        }

        const blockedUser = await ctx.db
            .query("blockedUsers")
            .withIndex("by_blocked", (q) => q.eq("blockedUserId", userId))
            .collect();

        for (const blocked of blockedUser) {
            await ctx.db.delete(blocked._id);
        }

        // 8. Delete all conversations involving the user
        const userConversations = await ctx.db
            .query("conversations")
            .withIndex("by_user_lastMessageTime", (q) => q.eq("userId", userId))
            .collect();

        const conversationIds = new Set(
            userConversations.map((c) => c.conversationId)
        );

        for (const groupId of conversationIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationGroup", (q) =>
                    q.eq("conversationId", groupId)
                )
                .collect();

            for (const message of messages) {
                if (message.type === "image" && message.attachment) {
                    // R2 cleanup handled separately
                }
                await ctx.db.delete(message._id);
            }

            const allConversations = await ctx.db
                .query("conversations")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", groupId)
                )
                .collect();

            for (const conversation of allConversations) {
                await ctx.db.delete(conversation._id);
            }
        }

        // 9. Delete all communities owned by the user
        const ownedCommunities = await ctx.db
            .query("communities")
            .withIndex("by_adminId", (q) => q.eq("adminId", userId))
            .collect();

        for (const community of ownedCommunities) {
            const discussions = await ctx.db
                .query("discussions")
                .withIndex("by_communityId", (q) =>
                    q.eq("communityId", community._id)
                )
                .collect();

            for (const discussion of discussions) {
                if (discussion.imageUrl) {
                    await r2.deleteObject(ctx, discussion.imageUrl);
                }

                const threads = await ctx.db
                    .query("discussionThreads")
                    .withIndex("by_discussionId", (q) =>
                        q.eq("discussionId", discussion._id)
                    )
                    .collect();

                for (const thread of threads) {
                    await ctx.db.delete(thread._id);
                }

                await ctx.db.delete(discussion._id);
            }

            if (community.banner) {
                await ctx.storage.delete(community.banner);
            }

            const members = await ctx.db
                .query("communityMembers")
                .withIndex("by_communityId", (q) =>
                    q.eq("communityId", community._id)
                )
                .collect();

            for (const member of members) {
                await ctx.db.delete(member._id);
            }

            await ctx.db.delete(community._id);
        }

        // 10. Delete all community memberships
        const communityMemberships = await ctx.db
            .query("communityMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const membership of communityMemberships) {
            await ctx.db.delete(membership._id);
        }

        // 11. Delete all discussions created by the user
        const userDiscussions = await ctx.db
            .query("discussions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const discussion of userDiscussions) {
            if (discussion.imageUrl) {
                await r2.deleteObject(ctx, discussion.imageUrl);
            }

            const threads = await ctx.db
                .query("discussionThreads")
                .withIndex("by_discussionId", (q) =>
                    q.eq("discussionId", discussion._id)
                )
                .collect();

            for (const thread of threads) {
                await ctx.db.delete(thread._id);
            }

            await ctx.db.delete(discussion._id);
        }

        // 12. Delete all discussion threads created by the user
        const userThreads = await ctx.db
            .query("discussionThreads")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const thread of userThreads) {
            await ctx.db.delete(thread._id);
        }


        // 14. Delete all letters involving the user (sent and received)
        const lettersSent = await ctx.db
            .query("letters")
            .withIndex("by_sender", (q) => q.eq("senderId", userId))
            .collect();

        for (const letter of lettersSent) {
            await ctx.db.delete(letter._id);
        }

        const lettersReceived = await ctx.db
            .query("letters")
            .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
            .collect();

        for (const letter of lettersReceived) {
            await ctx.db.delete(letter._id);
        }

        // 15. Delete all notifications involving the user
        const userNotificationsAsRecipient = await ctx.db
            .query("notifications")
            .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
            .collect();

        for (const notification of userNotificationsAsRecipient) {
            await ctx.db.delete(notification._id);
        }

        // Note: We're not deleting notifications where the user is the sender
        // as this might remove important notifications from other users' inboxes

        // 16. Delete all reports made by the user or about the user
        const reportsMadeByUser = await ctx.db
            .query("reports")
            .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
            .collect();

        for (const report of reportsMadeByUser) {
            // Delete report attachment
            if (report.attachment) {
                await ctx.storage.delete(report.attachment);
            }
            await ctx.db.delete(report._id);
        }

        const reportsAboutUser = await ctx.db
            .query("reports")
            .withIndex("by_targetUser", (q) => q.eq("targetUserId", userId))
            .collect();

        for (const report of reportsAboutUser) {
            // Delete report attachment
            if (report.attachment) {
                await ctx.storage.delete(report.attachment);
            }
            await ctx.db.delete(report._id);
        }

        // 17. Delete user data from all tables
        if (user.profilePicture) {
            // Delete profile picture from R2
            await r2.deleteObject(ctx, user.profilePicture);
        }

        // Delete from profiles table
        await ctx.db.delete(profile._id);

        // Delete from userInformation table
        await ctx.db.delete(userInfo._id);

        console.log(`Completed application data cleanup for userId: ${userId}`);

        // 18. Delete from auth tables (in correct order to avoid foreign key issues)
        console.log(`Starting auth data cleanup for userId: ${userId}`);

        // First, get all accounts for this user
        const userAccounts = await ctx.db
            .query("authAccounts")
            .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
            .collect();

        // Delete all verification codes for the user's accounts
        for (const account of userAccounts) {
            const verificationCodes = await ctx.db
                .query("authVerificationCodes")
                .withIndex("accountId", (q) => q.eq("accountId", account._id))
                .collect();

            for (const code of verificationCodes) {
                await ctx.db.delete(code._id);
            }
        }

        // Get all sessions for this user
        const userSessions = await ctx.db
            .query("authSessions")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        // Delete all refresh tokens for the user's sessions
        for (const session of userSessions) {
            const refreshTokens = await ctx.db
                .query("authRefreshTokens")
                .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
                .collect();

            for (const token of refreshTokens) {
                await ctx.db.delete(token._id);
            }
        }

        // Delete all sessions for the user
        for (const session of userSessions) {
            await ctx.db.delete(session._id);
        }

        // Delete all accounts for the user
        for (const account of userAccounts) {
            await ctx.db.delete(account._id);
        }

        // Delete any auth verifiers associated with the user's sessions
        for (const session of userSessions) {
            const verifiers = await ctx.db
                .query("authVerifiers")
                .filter((q) => q.eq(q.field("sessionId"), session._id))
                .collect();

            for (const verifier of verifiers) {
                await ctx.db.delete(verifier._id);
            }
        }

        // Finally, delete the user record itself
        await ctx.db.delete(userId);
        return { success: true };
    },
});

/**
 * Block a user and clean up all relationships
 * This will:
 * 1. Add user to blocked list
 * 2. Remove friendship if exists
 * 3. Remove any pending friend requests (both directions)
 * 4. Delete any conversations between the users
 * 5. Delete all comments by blocked user on blocker's posts
 * 6. Delete all reactions by blocked user on blocker's posts
 * 7. Delete all comments by blocker on blocked user's posts
 * 8. Delete all reactions by blocker on blocked user's posts
 */
export const blockUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Get the target user
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Don't allow blocking yourself
        if (currentUserId === args.userId) {
            throw new Error("Cannot block yourself");
        }

        // Check if already blocked
        const existingBlock = await ctx.db
            .query("blockedUsers")
            .withIndex("by_both", (q) =>
                q.eq("blockerUserId", currentUserId).eq("blockedUserId", args.userId),
            )
            .first();

        if (existingBlock) {
            throw new Error("User is already blocked");
        }

        // 1. Add to blocked users
        await ctx.db.insert("blockedUsers", {
            blockerUserId: currentUserId,
            blockedUserId: args.userId,
        });

        // Get current user for notification
        const currentUser = await ctx.db.get(currentUserId);

        if (currentUser) {
            // Send notification to blocked user
            await createNotification(ctx, args.userId, currentUserId, "user_blocked");
        }

        // 2. Remove friendship if exists (both directions)
        const friendship1 = await ctx.db
            .query("friendships")
            .withIndex("by_both", (q) =>
                q.eq("userId", currentUserId).eq("friendId", args.userId),
            )
            .first();

        if (friendship1) {
            await ctx.db.delete(friendship1._id);
        }

        const friendship2 = await ctx.db
            .query("friendships")
            .withIndex("by_both", (q) =>
                q.eq("userId", args.userId).eq("friendId", currentUserId),
            )
            .first();

        if (friendship2) {
            await ctx.db.delete(friendship2._id);
        }

        // 3. Remove pending friend requests (both directions)
        const sentRequests = await ctx.db
            .query("friendRequests")
            .withIndex("by_both", (q) =>
                q.eq("senderId", currentUserId).eq("receiverId", args.userId),
            )
            .collect();

        for (const request of sentRequests) {
            await ctx.db.delete(request._id);
        }

        const receivedRequests = await ctx.db
            .query("friendRequests")
            .withIndex("by_both", (q) =>
                q.eq("senderId", args.userId).eq("receiverId", currentUserId),
            )
            .collect();

        for (const request of receivedRequests) {
            await ctx.db.delete(request._id);
        }

        // 5. Delete all comments by blocked user on blocker's posts
        const blockerPosts = await ctx.db
            .query("posts")
            .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
            .collect();

        for (const post of blockerPosts) {
            const blockedUserComments = await ctx.db
                .query("comments")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .collect();

            for (const comment of blockedUserComments) {
                await ctx.db.delete(comment._id);
            }

            // Update comments count
            if (blockedUserComments.length > 0) {
                await ctx.db.patch(post._id, {
                    commentsCount: Math.max(
                        0,
                        post.commentsCount - blockedUserComments.length,
                    ),
                });
            }
        }

        // 6. Delete all reactions by blocked user on blocker's posts
        for (const post of blockerPosts) {
            const blockedUserReactions = await ctx.db
                .query("reactions")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .collect();

            for (const reaction of blockedUserReactions) {
                await ctx.db.delete(reaction._id);
            }

            // Update reactions count
            if (blockedUserReactions.length > 0) {
                await ctx.db.patch(post._id, {
                    reactionsCount: Math.max(
                        0,
                        post.reactionsCount - blockedUserReactions.length,
                    ),
                });
            }
        }

        // 7. Delete all comments by blocker on blocked user's posts
        const blockedUserPosts = await ctx.db
            .query("posts")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        for (const post of blockedUserPosts) {
            const blockerComments = await ctx.db
                .query("comments")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .filter((q) => q.eq(q.field("userId"), currentUserId))
                .collect();

            for (const comment of blockerComments) {
                await ctx.db.delete(comment._id);
            }

            // Update comments count
            if (blockerComments.length > 0) {
                await ctx.db.patch(post._id, {
                    commentsCount: Math.max(
                        0,
                        post.commentsCount - blockerComments.length,
                    ),
                });
            }
        }

        // 8. Delete all reactions by blocker on blocked user's posts
        for (const post of blockedUserPosts) {
            const blockerReactions = await ctx.db
                .query("reactions")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .filter((q) => q.eq(q.field("userId"), currentUserId))
                .collect();

            for (const reaction of blockerReactions) {
                await ctx.db.delete(reaction._id);
            }

            // Update reactions count
            if (blockerReactions.length > 0) {
                await ctx.db.patch(post._id, {
                    reactionsCount: Math.max(
                        0,
                        post.reactionsCount - blockerReactions.length,
                    ),
                });
            }
        }

        // 4. Delete all conversations between the users
        const conversation1 = await ctx.db
            .query("conversations")
            .withIndex("by_both", (q) =>
                q.eq("userId", currentUserId).eq("otherUserId", args.userId)
            )
            .first();

        const conversation2 = await ctx.db
            .query("conversations")
            .withIndex("by_both", (q) =>
                q.eq("userId", args.userId).eq("otherUserId", currentUserId)
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

        // 11. Delete all letters between the users (both directions)
        const lettersFromBlockedUser = await ctx.db
            .query("letters")
            .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
            .filter((q) => q.eq(q.field("recipientId"), currentUserId))
            .collect();

        for (const letter of lettersFromBlockedUser) {
            await ctx.db.delete(letter._id);
        }

        const lettersToBlockedUser = await ctx.db
            .query("letters")
            .withIndex("by_sender", (q) => q.eq("senderId", currentUserId))
            .filter((q) => q.eq(q.field("recipientId"), args.userId))
            .collect();

        for (const letter of lettersToBlockedUser) {
            await ctx.db.delete(letter._id);
        }

        return { success: true };
    },
});
