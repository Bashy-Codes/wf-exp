import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { r2 } from "../storage";
import { areFriends, calculateAge, checkUsersPrivacy, getAgeGroup } from "../helpers";

export const hasProfile = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        return !!profile;
    },
});

export const getCurrentUser = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = ctx.db.get(userId)
        if (!user) return null;

        return user;
    },
});

export const getCurrentUserId = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        return userId;
    },
})

export const getCurrentProfile = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

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

        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        return {
            ...user,
            ...profile,
            profilePictureUrl,
            age: calculateAge(user.birthDate),
            ageGroup: getAgeGroup(user.birthDate),
            genderPreference: userInfo.genderPreference,
        };
    },
});

/**
 * Get detailed user profile with friendship status
 * Returns all profile information needed for user profile screen
 */
export const getUserProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Get the target user data
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Get the target user's profile
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) {
            throw new Error("User profile not found");
        }

        // Don't allow viewing own profile through this function
        if (currentUserId === args.userId) {
            return { ok: false, error: "OWN_PROFILE" };
        }

        // Check if user is blocked (either direction)
        const isBlocked = await ctx.db
            .query("blockedUsers")
            .withIndex("by_both", (q) =>
                q.eq("blockerUserId", currentUserId).eq("blockedUserId", args.userId),
            )
            .first();

        const isBlockedBy = await ctx.db
            .query("blockedUsers")
            .withIndex("by_both", (q) =>
                q.eq("blockerUserId", args.userId).eq("blockedUserId", currentUserId),
            )
            .first();

        // If blocked in either direction, don't show profile
        if (isBlocked || isBlockedBy) {
            throw new Error("User profile not accessible");
        }

        // Check privacy restrictions
        const canView = await checkUsersPrivacy(ctx, currentUserId, args.userId);
        if (!canView) {
            return { ok: false, error: "PRIVACY_RESTRICTION" };
        }

        // Check friendship status
        const isFriend = await areFriends(ctx, currentUserId, args.userId);

        // Check for pending friend requests
        const [userAId, userBId] = currentUserId < args.userId
            ? [currentUserId, args.userId]
            : [args.userId, currentUserId];

        const pendingFriendship = await ctx.db
            .query("friendships")
            .withIndex("by_pair", (q) =>
                q.eq("userAId", userAId).eq("userBId", userBId)
            )
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        const hasPendingRequest = !!pendingFriendship;

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        const userProfile = {
            userId: args.userId,
            profilePicture: profilePictureUrl,
            name: user.name,
            username: user.userName,
            gender: user.gender,
            age: calculateAge(user.birthDate),
            isPremiumUser: user.isPremium,
            country: user.country,
            aboutMe: profile.aboutMe,
            spokenLanguages: profile.spokenLanguages,
            learningLanguages: profile.learningLanguages,
            hobbies: profile.hobbies,
            isFriend,
            hasPendingRequest,
        };

        return { ok: true, profile: userProfile };
    },
});

export const checkUsernameAvailability = query({
    args: { userName: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_userName", (q) => q.eq("userName", args.userName))
            .unique();
        return !existing;
    },
});

export const getSenderCountry = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        return user?.country;
    },
});
